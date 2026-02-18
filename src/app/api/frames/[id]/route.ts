import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { deleteFrameImages } from "@/lib/r2";
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

// PUT /api/frames/[id] - Update frame
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const env = getCloudflareEnv(request);
  const db = env?.DB;

  if (!db) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 500 }
    );
  }

  const user = await getAuthUser(request, db);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await request.json();
  const { id: frameId } = await params;

  const result = await db
    .prepare(
      "UPDATE frames SET title = ?, description = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    )
    .bind(title, description || null, frameId, user.id)
    .run();

  if (result.meta.changes === 0) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/frames/[id] - Delete frame and all images
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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

  const user = await getAuthUser(request, db);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: frameId } = await params;

  // Delete images from R2
  if (bucket) {
    try {
      await deleteFrameImages(bucket, user.id, frameId);
    } catch (error) {
      console.error("Failed to delete R2 images:", error);
      // Continue with DB deletion even if R2 fails
    }
  }

  // Delete from database (CASCADE will delete frame_images)
  const result = await db
    .prepare("DELETE FROM frames WHERE id = ? AND user_id = ?")
    .bind(frameId, user.id)
    .run();

  if (result.meta.changes === 0) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
