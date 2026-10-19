import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { getProfile } from "@/lib/data";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Contacto",
    path: "/contacto",
    describe: (name, profession) =>
      `Contacta a ${name}${profession ? `, ${profession}` : ""}: correo, teléfono y redes sociales.`,
  });
}

const isPlaceholder = (s: string) => s.trim().startsWith("[");

function socials(p: Awaited<ReturnType<typeof getProfile>>) {
  const list: { label: string; href: string }[] = [];
  if (p.linkedin) list.push({ label: "LinkedIn", href: p.linkedin });
  if (p.instagram) list.push({ label: "Instagram", href: p.instagram });
  if (p.youtube) list.push({ label: "YouTube", href: p.youtube });
  const digits = p.whatsapp.replace(/\D/g, "");
  if (digits) list.push({ label: "WhatsApp", href: `https://wa.me/${digits}` });
  return list;
}

export default async function ContactoPage() {
  const profile = await getProfile();
  const links = socials(profile);

  return (
    <section className="section">
      <div className="container">
        <div className="contact">
          <div className="contact-info">
            <div className="intro" style={{ marginBottom: 0 }}>
              <div className="eyebrow">Contacto y redes</div>
              <h1 className="h2">Conversemos</h1>
              <p className="lead">
                Escríbeme para consultas, colaboraciones o para saber más de mi
                trabajo.
              </p>
            </div>

            <div className="stack" style={{ gap: 18 }}>
              {profile.email && (
                <div className="info-item">
                  <small>Correo</small>
                  {isPlaceholder(profile.email) ? (
                    <span>{profile.email}</span>
                  ) : (
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  )}
                </div>
              )}
              {profile.phone && (
                <div className="info-item">
                  <small>Teléfono</small>
                  {isPlaceholder(profile.phone) ? (
                    <span>{profile.phone}</span>
                  ) : (
                    <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
                      {profile.phone}
                    </a>
                  )}
                </div>
              )}
              {profile.location && (
                <div className="info-item">
                  <small>Ubicación</small>
                  <span>{profile.location}</span>
                </div>
              )}
            </div>

            {links.length > 0 && (
              <ul
                className="socials"
                aria-label="Redes sociales"
                style={{ listStyle: "none", margin: 0, padding: 0 }}
              >
                {links.map((l) => (
                  <li key={l.label}>
                    <a
                      className="social"
                      href={l.href}
                      {...(l.href.startsWith("http")
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
