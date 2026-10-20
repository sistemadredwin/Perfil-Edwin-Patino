"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { TabLinks } from "./TabLinks";

/** Marca la pestaña activa según la ruta actual. */
export function TabNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="mobile-menu-toggle"
        type="button"
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        <span className="hamburger-icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>
      <div
        className={`site-menu${open ? " is-open" : ""}`}
        id="site-menu"
      >
        <TabLinks pathname={pathname} onNavigate={() => setOpen(false)} />
      </div>
    </>
  );
}
