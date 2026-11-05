import { ImageResponse } from "next/og";
import { getProfile } from "@/lib/data";

export const alt = "Perfil profesional";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Tarjeta que se ve al compartir el enlace (WhatsApp, LinkedIn, etc.):
 * nombre y profesión sobre azul marino, con el acento de la bandera.
 */
export default async function Image() {
  const p = await getProfile();
  const city = p.location.split(",")[0].trim();
  const sub = [p.profession, city].filter(Boolean).join(" · ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#14233f",
          color: "#f1f2f4",
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: 8,
            display: "flex",
            background: "linear-gradient(to top right, #f2c200 50%, #0e8a4b 50%)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            {p.full_name}
          </div>
          {sub && (
            <div style={{ fontSize: 36, color: "#e8c25a", letterSpacing: 4 }}>
              {sub.toUpperCase()}
            </div>
          )}
        </div>
        <div
          style={{ width: "100%", height: 8, display: "flex", background: "#d4a72c" }}
        />
      </div>
    ),
    size,
  );
}
