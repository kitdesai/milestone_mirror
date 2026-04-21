// R2 Storage utilities
import type { R2Bucket } from "./d1-types";

export interface UploadResult {
  key: string;
  url: string;
}

export function toImageApiPath(key: string): string {
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  return `/api/images/${encodedKey}`;
}

export async function uploadImage(
  bucket: R2Bucket,
  file: File | ArrayBuffer,
  userId: string,
  frameId: string
): Promise<UploadResult> {
  const fileId = crypto.randomUUID();
  const extension = file instanceof File ? getExtension(file.name) : "jpg";
  const key = `frames/${userId}/${frameId}/${fileId}.${extension}`;

  const body = file instanceof File ? await file.arrayBuffer() : file;
  const contentType = file instanceof File ? file.type : "image/jpeg";

  await bucket.put(key, body, {
    httpMetadata: {
      contentType,
      cacheControl: "private, max-age=31536000",
    },
  });

  return { key, url: toImageApiPath(key) };
}

export async function deleteImage(
  bucket: R2Bucket,
  key: string
): Promise<void> {
  await bucket.delete(key);
}

export async function deleteFrameImages(
  bucket: R2Bucket,
  userId: string,
  frameId: string
): Promise<void> {
  const prefix = `frames/${userId}/${frameId}/`;
  const listed = await bucket.list({ prefix });

  const deletePromises = listed.objects.map((obj) => bucket.delete(obj.key));
  await Promise.all(deletePromises);
}

function getExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "jpg";
}
