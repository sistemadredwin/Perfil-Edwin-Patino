import type { Metadata } from "next";
import {
  COMPROMISOS,
  EJES,
  FINANCIACION,
  PLAN,
  PROPUESTA_LEMA,
  PROPUESTA_PERIODO,
  PROPUESTA_TITULO,
} from "@/lib/propuesta";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Propuesta",
    path: "/propuesta",
    describe: (name) =>
      `${PROPUESTA_TITULO}: propuesta de ${name} para Buenaventura 2028–2031 en seguridad, turismo y desarrollo económico.`,
  });
}

export default function PropuestaPage() {
  return (
    <>
      <section className="section">
        <div className="container">
          <div className="intro">
            <div className="eyebrow">{PROPUESTA_PERIODO}</div>
            <h1 className="h2">{PROPUESTA_TITULO}</h1>
            <p className="lead">“{PROPUESTA_LEMA}”</p>
          </div>

          {EJES.map((eje) => (
            <div key={eje.numero} className="eje">
              <div className="eje-head">
                <span className="eje-num">Eje {eje.numero}</span>
                <h2 className="eje-title">{eje.titulo}</h2>
                <p className="eje-purpose">Propósito: {eje.proposito}</p>
              </div>
              <ul className="cards eje-cards">
                {eje.puntos.map((p) => (
                  <li key={p.titulo} className="card">
                    <div className="card-body">
                      <h3>{p.titulo}</h3>
                      <p>{p.texto}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-dark">
        <div className="container">
          <div className="intro">
            <div className="eyebrow">Compromisos transversales 2028–2031</div>
            <h2 className="h2">Un gobierno integral y de derechos</h2>
          </div>
          <ul className="achievements" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {COMPROMISOS.map((c) => (
              <li key={c.area} className="achievement">
                <h3>{c.area}</h3>
                <p>{c.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="intro">
            <div className="eyebrow">Plan de ejecución 2028–2031</div>
            <h2 className="h2">De las ideas a la gestión verificable</h2>
          </div>
          <ol className="plan">
            {PLAN.map((p) => (
              <li key={p.anio} className="plan-step">
                <span className="plan-year">{p.anio}</span>
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </li>
            ))}
          </ol>

          <div className="intro" style={{ marginTop: 56 }}>
            <div className="eyebrow">Estrategia financiera</div>
            <h2 className="h2">Viabilidad y rigor en la gestión pública</h2>
          </div>
          <ul className="cards eje-cards">
            {FINANCIACION.map((f) => (
              <li key={f.titulo} className="card">
                <div className="card-body">
                  <h3>{f.titulo}</h3>
                  <p>{f.texto}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
