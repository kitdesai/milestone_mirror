"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PhotoWithAge, Child, Milestone } from "@/types";
import { detectFaces, loadFaceDetectionModels } from "@/lib/face-detection";

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
  const [faceFilterEnabled, setFaceFilterEnabled] = useState(false);
  const [faceCheckResults, setFaceCheckResults] = useState<Map<string, boolean>>(new Map());
  const [isCheckingFaces, setIsCheckingFaces] = useState(false);
  const [faceCheckProgress, setFaceCheckProgress] = useState({ checked: 0, total: 0 });

  // Get filtered photos based on face detection
  const getFilteredPhotos = useCallback((childId: string): PhotoWithAge[] => {
    const allPhotos = photosByChild.get(childId) || [];
    if (!faceFilterEnabled) return allPhotos;
    return allPhotos.filter((photo) => faceCheckResults.get(photo.id) === true);
  }, [photosByChild, faceFilterEnabled, faceCheckResults]);

  // Check all photos for faces when filter is enabled
  useEffect(() => {
    if (!faceFilterEnabled) return;

    const allPhotos = Array.from(photosByChild.values()).flat();
    const uncheckedPhotos = allPhotos.filter((photo) => !faceCheckResults.has(photo.id));

    if (uncheckedPhotos.length === 0) return;

    setIsCheckingFaces(true);
    setFaceCheckProgress({ checked: 0, total: uncheckedPhotos.length });

    const checkFaces = async () => {
      await loadFaceDetectionModels();
      const results = new Map(faceCheckResults);
      let checked = 0;

      for (const photo of uncheckedPhotos) {
        if (!photo.baseUrl) {
          results.set(photo.id, false);
        } else {
          const hasFace = await detectFaces(photo.baseUrl);
          results.set(photo.id, hasFace);
        }
        checked++;
        setFaceCheckProgress({ checked, total: uncheckedPhotos.length });
        setFaceCheckResults(new Map(results));
      }

      setIsCheckingFaces(false);
    };

    checkFaces();
  }, [faceFilterEnabled, photosByChild]);

  // Reset photo indexes when filter changes
  useEffect(() => {
    setPhotoIndexes(new Map(childProfiles.map((c) => [c.id, 0])));
  }, [faceFilterEnabled, childProfiles]);

  const navigatePhoto = (childId: string, direction: "prev" | "next") => {
    const photos = getFilteredPhotos(childId);
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

        {/* Face filter toggle */}
        <div className="mt-4 flex items-center justify-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={faceFilterEnabled}
              onChange={(e) => setFaceFilterEnabled(e.target.checked)}
              className="w-4 h-4 text-rose-500 border-gray-300 rounded focus:ring-rose-400"
            />
            <span className="text-sm text-gray-600">Show only photos with faces</span>
          </label>
          {isCheckingFaces && (
            <span className="text-xs text-gray-400">
              Scanning... {faceCheckProgress.checked}/{faceCheckProgress.total}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {childProfiles.map((child) => {
          const photos = getFilteredPhotos(child.id);
          const allPhotosCount = (photosByChild.get(child.id) || []).length;
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

              <div className="relative aspect-[3/4] bg-cream-50">
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
                      <p className="text-sm">
                        {faceFilterEnabled && allPhotosCount > 0
                          ? "No photos with faces"
                          : "No photos found"}
                      </p>
                      <p className="text-xs mt-1">
                        {faceFilterEnabled && allPhotosCount > 0
                          ? `${allPhotosCount} photos scanned`
                          : "for this milestone"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Image
                      src={currentPhoto.baseUrl}
                      alt={`${child.name} at ${currentPhoto.ageAtPhoto}`}
                      fill
                      className="object-cover cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={() => setSelectedPhoto(currentPhoto)}
                      unoptimized
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

              {photos.length > 0 && (
                <div className="px-4 py-2 bg-cream-50 text-center text-sm text-gray-500">
                  Photo {currentIndex + 1} of {photos.length}
                  {faceFilterEnabled && allPhotosCount !== photos.length && (
                    <span className="text-gray-400 ml-1">
                      ({allPhotosCount} total)
                    </span>
                  )}
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
              src={selectedPhoto.baseUrl}
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
