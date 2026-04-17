import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPostBySlug, getAllSlugs } from "@/lib/blog";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return { title: "Post Not Found" };

  return {
    title: `${post.title} | Milestone Mirror`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://milestonemirror.com/blog/${slug}`,
      ...(post.image && { images: [{ url: post.image }] }),
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/icon.svg"
              alt="Milestone Mirror"
              width={40}
              height={40}
            />
            <span className="font-display text-lg font-bold text-gray-800">
              Milestone Mirror
            </span>
          </Link>
          <Link
            href="/auth"
            className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors"
          >
            Sign Up Free
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link
          href="/blog"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6 inline-flex items-center gap-1"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          All posts
        </Link>

        <article className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 mt-4">
          <header className="mb-8">
            <h1 className="font-display text-3xl font-bold text-gray-800 mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <time>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.author && (
                <>
                  <span className="text-gray-300">|</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>
          </header>

          <div
            className="prose prose-gray max-w-none
              prose-headings:font-display prose-headings:text-gray-800
              prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3
              prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-2
              prose-p:text-gray-600 prose-p:leading-relaxed
              prose-a:text-peach-600 prose-a:no-underline hover:prose-a:text-peach-700
              prose-strong:text-gray-800
              prose-ul:text-gray-600 prose-ol:text-gray-600
              prose-li:my-1
              prose-img:rounded-xl prose-img:shadow-sm"
            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
          />

          {/* CTA */}
          <div className="mt-10 pt-8 border-t border-cream-200 text-center">
            <p className="text-gray-500 mb-4">
              Ready to start comparing your children&apos;s milestones?
            </p>
            <Link
              href="/auth"
              className="inline-block bg-peach-500 hover:bg-peach-600 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </article>
      </main>

      <footer className="border-t border-cream-200 bg-white/50 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <div className="flex justify-center gap-4">
            <Link
              href="/"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
