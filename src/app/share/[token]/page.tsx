import { Metadata } from "next";
import { ShareFrameView } from "@/components/ShareFrameView";

export const runtime = "edge";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

async function getSharedFrame(token: string, origin: string) {
  const res = await fetch(`${origin}/api/share/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.frame as {
    title: string;
    description: string | null;
    tier: string;
    images: { id: string; childName: string; publicUrl: string; caption: string | null }[];
  };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { token } = await params;
  // Use a relative URL for the API call during build, but we need an absolute URL
  // Since we can't reliably get the origin in generateMetadata, use a simpler approach
  const title = "Milestone Mirror";
  const description = "Compare your children at the same ages";

  return {
    title: `Shared Frame | ${title}`,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/share/${token}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params;

  return <ShareFrameView token={token} />;
}
