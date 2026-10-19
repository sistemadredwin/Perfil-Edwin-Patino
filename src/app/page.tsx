/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { PersonJsonLd } from "@/components/PersonJsonLd";
import { getEducation, getProfile, getStats } from "@/lib/data";

export const metadata: Metadata = { alternates: { canonical: "/" } };

export default async function HomePage() {
  const [profile, education, stats] = await Promise.all([
    getProfile(),
    getEducation(),
    getStats(),
  ]);
  const city = profile.location.split(",")[0].trim();
  const eyebrow = [profile.profession, city].filter(Boolean).join(" · ");
  const chips = education.slice(0, 3);

  const numbers: { value: number | null; label: string }[] = [
    { value: stats.titles, label: "Títulos universitarios" },
    { value: stats.years, label: "Años de trayectoria pública" },
    { value: stats.positions, label: "Cargos públicos y de dirección" },
  ];

  return (
    <section className="section">
      <PersonJsonLd />
      <div className="container">
        <div className="hero">
          <div className="hero-copy">
            <div className="eyebrow">{eyebrow}</div>
            <h1 className="h1">{profile.full_name}</h1>
            {profile.headline && <p>{profile.headline}</p>}
            {chips.length > 0 && (
              <ul className="chips" aria-label="Títulos principales">
                {chips.map((e) => (
                  <li key={e.id} className="chip">
                    {e.program}
                  </li>
                ))}
              </ul>
            )}
            <div className="btn-row">
              <Link href="/formacion" className="btn btn-primary">
                Mi formación
              </Link>
            </div>
          </div>

          <div className="portrait-wrap">
            <div className="portrait-frame">
              <div className="portrait-backdrop" aria-hidden="true" />
              <div className="portrait">
                {profile.photo_url ? (
                  <img
                    className="media-fill"
                    src={profile.photo_url}
                    alt={`Retrato de ${profile.full_name}`}
                  />
                ) : (
                  <span className="ph-label">[Foto de perfil]</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <ul className="stats" aria-label="Cifras destacadas">
          {numbers
            .filter((n) => n.value !== null && n.value > 0)
            .map((n) => (
              <li key={n.label} className="stat">
                <strong>{n.value}</strong>
                <span>{n.label}</span>
              </li>
            ))}
        </ul>
      </div>
    </section>
  );
}
