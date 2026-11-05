/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { PersonJsonLd } from "@/components/PersonJsonLd";
import { getProfile, getStats } from "@/lib/data";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [profile, stats] = await Promise.all([getProfile(), getStats()]);

  const numbers: { value: number | null; label: string }[] = [
    { value: stats.years, label: "Años de trayectoria" },
    { value: stats.titles, label: "Títulos académicos" },
    { value: stats.positions, label: "Cargos y experiencias" },
  ];

  return (
    <div className="home-page">
      <PersonJsonLd />
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-copy">
            <div className="eyebrow home-eyebrow">Buenaventura · Valle del Cauca</div>
            <h1 className="home-title">
              <span>Edwin Janes</span>
              <span>Patiño Minotta</span>
            </h1>
            <p className="home-lead">
              Abogado y contador público al servicio de Buenaventura.
            </p>
            <div className="btn-row home-actions">
              <Link href="/formacion" className="btn btn-primary">
                Conoce su historia
                <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <a className="home-scroll-cue" href="#trayectoria">
              <span aria-hidden="true" />
              Desliza
            </a>
          </div>

          <div className="home-portrait-wrap">
            <div className="home-portrait-frame">
              {profile.photo_url ? (
                <img
                  className="media-fill home-portrait"
                  src={profile.photo_url}
                  alt={`Retrato de ${profile.full_name}`}
                  fetchPriority="high"
                />
              ) : (
                <div
                  className="home-portrait home-portrait-placeholder"
                  role="img"
                  aria-label={`Retrato de ${profile.full_name} no disponible`}
                />
              )}
              {stats.years !== null && stats.years > 0 && (
                <div className="home-portrait-badge">
                  <strong>{stats.years}</strong>
                  <span>años de<br />servicio</span>
                </div>
              )}
              <div className="home-portrait-caption">
                <span>Buenaventura</span>
              </div>
            </div>
            <div className="home-portrait-accent" aria-hidden="true" />
          </div>
        </div>
        <div className="home-hero-rule" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="container home-stats-container" data-reveal="up">
        <ul className="stats home-stats" aria-label="Trayectoria en cifras">
          {numbers
            .filter((item) => item.value !== null && item.value > 0)
            .map((item) => (
              <li key={item.label} className="stat home-stat">
                <strong data-count={item.value}>{item.value}</strong>
                <span>{item.label}</span>
              </li>
            ))}
        </ul>
      </div>

      <section className="home-story section" id="trayectoria">
        <div className="home-story-inner" data-reveal="up">
          <div>
            <div className="eyebrow">Vocación de servicio</div>
            <h2 className="h2">
              Experiencia y compromiso con Buenaventura.
            </h2>
          </div>
          <div className="home-story-copy">
            <p className="lead">{profile.bio || profile.headline}</p>
            <Link href="/logros" className="text-link home-story-link">
              Explora mi experiencia <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
