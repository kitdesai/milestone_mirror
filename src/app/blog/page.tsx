import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog | Milestone Mirror",
  description:
    "Tips, ideas, and inspiration for comparing your children's milestone photos.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

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

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-2">
          Blog
        </h1>
        <p className="text-gray-500 mb-10">
          Tips, ideas, and inspiration for capturing your family&apos;s milestones.
        </p>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-12 text-center">
            <p className="text-gray-500">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block bg-white rounded-2xl shadow-sm border border-cream-200 p-6 hover:border-peach-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-display text-xl font-semibold text-gray-800 mb-1">
                      {post.title}
                    </h2>
                    <p className="text-gray-500 text-sm mb-2">
                      {post.description}
                    </p>
                    <time className="text-xs text-gray-400">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
