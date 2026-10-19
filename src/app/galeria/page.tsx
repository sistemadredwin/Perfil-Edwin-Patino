import type { Metadata } from "next";
import { MediaTile } from "@/components/MediaTile";
import { getGallery } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Galería",
    path: "/galeria",
    describe: (name) => `Fotos y videos cortos del trabajo de ${name}.`,
  });
}

// Alturas de los marcadores de posición, para que el mosaico se vea variado.
const HEIGHTS = [280, 360, 250, 400, 300, 340];

export default async function GaleriaPage() {
  const media = await getGallery();

  return (
    <section className="section">
      <div className="container">
        <div className="intro">
          <div className="eyebrow">Galería</div>
          <h1 className="h2">Momentos en imagen</h1>
          <p className="lead">
            Fotos y videos de entre 30 segundos y 1 minuto y medio.
          </p>
        </div>

        {media.length === 0 ? (
          <p className="empty">Todavía no hay fotos ni videos publicados.</p>
        ) : (
          <div className="masonry">
            {media.map((m, i) => (
              <MediaTile key={m.id} media={m} height={HEIGHTS[i % HEIGHTS.length]} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
