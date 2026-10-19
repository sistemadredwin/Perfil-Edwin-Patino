import type { MetadataRoute } from "next";
import { getMeetings } from "@/lib/data";
import { getSiteUrl } from "@/lib/site";

/** Mapa del sitio: le dice a Google qué páginas existen (se envía en Search Console). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const meetings = await getMeetings();

  const pages = ["", "/formacion", "/propuesta", "/reuniones", "/logros", "/galeria", "/contacto"];
  return [
    ...pages.map((path) => ({
      url: `${base}${path}`,
      priority: path === "" ? 1 : 0.7,
    })),
    ...meetings.map((m) => ({
      url: `${base}/reuniones/${m.slug}`,
      lastModified: m.updated_at ?? m.meeting_date,
      priority: 0.5,
    })),
  ];
}
