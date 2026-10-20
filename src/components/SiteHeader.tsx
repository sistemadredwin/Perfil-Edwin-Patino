import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { getProfile } from "@/lib/data";
import { TabNav } from "./TabNav";

export async function SiteHeader() {
  const p = await getProfile();
  const city = p.location.split(",")[0].trim();
  const sub = [p.profession, city].filter(Boolean).join(" · ");
  return (
    <header className="site-header" id="top">
      <div className="header-inner">
        <Link href="/" className="brand" aria-label={`${p.full_name}, inicio`}>
          <Image
            className="brand-mark"
            src="/logo-edwin.png"
            width={56}
            height={56}
            alt=""
            priority
          />
          <span>
            <span className="brand-name">{p.full_name}</span>
            <span className="brand-sub">{sub}</span>
          </span>
        </Link>
        {/* La pestaña activa depende de la URL: se resuelve en el cliente. */}
        <Suspense fallback={null}>
          <TabNav />
        </Suspense>
      </div>
    </header>
  );
}
