import { NextRequest, NextResponse } from "next/server";
import { getCloudflareEnv } from "@/lib/d1-types";

export const runtime = "edge";

// GET /api/share/[token] — public frame data (no auth required)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const env = getCloudflareEnv(request);
  const db = env?.DB;

  if (!db) {
    return NextResponse.json(
      { error: "Database not available" },
      { status: 500 }
    );
  }

  const { token } = await params;

  // Get frame with user tier
  const frame = await db
    .prepare(
      `SELECT f.id, f.title, f.description, u.tier
       FROM frames f
       JOIN users u ON f.user_id = u.id
       WHERE f.share_token = ?`
    )
    .bind(token)
    .first<{
      id: string;
      title: string;
      description: string | null;
      tier: string;
    }>();

  if (!frame) {
    return NextResponse.json(
      { error: "Frame not found" },
      { status: 404 }
    );
  }

  // Get images with child names
  const imagesResult = await db
    .prepare(
      `SELECT fi.id, fi.image_key as imageKey, fi.image_url as imageUrl,
              fi.caption, c.name as childName
       FROM frame_images fi
       JOIN children c ON fi.child_id = c.id
       WHERE fi.frame_id = ?
       ORDER BY fi.display_order`
    )
    .bind(frame.id)
    .all<{
      id: string;
      imageKey: string;
      imageUrl: string;
      caption: string | null;
      childName: string;
    }>();

  // Build public R2 URLs for images
  const r2PublicUrl = env.R2_PUBLIC_URL?.replace(/\/+$/, "");
  const images = (imagesResult.results || []).map((img) => ({
    id: img.id,
    childName: img.childName,
    caption: img.caption,
    publicUrl: r2PublicUrl
      ? `${r2PublicUrl}/${img.imageKey}`
      : img.imageUrl,
  }));

  return NextResponse.json({
    frame: {
      title: frame.title,
      description: frame.description,
      tier: frame.tier,
      images,
    },
  });
}
