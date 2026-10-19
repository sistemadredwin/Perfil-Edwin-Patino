"use client";

import { usePathname } from "next/navigation";
import { TabLinks } from "./TabLinks";

/** Marca la pestaña activa según la ruta actual. */
export function TabNav() {
  const pathname = usePathname();
  return <TabLinks pathname={pathname} />;
}
