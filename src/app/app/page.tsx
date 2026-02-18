"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Child, Milestone, PhotoWithAge } from "@/types";
import { TabNavigation } from "@/components/TabNavigation";
import { ChildForm } from "@/components/ChildForm";
import { ChildList } from "@/components/ChildList";
import { MilestoneSelector } from "@/components/MilestoneSelector";
import { PhotoComparison } from "@/components/PhotoComparison";
import { DropboxConnectButton } from "@/components/DropboxConnectButton";
import { FramesList } from "@/components/FramesList";
import { getComparisonPhotos } from "@/lib/dropbox";

const TABS = [
  {
    id: "comparison",
    label: "Comparison",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
      </svg>
    ),
  },
  {
    id: "frames",
    label: "Frames",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
];

export default function AppPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("comparison");
  const [children, setChildren] = useState<Child[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(
    null
  );
  const [photosByChild, setPhotosByChild] = useState<
    Map<string, PhotoWithAge[]>
  >(new Map());
  const [isLoadingPhotos, setIsLoadingPhotos] = useState(false);
  const [isLoadingChildren, setIsLoadingChildren] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch children from API
  const fetchChildren = useCallback(async () => {
    try {
      const res = await fetch("/api/children");
      if (res.ok) {
        const data: { children: Child[] } = await res.json();
        setChildren(data.children || []);
      }
    } catch (err) {
      console.error("Failed to fetch children:", err);
    } finally {
      setIsLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  // Handle connection status change
  const handleConnectionChange = useCallback((connected: boolean) => {
    setIsConnected(connected);
    if (!connected) {
      setPhotosByChild(new Map());
      setSelectedMilestone(null);
    }
  }, []);

  // Fetch photos when milestone is selected
  useEffect(() => {
    if (!selectedMilestone || !isConnected || children.length < 2) {
      return;
    }

    const fetchPhotos = async () => {
      setIsLoadingPhotos(true);
      setError(null);

      try {
        const photos = await getComparisonPhotos(children, selectedMilestone);
        setPhotosByChild(photos);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch photos"
        );
        setPhotosByChild(new Map());
      } finally {
        setIsLoadingPhotos(false);
      }
    };

    fetchPhotos();
  }, [selectedMilestone, isConnected, children]);

  const handleAddChild = async (child: Child) => {
    try {
      if (editingChild) {
        await fetch(`/api/children/${child.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: child.name, birthDate: child.birthDate }),
        });
        setEditingChild(null);
      } else {
        await fetch("/api/children", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: child.name, birthDate: child.birthDate }),
        });
        setShowAddForm(false);
      }
      await fetchChildren();
    } catch (err) {
      console.error("Failed to save child:", err);
    }
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setShowAddForm(true);
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      await fetch(`/api/children/${childId}`, { method: "DELETE" });
      await fetchChildren();
    } catch (err) {
      console.error("Failed to delete child:", err);
    }
  };

  const handleCancelEdit = () => {
    setEditingChild(null);
    setShowAddForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-peach-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-cream-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-peach-400 to-rose-400 rounded-xl flex items-center justify-center">
              <svg
                className="h-6 w-6 text-white"
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
            <div>
              <h1 className="font-display text-xl font-bold text-gray-800">
                Milestone Mirror
              </h1>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <TabNavigation
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {/* Error display */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === "comparison" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left sidebar - Children management */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-gray-800">
                    Your Children
                  </h2>
                  {!showAddForm && (
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

                {isLoadingChildren ? (
                  <div className="flex justify-center py-8">
                    <div className="w-6 h-6 border-2 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
                  </div>
                ) : showAddForm ? (
                  <ChildForm
                    onAdd={handleAddChild}
                    onCancel={handleCancelEdit}
                    editingChild={editingChild || undefined}
                  />
                ) : (
                  <ChildList
                    childProfiles={children}
                    onEdit={handleEditChild}
                    onDelete={handleDeleteChild}
                  />
                )}
              </div>

              {/* Dropbox connection */}
              <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
                <h2 className="font-display text-lg font-semibold text-gray-800 mb-4">
                  Photo Source
                </h2>
                <DropboxConnectButton
                  onConnectionChange={handleConnectionChange}
                />
              </div>

              {/* Milestone selector */}
              {isConnected && (
                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
                  <MilestoneSelector
                    childProfiles={children}
                    selectedMilestone={selectedMilestone}
                    onSelect={setSelectedMilestone}
                  />
                </div>
              )}
            </div>

            {/* Main content - Photo comparison */}
            <div className="lg:col-span-2">
              {!isConnected ? (
                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-peach-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                  <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">
                    Connect to Dropbox
                  </h2>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    Connect your Dropbox account to compare photos of your
                    children at the same ages.
                  </p>
                </div>
              ) : children.length < 2 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg
                      className="h-8 w-8 text-sky-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">
                    Add Your Children
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Add at least two children to start comparing their photos.
                  </p>
                </div>
              ) : !selectedMilestone ? (
                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-12 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cream-100 to-peach-100 rounded-full flex items-center justify-center mx-auto mb-6">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">
                    Select a Milestone
                  </h2>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Choose an age milestone from the sidebar.
                  </p>
                </div>
              ) : isLoadingPhotos ? (
                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-12">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-peach-200 border-t-peach-500 rounded-full animate-spin mb-4" />
                    <p className="text-gray-600">Loading photos...</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
                  <PhotoComparison
                    childProfiles={children}
                    photosByChild={photosByChild}
                    milestone={selectedMilestone}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Frames Tab */
          <div>
            {isLoadingChildren ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-4 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
              </div>
            ) : children.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-sky-100 to-sky-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="h-8 w-8 text-sky-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-xl font-semibold text-gray-800 mb-2">
                  Add Children First
                </h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  Go to the Comparison tab and add your children before creating
                  frames.
                </p>
                <button
                  onClick={() => setActiveTab("comparison")}
                  className="bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  Go to Comparison
                </button>
              </div>
            ) : (
              <FramesList childProfiles={children} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
