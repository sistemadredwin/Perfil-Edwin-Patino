"use client";

import Link from "next/link";
import {
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { AdminContentManager } from "./AdminContentManager";
import { formatDuration } from "@/lib/format";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import type { Media, Status } from "@/lib/types";

type PanelTab =
  | "resumen"
  | "reuniones"
  | "formacion"
  | "logros"
  | "galeria"
  | "perfil";
type AuthStatus =
  | "checking"
  | "signed-out"
  | "admin"
  | "forbidden"
  | "unconfigured";
type AdminMedia = Media & {
  public_id: string;
  status: Status;
  created_at: string;
};
type CloudinarySignature = {
  cloudName: string;
  apiKey: string;
  folder: string;
  timestamp: number;
  signature: string;
};
type CloudinaryUpload = {
  public_id: string;
  version: number;
  signature: string;
  secure_url: string;
  resource_type: string;
  format: string;
  duration?: number;
};
type MeetingOption = { id: string; title: string; meeting_date: string };
const PANEL_TABS: { id: PanelTab; label: string }[] = [
  { id: "resumen", label: "Resumen" },
  { id: "reuniones", label: "Reuniones" },
  { id: "formacion", label: "Formación" },
  { id: "logros", label: "Logros" },
  { id: "galeria", label: "Galería" },
  { id: "perfil", label: "Perfil y redes" },
];

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const VIDEO_TYPES = new Set(["video/mp4", "video/quicktime"]);

async function responseError(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { error?: unknown };
    if (typeof payload.error === "string") return payload.error;
  } catch {
    return "El servidor devolvió una respuesta no válida.";
  }
  return "No se pudo completar la solicitud.";
}

function checkVideoDuration(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (!Number.isFinite(video.duration) || video.duration <= 0) {
        reject(new Error("No se pudo leer la duración del video."));
      } else if (video.duration < 30 || video.duration > 90) {
        reject(
          new Error(
            `El archivo indica ${video.duration.toFixed(2)} segundos; debe durar entre 30 y 90 segundos.`,
          ),
        );
      } else {
        resolve();
      }
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo abrir el video seleccionado."));
    };
    video.src = url;
  });
}

function uploadToCloudinary(
  file: File,
  kind: "foto" | "video",
  signature: CloudinarySignature,
  onProgress: (progress: number) => void,
): Promise<CloudinaryUpload> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signature.apiKey);
    formData.append("timestamp", String(signature.timestamp));
    formData.append("folder", signature.folder);
    formData.append("signature", signature.signature);

    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${signature.cloudName}/${kind === "foto" ? "image" : "video"}/upload`,
    );
    request.timeout = 10 * 60 * 1000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 90));
      }
    };
    request.onerror = () =>
      reject(new Error("No se pudo conectar con Cloudinary."));
    request.ontimeout = () =>
      reject(new Error("La subida tardó demasiado. Inténtalo con un archivo menor."));
    request.onload = () => {
      let result: CloudinaryUpload & { error?: { message?: string } };
      try {
        result = JSON.parse(request.responseText) as CloudinaryUpload & {
          error?: { message?: string };
        };
      } catch {
        reject(new Error("Cloudinary devolvió una respuesta no válida."));
        return;
      }
      if (request.status < 200 || request.status >= 300) {
        reject(
          new Error(result.error?.message || "Cloudinary rechazó el archivo."),
        );
        return;
      }
      onProgress(90);
      resolve(result);
    };
    request.send(formData);
  });
}

export function AdminPanel() {
  const client = useMemo(() => getSupabaseBrowser(), []);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [accessStatus, setAccessStatus] = useState<
    "checking" | "admin" | "forbidden"
  >("checking");
  const [activeTab, setActiveTab] = useState<PanelTab>("resumen");
  const [items, setItems] = useState<AdminMedia[]>([]);
  const [meetingOptions, setMeetingOptions] = useState<MeetingOption[]>([]);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [draftsCount, setDraftsCount] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [meetingId, setMeetingId] = useState("");
  const [caption, setCaption] = useState("");
  const [publishStatus, setPublishStatus] = useState<Status>("borrador");
  const [isBusy, setIsBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const authStatus: AuthStatus = !client
    ? "unconfigured"
    : session === undefined
      ? "checking"
      : session === null
        ? "signed-out"
        : accessStatus;

  useEffect(() => {
    if (!client) return;
    let active = true;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        setAccessStatus("checking");
        setSession(nextSession);
      }
    });
    void client.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setErrorMessage("No se pudo recuperar la sesión. Vuelve a iniciar sesión.");
        setSession(null);
      } else {
        setSession(data.session);
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);

  useEffect(() => {
    if (!client || session === undefined || session === null) return;
    let active = true;
    void (async () => {
      const { data: isAdmin, error: permissionError } =
        await client.rpc("is_admin");
      if (!active) return;
      if (permissionError) {
        setErrorMessage(
          "No se pudo validar tu permiso. Confirma que ejecutaste schema.sql y autorizaste tu usuario administrador.",
        );
        setAccessStatus("forbidden");
        return;
      }
      if (isAdmin !== true) {
        setAccessStatus("forbidden");
        return;
      }

      const [
        { data: media, error: mediaError },
        { data: meetings, error: meetingError },
      ] =
        await Promise.all([
          client.from("media").select("*").order("created_at", { ascending: false }),
          client
            .from("meetings")
            .select("id, title, meeting_date, status")
            .order("meeting_date", { ascending: false }),
        ]);
      if (!active) return;
      if (mediaError || meetingError) {
        setErrorMessage(
          "No se pudieron cargar los datos. Revisa que el esquema de Supabase esté actualizado.",
        );
        setAccessStatus("forbidden");
        return;
      }
      setItems((media ?? []) as AdminMedia[]);
      const meetingRows = meetings ?? [];
      setMeetingOptions(
        meetingRows.map((row) => ({
          id: row.id,
          title: row.title,
          meeting_date: row.meeting_date,
        })),
      );
      setMeetingsCount(meetingRows.filter((row) => row.status === "publica").length);
      setDraftsCount(
        meetingRows.filter(
          (row) => row.status === "borrador" || row.status === "oculta",
        ).length,
      );
      setAccessStatus("admin");
    })();

    return () => {
      active = false;
    };
  }, [client, session]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!client) return;
    setIsBusy(true);
    setErrorMessage("");
    setMessage("");
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setIsBusy(false);
    if (error) {
      setErrorMessage("No se pudo iniciar sesión. Revisa el correo y la contraseña.");
      return;
    }
    setAccessStatus("checking");
    setSession(data.session);
    setPassword("");
  }

  async function handleLogout() {
    if (!client) return;
    setIsBusy(true);
    const { error } = await client.auth.signOut();
    setIsBusy(false);
    if (error) {
      setErrorMessage("No se pudo cerrar la sesión. Inténtalo de nuevo.");
    } else {
      setSession(null);
      setItems([]);
      setAccessStatus("checking");
      setMessage("");
      setErrorMessage("");
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.currentTarget.files?.[0] ?? null;
    setFile(selected);
    setMessage("");
    setErrorMessage("");
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!client || !session || !file) {
      setErrorMessage("Selecciona una foto o un video antes de subirlo.");
      return;
    }
    const kind = file.type.startsWith("image/") ? "foto" : "video";
    if (kind === "foto" && !IMAGE_TYPES.has(file.type)) {
      setErrorMessage("Usa una foto JPG, PNG o WebP.");
      return;
    }
    if (kind === "video" && !VIDEO_TYPES.has(file.type)) {
      setErrorMessage("Usa un video MP4 o MOV.");
      return;
    }
    const maxBytes = kind === "foto" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
    if (file.size > maxBytes) {
      setErrorMessage(
        kind === "foto"
          ? "La foto no puede superar 15 MB."
          : "El video no puede superar 100 MB.",
      );
      return;
    }
    setIsBusy(true);
    setProgress(0);
    setErrorMessage("");
    setMessage("");

    try {
      if (kind === "video") await checkVideoDuration(file);

      const signResponse = await fetch("/api/admin/media/signature", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ kind, fileSize: file.size }),
      });
      if (!signResponse.ok) throw new Error(await responseError(signResponse));
      const signature = (await signResponse.json()) as CloudinarySignature;
      const uploaded = await uploadToCloudinary(
        file,
        kind,
        signature,
        setProgress,
      );
      setProgress(95);

      const registerResponse = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          kind,
          caption,
          status: publishStatus,
          meeting_id: meetingId || null,
          upload: uploaded,
        }),
      });
      if (!registerResponse.ok) {
        throw new Error(await responseError(registerResponse));
      }

      const { data, error } = await client
        .from("media")
        .select("*")
        .eq("public_id", uploaded.public_id)
        .single();
      if (error) {
        throw new Error("Se guardó el archivo, pero no se pudo actualizar la lista.");
      }
      setItems((current) => [data as AdminMedia, ...current]);
      setFile(null);
      setMeetingId("");
      setCaption("");
      setProgress(100);
      setMessage("Archivo subido y guardado correctamente.");
      form.reset();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo subir el archivo.",
      );
    } finally {
      setIsBusy(false);
    }
  }

  async function updateItem(item: AdminMedia) {
    if (!session) return;
    const nextStatus: Status =
      item.status === "publica" ? "oculta" : "publica";
    setIsBusy(true);
    setErrorMessage("");
    const response = await fetch("/api/admin/media", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: item.id, status: nextStatus }),
    });
    if (!response.ok) {
      setErrorMessage(await responseError(response));
    } else {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id ? { ...entry, status: nextStatus } : entry,
        ),
      );
      setMessage(nextStatus === "publica" ? "Medio publicado." : "Medio ocultado.");
    }
    setIsBusy(false);
  }

  async function deleteItem(item: AdminMedia) {
    if (!session || !window.confirm("¿Eliminar este archivo y su registro?")) return;
    setIsBusy(true);
    setErrorMessage("");
    const response = await fetch(`/api/admin/media/${item.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!response.ok) {
      setErrorMessage(await responseError(response));
    } else {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setMessage("Archivo eliminado.");
    }
    setIsBusy(false);
  }

  const photos = items.filter((item) => item.kind === "foto");
  const videos = items.filter((item) => item.kind === "video");
  const drafts = items.filter((item) => item.status !== "publica").length;
  const selectedMeeting = meetingOptions.find(
    (meeting) => meeting.id === meetingId,
  );

  return (
    <div className="admin-panel">
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-brand">
            <span>
              <strong>Panel de administración</strong>
              <small>Edwin Janes Patiño Minotta</small>
            </span>
          </div>
          <div className="admin-header-actions">
            <Link href="/" className="admin-link">
              Ver sitio público
            </Link>
            {session && (
              <button
                className="admin-logout"
                type="button"
                onClick={handleLogout}
                disabled={isBusy}
              >
                Cerrar sesión
              </button>
            )}
          </div>
          {authStatus === "admin" && (
            <nav className="admin-tabs" aria-label="Secciones del panel">
              {PANEL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  aria-current={activeTab === tab.id ? "page" : undefined}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      <main className="admin-main">
        {authStatus === "checking" && (
          <p className="admin-message">Comprobando acceso…</p>
        )}

        {authStatus === "unconfigured" && (
          <section className="admin-card admin-login">
            <p className="eyebrow">Configuración requerida</p>
            <h1 className="h2">Conecta Supabase</h1>
            <p>
              Añade la URL y la clave pública de Supabase al archivo{" "}
              <code>.env.local</code> y reinicia el servidor local.
            </p>
          </section>
        )}

        {authStatus === "signed-out" && (
          <section className="admin-card admin-login">
            <p className="eyebrow">Acceso privado</p>
            <h1 className="h2">Iniciar sesión</h1>
            <p>Ingresa con el usuario administrador creado en Supabase.</p>
            <form className="admin-form" onSubmit={handleLogin}>
              <label className="field">
                <span>Correo</span>
                <input
                  autoComplete="username"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.currentTarget.value)}
                  required
                />
              </label>
              <label className="field">
                <span>Contraseña</span>
                <input
                  autoComplete="current-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.currentTarget.value)}
                  required
                />
              </label>
              <button className="btn btn-primary" type="submit" disabled={isBusy}>
                {isBusy ? "Ingresando…" : "Entrar al panel"}
              </button>
            </form>
            <AdminNotices error={errorMessage} message={message} />
          </section>
        )}

        {authStatus === "forbidden" && (
          <section className="admin-card admin-login">
            <p className="eyebrow">Acceso restringido</p>
            <h1 className="h2">Esta cuenta no es administradora</h1>
            <p>
              Autoriza su usuario en <code>public.admins</code> desde Supabase.
            </p>
            <AdminNotices error={errorMessage} message="" />
            <button
              className="btn btn-outline"
              type="button"
              onClick={handleLogout}
              disabled={isBusy}
            >
              Cerrar sesión
            </button>
          </section>
        )}

        {authStatus === "admin" && client && session && (
          <>
            <AdminNotices error={errorMessage} message={message} />
            {activeTab === "resumen" ? (
              <section className="admin-section">
                <div className="admin-intro">
                  <p className="eyebrow">Resumen</p>
                  <h1 className="h2">
                    Hola, {session?.user.email?.split("@")[0] || "administrador"}
                  </h1>
                  <p className="lead">
                    Desde aquí administras las fotos y videos que aparecen en tu sitio.
                  </p>
                </div>
                <div className="admin-stats">
                  <AdminStat value={meetingsCount} label="Reuniones publicadas" />
                  <AdminStat
                    value={draftsCount + drafts}
                    label="Borradores y ocultos"
                  />
                  <AdminStat value={photos.length} label="Fotos" />
                  <AdminStat value={videos.length} label="Videos" />
                </div>
                <section className="admin-card">
                  <p className="eyebrow">Acciones rápidas</p>
                  <div className="admin-quick-actions">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={() => setActiveTab("galeria")}
                    >
                      Subir foto o video
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => setActiveTab("reuniones")}
                    >
                      Nueva reunión
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => setActiveTab("formacion")}
                    >
                      Agregar título
                    </button>
                    <button
                      className="btn btn-outline"
                      type="button"
                      onClick={() => setActiveTab("logros")}
                    >
                      Nuevo logro
                    </button>
                    <Link className="btn btn-outline" href="/galeria">
                      Ver galería pública
                    </Link>
                  </div>
                </section>
                <section className="admin-rules">
                  <h2>Antes de subir</h2>
                  <ul>
                    <li>Fotos JPG, PNG o WebP de hasta 15 MB.</li>
                    <li>Videos MP4 o MOV de 30 a 90 segundos y hasta 100 MB.</li>
                    <li>Los nuevos archivos quedan como borrador hasta que los publiques.</li>
                    <li>Verifica que tienes permiso para publicar a las personas que aparecen.</li>
                  </ul>
                </section>
              </section>
            ) : activeTab === "galeria" ? (
              <section className="admin-section">
                <div className="admin-intro">
                  <p className="eyebrow">Galería</p>
                  <h1 className="h2">Fotos y videos</h1>
                  <p className="lead">
                    {selectedMeeting
                      ? `Los archivos que subas se asociarán a «${selectedMeeting.title}».`
                      : "Sube fotos o videos y elige si se publican ahora o quedan como borrador."}
                  </p>
                </div>
                <section className="admin-card">
                  <form className="admin-form" onSubmit={handleUpload}>
                    <label className="admin-file-picker">
                      <span>Selecciona una foto o video</span>
                      <small>
                        JPG, PNG, WebP, MP4 o MOV. Video de 30 segundos a 1 minuto y medio.
                      </small>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime"
                        onChange={handleFileChange}
                        required
                        disabled={isBusy}
                      />
                    </label>
                    {file && (
                      <p className="admin-file-name">
                        {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    )}
                    <label className="field">
                      <span>Descripción (opcional)</span>
                      <input
                        type="text"
                        maxLength={300}
                        value={caption}
                        onChange={(event) => setCaption(event.currentTarget.value)}
                        placeholder="Describe el momento"
                        disabled={isBusy}
                      />
                    </label>
                    <label className="field">
                      <span>Visibilidad</span>
                      <select
                        value={publishStatus}
                        onChange={(event) =>
                          setPublishStatus(event.currentTarget.value as Status)
                        }
                        disabled={isBusy}
                      >
                        <option value="borrador">Guardar como borrador</option>
                        <option value="publica">Publicar en la galería</option>
                        <option value="oculta">Guardar como oculto</option>
                      </select>
                    </label>
                    <label className="field">
                      <span>Asociar a reunión (opcional)</span>
                      <select
                        value={meetingId}
                        onChange={(event) =>
                          setMeetingId(event.currentTarget.value)
                        }
                        disabled={isBusy}
                      >
                        <option value="">Solo en la galería general</option>
                        {meetingOptions.map((meeting) => (
                          <option key={meeting.id} value={meeting.id}>
                            {meeting.title} · {meeting.meeting_date}
                          </option>
                        ))}
                      </select>
                    </label>
                    {isBusy && (
                      <progress
                        className="admin-progress"
                        max={100}
                        value={progress}
                        aria-label="Progreso de subida"
                      />
                    )}
                    <button className="btn btn-primary" type="submit" disabled={isBusy}>
                      {isBusy ? `Subiendo… ${progress}%` : "Subir archivo"}
                    </button>
                  </form>
                </section>
                <div className="admin-media-heading">
                  <h2>Archivos guardados</h2>
                  <span>{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <p className="admin-empty">Todavía no hay medios cargados.</p>
                ) : (
                  <div className="admin-media-grid">
                    {items.map((item) => (
                      <article className="admin-media-card" key={item.id}>
                        {item.kind === "foto" ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.url} alt={item.caption || "Foto de galería"} />
                        ) : (
                          <video
                            src={item.url}
                            poster={item.thumb_url || undefined}
                            controls
                            playsInline
                            preload="metadata"
                          />
                        )}
                        <div className="admin-media-copy">
                          <span className={`admin-status admin-status-${item.status}`}>
                            {item.status === "publica"
                              ? "Publicada"
                              : item.status === "oculta"
                                ? "Oculta"
                                : "Borrador"}
                          </span>
                          <p>{item.caption || (item.kind === "foto" ? "Foto" : "Video")}</p>
                          {item.kind === "video" && (
                            <small>{formatDuration(item.duration_seconds)}</small>
                          )}
                          <div className="admin-media-actions">
                            <button
                              type="button"
                              className="admin-action"
                              disabled={isBusy}
                              onClick={() => void updateItem(item)}
                            >
                              {item.status === "publica" ? "Ocultar" : "Publicar"}
                            </button>
                            <button
                              type="button"
                              className="admin-action admin-action-danger"
                              disabled={isBusy}
                              onClick={() => void deleteItem(item)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            ) : (
              <AdminContentManager
                tab={activeTab}
                client={client}
                accessToken={session.access_token}
                onAddMedia={
                  activeTab === "reuniones"
                    ? (meeting) => {
                        setMeetingId(meeting.id);
                        setActiveTab("galeria");
                      }
                    : undefined
                }
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function AdminStat({ value, label }: { value: number; label: string }) {
  return (
    <div className="admin-stat">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function AdminNotices({ error, message }: { error: string; message: string }) {
  return (
    <>
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
    </>
  );
}
