import { authorizeAdmin } from "@/lib/admin-api";
import { getCloudinaryConfig, signCloudinaryParams } from "@/lib/cloudinary";

const MAX_IMAGE_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export async function POST(request: Request) {
  const authorization = await authorizeAdmin(request);
  if ("response" in authorization) return authorization.response;

  const cloudinary = getCloudinaryConfig();
  if (!cloudinary) {
    return Response.json(
      {
        error:
          "Configura Cloudinary en .env.local para activar las subidas.",
      },
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
      { error: "Solicitud de subida no válida." },
      { status: 400 },
    );
  }

  const { kind, fileSize } = body as {
    kind?: unknown;
    fileSize?: unknown;
  };
  if (
    (kind !== "foto" && kind !== "video") ||
    typeof fileSize !== "number" ||
    !Number.isSafeInteger(fileSize) ||
    fileSize <= 0
  ) {
    return Response.json(
      { error: "Selecciona una foto o un video válido." },
      { status: 400 },
    );
  }

  const maxBytes = kind === "foto" ? MAX_IMAGE_BYTES : MAX_VIDEO_BYTES;
  if (fileSize > maxBytes) {
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

  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "edwin-perfil";
  const signature = signCloudinaryParams(
    { folder, timestamp },
    cloudinary.apiSecret,
  );
  return Response.json({
    cloudName: cloudinary.cloudName,
    apiKey: cloudinary.apiKey,
    folder,
    timestamp,
    signature,
  });
}
