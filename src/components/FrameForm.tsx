"use client";

import { useState } from "react";
import { Frame } from "@/types";

interface FrameFormProps {
  frame?: Frame;
  onSave: (title: string, description?: string) => Promise<void>;
  onCancel: () => void;
}

export function FrameForm({ frame, onSave, onCancel }: FrameFormProps) {
  const [title, setTitle] = useState(frame?.title || "");
  const [description, setDescription] = useState(frame?.description || "");
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
      await onSave(title.trim(), description.trim() || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-cream-50 rounded-xl p-6 shadow-sm border border-cream-200"
    >
      <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
        {frame ? "Edit Frame" : "Create New Frame"}
      </h3>

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
            className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-peach-400 focus:border-transparent outline-none transition-all"
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
            className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-peach-400 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-peach-500 hover:bg-peach-600 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? "Saving..." : frame ? "Save Changes" : "Create Frame"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}
