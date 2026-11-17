
import { getEducation, getProfile } from "@/lib/data";
import { getSiteUrl, isReal, nameVariants } from "@/lib/site";

/**
 * Datos estructurados (schema.org) que le dicen a Google quién es la persona
 * de este sitio: nombre, variantes del nombre, profesión, redes y estudios.
 * Ayuda a que Google asocie el sitio con la persona.
 * Solo se emiten datos reales: nada de marcadores de ejemplo.
 */
export async function PersonJsonLd() {
  const [p, education] = await Promise.all([getProfile(), getEducation()]);
  if (!isReal(p.full_name)) return null;

  const url = getSiteUrl();
  const variants = nameVariants(p.full_name);

  const sameAs = [
    "https://www.facebook.com/edwinjanes.patinominota",
    "https://www.instagram.com/edwinjanes/",
    p.linkedin,
    p.youtube,
  ].filter((u) => isReal(u) && u.startsWith("http"));

  const universities = Array.from(
    new Set(education.map((e) => e.university.trim()).filter(isReal)),
  );

  const [locality, region] = p.location.split(",").map((s) => s.trim());

  const person = {
    "@type": "Person",
    "@id": `${url}/#persona`,
    name: p.full_name,
    ...(variants.length > 0 && { alternateName: variants }),
    url,
    ...(isReal(p.profession) && { jobTitle: p.profession }),
    ...(isReal(p.headline) && { description: p.headline }),
    ...(isReal(p.photo_url) && { image: p.photo_url }),
    ...(isReal(locality) && {
      address: {
        "@type": "PostalAddress",
        addressLocality: locality,
        ...(isReal(region) && { addressRegion: region }),
      },
    }),
    ...(sameAs.length > 0 && { sameAs }),
    ...(universities.length > 0 && {
      alumniOf: universities.map((name) => ({
        "@type": "CollegeOrUniversity",
        name,
      })),
    }),
  };

  const website = {
    "@type": "WebSite",
    "@id": `${url}/#sitio`,
    url,
    name: p.full_name,
    ...(variants.length > 0 && { alternateName: variants }),
    inLanguage: "es",
    publisher: { "@id": `${url}/#persona` },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [person, website],
        }).replace(/</g, "\\u003c"),
      }}
    />
  );
}
