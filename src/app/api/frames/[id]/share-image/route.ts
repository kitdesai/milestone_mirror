import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv, D1Database } from "@/lib/d1-types";

export const runtime = "edge";

async function getAuthUser(request: NextRequest, db: D1Database) {
  const sessionCookie = request.cookies.get("auth_session");
  if (!sessionCookie) return null;

  const lucia = initializeLucia(db);
  const { session, user } = await lucia.validateSession(sessionCookie.value);

  if (!session || !user) return null;
  return user;
}

// POST /api/frames/[id]/share-image — upload composite image for OG sharing
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const user = await getAuthUser(request, db);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: frameId } = await params;

  // Verify ownership
  const frame = await db
    .prepare(
      "SELECT id, share_image_key FROM frames WHERE id = ? AND user_id = ?"
    )
    .bind(frameId, user.id)
    .first<{ id: string; share_image_key: string | null }>();

  if (!frame) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  // Delete old share image if exists
  if (frame.share_image_key) {
    try {
      await bucket.delete(frame.share_image_key);
    } catch {
      // ignore
    }
  }

  // Read the uploaded image
  const formData = await request.formData();
  const file = formData.get("image") as File;

  if (!file) {
    return NextResponse.json(
      { error: "Image is required" },
      { status: 400 }
    );
  }

  // Upload to R2
  const key = `share/${user.id}/${frameId}/${crypto.randomUUID()}.jpg`;
  const body = await file.arrayBuffer();

  await bucket.put(key, body, {
    httpMetadata: {
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000",
    },
  });

  // Save key to DB
  await db
    .prepare(
      "UPDATE frames SET share_image_key = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    )
    .bind(key, frameId, user.id)
    .run();

  return NextResponse.json({ success: true, key });
}
