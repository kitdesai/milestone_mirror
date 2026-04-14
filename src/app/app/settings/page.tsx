"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Child } from "@/types";
import { ChildForm } from "@/components/ChildForm";
import { ChildList } from "@/components/ChildList";
import { SubscriptionManager } from "@/components/SubscriptionManager";
import { UpgradePrompt } from "@/components/UpgradePrompt";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  const handleAddChild = async (child: Child) => {
    const url = editingChild
      ? `/api/children/${editingChild.id}`
      : "/api/children";
    const method = editingChild ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: child.name, birthDate: child.birthDate }),
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
            <Link href="/app" className="flex items-center gap-3">
              <Image src="/icon.svg" alt="Milestone Mirror" width={56} height={56} />
              <div>
                <h1 className="font-display text-xl font-bold text-gray-800">
                  Milestone Mirror
                </h1>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </Link>
          </div>
          <Link
            href="/app"
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
          >
            <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <h2 className="font-display text-2xl font-bold text-gray-800">
          Settings
        </h2>

        {/* Children */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-semibold text-gray-800">
              Children
            </h3>
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
                Add
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-6">
              <div className="w-6 h-6 border-2 border-peach-200 border-t-peach-500 rounded-full animate-spin" />
            </div>
          ) : showAddForm ? (
            <ChildForm
              onAdd={handleAddChild}
              onCancel={handleCancelEdit}
              editingChild={editingChild || undefined}
            />
          ) : children.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">No children added yet.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-3 bg-peach-500 hover:bg-peach-600 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors"
              >
                Add Child
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

        {/* Subscription */}
        <SubscriptionManager />

        {/* Account */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">
            Account
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Email</span>
              <span className="text-sm text-gray-800">{user?.email}</span>
            </div>
            <div className="border-t border-cream-200 pt-3">
              <button
                onClick={logout}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>

        {/* Legal */}
        <div className="bg-white rounded-2xl shadow-sm border border-cream-200 p-6">
          <h3 className="font-display text-lg font-semibold text-gray-800 mb-4">
            Legal
          </h3>
          <div className="space-y-2">
            <Link
              href="/privacy"
              className="block text-sm text-gray-600 hover:text-peach-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="block text-sm text-gray-600 hover:text-peach-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
