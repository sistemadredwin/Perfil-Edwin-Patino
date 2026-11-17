import { revalidateTag } from "next/cache";
import { authorizeAdmin } from "@/lib/admin-api";
import { getCloudinaryConfig, signCloudinaryParams } from "@/lib/cloudinary";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authorization = await authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  const { id } = await params;
  if (!UUID.test(id)) {
    return Response.json({ error: "El identificador del medio no es válido." }, { status: 400 });
  }

  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    return Response.json(
      { error: "Cloudinary no está configurado." },
      { status: 503 },
    );
  }

  const { data: media, error: lookupError } = await authorization.client
    .from("media")
    .select("id, kind, public_id")
    .eq("id", id)
    .maybeSingle();
  if (lookupError) {
    console.error("No se pudo consultar el medio para eliminarlo:", lookupError.message);
    return Response.json(
      { error: "No se pudo consultar el archivo en Supabase." },
      { status: 500 },
    );
  }
  if (!media) {
    return Response.json({ error: "El medio no existe." }, { status: 404 });
  }
  if (!media.public_id) {
    return Response.json(
      { error: "Este registro no tiene identificador de Cloudinary." },
      { status: 409 },
    );
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const signature = signCloudinaryParams(
    { public_id: media.public_id, timestamp },
    cloudinary.apiSecret,
  );
  const resourceType = media.kind === "video" ? "video" : "image";
  const cloudinaryResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/${resourceType}/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        public_id: media.public_id,
        timestamp: String(timestamp),
        api_key: cloudinary.apiKey,
        signature,
      }),
    },
  );
  if (!cloudinaryResponse.ok) {
    console.error("Cloudinary rechazó la eliminación del archivo.");
    return Response.json(
      { error: "Cloudinary no pudo eliminar el archivo." },
      { status: 502 },
    );
  }

  let destroyResult: { result?: string };
  try {
    destroyResult = (await cloudinaryResponse.json()) as { result?: string };
  } catch {
    return Response.json(
      { error: "Cloudinary devolvió una respuesta no válida al eliminar." },
      { status: 502 },
    );
  }
  if (destroyResult.result !== "ok" && destroyResult.result !== "not found") {
    return Response.json(
      { error: "Cloudinary no confirmó la eliminación del archivo." },
      { status: 502 },
    );
  }

  const { error: deleteError } = await authorization.client
    .from("media")
    .delete()
    .eq("id", id);
  if (deleteError) {
    console.error("No se pudo borrar el registro del medio:", deleteError.message);
    return Response.json(
      { error: "Se eliminó el archivo, pero no se pudo borrar su registro." },
      { status: 500 },
    );
  }

  revalidateTag("media", "max");
  revalidateTag("meetings", "max");
  return Response.json({ ok: true });
}
