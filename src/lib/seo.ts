import type { Metadata } from "next";
import { getProfile } from "./data";

/**
 * Metadatos de una pestaña: título, descripción propia y dirección canónica
 * (la dirección "oficial" de la página, para que Google no la duplique entre
 * tu dominio y la dirección *.vercel.app).
 */
export async function pageMetadata(opts: {
  title: string;
  path: string;
  describe: (name: string, profession: string) => string;
}): Promise<Metadata> {
  const p = await getProfile();
  const description = opts.describe(p.full_name, p.profession);
  return {
    title: opts.title,
    description,
    alternates: { canonical: opts.path },
    openGraph: { title: `${opts.title} · ${p.full_name}`, description },
  };
}
