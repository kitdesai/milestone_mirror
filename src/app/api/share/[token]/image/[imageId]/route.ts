import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/d1-types";

export const runtime = "edge";

// GET /api/share/[token]/image/[imageId] — serve shared frame image (no auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; imageId: string }> }
) {
  const env = getCloudflareEnv(request);
  const db = env?.DB;
  const bucket = env?.IMAGES;

  if (!db || !bucket) {
    return NextResponse.json(
      { error: "Service not available" },
      { status: 500 }
    );
  }

  const { token, imageId } = await params;

  // Verify the image belongs to a shared frame
  const image = await db
    .prepare(
      `SELECT fi.image_key
       FROM frame_images fi
       JOIN frames f ON fi.frame_id = f.id
       WHERE fi.id = ? AND f.share_token = ?`
    )
    .bind(imageId, token)
    .first<{ image_key: string }>();

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const object = await bucket.get(image.image_key);
  if (!object || !object.body) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "application/octet-stream"
  );
  headers.set("Cache-Control", "public, max-age=31536000, immutable");

  return new Response(object.body, { headers });
}
