"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { FrameWithImages } from "@/types";
import { cn } from "@/lib/utils";
import { toImageApiPath } from "@/lib/r2";
import { generateComposite } from "@/lib/composite";

interface FrameCardProps {
  frame: FrameWithImages;
  onEdit: () => void;
  onDelete: () => void;
  onShare: () => void;
  onAddImage: (childId: string) => void;
  onDeleteImage: (imageId: string) => void;
  childProfiles: { id: string; name: string }[];
  dragListeners?: SyntheticListenerMap;
}

export function FrameCard({
  frame,
  onEdit,
  onDelete,
  onShare,
  onAddImage,
  onDeleteImage,
  childProfiles,
  dragListeners,
}: FrameCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shareTooltip, setShareTooltip] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (frame.images.length === 0) return;
    setIsDownloading(true);
    try {
      const blob = await generateComposite({
        images: frame.images.map((img) => ({
          url: getImageSrc(img),
          childName: img.childName,
        })),
        title: frame.title,
        watermark: false,
        includeLabels: true,
        highRes: true,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${frame.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "-").toLowerCase()}-milestone-mirror.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  };
  const [imageError, setImageError] = useState<Set<string>>(new Set());
  const [apiFallbackImageIds, setApiFallbackImageIds] = useState<Set<string>>(
    new Set()
  );

  // Swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartX.current === null || touchStartY.current === null) return;
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = e.changedTouches[0].clientY - touchStartY.current;
      touchStartX.current = null;
      touchStartY.current = null;

      // Only swipe if horizontal movement > 50px and greater than vertical
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;

      if (dx < 0) {
        // Swipe left -> next
        setCurrentIndex((prev) =>
          prev < frame.images.length - 1 ? prev + 1 : 0
        );
      } else {
        // Swipe right -> prev
        setCurrentIndex((prev) =>
          prev > 0 ? prev - 1 : frame.images.length - 1
        );
      }
    },
    [frame.images.length]
  );

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : frame.images.length - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev < frame.images.length - 1 ? prev + 1 : 0
    );
  };

  const currentImage = frame.images[currentIndex];

  const getImageSrc = (image: typeof currentImage) => {
    if (!image) return "";
    const useApiFallback = apiFallbackImageIds.has(image.id);
    return useApiFallback
      ? toImageApiPath(image.imageKey)
      : image.imageUrl?.startsWith("http://") ||
          image.imageUrl?.startsWith("https://") ||
          image.imageUrl?.startsWith("/api/images/")
        ? image.imageUrl
        : toImageApiPath(image.imageKey);
  };

  const currentImageSrc = getImageSrc(currentImage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-peach-100 to-rose-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {dragListeners && (
            <button
              className="touch-none cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-400 hover:text-gray-600 transition-colors"
              {...dragListeners}
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 2a2 2 0 10.001 4.001A2 2 0 007 2zm0 6a2 2 0 10.001 4.001A2 2 0 007 8zm0 6a2 2 0 10.001 4.001A2 2 0 007 14zm6-8a2 2 0 10-.001-4.001A2 2 0 0013 6zm0 2a2 2 0 10.001 4.001A2 2 0 0013 8zm0 6a2 2 0 10.001 4.001A2 2 0 0013 14z" />
              </svg>
            </button>
          )}
          <div>
            <h3 className="font-display font-semibold text-gray-800">
              {frame.title}
            </h3>
          {frame.description && (
            <p className="text-sm text-gray-500">{frame.description}</p>
          )}
          </div>
        </div>
        <div className="flex gap-1">
          <div className="relative">
            <button
              onClick={() => {
                onShare();
                setShareTooltip(true);
                setTimeout(() => setShareTooltip(false), 2000);
              }}
              className="p-2 text-gray-500 hover:text-peach-700 transition-colors"
              title="Share frame"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
              </svg>
            </button>
            {shareTooltip && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-30">
                Link copied!
              </div>
            )}
          </div>
          {frame.images.length > 0 && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 text-gray-500 hover:text-peach-700 transition-colors disabled:opacity-50"
              title="Download image"
            >
              {isDownloading ? (
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="10" cy="10" r="7" strokeDasharray="30" strokeDashoffset="10" />
                </svg>
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" />
                </svg>
              )}
            </button>
          )}
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-peach-700 transition-colors"
            title="Edit frame"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-rose-600 transition-colors"
            title="Delete frame"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Image display - Carousel on mobile, Grid on desktop */}
      {frame.images.length === 0 ? (
        <div className="flex items-center justify-center gap-2 text-gray-400 px-4 py-6">
          <svg
            className="h-5 w-5 opacity-50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm">No photos yet — add photos for each child below</p>
        </div>
      ) : (
        <>
          {/* Mobile carousel view - all images rendered for preloading, only current visible */}
          <div
            className="md:hidden relative aspect-[3/4] bg-cream-50 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {frame.images.map((image, index) => (
              <div
                key={image.id}
                className={cn(
                  "absolute inset-0 transition-opacity duration-200",
                  index === currentIndex
                    ? "opacity-100 z-10"
                    : "opacity-0 z-0"
                )}
              >
                {imageError.has(image.id) ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <p className="text-sm">Failed to load image</p>
                  </div>
                ) : (
                  <Image
                    src={getImageSrc(image)}
                    alt={`${image.childName}'s photo`}
                    fill
                    unoptimized
                    className="object-cover"
                    onError={() => {
                      if (
                        !apiFallbackImageIds.has(image.id) &&
                        (image.imageUrl?.startsWith("http://") ||
                          image.imageUrl?.startsWith("https://"))
                      ) {
                        setApiFallbackImageIds(
                          (prev) => new Set(prev).add(image.id)
                        );
                        return;
                      }
                      setImageError((prev) => new Set(prev).add(image.id));
                    }}
                  />
                )}
              </div>
            ))}

            {/* Child name label */}
            <div className="absolute bottom-4 left-4 z-20 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImage.childName}
            </div>

            {/* Delete image button */}
            <button
              onClick={() => onDeleteImage(currentImage.id)}
              className="absolute top-2 right-2 z-20 bg-black/50 hover:bg-rose-500 text-white p-1.5 rounded-full transition-colors"
              title="Delete this photo"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Navigation arrows */}
            {frame.images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Desktop grid view - side by side comparison */}
          <div className="hidden md:flex md:flex-wrap bg-cream-100">
            {frame.images.map((image) => (
              <div key={image.id} className="relative aspect-[3/4] bg-cream-50 flex-1 min-w-[200px] max-w-[50%]">
                {imageError.has(image.id) ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <p className="text-sm">Failed to load</p>
                  </div>
                ) : (
                  <Image
                    src={getImageSrc(image)}
                    alt={`${image.childName}'s photo`}
                    fill
                    unoptimized
                    className="object-cover"
                    onError={() => {
                      if (
                        !apiFallbackImageIds.has(image.id) &&
                        (image.imageUrl?.startsWith("http://") ||
                          image.imageUrl?.startsWith("https://"))
                      ) {
                        setApiFallbackImageIds(
                          (prev) => new Set(prev).add(image.id)
                        );
                        return;
                      }
                      setImageError((prev) => new Set(prev).add(image.id));
                    }}
                  />
                )}

                {/* Child name label */}
                <div className="absolute bottom-2 left-2 bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
                  {image.childName}
                </div>

                {/* Delete image button */}
                <button
                  onClick={() => onDeleteImage(image.id)}
                  className="absolute top-2 right-2 bg-black/50 hover:bg-rose-500 text-white p-1 rounded-full transition-colors opacity-0 hover:opacity-100 focus:opacity-100"
                  title="Delete this photo"
                >
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Footer with child image slots */}
      <div className="px-4 py-3 bg-cream-50 border-t border-cream-200">
        <p className="text-xs text-gray-500 mb-2">Add photos:</p>
        <div className="flex flex-wrap gap-2">
          {childProfiles.map((child) => {
            const hasImage = frame.images.some(
              (img) => img.childId === child.id
            );
            return (
              <button
                key={child.id}
                onClick={() => !hasImage && onAddImage(child.id)}
                disabled={hasImage}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-all",
                  hasImage
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-cream-200 text-gray-500 hover:bg-peach-200 hover:text-peach-700"
                )}
              >
                {hasImage ? "\u2713 " : "+ "}
                {child.name}
              </button>
            );
          })}
        </div>

        {/* Dot indicators - only on mobile */}
        {frame.images.length > 1 && (
          <div className="flex justify-center gap-1 mt-3 md:hidden">
            {frame.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex ? "bg-peach-500" : "bg-cream-200"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
