
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

        <div className="footer-social">
          <a
            className="footer-social-link"
            href="https://www.facebook.com/edwinjanes.patinominota"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-facebook" aria-hidden="true" />
            Facebook
          </a>

          <span aria-hidden="true">·</span>

          <a
            className="footer-social-link"
            href="https://www.instagram.com/edwinjanes/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="bi bi-instagram" aria-hidden="true" />
            Instagram
          </a>
        </div>

        <span className="footer-tagline">
          Buenaventura, estoy contigo
        </span>
      </div>
    </footer>
  );
}
