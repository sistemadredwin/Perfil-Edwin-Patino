/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { getEducation } from "@/lib/data";
import { LEVEL_LABEL } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Formación",
    path: "/formacion",
    describe: (name) =>
      `Formación académica y experiencia en planeación pública con enfoque étnico de ${name}.`,
  });
}

export default async function FormacionPage() {
  const education = await getEducation();

  return (
    <section className="section">
      <div className="container">
        <div className="intro">
          <div className="eyebrow">Formación</div>
          <h1 className="h2">
            Una trayectoria académica construida en varias aulas
          </h1>
          <p className="lead">
            Abogado y contador público, con especializaciones en Intervención
            Social Comunitaria, Cultura de Paz y Derecho Internacional
            Humanitario, y Gerencia Financiera. Su trayectoria reúne el
            conocimiento jurídico y la gestión de recursos con la defensa de
            los derechos humanos y el trabajo con las comunidades. Ha trabajado
            en el Concejo de Buenaventura, la Universidad del Pacífico y la
            Personería Distrital. En el Departamento Nacional de Planeación,
            desde el área de Asuntos Étnicos, apoyó la articulación en derechos
            humanos y paz, así como el seguimiento a los compromisos del Plan
            Nacional de Desarrollo relacionados con las comunidades negras,
            afrocolombianas, raizales y palenqueras (NARP).
          </p>
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
