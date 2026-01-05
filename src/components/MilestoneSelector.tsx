"use client";

import { Milestone, Child } from "@/types";
import { MILESTONES, getCommonMilestones } from "@/lib/milestones";

interface MilestoneSelectorProps {
  childProfiles: Child[];
  selectedMilestone: Milestone | null;
  onSelect: (milestone: Milestone) => void;
}

export function MilestoneSelector({
  childProfiles,
  selectedMilestone,
  onSelect,
}: MilestoneSelectorProps) {
  // Get milestones that all children have reached
  const birthDates = childProfiles.map((c) => new Date(c.birthDate));
  const commonMilestones = getCommonMilestones(birthDates);
  const upcomingMilestones = MILESTONES.filter(
    (m) => !commonMilestones.some((cm) => cm.id === m.id)
  );

  if (childProfiles.length < 2) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>Add at least 2 children to compare photos at the same age.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-display font-semibold text-gray-800">
        Select an Age Milestone
      </h3>

      {commonMilestones.length > 0 && (
        <div>
          <p className="text-sm text-gray-500 mb-2">
            Milestones all children have reached:
          </p>
          <div className="flex flex-wrap gap-2">
            {commonMilestones.map((milestone) => (
              <button
                key={milestone.id}
                onClick={() => onSelect(milestone)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedMilestone?.id === milestone.id
                    ? "bg-peach-500 text-white shadow-md"
                    : "bg-cream-100 text-gray-700 hover:bg-cream-200"
                }`}
              >
                {milestone.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {upcomingMilestones.length > 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-2">
            Upcoming milestones (not all children have reached):
          </p>
          <div className="flex flex-wrap gap-2">
            {upcomingMilestones.slice(0, 5).map((milestone) => (
              <button
                key={milestone.id}
                disabled
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                {milestone.label}
              </button>
            ))}
            {upcomingMilestones.length > 5 && (
              <span className="px-4 py-2 text-sm text-gray-400">
                +{upcomingMilestones.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {commonMilestones.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          <p>No common milestones yet.</p>
          <p className="text-sm mt-1">
            Wait until all children have reached the same age milestones.
          </p>
        </div>
      )}
    </div>
  );
}
