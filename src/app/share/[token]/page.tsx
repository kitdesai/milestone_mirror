import { Metadata } from "next";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { ShareFrameView } from "@/components/ShareFrameView";

export const runtime = "edge";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

async function getSharedFrameMeta(token: string) {
  try {
    const { env } = getRequestContext();
    const db = (env as { DB: import("@/lib/d1-types").D1Database }).DB;

    const frame = await db
      .prepare(
        "SELECT f.id, f.title, f.description FROM frames f WHERE f.share_token = ?"
      )
      .bind(token)
      .first<{ id: string; title: string; description: string | null }>();

    if (!frame) return null;

    const firstImage = await db
      .prepare(
        "SELECT fi.image_key FROM frame_images fi WHERE fi.frame_id = ? ORDER BY fi.display_order LIMIT 1"
      )
      .bind(frame.id)
      .first<{ image_key: string }>();

    const r2PublicUrl = (
      env as { R2_PUBLIC_URL?: string }
    ).R2_PUBLIC_URL?.replace(/\/+$/, "");
    const ogImageUrl =
      firstImage && r2PublicUrl
        ? `${r2PublicUrl}/${firstImage.image_key}`
        : null;

    return {
      title: frame.title,
      description: frame.description,
      ogImageUrl,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  const frame = await getSharedFrameMeta(token);

  const title = frame?.title
    ? `${frame.title} | Milestone Mirror`
    : "Milestone Mirror";
  const description =
    frame?.description || "Compare your children at the same ages";

  return {
    title,
    description,
    openGraph: {
      title: frame?.title || "Milestone Mirror",
      description,
      type: "article",
      url: `https://milestonemirror.com/share/${token}`,
      ...(frame?.ogImageUrl && {
        images: [{ url: frame.ogImageUrl, width: 1200, height: 900 }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: frame?.title || "Milestone Mirror",
      description,
      ...(frame?.ogImageUrl && {
        images: [frame.ogImageUrl],
      }),
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  return <ShareFrameView token={token} />;
}
