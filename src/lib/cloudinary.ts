import "server-only";

import { createHash } from "node:crypto";

export type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) return null;
  return { cloudName, apiKey, apiSecret };
}

export function signCloudinaryParams(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const serialized = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1")
    .update(`${serialized}${apiSecret}`)
    .digest("hex");
}

export function verifyCloudinarySignature(
  params: Record<string, string | number>,
  signature: string,
  apiSecret: string,
): boolean {
  const expected = signCloudinaryParams(params, apiSecret);
  if (!/^[a-f0-9]{40}$/i.test(signature)) return false;
  return expected === signature.toLowerCase();
}
