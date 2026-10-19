"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { formatDate, KIND_LABEL, LEVEL_LABEL } from "@/lib/format";
import type {
  Achievement,
  Education,
  EducationLevel,
  MeetingKind,
  Profile,
  Status,
} from "@/lib/types";

type ContentTab = "reuniones" | "formacion" | "logros" | "perfil";
type AdminMeeting = {
  id: string;
  slug: string;
  title: string;
  meeting_date: string;
  kind: MeetingKind;
  place: string;
  context: string;
  actions: string;
  result: string;
  status: Status;
};
type ProfileRow = Profile & { updated_at: string };

const LEVELS: EducationLevel[] = [
  "pregrado",
  "especializacion",
  "maestria",
  "doctorado",
];
const MEETING_KINDS: MeetingKind[] = ["trabajo", "audiencia", "charla", "otro"];
const STATUS_LABEL: Record<Status, string> = {
  publica: "Publicada",
  oculta: "Oculta",
  borrador: "Borrador",
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function AdminContentManager({
  tab,
  client,
  accessToken,
}: {
  tab: ContentTab;
  client: SupabaseClient;
  accessToken: string;
}) {
  const [education, setEducation] = useState<Education[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [meetings, setMeetings] = useState<AdminMeeting[]>([]);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTabData = useCallback(async () => {
    if (tab === "formacion") {
      const { data, error: queryError } = await client
        .from("education")
        .select("*")
        .order("year", { ascending: false, nullsFirst: false })
        .order("sort_order", { ascending: true });
      if (queryError) {
        setError("No se pudo cargar la formación.");
        return;
      }
      setEducation((data ?? []) as Education[]);
    } else if (tab === "logros") {
      const { data, error: queryError } = await client
        .from("achievements")
        .select("*")
        .order("year", { ascending: false, nullsFirst: false })
        .order("sort_order", { ascending: true });
      if (queryError) {
        setError("No se pudieron cargar los logros.");
        return;
      }
      setAchievements((data ?? []) as Achievement[]);
    } else if (tab === "reuniones") {
      const { data, error: queryError } = await client
        .from("meetings")
        .select("*")
        .order("meeting_date", { ascending: false });
      if (queryError) {
        setError("No se pudieron cargar las reuniones.");
        return;
      }
      setMeetings((data ?? []) as AdminMeeting[]);
    } else {
      const { data, error: queryError } = await client
        .from("profile")
        .select("*")
        .eq("id", true)
        .maybeSingle();
      if (queryError) {
        setError("No se pudo cargar el perfil.");
        return;
      }
      setProfile((data as ProfileRow | null) ?? null);
    }
  }, [client, tab]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void loadTabData();
    });
    return () => {
      active = false;
    };
  }, [loadTabData]);

  async function refreshPublicData(tag: string): Promise<void> {
    const response = await fetch("/api/admin/revalidate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tag }),
    });
    if (!response.ok) {
      throw new Error(
        "Los datos se guardaron, pero no se pudo actualizar la caché del sitio.",
      );
    }
  }

  async function saveForm(
    event: FormEvent<HTMLFormElement>,
    save: (formData: FormData) => Promise<{ tag: string; success: string }>,
  ) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = event.currentTarget;
    try {
      const result = await save(new FormData(form));
      await refreshPublicData(result.tag);
      await loadTabData();
      form.reset();
      setMessage(result.success);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "No se pudieron guardar los cambios.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function saveEducation(formData: FormData) {
    const program = String(formData.get("program") ?? "").trim();
    const university = String(formData.get("university") ?? "").trim();
    const yearValue = String(formData.get("year") ?? "").trim();
    if (!program) throw new Error("Escribe el nombre del programa.");
    const year = yearValue ? Number(yearValue) : null;
    if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
      throw new Error("Escribe un año válido.");
    }
    const { error: saveError } = await client.from("education").insert({
      level: String(formData.get("level")) as EducationLevel,
      program,
      university,
      year,
      description: String(formData.get("description") ?? "").trim(),
      sort_order: education.length + 1,
    });
    if (saveError) throw new Error("No se pudo guardar el título.");
    return { tag: "education", success: "Formación agregada." };
  }

  async function saveAchievement(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const yearValue = String(formData.get("year") ?? "").trim();
    if (!title) throw new Error("Escribe el nombre del logro o cargo.");
    const year = yearValue ? Number(yearValue) : null;
    if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
      throw new Error("Escribe un año válido.");
    }
    const { error: saveError } = await client.from("achievements").insert({
      title,
      year,
      description: String(formData.get("description") ?? "").trim(),
      sort_order: achievements.length + 1,
    });
    if (saveError) throw new Error("No se pudo guardar el logro.");
    return { tag: "achievements", success: "Logro agregado." };
  }

  async function saveMeeting(formData: FormData) {
    const title = String(formData.get("title") ?? "").trim();
    const meetingDate = String(formData.get("meeting_date") ?? "");
    if (!title || !meetingDate) {
      throw new Error("Completa el título y la fecha de la reunión.");
    }
    const customSlug = String(formData.get("slug") ?? "").trim();
    const slug = slugify(customSlug || title);
    if (!slug) throw new Error("No se pudo crear una dirección para la reunión.");
    const { error: saveError } = await client.from("meetings").insert({
      title,
      slug,
      meeting_date: meetingDate,
      kind: String(formData.get("kind")) as MeetingKind,
      place: String(formData.get("place") ?? "").trim(),
      context: String(formData.get("context") ?? "").trim(),
      actions: String(formData.get("actions") ?? "").trim(),
      result: String(formData.get("result") ?? "").trim(),
      status: String(formData.get("status")) as Status,
    });
    if (saveError) {
      throw new Error(
        "No se pudo guardar. Revisa que el título o la dirección de la reunión no estén repetidos.",
      );
    }
    return { tag: "meetings", success: "Reunión agregada." };
  }

  async function saveProfile(formData: FormData) {
    const fullName = String(formData.get("full_name") ?? "").trim();
    if (!fullName) throw new Error("El nombre del perfil es obligatorio.");
    const careerStartYearValue = String(
      formData.get("career_start_year") ?? "",
    ).trim();
    const careerStartYear = careerStartYearValue
      ? Number(careerStartYearValue)
      : null;
    if (
      careerStartYear !== null &&
      (!Number.isInteger(careerStartYear) ||
        careerStartYear < 1900 ||
        careerStartYear > 2200)
    ) {
      throw new Error("Escribe un año de inicio válido.");
    }

    const { error: saveError } = await client.from("profile").upsert(
      {
        id: true,
        full_name: fullName,
        profession: String(formData.get("profession") ?? "").trim(),
        headline: String(formData.get("headline") ?? "").trim(),
        bio: String(formData.get("bio") ?? "").trim(),
        email: String(formData.get("email") ?? "").trim(),
        phone: String(formData.get("phone") ?? "").trim(),
        location: String(formData.get("location") ?? "").trim(),
        photo_url: String(formData.get("photo_url") ?? "").trim(),
        linkedin: String(formData.get("linkedin") ?? "").trim(),
        instagram: String(formData.get("instagram") ?? "").trim(),
        youtube: String(formData.get("youtube") ?? "").trim(),
        whatsapp: String(formData.get("whatsapp") ?? "").trim(),
        career_start_year: careerStartYear,
      },
      { onConflict: "id" },
    );
    if (saveError) throw new Error("No se pudo guardar el perfil.");
    return { tag: "profile", success: "Perfil actualizado." };
  }

  async function removeRecord(table: "education" | "achievements", id: string) {
    if (!window.confirm("¿Eliminar este registro?")) return;
    setBusy(true);
    setError("");
    const { error: deleteError } = await client.from(table).delete().eq("id", id);
    if (deleteError) {
      setError("No se pudo eliminar el registro.");
    } else {
      await refreshPublicData(table);
      await loadTabData();
      setMessage("Registro eliminado.");
    }
    setBusy(false);
  }

  async function changeMeetingStatus(meeting: AdminMeeting) {
    const status: Status =
      meeting.status === "publica" ? "borrador" : "publica";
    setBusy(true);
    setError("");
    const { error: updateError } = await client
      .from("meetings")
      .update({ status })
      .eq("id", meeting.id);
    if (updateError) {
      setError("No se pudo cambiar la visibilidad de la reunión.");
    } else {
      await refreshPublicData("meetings");
      await loadTabData();
      setMessage(status === "publica" ? "Reunión publicada." : "Reunión guardada como borrador.");
    }
    setBusy(false);
  }

  const titles: Record<ContentTab, string> = {
    reuniones: "Reuniones",
    formacion: "Formación",
    logros: "Logros y cargos",
    perfil: "Perfil y redes",
  };

  return (
    <section className="admin-section">
      <div className="admin-intro">
        <p className="eyebrow">Administración del sitio</p>
        <h1 className="h2">{titles[tab]}</h1>
      </div>
      {error && (
        <p className="notice notice-error" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="notice notice-ok" role="status">
          {message}
        </p>
      )}

      {tab === "formacion" && (
        <>
          <section className="admin-card">
            <h2>Agregar formación</h2>
            <form
              className="admin-form admin-form-grid"
              onSubmit={(event) => void saveForm(event, saveEducation)}
            >
              <label className="field">
                <span>Nivel</span>
                <select name="level" defaultValue="pregrado">
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {LEVEL_LABEL[level]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Programa o título</span>
                <input name="program" required maxLength={200} />
              </label>
              <label className="field">
                <span>Universidad</span>
                <input name="university" maxLength={200} />
              </label>
              <label className="field">
                <span>Año</span>
                <input name="year" type="number" min="1900" max="2200" />
              </label>
              <label className="field admin-field-wide">
                <span>Descripción</span>
                <textarea name="description" rows={3} maxLength={2000} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                Agregar título
              </button>
            </form>
          </section>
          <div className="admin-record-list">
            {education.map((item) => (
              <article className="admin-record" key={item.id}>
                <div>
                  <span className="meta">{LEVEL_LABEL[item.level]}</span>
                  <h2>{item.program}</h2>
                  <p>{[item.university, item.year].filter(Boolean).join(" · ")}</p>
                </div>
                <button
                  className="admin-action admin-action-danger"
                  type="button"
                  disabled={busy}
                  onClick={() => void removeRecord("education", item.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === "logros" && (
        <>
          <section className="admin-card">
            <h2>Agregar logro o cargo</h2>
            <form
              className="admin-form admin-form-grid"
              onSubmit={(event) => void saveForm(event, saveAchievement)}
            >
              <label className="field">
                <span>Nombre</span>
                <input name="title" required maxLength={200} />
              </label>
              <label className="field">
                <span>Año</span>
                <input name="year" type="number" min="1900" max="2200" />
              </label>
              <label className="field admin-field-wide">
                <span>Descripción</span>
                <textarea name="description" rows={4} maxLength={2000} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                Agregar logro
              </button>
            </form>
          </section>
          <div className="admin-record-list">
            {achievements.map((item) => (
              <article className="admin-record" key={item.id}>
                <div>
                  <span className="meta">{item.year ?? "Trayectoria"}</span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                </div>
                <button
                  className="admin-action admin-action-danger"
                  type="button"
                  disabled={busy}
                  onClick={() => void removeRecord("achievements", item.id)}
                >
                  Eliminar
                </button>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === "reuniones" && (
        <>
          <section className="admin-card">
            <h2>Agregar reunión</h2>
            <form
              className="admin-form admin-form-grid"
              onSubmit={(event) => void saveForm(event, saveMeeting)}
            >
              <label className="field">
                <span>Título</span>
                <input name="title" required maxLength={200} />
              </label>
              <label className="field">
                <span>Fecha</span>
                <input name="meeting_date" type="date" required />
              </label>
              <label className="field">
                <span>Dirección corta (opcional)</span>
                <input name="slug" maxLength={180} />
              </label>
              <label className="field">
                <span>Tipo</span>
                <select name="kind" defaultValue="trabajo">
                  {MEETING_KINDS.map((kind) => (
                    <option key={kind} value={kind}>
                      {KIND_LABEL[kind]}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Lugar</span>
                <input name="place" maxLength={200} />
              </label>
              <label className="field">
                <span>Visibilidad inicial</span>
                <select name="status" defaultValue="borrador">
                  <option value="borrador">Borrador</option>
                  <option value="publica">Publicada</option>
                  <option value="oculta">Oculta</option>
                </select>
              </label>
              <label className="field admin-field-wide">
                <span>Contexto</span>
                <textarea name="context" rows={3} maxLength={4000} />
              </label>
              <label className="field admin-field-wide">
                <span>Qué hicimos</span>
                <textarea name="actions" rows={3} maxLength={4000} />
              </label>
              <label className="field admin-field-wide">
                <span>Resultado</span>
                <textarea name="result" rows={3} maxLength={4000} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                Agregar reunión
              </button>
            </form>
          </section>
          <div className="admin-record-list">
            {meetings.map((meeting) => (
              <article className="admin-record" key={meeting.id}>
                <div>
                  <span className="meta">
                    {formatDate(meeting.meeting_date)} · {KIND_LABEL[meeting.kind]}
                  </span>
                  <h2>{meeting.title}</h2>
                  <p>{meeting.place || "Sin lugar especificado"}</p>
                  <span
                    className={`admin-status admin-status-${meeting.status}`}
                  >
                    {STATUS_LABEL[meeting.status]}
                  </span>
                </div>
                <button
                  className="admin-action"
                  type="button"
                  disabled={busy}
                  onClick={() => void changeMeetingStatus(meeting)}
                >
                  {meeting.status === "publica" ? "Pasar a borrador" : "Publicar"}
                </button>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === "perfil" &&
        (profile ? (
          <section className="admin-card">
            <h2>Datos públicos y redes</h2>
            <form
              className="admin-form admin-form-grid"
              key={profile.updated_at}
              onSubmit={(event) => void saveForm(event, saveProfile)}
            >
              <label className="field">
                <span>Nombre completo</span>
                <input name="full_name" defaultValue={profile.full_name} required />
              </label>
              <label className="field">
                <span>Profesión</span>
                <input name="profession" defaultValue={profile.profession} />
              </label>
              <label className="field admin-field-wide">
                <span>Presentación breve</span>
                <textarea name="headline" rows={3} defaultValue={profile.headline} />
              </label>
              <label className="field admin-field-wide">
                <span>Biografía</span>
                <textarea name="bio" rows={5} defaultValue={profile.bio} />
              </label>
              <label className="field">
                <span>Correo</span>
                <input name="email" type="email" defaultValue={profile.email} />
              </label>
              <label className="field">
                <span>Teléfono</span>
                <input name="phone" defaultValue={profile.phone} />
              </label>
              <label className="field">
                <span>Ubicación</span>
                <input name="location" defaultValue={profile.location} />
              </label>
              <label className="field">
                <span>Año de inicio de trayectoria</span>
                <input
                  name="career_start_year"
                  type="number"
                  min="1900"
                  max="2200"
                  defaultValue={profile.career_start_year ?? ""}
                />
              </label>
              <label className="field admin-field-wide">
                <span>URL de la foto de perfil</span>
                <input name="photo_url" type="url" defaultValue={profile.photo_url} />
              </label>
              <label className="field">
                <span>LinkedIn</span>
                <input name="linkedin" type="url" defaultValue={profile.linkedin} />
              </label>
              <label className="field">
                <span>Instagram</span>
                <input name="instagram" type="url" defaultValue={profile.instagram} />
              </label>
              <label className="field">
                <span>YouTube</span>
                <input name="youtube" type="url" defaultValue={profile.youtube} />
              </label>
              <label className="field">
                <span>WhatsApp (número internacional)</span>
                <input name="whatsapp" defaultValue={profile.whatsapp} />
              </label>
              <button className="btn btn-primary" type="submit" disabled={busy}>
                Guardar perfil
              </button>
            </form>
          </section>
        ) : (
          <p className="admin-empty">No se encontró el registro de perfil.</p>
        ))}
    </section>
  );
}
