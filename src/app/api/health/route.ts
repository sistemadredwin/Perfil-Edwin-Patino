import { connection } from "next/server";
import { getSupabase } from "@/lib/supabase";

/**
 * Chequeo de salud. Hace una consulta mínima a Supabase en cada visita, así
 * que si un monitor (por ejemplo UptimeRobot) la visita cada pocos minutos,
 * el proyecto gratuito de Supabase no se pausa por inactividad.
 */
export async function GET() {
  await connection(); // siempre en tiempo de solicitud, nunca prerenderizada

  const sb = getSupabase();
  if (!sb) {
    return Response.json(
      { ok: true, database: "no configurada" },
      { headers: { "Cache-Control": "no-store" } },
    );
  }

  const { error } = await sb.from("profile").select("full_name").limit(1);
  return Response.json(
    { ok: !error, database: error ? "error" : "ok" },
    {
      status: error ? 503 : 200,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
