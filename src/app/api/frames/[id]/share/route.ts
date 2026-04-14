import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
import { getCloudflareEnv, D1Database } from "@/lib/d1-types";
import { generateShareToken } from "@/lib/utils";

export const runtime = "edge";

async function getAuthUser(request: NextRequest, db: D1Database) {
  const sessionCookie = request.cookies.get("auth_session");
  if (!sessionCookie) return null;

  const lucia = initializeLucia(db);
  const { session, user } = await lucia.validateSession(sessionCookie.value);

  if (!session || !user) return null;
  return user;
}

// POST /api/frames/[id]/share — generate or return share token
export async function POST(
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

  const { id: frameId } = await params;

  // Check ownership and get existing token
  const frame = await db
    .prepare("SELECT id, share_token FROM frames WHERE id = ? AND user_id = ?")
    .bind(frameId, user.id)
    .first<{ id: string; share_token: string | null }>();

  if (!frame) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  // Return existing token if already shared
  if (frame.share_token) {
    return NextResponse.json({
      shareToken: frame.share_token,
      shareUrl: `/share/${frame.share_token}`,
    });
  }

  // Generate new token
  const token = generateShareToken();
  await db
    .prepare(
      "UPDATE frames SET share_token = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    )
    .bind(token, frameId, user.id)
    .run();

  return NextResponse.json({
    shareToken: token,
    shareUrl: `/share/${token}`,
  });
}

// DELETE /api/frames/[id]/share — remove share token
export async function DELETE(
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

  const { id: frameId } = await params;

  await db
    .prepare(
      "UPDATE frames SET share_token = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    )
    .bind(frameId, user.id)
    .run();

  return NextResponse.json({ success: true });
}
