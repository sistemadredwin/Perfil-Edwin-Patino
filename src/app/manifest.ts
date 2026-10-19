import type { MetadataRoute } from "next";
import { getProfile } from "@/lib/data";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const profile = await getProfile();
  const name = profile.full_name || "Perfil profesional";
  const description =
    profile.headline || `Perfil profesional de ${name}.`;

  return {
    name,
    short_name: "Edwin Patiño",
    description,
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f1f2f4",
    theme_color: "#14233f",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
