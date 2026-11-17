"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { TabLinks } from "./TabLinks";

/** Marca la pestaña activa según la ruta actual. */
export function TabNav({ brandName }: { brandName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  return (
    <>
      <button
        ref={toggleRef}
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
        aria-hidden={!open}
      >
        <button
          className="site-menu-backdrop"
          type="button"
          tabIndex={open ? 0 : -1}
          aria-label="Cerrar menú"
          onClick={() => {
            setOpen(false);
            toggleRef.current?.focus();
          }}
        />
        <div className="site-menu-panel">
          <div className="site-menu-header">
            <div className="site-menu-heading">
              <strong>Navega por</strong>
              <span>{brandName}</span>
              <small>Buenaventura · Valle del Cauca</small>
            </div>
          </div>
          <TabLinks pathname={pathname} onNavigate={() => setOpen(false)} />
          <div className="site-menu-footer" aria-hidden="true">
            <span />
            Una ciudad, muchas historias
          </div>
        </div>
      </div>
    </>
  );
}
