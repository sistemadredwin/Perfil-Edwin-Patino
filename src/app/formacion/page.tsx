/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { getEducation, getProfile } from "@/lib/data";
import { LEVEL_LABEL } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Formación",
    path: "/formacion",
    describe: (name) =>
      `Formación académica de ${name}: títulos universitarios, programas y universidades.`,
  });
}

export default async function FormacionPage() {
  const [education, profile] = await Promise.all([
    getEducation(),
    getProfile(),
  ]);

  return (
    <section className="section">
      <div className="container">
        <div className="intro">
          <div className="eyebrow">Formación</div>
          <h1 className="h2">
            Una trayectoria académica construida en varias aulas
          </h1>
          {profile.bio && <p className="lead">{profile.bio}</p>}
        </div>

        {education.length === 0 ? (
          <p className="empty">Todavía no hay títulos registrados.</p>
        ) : (
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {education.map((e) => (
              <li key={e.id} className="edu-row">
                <div className="edu-year">{e.year ?? "—"}</div>
                <div className="edu-body">
                  <span className="edu-level">{LEVEL_LABEL[e.level]}</span>
                  <h2 className="edu-program">{e.program}</h2>
                  {e.university && <p className="edu-uni">{e.university}</p>}
                  {e.description && <p className="edu-desc">{e.description}</p>}
                </div>
                {e.logo_url ? (
                  <img
                    className="edu-logo"
                    src={e.logo_url}
                    alt={`Escudo de ${e.university}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="edu-logo" aria-hidden="true" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
