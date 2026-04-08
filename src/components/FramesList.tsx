"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FrameWithImages, Child } from "@/types";
import { SortableFrameCard } from "./SortableFrameCard";
import { FrameForm } from "./FrameForm";
import { ImageUploader } from "./ImageUploader";

interface FramesListProps {
  childProfiles: Child[];
}

interface ApiError {
  error: string;
}

export function FramesList({ childProfiles }: FramesListProps) {
  const [frames, setFrames] = useState<FrameWithImages[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFrame, setEditingFrame] = useState<FrameWithImages | null>(
    null
  );
  const [uploadTarget, setUploadTarget] = useState<{
    frameId: string;
    childId: string;
    childName: string;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchFrames = async () => {
    try {
      const res = await fetch("/api/frames");
      const data: { frames: FrameWithImages[] } = await res.json();
      setFrames(data.frames || []);
    } catch (error) {
      console.error("Failed to fetch frames:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFrames();
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = frames.findIndex((f) => f.id === active.id);
    const newIndex = frames.findIndex((f) => f.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistic reorder
    const reordered = [...frames];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);
    setFrames(reordered);

    // Persist to backend
    try {
      await fetch("/api/frames", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((f) => f.id) }),
      });
    } catch (error) {
      console.error("Failed to reorder frames:", error);
      await fetchFrames(); // Revert on failure
    }
  };

  const handleCreateFrame = async (title: string, description?: string) => {
    const res = await fetch("/api/frames", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error || "Failed to create frame");
    }

    setShowCreateForm(false);
    await fetchFrames();
  };

  const handleEditFrame = async (title: string, description?: string) => {
    if (!editingFrame) return;

    const res = await fetch(`/api/frames/${editingFrame.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    if (!res.ok) {
      const error: ApiError = await res.json();
      throw new Error(error.error || "Failed to update frame");
    }

    setEditingFrame(null);
    await fetchFrames();
  };

  const handleDeleteFrame = async (frameId: string) => {
    if (!confirm("Delete this frame and all its photos?")) return;

    await fetch(`/api/frames/${frameId}`, { method: "DELETE" });
    await fetchFrames();
  };

  const handleDeleteImage = async (frameId: string, imageId: string) => {
    if (!confirm("Delete this photo?")) return;

    await fetch(`/api/frames/${frameId}/images/${imageId}`, {
      method: "DELETE",
    });
    await fetchFrames();
  };

  const handleAddImage = (frameId: string, childId: string) => {
    const child = childProfiles.find((c) => c.id === childId);
    if (child) {
      setUploadTarget({ frameId, childId, childName: child.name });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-gray-800">
            Your Frames
          </h2>
          <p className="text-sm text-gray-500">
            Create custom milestone collections
          </p>
        </div>
        {!showCreateForm && !editingFrame && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Frame
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreateForm && (
        <FrameForm
          onSave={handleCreateFrame}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit form */}
      {editingFrame && (
        <FrameForm
          frame={editingFrame}
          onSave={handleEditFrame}
          onCancel={() => setEditingFrame(null)}
        />
      )}

      {/* Frames grid */}
      {frames.length === 0 && !showCreateForm ? (
        <div className="text-center py-12 text-gray-500">
          <div className="w-16 h-16 bg-gradient-to-br from-cream-100 to-peach-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="h-8 w-8 text-peach-500"
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
          </div>
          <p className="font-medium">No frames yet</p>
          <p className="text-sm mt-1">
            Create your first frame to capture milestone moments
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={frames.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 gap-6">
              {frames.map((frame) => (
                <SortableFrameCard
                  key={frame.id}
                  frame={frame}
                  childProfiles={childProfiles.map((c) => ({
                    id: c.id,
                    name: c.name,
                  }))}
                  onEdit={() => setEditingFrame(frame)}
                  onDelete={() => handleDeleteFrame(frame.id)}
                  onAddImage={(childId) => handleAddImage(frame.id, childId)}
                  onDeleteImage={(imageId) =>
                    handleDeleteImage(frame.id, imageId)
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Image uploader modal */}
      {uploadTarget && (
        <ImageUploader
          frameId={uploadTarget.frameId}
          childId={uploadTarget.childId}
          childName={uploadTarget.childName}
          onUploadComplete={() => {
            setUploadTarget(null);
            fetchFrames();
          }}
          onClose={() => setUploadTarget(null)}
        />
      )}
    </div>
  );
}
