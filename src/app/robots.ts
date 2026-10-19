import type { MetadataRoute } from "next";
import { getSiteUrl, isSampleMode } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Con datos de ejemplo no se permite rastrear nada.
  if (isSampleMode()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
