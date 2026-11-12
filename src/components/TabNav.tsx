"use client";

import Image from "next/image";
import Link from "next/link";
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
            <Link
              href="/"
              className="site-menu-brand"
              aria-label={`${brandName}, inicio`}
              onClick={() => setOpen(false)}
            >
              <Image src="/logo-edwin.png" width={36} height={36} alt="" />
              <span>{brandName}</span>
            </Link>
            <button
              className="site-menu-close"
              type="button"
              onClick={() => {
                setOpen(false);
                toggleRef.current?.focus();
              }}
            >
              Cerrar menú
            </button>
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
