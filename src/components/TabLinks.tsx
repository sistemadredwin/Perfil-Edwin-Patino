import Link from "next/link";

export const TABS = [
  { href: "/", label: "Inicio" },
  { href: "/formacion", label: "Formación" },
  { href: "/reuniones", label: "Reuniones" },
  { href: "/logros", label: "Logros" },
  { href: "/galeria", label: "Galería" },
  { href: "/contacto", label: "Contacto" },
] as const;

export function isActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Lista de pestañas. Se renderiza igual en servidor y en cliente. */
export function TabLinks({
  pathname,
  onNavigate,
}: {
  pathname: string | null;
  onNavigate?: () => void;
}) {
  return (
    <nav className="tabs" aria-label="Secciones del sitio">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="tab"
          aria-current={isActive(tab.href, pathname) ? "page" : undefined}
          onClick={onNavigate}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
