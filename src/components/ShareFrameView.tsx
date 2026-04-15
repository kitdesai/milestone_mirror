"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ShareImage {
  id: string;
  childName: string;
  publicUrl: string;
  proxyUrl: string;
  caption: string | null;
}

interface SharedFrame {
  title: string;
  description: string | null;
  tier: string;
  images: ShareImage[];
}

export function ShareFrameView({ token }: { token: string }) {
  const [frame, setFrame] = useState<SharedFrame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(`/api/share/${token}`)
      .then((res) => {
        if (!res.ok) {
          setNotFound(true);
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setFrame(data.frame);
      })
      .catch(() => setNotFound(true))
      .finally(() => setIsLoading(false));
  }, [token]);

  // Swipe handling for mobile
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || !frame) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(dx) < 50) return;

    if (dx < 0) {
      setCurrentIndex((prev) =>
        prev < frame.images.length - 1 ? prev + 1 : 0
      );
    } else {
      setCurrentIndex((prev) =>
        prev > 0 ? prev - 1 : frame.images.length - 1
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !frame) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 text-center max-w-md">
          <Image
            src="/icon.svg"
            alt="Milestone Mirror"
            width={48}
            height={48}
            className="mx-auto mb-4"
          />
          <h1 className="font-display text-xl font-bold text-gray-800 mb-2">
            Frame Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            This frame may have been removed or the link is no longer valid.
          </p>
          <Link
            href="/"
            className="inline-block bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Milestone Mirror
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      {/* Header */}
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

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Frame card — matches FrameCard design */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden mb-8">
          {/* Pink gradient header */}
          <div className="px-5 py-4 bg-gradient-to-r from-peach-100 to-rose-100">
            <h1 className="font-display text-xl font-semibold text-gray-800">
              {frame.title}
            </h1>
            {frame.description && (
              <p className="text-sm text-gray-600 mt-0.5">{frame.description}</p>
            )}
          </div>

          {/* Images */}
          {frame.images.length > 0 && (
            <>
              {/* Mobile: carousel */}
              <div
                className="md:hidden relative aspect-[3/4] bg-cream-50"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {frame.images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`absolute inset-0 transition-opacity duration-200 ${
                      index === currentIndex
                        ? "opacity-100 z-10"
                        : "opacity-0 z-0"
                    }`}
                  >
                    <img
                      src={image.publicUrl}
                      alt={`${image.childName}'s photo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <div className="absolute bottom-4 left-4 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {frame.images[currentIndex]?.childName}
                </div>
                {frame.images.length > 1 && (
                  <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
                    {frame.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop: side by side */}
              <div className="hidden md:flex bg-cream-100">
                {frame.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative aspect-[3/4] bg-cream-50 flex-1"
                  >
                    <img
                      src={image.publicUrl}
                      alt={`${image.childName}'s photo`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
                      {image.childName}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-8 text-center">
          <Image
            src="/icon.svg"
            alt="Milestone Mirror"
            width={48}
            height={48}
            className="mx-auto mb-4"
          />
          <h2 className="font-display text-xl font-bold text-gray-800 mb-2">
            Create Your Own Milestone Frames
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Compare your children at the same ages. See the resemblance,
            cherish the differences.
          </p>
          <Link
            href="/auth"
            className="inline-block bg-peach-500 hover:bg-peach-600 text-white font-medium py-3 px-8 rounded-lg text-lg transition-colors"
          >
            Get Started Free
          </Link>
        </div>
      </main>
    </div>
  );
}
