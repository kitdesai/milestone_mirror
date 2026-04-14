"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Child, FrameWithImages } from "@/types";
import { ChildForm } from "@/components/ChildForm";
import { ChildList } from "@/components/ChildList";
import { FramesList } from "@/components/FramesList";
import { UpgradePrompt } from "@/components/UpgradePrompt";

export default function AppPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [frames, setFrames] = useState<FrameWithImages[]>([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [isLoadingFrames, setIsLoadingFrames] = useState(true);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchChildren = useCallback(async () => {
    try {
      const res = await fetch("/api/children");
      const data = await res.json();
      setChildren(data.children || []);
    } catch (error) {
      console.error("Failed to fetch children:", error);
    } finally {
      setIsLoadingChildren(false);
    }
  }, []);

  const fetchFrames = useCallback(async () => {
    try {
      const res = await fetch("/api/frames");
      const data = await res.json();
      setFrames(data.frames || []);
    } catch (error) {
      console.error("Failed to fetch frames:", error);
    } finally {
      setIsLoadingFrames(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
    fetchFrames();
  }, [fetchChildren, fetchFrames]);

  // Show children management on main page until user has a frame with at least one image
  const hasFrameWithImage = frames.some((f) => f.images.length > 0);
  const showOnboarding = !hasFrameWithImage;
  const isLoading = isLoadingChildren || isLoadingFrames;

  const handleAddChild = async (name: string, birthDate: string) => {
    const url = editingChild
      ? `/api/children/${editingChild.id}`
      : "/api/children";
    const method = editingChild ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, birthDate }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Failed to save child");
    }

    setShowAddForm(false);
    setEditingChild(null);
    await fetchChildren();
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setShowAddForm(true);
  };

  const handleDeleteChild = async (childId: string) => {
    if (!confirm("Delete this child and all their photos?")) return;
    await fetch(`/api/children/${childId}`, { method: "DELETE" });
    await fetchChildren();
  };

  const handleCancelEdit = () => {
    setShowAddForm(false);
    setEditingChild(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/icon.svg" alt="Milestone Mirror" width={56} height={56} />
            <div>
              <h1 className="font-display text-xl font-bold text-gray-800">
                Milestone Mirror
              </h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user?.tier === "free" && (
              <Link
                href="/app/settings"
                className="text-xs bg-peach-500 hover:bg-peach-600 text-white font-medium py-1 px-3 rounded-full transition-colors"
              >
                Upgrade
              </Link>
            )}
            <Link
              href="/app/settings"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Settings"
            >
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Children management — shown until first frame has an image */}
            {showOnboarding && (
              <div className="mb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display text-lg font-semibold text-gray-800">
                      Your Children
                    </h2>
                    {!showAddForm && !(user?.tier === "free" && children.length >= 2) && children.length > 0 && (
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="text-peach-600 hover:text-peach-700 font-medium text-sm flex items-center gap-1"
                      >
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Add Child
                      </button>
                    )}
                  </div>

                  {showAddForm ? (
                    <ChildForm
                      onAdd={handleAddChild}
                      onCancel={handleCancelEdit}
                      editingChild={editingChild || undefined}
                    />
                  ) : children.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <p className="font-medium">No children added yet</p>
                      <p className="text-sm mt-1">Add your children to start creating frames</p>
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="mt-4 bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                      >
                        Add Your First Child
                      </button>
                    </div>
                  ) : (
                    <ChildList
                      childProfiles={children}
                      onEdit={handleEditChild}
                      onDelete={handleDeleteChild}
                    />
                  )}
                  {user?.tier === "free" && children.length >= 2 && !showAddForm && (
                    <div className="mt-4">
                      <UpgradePrompt limitType="children" limit={2} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Frames */}
            {children.length > 0 ? (
              <FramesList childProfiles={children} />
            ) : null}
          </>
        )}
      </main>
    </div>
  );
}
