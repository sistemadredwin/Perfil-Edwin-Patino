import { revalidateTag } from "next/cache";
import { authorizeAdmin } from "@/lib/admin-api";
import { getCloudinaryConfig, verifyCloudinarySignature } from "@/lib/cloudinary";
import type { Status } from "@/lib/types";

type CloudinaryUpload = {
  public_id?: unknown;
  version?: unknown;
  signature?: unknown;
  secure_url?: unknown;
  resource_type?: unknown;
  format?: unknown;
  duration?: unknown;
};

type CloudinaryAsset = {
  public_id?: unknown;
  version?: unknown;
  secure_url?: unknown;
  resource_type?: unknown;
  format?: unknown;
  duration?: unknown;
  bytes?: unknown;
};

const STATUSES = new Set<Status>(["publica", "oculta", "borrador"]);
const IMAGE_FORMATS = new Set(["jpg", "jpeg", "png", "webp"]);
const VIDEO_FORMATS = new Set(["mp4", "mov"]);

function getDurationSeconds(value: unknown): number | null {
  const duration =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;
  return Number.isFinite(duration) && duration > 0 ? duration : null;
}

export async function POST(request: Request) {
  const authorization = await authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    return Response.json(
      { error: "Cloudinary no está configurado." },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "La solicitud no contiene JSON válido." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object") {
    return Response.json(
      { error: "Los datos del medio no son válidos." },
      { status: 400 },
    );
  }

  const payload = body as {
    kind?: unknown;
    caption?: unknown;
    status?: unknown;
    meeting_id?: unknown;
    upload?: CloudinaryUpload;
  };
  const { kind, caption, status, meeting_id, upload } = payload;
  if (
    (kind !== "foto" && kind !== "video") ||
    typeof status !== "string" ||
    !STATUSES.has(status as Status) ||
    !upload ||
    typeof upload !== "object"
  ) {
    return Response.json(
      { error: "Los datos del medio no son válidos." },
      { status: 400 },
    );
  }
  if (
    meeting_id !== null &&
    meeting_id !== undefined &&
    (typeof meeting_id !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        meeting_id,
      ))
  ) {
    return Response.json(
      { error: "La reunión asociada no es válida." },
      { status: 400 },
    );
  }

  const { public_id, version, signature } = upload;
  if (
    typeof public_id !== "string" ||
    !/^[A-Za-z0-9_./-]{1,240}$/.test(public_id) ||
    public_id.includes("..") ||
    typeof version !== "number" ||
    !Number.isSafeInteger(version) ||
    typeof signature !== "string"
  ) {
    return Response.json(
      { error: "La respuesta del servicio de archivos no es válida." },
      { status: 400 },
    );
  }

  if (
    !verifyCloudinarySignature(
      { public_id, version },
      signature,
      cloudinary.apiSecret,
    )
  ) {
    return Response.json(
      { error: "No se pudo verificar el archivo recibido." },
      { status: 400 },
    );
  }

  const expectedResourceType = kind === "foto" ? "image" : "video";
  const allowedFormats = kind === "foto" ? IMAGE_FORMATS : VIDEO_FORMATS;
  const publicIdPath = public_id
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const assetResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/resources/${expectedResourceType}/upload/${publicIdPath}`,
    {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${cloudinary.apiKey}:${cloudinary.apiSecret}`,
        ).toString("base64")}`,
      },
      cache: "no-store",
    },
  );
  if (!assetResponse.ok) {
    console.error(
      "Cloudinary no pudo confirmar los metadatos del archivo:",
      assetResponse.status,
    );
    return Response.json(
      { error: "No se pudo verificar el archivo en Cloudinary." },
      { status: 502 },
    );
  }

  let asset: CloudinaryAsset;
  try {
    asset = (await assetResponse.json()) as CloudinaryAsset;
  } catch {
    return Response.json(
      { error: "Cloudinary devolvió metadatos no válidos." },
      { status: 502 },
    );
  }
  if (
    asset.public_id !== public_id ||
    asset.version !== version ||
    asset.resource_type !== expectedResourceType ||
    typeof asset.secure_url !== "string" ||
    typeof asset.format !== "string" ||
    typeof asset.bytes !== "number" ||
    !Number.isSafeInteger(asset.bytes)
  ) {
    return Response.json(
      { error: "Los metadatos del archivo no coinciden con la subida." },
      { status: 400 },
    );
  }

  const maxBytes = kind === "foto" ? 15 * 1024 * 1024 : 100 * 1024 * 1024;
  if (asset.bytes <= 0 || asset.bytes > maxBytes) {
    return Response.json(
      {
        error:
          kind === "foto"
            ? "La foto no puede superar 15 MB."
            : "El video no puede superar 100 MB.",
      },
      { status: 413 },
    );
  }

  const secureUrl = asset.secure_url;
  const format = asset.format.toLowerCase();
  let fileUrl: URL;
  try {
    fileUrl = new URL(secureUrl);
  } catch {
    return Response.json(
      { error: "La dirección del archivo no es válida." },
      { status: 400 },
    );
  }
  if (
    !allowedFormats.has(format) ||
    fileUrl.protocol !== "https:" ||
    fileUrl.hostname !== "res.cloudinary.com" ||
    !fileUrl.pathname.includes(`/${expectedResourceType}/upload/`)
  ) {
    return Response.json(
      { error: "El tipo o la dirección del archivo no son válidos." },
      { status: 400 },
    );
  }

  let durationSeconds: number | null = null;
  if (kind === "video") {
    const verifiedDuration =
      getDurationSeconds(asset.duration) ?? getDurationSeconds(upload.duration);
    if (verifiedDuration === null) {
      return Response.json(
        {
          error:
            "Cloudinary no devolvió la duración del video. Intenta subirlo de nuevo.",
        },
        { status: 400 },
      );
    }
    if (verifiedDuration < 30 || verifiedDuration > 90) {
      return Response.json(
        {
          error: `Cloudinary detectó ${verifiedDuration.toFixed(2)} segundos; el video debe durar entre 30 y 90 segundos.`,
        },
        { status: 400 },
      );
    }
    durationSeconds = verifiedDuration;
  }

  const thumbUrl =
    kind === "foto"
      ? secureUrl
      : secureUrl
          .replace("/video/upload/", "/video/upload/so_0,w_1000,f_jpg/")
          .replace(/\.[^/.]+$/, ".jpg");
  const { data, error } = await authorization.client
    .from("media")
    .insert({
      meeting_id: typeof meeting_id === "string" ? meeting_id : null,
      kind,
      url: secureUrl,
      thumb_url: thumbUrl,
      public_id,
      duration_seconds: durationSeconds,
      caption:
        typeof caption === "string" ? caption.trim().slice(0, 300) : "",
      sort_order: 0,
      status: status as Status,
    })
    .select("id")
    .single();

  if (error) {
    console.error("No se pudo registrar el medio en Supabase:", {
      code: error.code,
      message: error.message,
    });
    const userMessage =
      error.code === "23514"
        ? "Supabase todavía tiene una regla anterior para la duración. Ejecuta la actualización SQL de videos de 30 a 90 segundos en el README."
        : error.code === "42501"
          ? "Supabase rechazó el registro. Confirma que esta cuenta esté autorizada como administradora."
          : error.code === "23503"
            ? "La reunión seleccionada ya no existe. Actualiza el panel y vuelve a intentarlo."
            : error.code === "PGRST204" || error.code === "42703"
              ? "El esquema de Supabase está desactualizado. Ejecuta la actualización SQL indicada en el README."
              : "El archivo se subió, pero no se pudo registrar en Supabase.";
    return Response.json(
      { error: userMessage },
      { status: 500 },
    );
  }

  revalidateTag("media", "max");
  return Response.json({ id: data.id }, { status: 201 });
}

export async function PATCH(request: Request) {
  const authorization = await authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "La solicitud no contiene JSON válido." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object") {
    return Response.json(
      { error: "Los datos del medio no son válidos." },
      { status: 400 },
    );
  }

  const { id, status } = body as { id?: unknown; status?: unknown };
  if (
    typeof id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id,
    ) ||
    typeof status !== "string" ||
    !STATUSES.has(status as Status)
  ) {
    return Response.json(
      { error: "El estado o identificador del medio no son válidos." },
      { status: 400 },
    );
  }

  const { error } = await authorization.client
    .from("media")
    .update({ status: status as Status })
    .eq("id", id);
  if (error) {
    console.error("No se pudo actualizar la visibilidad del medio:", error.message);
    return Response.json(
      { error: "No se pudo actualizar la visibilidad del archivo." },
      { status: 500 },
    );
  }

  revalidateTag("media", "max");
  return Response.json({ ok: true });
}
