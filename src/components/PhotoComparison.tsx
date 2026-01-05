"use client";

import { useState } from "react";
import Image from "next/image";
import { PhotoWithAge, Child, Milestone } from "@/types";
import { getPhotoUrl } from "@/lib/google-photos";

interface PhotoComparisonProps {
  childProfiles: Child[];
  photosByChild: Map<string, PhotoWithAge[]>;
  milestone: Milestone;
}

export function PhotoComparison({
  childProfiles,
  photosByChild,
  milestone,
}: PhotoComparisonProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithAge | null>(null);
  const [photoIndexes, setPhotoIndexes] = useState<Map<string, number>>(
    new Map(childProfiles.map((c) => [c.id, 0]))
  );

  const navigatePhoto = (childId: string, direction: "prev" | "next") => {
    const photos = photosByChild.get(childId) || [];
    const currentIndex = photoIndexes.get(childId) || 0;
    let newIndex: number;

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : photos.length - 1;
    } else {
      newIndex = currentIndex < photos.length - 1 ? currentIndex + 1 : 0;
    }

    setPhotoIndexes(new Map(photoIndexes.set(childId, newIndex)));
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-display font-semibold text-gray-800">
          {milestone.label}
        </h3>
        <p className="text-gray-500 text-sm mt-1">
          Comparing photos from approximately the same age
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {childProfiles.map((child) => {
          const photos = photosByChild.get(child.id) || [];
          const currentIndex = photoIndexes.get(child.id) || 0;
          const currentPhoto = photos[currentIndex];

          return (
            <div key={child.id} className="bg-white rounded-xl shadow-sm border border-cream-200 overflow-hidden">
              <div className="bg-gradient-to-r from-peach-100 to-rose-100 px-4 py-3">
                <h4 className="font-display font-semibold text-gray-800">
                  {child.name}
                </h4>
                {currentPhoto && (
                  <p className="text-sm text-gray-600">
                    Age: {currentPhoto.ageAtPhoto}
                  </p>
                )}
              </div>

              <div className="relative aspect-[4/3] bg-cream-50">
                {photos.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 mx-auto mb-2 opacity-50"
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
                      <p className="text-sm">No photos found</p>
                      <p className="text-xs mt-1">for this milestone</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image
                      src={getPhotoUrl(currentPhoto.baseUrl, 800, 600)}
                      alt={`${child.name} at ${currentPhoto.ageAtPhoto}`}
                      fill
                      className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setSelectedPhoto(currentPhoto)}
                      unoptimized // Google Photos URLs are dynamic
                    />

                    {/* Navigation arrows */}
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={() => navigatePhoto(child.id, "prev")}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
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
                          onClick={() => navigatePhoto(child.id, "next")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
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

              {photos.length > 1 && (
                <div className="px-4 py-2 bg-cream-50 text-center text-sm text-gray-500">
                  Photo {currentIndex + 1} of {photos.length}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white"
            onClick={() => setSelectedPhoto(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <Image
              src={getPhotoUrl(selectedPhoto.baseUrl, 1600, 1200)}
              alt={`${selectedPhoto.childName} at ${selectedPhoto.ageAtPhoto}`}
              width={1600}
              height={1200}
              className="object-contain max-h-[85vh] mx-auto"
              unoptimized
            />
            <div className="text-center mt-4 text-white">
              <p className="font-display text-lg">{selectedPhoto.childName}</p>
              <p className="text-white/70">{selectedPhoto.ageAtPhoto} old</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
