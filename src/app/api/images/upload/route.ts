import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { uploadImage } from "@/lib/r2";
import { generateId } from "@/lib/utils";
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

export async function POST(request: NextRequest) {
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

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const frameId = formData.get("frameId") as string;
    const childId = formData.get("childId") as string;
    const caption = formData.get("caption") as string | null;

    if (!file || !frameId || !childId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be less than 10MB" },
        { status: 400 }
      );
    }

    // Verify frame belongs to user
    const frame = await db
      .prepare("SELECT id FROM frames WHERE id = ? AND user_id = ?")
      .bind(frameId, user.id)
      .first();

    if (!frame) {
      return NextResponse.json({ error: "Frame not found" }, { status: 404 });
    }

    // Verify child belongs to user
    const child = await db
      .prepare("SELECT id FROM children WHERE id = ? AND user_id = ?")
      .bind(childId, user.id)
      .first();

    if (!child) {
      return NextResponse.json({ error: "Child not found" }, { status: 404 });
    }

    // Check if child already has an image in this frame
    const existingImage = await db
      .prepare(
        "SELECT id FROM frame_images WHERE frame_id = ? AND child_id = ?"
      )
      .bind(frameId, childId)
      .first();

    if (existingImage) {
      return NextResponse.json(
        { error: "Child already has an image in this frame" },
        { status: 409 }
      );
    }

    // Upload to R2
    const { key, url } = await uploadImage(bucket, file, user.id, frameId);

    // Get next display order
    const lastImage = await db
      .prepare(
        "SELECT MAX(display_order) as max_order FROM frame_images WHERE frame_id = ?"
      )
      .bind(frameId)
      .first<{ max_order: number | null }>();

    const displayOrder = (lastImage?.max_order ?? -1) + 1;

    // Save to database
    const imageId = generateId();
    await db
      .prepare(
        `INSERT INTO frame_images (id, frame_id, child_id, image_key, image_url, caption, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(imageId, frameId, childId, key, url, caption, displayOrder)
      .run();

    return NextResponse.json({
      id: imageId,
      imageUrl: url,
      imageKey: key,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
