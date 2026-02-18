import { NextRequest, NextResponse } from "next/server";
import { initializeLucia } from "@/lib/auth";
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

// GET /api/children - List all children for user
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

  const children = await db
    .prepare(
      "SELECT id, name, birth_date as birthDate, created_at as createdAt FROM children WHERE user_id = ? ORDER BY created_at"
    )
    .bind(user.id)
    .all();

  return NextResponse.json({ children: children.results });
}

// POST /api/children - Create new child
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

  const { name, birthDate } = await request.json();

  if (!name || !birthDate) {
    return NextResponse.json(
      { error: "Name and birth date are required" },
      { status: 400 }
    );
  }

  const childId = generateId();
  await db
    .prepare(
      "INSERT INTO children (id, user_id, name, birth_date) VALUES (?, ?, ?, ?)"
    )
    .bind(childId, user.id, name, birthDate)
    .run();

  return NextResponse.json({
    id: childId,
    name,
    birthDate,
    createdAt: new Date().toISOString(),
  });
}
