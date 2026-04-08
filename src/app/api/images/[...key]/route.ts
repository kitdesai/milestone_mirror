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

// GET /api/images/[...key] - Serve an image by its R2 key for the authenticated owner
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const env = getCloudflareEnv(request);
  const db = env?.DB;
  const bucket = env?.IMAGES;

  if (!db) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 500 }
    );
  }

  if (!bucket) {
    return NextResponse.json(
      { error: "Storage not available" },
      { status: 500 }
    );
  }

  const user = await getAuthUser(request, db);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key } = await params;
  if (!Array.isArray(key) || key.length === 0) {
    return NextResponse.json({ error: "Invalid image key" }, { status: 400 });
  }

  const imageKey = key.map(decodeURIComponent).join("/");

  // Ensure this image belongs to the authenticated user before serving it.
  const image = await db
    .prepare(
      `SELECT fi.id
       FROM frame_images fi
       JOIN frames f ON fi.frame_id = f.id
       WHERE fi.image_key = ? AND f.user_id = ?`
    )
    .bind(imageKey, user.id)
    .first<{ id: string }>();

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const object = await bucket.get(imageKey);
  if (!object || !object.body) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  const headers = new Headers();
  headers.set(
    "Content-Type",
    object.httpMetadata?.contentType || "application/octet-stream"
  );
  headers.set(
    "Cache-Control",
    "private, max-age=31536000, immutable"
  );

  return new Response(object.body, { headers });
}
