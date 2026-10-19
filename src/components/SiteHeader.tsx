import Link from "next/link";
import { Suspense } from "react";
import { getProfile } from "@/lib/data";
import { TabLinks } from "./TabLinks";
import { TabNav } from "./TabNav";

export async function SiteHeader() {
  const p = await getProfile();
  const city = p.location.split(",")[0].trim();
  const sub = [p.profession, city].filter(Boolean).join(" · ");
  return (
    <header className="site-header" id="top">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label={`${p.full_name}, inicio`}>
          <span className="brand-mark" aria-hidden="true" />
          <span>
            <span className="brand-name">{p.full_name}</span>
            <span className="brand-sub">{sub}</span>
          </span>
        </Link>
        {/* La pestaña activa depende de la URL: se resuelve en el cliente. */}
        <Suspense fallback={<TabLinks pathname={null} />}>
          <TabNav />
        </Suspense>
      </div>
    </header>
  );
}
