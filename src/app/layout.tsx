
import type { Metadata } from "next";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./globals.css";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollExperience } from "@/components/ScrollExperience";
import { getProfile } from "@/lib/data";
import { getSiteUrl, isSampleMode } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const p = await getProfile();

  const name = p.full_name || "Edwin Patiño";

  const title = `${name} | Perfil oficial`;

  const description =
    "Edwin Janes Patiño Minotta, abogado y contador público de Buenaventura. Conoce su trayectoria, formación y compromiso con las comunidades del territorio.";

  const googleCode = process.env.GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(getSiteUrl()),

    title: {
      default: title,
      template: `%s | ${name}`,
    },

    description,

    applicationName: name,

    authors: [{ name }],

    creator: name,

    publisher: name,

    keywords: [
      name,
      "Edwin Patiño",
      "Edwin Janes Patiño Minotta",
      "Perfil oficial de Edwin Patiño",
      "Buenaventura",
      "Valle del Cauca",
      "Perfil profesional",
      "Trayectoria de Edwin Patiño",
    ],

    robots: isSampleMode()
      ? { index: false, follow: false }
      : { index: true, follow: true },

    verification: googleCode
      ? { google: googleCode }
      : undefined,

    openGraph: {
      type: "website",
      locale: "es_CO",
      siteName: name,
      title,
      description,
    },

    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="es" data-scroll-behavior="smooth">
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
        <ScrollExperience />
      </body>
    </html>
  );
}
