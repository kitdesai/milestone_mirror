import Link from "next/link";
import Image from "next/image";
import { AuthNavButton } from "@/components/AuthNavButton";

export const metadata = {
  title: "Milestone Mirror — Compare Your Children at the Same Ages",
  description:
    "Create milestone frames to compare your children's photos side by side. See the resemblance, cherish the differences.",
  openGraph: {
    title: "Milestone Mirror — Compare Your Children at the Same Ages",
    description:
      "Create milestone frames to compare your children's photos side by side.",
    url: "https://milestonemirror.com",
    type: "website",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Milestone Mirror" width={56} height={56} />
            <h1 className="font-display text-xl font-bold text-gray-800">
              Milestone Mirror
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/blog"
              className="text-gray-500 hover:text-gray-700 font-medium py-2 px-3 text-sm transition-colors"
            >
              Blog
            </Link>
            <AuthNavButton />
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 py-20 text-center">
          <div className="mb-8">
            <Image
              src="/icon.svg"
              alt="Milestone Mirror"
              width={80}
              height={80}
              className="mx-auto mb-6"
            />
            <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              See How They&apos;ve Grown,
              <br />
              <span className="text-peach-500">Side by Side</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              Create milestone frames to compare your children at the same ages.
              First smile, first steps, first day of school — see the
              resemblance and differences, beautifully.
            </p>
            <Link
              href="/auth"
              className="inline-block bg-peach-500 hover:bg-peach-600 text-white font-medium py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white/60 border-y border-cream-200 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h3 className="font-display text-2xl font-bold text-gray-800 text-center mb-12">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 bg-peach-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="h-7 w-7 text-peach-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-display text-lg font-semibold text-gray-800 mb-2">
                  1. Add Your Children
                </h4>
                <p className="text-gray-500 text-sm">
                  Add each child with their name and birthday. Milestone Mirror
                  uses birthdays to match photos at the same ages.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="h-7 w-7 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-display text-lg font-semibold text-gray-800 mb-2">
                  2. Create Frames
                </h4>
                <p className="text-gray-500 text-sm">
                  Create milestone frames like &quot;First Smile&quot; or
                  &quot;3 Months Old&quot; and upload a photo of each child.
                </p>
              </div>

              <div className="text-center">
                <div className="w-14 h-14 bg-cream-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="h-7 w-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h4 className="font-display text-lg font-semibold text-gray-800 mb-2">
                  3. Compare & Swipe
                </h4>
                <p className="text-gray-500 text-sm">
                  Swipe between your children&apos;s photos on mobile, or view
                  them side by side on desktop. See the resemblance instantly.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
              <div className="w-10 h-10 bg-peach-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-peach-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
              <h4 className="font-display text-lg font-semibold text-gray-800 mb-2">
                Drag & Drop Reorder
              </h4>
              <p className="text-gray-500 text-sm">
                Organize your frames in the order that tells your family&apos;s story.
                Drag to reorder on any device.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
              <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-display text-lg font-semibold text-gray-800 mb-2">
                Mobile First
              </h4>
              <p className="text-gray-500 text-sm">
                Swipe between photos on your phone. Upload directly from your
                camera roll. Works beautifully on any screen size.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
              <div className="w-10 h-10 bg-cream-200 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h4 className="font-display text-lg font-semibold text-gray-800 mb-2">
                Private & Secure
              </h4>
              <p className="text-gray-500 text-sm">
                Your photos are encrypted and only accessible to you. We never
                use your images for anything other than showing them to you.
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8">
              <div className="w-10 h-10 bg-peach-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="h-5 w-5 text-peach-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h4 className="font-display text-lg font-semibold text-gray-800 mb-2">
                Made for Parents
              </h4>
              <p className="text-gray-500 text-sm">
                Built by parents, for parents. No clutter, no social features —
                just a simple way to cherish your family&apos;s milestones.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="bg-white/60 border-y border-cream-200 py-16">
          <div className="max-w-4xl mx-auto px-4">
            <h3 className="font-display text-2xl font-bold text-gray-800 text-center mb-3">
              Simple Pricing
            </h3>
            <p className="text-gray-500 text-center mb-10">
              Start free. Upgrade when you need more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Free tier */}
              <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
                <h4 className="font-display text-lg font-semibold text-gray-800 mb-1">
                  Free
                </h4>
                <p className="text-3xl font-bold text-gray-800 mb-4">
                  $0
                  <span className="text-sm font-normal text-gray-500"> /forever</span>
                </p>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Up to 5 frames
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Up to 2 children
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Swipe & side-by-side comparison
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-green-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Drag & drop reorder
                  </li>
                </ul>
                <Link
                  href="/auth"
                  className="block text-center w-full border-2 border-cream-200 hover:border-peach-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Get Started
                </Link>
              </div>

              {/* Premium tier */}
              <div className="bg-white rounded-2xl shadow-sm border-2 border-peach-400 p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-peach-500 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <h4 className="font-display text-lg font-semibold text-gray-800 mb-1">
                  Premium
                </h4>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  $4.99
                  <span className="text-sm font-normal text-gray-500"> /month</span>
                </p>
                <p className="text-xs text-gray-400 mb-4">
                  or $49.99/year (save 17%)
                </p>
                <ul className="space-y-3 text-sm text-gray-600 mb-6">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-peach-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>Unlimited</strong> frames
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-peach-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <strong>Unlimited</strong> children
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-peach-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Everything in Free
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-peach-500 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                </ul>
                <Link
                  href="/auth"
                  className="block text-center w-full bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Start Free, Upgrade Later
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h3 className="font-display text-2xl font-bold text-gray-800 mb-3">
            Start Capturing Milestones Today
          </h3>
          <p className="text-gray-500 mb-6">
            Free to start. No credit card required.
          </p>
          <Link
            href="/auth"
            className="inline-block bg-peach-500 hover:bg-peach-600 text-white font-medium py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Get Started Free
          </Link>
        </section>
      </main>

      <footer className="border-t border-cream-200 bg-white/50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
          <p>
            Milestone Mirror — Your photos, your memories, your privacy.
          </p>
          <div className="flex justify-center gap-4 mt-3">
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
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
