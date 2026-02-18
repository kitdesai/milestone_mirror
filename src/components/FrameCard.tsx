"use client";

import { useState } from "react";
import Image from "next/image";
import { FrameWithImages } from "@/types";
import { cn } from "@/lib/utils";
import { toImageApiPath } from "@/lib/r2";

interface FrameCardProps {
  frame: FrameWithImages;
  onEdit: () => void;
  onDelete: () => void;
  onAddImage: (childId: string) => void;
  onDeleteImage: (imageId: string) => void;
  childProfiles: { id: string; name: string }[];
}

export function FrameCard({
  frame,
  onEdit,
  onDelete,
  onAddImage,
  onDeleteImage,
  childProfiles,
}: FrameCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageError, setImageError] = useState<Set<string>>(new Set());
  const [apiFallbackImageIds, setApiFallbackImageIds] = useState<Set<string>>(
    new Set()
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
  const useApiFallback = currentImage
    ? apiFallbackImageIds.has(currentImage.id)
    : false;
  const currentImageSrc =
    currentImage &&
    (useApiFallback
      ? toImageApiPath(currentImage.imageKey)
      : currentImage.imageUrl?.startsWith("http://") ||
          currentImage.imageUrl?.startsWith("https://") ||
          currentImage.imageUrl?.startsWith("/api/images/")
        ? currentImage.imageUrl
        : toImageApiPath(currentImage.imageKey));

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-cream-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-peach-100 to-rose-100 flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-gray-800">
            {frame.title}
          </h3>
          {frame.description && (
            <p className="text-sm text-gray-600">{frame.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-peach-600 transition-colors"
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

      {/* Image carousel */}
      <div className="relative aspect-[4/3] bg-cream-50">
        {frame.images.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4">
            <svg
              className="h-12 w-12 mb-2 opacity-50"
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
            <p className="text-sm">No photos yet</p>
            <p className="text-xs mt-1">Add photos for each child</p>
          </div>
        ) : (
          <>
            {imageError.has(currentImage.id) ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <p className="text-sm">Failed to load image</p>
              </div>
            ) : (
              <Image
                src={currentImageSrc}
                alt={`${currentImage.childName}'s photo`}
                fill
                unoptimized
                className="object-cover"
                onError={() => {
                  if (
                    !useApiFallback &&
                    (currentImage.imageUrl?.startsWith("http://") ||
                      currentImage.imageUrl?.startsWith("https://"))
                  ) {
                    setApiFallbackImageIds(
                      (prev) => new Set(prev).add(currentImage.id)
                    );
                    return;
                  }
                  setImageError((prev) => new Set(prev).add(currentImage.id));
                }}
              />
            )}

            {/* Child name label */}
            <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImage.childName}
            </div>

            {/* Delete image button */}
            <button
              onClick={() => onDeleteImage(currentImage.id)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-rose-500 text-white p-1.5 rounded-full transition-colors"
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
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
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
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
          </>
        )}
      </div>

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
                    : "bg-cream-200 text-gray-600 hover:bg-peach-200 hover:text-peach-700"
                )}
              >
                {hasImage ? "\u2713 " : "+ "}
                {child.name}
              </button>
            );
          })}
        </div>

        {/* Dot indicators */}
        {frame.images.length > 1 && (
          <div className="flex justify-center gap-1 mt-3">
            {frame.images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex ? "bg-peach-500" : "bg-cream-300"
                )}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
