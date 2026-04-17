"use client";

import { useState } from "react";
import { Frame } from "@/types";
import { FRAME_COLORS, FrameColor, getFrameColorStyle } from "@/lib/frame-colors";

interface FrameFormProps {
  frame?: Frame;
  onSave: (title: string, description?: string, color?: string) => Promise<void>;
  onCancel: () => void;
}

export function FrameForm({ frame, onSave, onCancel }: FrameFormProps) {
  const [title, setTitle] = useState(frame?.title || "");
  const [description, setDescription] = useState(frame?.description || "");
  const [color, setColor] = useState<FrameColor>(
    (frame?.color as FrameColor) || "peach"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Please enter a title");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(title.trim(), description.trim() || undefined, color);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg max-w-md w-full overflow-hidden">
        {/* Preview header with selected color */}
        <div className="px-6 py-4" style={getFrameColorStyle(color)}>
          <h3 className="font-display font-semibold text-gray-800">
            {title || (frame ? "Edit Frame" : "New Frame")}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 mt-0.5">{description}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., First Steps, First Smile"
                autoFocus
                className="w-full px-4 py-2 border border-cream-200 rounded-lg focus:ring-2 focus:ring-peach-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a note about this milestone..."
                rows={2}
                className="w-full px-4 py-2 border border-cream-200 rounded-lg focus:ring-2 focus:ring-peach-400 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {(Object.keys(FRAME_COLORS) as FrameColor[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    title={FRAME_COLORS[key].label}
                    style={{ background: FRAME_COLORS[key].hex }}
                    className={`w-8 h-8 rounded-full transition-all ${
                      color === key
                        ? "ring-2 ring-peach-500 ring-offset-2 scale-110"
                        : "hover:scale-105"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-peach-500 hover:bg-peach-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {isSubmitting
                  ? "Saving..."
                  : frame
                    ? "Save Changes"
                    : "Create Frame"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-500 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
