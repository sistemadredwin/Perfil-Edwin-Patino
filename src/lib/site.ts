/**
 * Ayudas para el posicionamiento (SEO): dirección pública del sitio, detección
 * de datos de ejemplo y variantes del nombre que la gente escribe al buscar.
 */

/**
 * Dirección pública del sitio, sin barra final.
 * Prioridad: NEXT_PUBLIC_SITE_URL (tu dominio) → dirección de producción que
 * da Vercel → localhost. Con dominio propio, define NEXT_PUBLIC_SITE_URL: así
 * las direcciones canónicas, el sitemap y los datos estructurados apuntan al
 * dominio y no a la dirección *.vercel.app.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** true mientras Supabase no está configurado (el sitio muestra datos de ejemplo). */
export function isSampleMode(): boolean {
  return !(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Un valor "real": no vacío, no "#" y no un marcador entre corchetes. */
export function isReal(value: string | null | undefined): value is string {
  const v = (value ?? "").trim();
  return v !== "" && v !== "#" && !v.startsWith("[");
}

export function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Otras formas en que se escribe el nombre al buscarlo: con y sin tilde o ñ
 * ("Patiño" / "Patino") y con y sin título ("Dr. Edwin Patiño" / "Edwin Patiño").
 * No incluye el nombre principal.
 */
/** Formas cortas con las que la gente busca a la persona de este sitio. */
const SEARCH_NAMES = [
  "Edwin Patiño",
  "Dr. Edwin Patiño",
  "Edwin Patiño Minotta",
  "Edwin Janes Patiño",
];

export function nameVariants(fullName: string): string[] {
  const main = fullName.trim();
  const bare = main.replace(/^(dr|dra|doctor|doctora)\.?\s+/i, "").trim();
  const candidates = [
    ...SEARCH_NAMES,
    ...SEARCH_NAMES.map(stripAccents),
    bare,
    stripAccents(main),
    stripAccents(bare),
    bare === main ? `Dr. ${bare}` : "",
    bare === main ? stripAccents(`Dr. ${bare}`) : "",
  ];
  return Array.from(new Set(candidates.filter(Boolean))).filter(
    (v) => v !== main,
  );
}
