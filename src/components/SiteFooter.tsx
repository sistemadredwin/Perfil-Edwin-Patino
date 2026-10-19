import { cacheLife, cacheTag } from "next/cache";
import { getProfile } from "@/lib/data";

export async function SiteFooter() {
  "use cache";
  cacheLife("days");
  cacheTag("profile");

  const p = await getProfile();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span>
          {p.full_name} · {p.location} · © {year}
        </span>
        <a href="#top">Volver arriba</a>
      </div>
    </footer>
  );
}
