import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { deleteImage } from "@/lib/r2";
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

// DELETE /api/frames/[id]/images/[imageId] - Delete single image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
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

  const { imageId } = await params;

  // Get image key before deleting
  const image = await db
    .prepare(
      `SELECT fi.image_key FROM frame_images fi
       JOIN frames f ON fi.frame_id = f.id
       WHERE fi.id = ? AND f.user_id = ?`
    )
    .bind(imageId, user.id)
    .first<{ image_key: string }>();

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // Delete from R2
  if (bucket) {
    try {
      await deleteImage(bucket, image.image_key);
    } catch (error) {
      console.error("Failed to delete R2 image:", error);
    }
  }

  // Delete from database
  await db.prepare("DELETE FROM frame_images WHERE id = ?").bind(imageId).run();

  return NextResponse.json({ success: true });
}
