"use client";

import { useState } from "react";
import { Child } from "@/types";
import { generateId } from "@/lib/storage";

interface ChildFormProps {
  onAdd: (child: Child) => void;
  onCancel?: () => void;
  editingChild?: Child;
}

export function ChildForm({ onAdd, onCancel, editingChild }: ChildFormProps) {
  const [name, setName] = useState(editingChild?.name || "");
  const [birthDate, setBirthDate] = useState(editingChild?.birthDate || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (!birthDate) {
      setError("Please enter a birth date");
      return;
    }

    const birthDateObj = new Date(birthDate);
    if (birthDateObj > new Date()) {
      setError("Birth date cannot be in the future");
      return;
    }

    const child: Child = {
      id: editingChild?.id || generateId(),
      name: name.trim(),
      birthDate,
      createdAt: editingChild?.createdAt || new Date().toISOString(),
    };

    onAdd(child);
    setName("");
    setBirthDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-cream-50 rounded-xl p-6 shadow-sm border border-cream-200">
      <h3 className="text-lg font-display font-semibold text-gray-800 mb-4">
        {editingChild ? "Edit Child" : "Add a Child"}
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter child's name"
            className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-peach-400 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div>
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <input
            type="date"
            id="birthDate"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-2 border border-cream-300 rounded-lg focus:ring-2 focus:ring-peach-400 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-peach-500 hover:bg-peach-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {editingChild ? "Save Changes" : "Add Child"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
