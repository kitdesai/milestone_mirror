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

// PUT /api/children/[id] - Update child
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

  const { name, birthDate } = await request.json();
  const { id: childId } = await params;

  const result = await db
    .prepare(
      "UPDATE children SET name = ?, birth_date = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
    )
    .bind(name, birthDate, childId, user.id)
    .run();

  if (result.meta.changes === 0) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/children/[id] - Delete child
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

  const { id: childId } = await params;

  // Note: frame_images with this child_id will be deleted via CASCADE
  const result = await db
    .prepare("DELETE FROM children WHERE id = ? AND user_id = ?")
    .bind(childId, user.id)
    .run();

  if (result.meta.changes === 0) {
    return NextResponse.json({ error: "Child not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
