"use client";

import { useEffect, useRef, useState } from "react";
import { resizeImage } from "@/lib/image-resize";

interface ImageUploaderProps {
  frameId: string;
  childId: string;
  childName: string;
  onUploadComplete: () => void;
  onClose: () => void;
}

interface ApiError {
  error: string;
}

export function ImageUploader({
  frameId,
  childId,
  childName,
  onUploadComplete,
  onClose,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const setFile = (file: File | null) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be less than 10MB");
      return;
    }

    setError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    setSelectedFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFile(file || null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files?.[0];
    setFile(file || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleUpload = async () => {
    const file = selectedFile;
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      // Resize image before upload (max 1200px, JPEG 85%)
      const resizedFile = await resizeImage(file);

      const formData = new FormData();
      formData.append("file", resizedFile);
      formData.append("frameId", frameId);
      formData.append("childId", childId);

      const res = await fetch("/api/images/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data: ApiError = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      onUploadComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-gray-800">
            Add photo for {childName}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="h-6 w-6"
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
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Preview */}
          {preview ? (
            <div className="relative aspect-[4/3] bg-cream-50 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <label
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`flex flex-col items-center justify-center aspect-[4/3] bg-cream-50 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                isDragActive
                  ? "border-peach-500 bg-cream-50"
                  : "border-cream-200 hover:border-peach-500"
              }`}
            >
              <svg
                className="h-12 w-12 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span className="text-sm text-gray-500">
                Drag and drop a photo, or tap to select
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {preview && (
              <button
                onClick={() => {
                  if (preview) URL.revokeObjectURL(preview);
                  setPreview(null);
                  setSelectedFile(null);
                  setIsDragActive(false);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex-1 px-4 py-2 text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                Change Photo
              </button>
            )}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex-1 bg-peach-500 hover:bg-peach-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                "Upload"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
