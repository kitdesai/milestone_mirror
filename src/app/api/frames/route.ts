import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { generateId } from "@/lib/utils";
import { getCloudflareEnv, D1Database } from "@/lib/d1-types";
import { canCreateFrame, Tier } from "@/lib/tier-limits";

interface FrameRequest {
  title: string;
  description?: string;
}

export const runtime = "edge";

async function getAuthUser(request: NextRequest, db: D1Database) {
  const sessionCookie = request.cookies.get("auth_session");
  if (!sessionCookie) return null;

  const lucia = initializeLucia(db);
  const { session, user } = await lucia.validateSession(sessionCookie.value);

  if (!session || !user) return null;
  return user;
}

// GET /api/frames - List all frames with images
export async function GET(request: NextRequest) {
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

  // Get frames
  const framesResult = await db
    .prepare(
      `SELECT id, title, description, display_order as displayOrder, share_token as shareToken, created_at as createdAt
       FROM frames WHERE user_id = ? ORDER BY display_order, created_at DESC`
    )
    .bind(user.id)
    .all();

  // Get images with child names
  const imagesResult = await db
    .prepare(
      `SELECT fi.id, fi.frame_id as frameId, fi.child_id as childId,
              fi.image_url as imageUrl, fi.image_key as imageKey,
              fi.caption, fi.display_order as displayOrder,
              c.name as childName
       FROM frame_images fi
       JOIN frames f ON fi.frame_id = f.id
       JOIN children c ON fi.child_id = c.id
       WHERE f.user_id = ?
       ORDER BY fi.display_order`
    )
    .bind(user.id)
    .all();

  interface FrameRow {
    id: string;
    title: string;
    description: string | null;
    displayOrder: number;
    shareToken: string | null;
    createdAt: string;
  }

  interface ImageRow {
    id: string;
    frameId: string;
    childId: string;
    imageUrl: string;
    imageKey: string;
    caption: string | null;
    displayOrder: number;
    childName: string;
  }

  // Combine frames with their images
  const frames = (framesResult.results as FrameRow[]).map((frame) => ({
    ...frame,
    images: (imagesResult.results as ImageRow[]).filter(
      (img) => img.frameId === frame.id
    ),
  }));

  return NextResponse.json({ frames });
}

// POST /api/frames - Create new frame
export async function POST(request: NextRequest) {
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

  // Check tier limits
  const userRow = await db
    .prepare("SELECT tier FROM users WHERE id = ?")
    .bind(user.id)
    .first<{ tier: string }>();
  const tier = (userRow?.tier as Tier) || "free";

  const frameCount = await db
    .prepare("SELECT COUNT(*) as count FROM frames WHERE user_id = ?")
    .bind(user.id)
    .first<{ count: number }>();

  const { allowed, limit } = canCreateFrame(frameCount?.count ?? 0, tier);
  if (!allowed) {
    return NextResponse.json(
      { error: "Frame limit reached", limit, upgradeRequired: true },
      { status: 403 }
    );
  }

  const { title, description }: FrameRequest = await request.json();

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  // Get next display order
  const lastFrame = await db
    .prepare(
      "SELECT MAX(display_order) as max_order FROM frames WHERE user_id = ?"
    )
    .bind(user.id)
    .first<{ max_order: number | null }>();

  const displayOrder = (lastFrame?.max_order ?? -1) + 1;

  const frameId = generateId();
  await db
    .prepare(
      "INSERT INTO frames (id, user_id, title, description, display_order) VALUES (?, ?, ?, ?, ?)"
    )
    .bind(frameId, user.id, title, description || null, displayOrder)
    .run();

  return NextResponse.json({
    id: frameId,
    title,
    description,
    displayOrder,
    images: [],
    createdAt: new Date().toISOString(),
  });
}

// PATCH /api/frames - Reorder frames
export async function PATCH(request: NextRequest) {
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

  const { orderedIds }: { orderedIds: string[] } = await request.json();

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return NextResponse.json(
      { error: "orderedIds array is required" },
      { status: 400 }
    );
  }

  const statements = orderedIds.map((id, index) =>
    db
      .prepare(
        "UPDATE frames SET display_order = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
      )
      .bind(index, id, user.id)
  );

  await db.batch(statements);

  return NextResponse.json({ success: true });
}
