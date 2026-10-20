import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getProfile } from "@/lib/data";
import { getSiteUrl, isSampleMode } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();
  const name = p.full_name || "Perfil profesional";
  const description = p.headline || p.bio || undefined;
  const title = p.profession ? `${name} · ${p.profession}` : name;
  const googleCode = process.env.GOOGLE_SITE_VERIFICATION;
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: title, template: `%s · ${name}` },
    description,
    applicationName: name,
    authors: [{ name }],
    // Con datos de ejemplo (sin Supabase) no se debe indexar nada.
    robots: isSampleMode()
      ? { index: false, follow: false }
      : { index: true, follow: true },
    verification: googleCode ? { google: googleCode } : undefined,
    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: name,
      title,
      description,
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
