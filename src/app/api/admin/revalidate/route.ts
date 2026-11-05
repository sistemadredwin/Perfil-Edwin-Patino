import { revalidateTag } from "next/cache";
import { authorizeAdmin } from "@/lib/admin-api";

const TAGS = new Set([
  "profile",
  "education",
  "meetings",
  "achievements",
  "media",
]);

export async function POST(request: Request) {
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
  if (
    !body ||
    typeof body !== "object" ||
    !("tag" in body) ||
    typeof body.tag !== "string" ||
    !TAGS.has(body.tag)
  ) {
    return Response.json(
      { error: "La etiqueta de caché no está permitida." },
      { status: 400 },
    );
  }

  revalidateTag(body.tag, "max");
  return Response.json({ ok: true });
}
