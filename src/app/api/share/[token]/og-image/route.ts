import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/d1-types";

export const runtime = "edge";

// GET /api/share/[token]/og-image — serve share composite image publicly (for social previews)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
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

  const { token } = await params;

  // Get the share composite image key
  const frame = await db
    .prepare(
      "SELECT share_image_key FROM frames WHERE share_token = ?"
    )
    .bind(token)
    .first<{ share_image_key: string | null }>();

  if (!frame?.share_image_key) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const object = await bucket.get(frame.share_image_key);
  if (!object || !object.body) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "image/jpeg"
  );
  headers.set("Cache-Control", "public, max-age=86400");

  return new Response(object.body, { headers });
}
