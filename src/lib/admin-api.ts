import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type AdminAuthorization =
  | { client: SupabaseClient }
  | { response: Response };

export async function authorizeAdmin(
  request: Request,
): Promise<AdminAuthorization> {
  const token = request.headers
    .get("authorization")
    ?.match(/^Bearer\s+(\S+)$/i)?.[1];
  if (!token) {
    return {
      response: Response.json(
        { error: "Inicia sesión para continuar." },
        { status: 401 },
      ),
    };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      response: Response.json(
        { error: "Falta configurar la conexión con Supabase." },
        { status: 503 },
      ),
    };
  }

  const client = createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser(token);
  if (authError || !user) {
    return {
      response: Response.json(
        { error: "La sesión venció. Inicia sesión otra vez." },
        { status: 401 },
      ),
    };
  }

  const { data: isAdmin, error } = await client.rpc("is_admin");
  if (error) {
    console.error(
      "No se pudo verificar el permiso de administrador:",
      error.message,
    );
    return {
      response: Response.json(
        { error: "No se pudo comprobar el permiso de administrador." },
        { status: 500 },
      ),
    };
  }
  if (isAdmin !== true) {
    return {
      response: Response.json(
        { error: "Esta cuenta no tiene permiso de administrador." },
        { status: 403 },
      ),
    };
  }

  return { client };
}
