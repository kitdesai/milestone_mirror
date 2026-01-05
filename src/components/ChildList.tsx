"use client";

import { Child } from "@/types";
import { formatDisplayDate } from "@/lib/date-utils";
import { calculateAge } from "@/lib/date-utils";

interface ChildListProps {
  childProfiles: Child[];
  onEdit: (child: Child) => void;
  onDelete: (childId: string) => void;
}

export function ChildList({ childProfiles, onEdit, onDelete }: ChildListProps) {
  if (childProfiles.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No children added yet.</p>
        <p className="text-sm mt-1">Add your children to start comparing photos!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {childProfiles.map((child) => {
        const birthDate = new Date(child.birthDate);
        const currentAge = calculateAge(birthDate, new Date());

        return (
          <div
            key={child.id}
            className="bg-white rounded-xl p-4 shadow-sm border border-cream-200 flex items-center justify-between"
          >
            <div>
              <h4 className="font-medium text-gray-800">{child.name}</h4>
              <p className="text-sm text-gray-500">
                Born {formatDisplayDate(child.birthDate)} ({currentAge} old)
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(child)}
                className="p-2 text-gray-500 hover:text-peach-600 transition-colors"
                title="Edit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  if (confirm(`Are you sure you want to remove ${child.name}?`)) {
                    onDelete(child.id);
                  }
                }}
                className="p-2 text-gray-500 hover:text-rose-600 transition-colors"
                title="Delete"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
