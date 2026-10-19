import type { Metadata } from "next";
import { getAchievements } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Logros",
    path: "/logros",
    describe: (name) => `Logros, hitos y reconocimientos de ${name}.`,
  });
}

export default async function LogrosPage() {
  const achievements = await getAchievements();

  return (
    <section className="section section-dark">
      <div className="container">
        <div className="intro">
          <div className="eyebrow">Mis logros</div>
          <h1 className="h2">Hitos que marcaron el camino</h1>
        </div>

        {achievements.length === 0 ? (
          <p className="empty" style={{ color: "var(--on-dark)" }}>
            Todavía no hay logros registrados.
          </p>
        ) : (
          <ul
            className="achievements"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {achievements.map((a, i) => (
              <li key={a.id} className="achievement">
                <span className="year">
                  {String(i + 1).padStart(2, "0")}
                  {a.year ? ` · ${a.year}` : ""}
                </span>
                <h2 style={{ margin: 0 }}>{a.title}</h2>
                {a.description && <p>{a.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
