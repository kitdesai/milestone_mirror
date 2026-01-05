import { Milestone } from "@/types";

// Predefined milestones for comparing children at the same age
export const MILESTONES: Milestone[] = [
  {
    id: "newborn",
    label: "Newborn (0-7 days)",
    ageInDays: 3,
    rangeDays: 4,
  },
  {
    id: "2-weeks",
    label: "2 Weeks",
    ageInDays: 14,
    rangeDays: 3,
  },
  {
    id: "1-month",
    label: "1 Month",
    ageInDays: 30,
    rangeDays: 7,
  },
  {
    id: "2-months",
    label: "2 Months",
    ageInDays: 60,
    rangeDays: 7,
  },
  {
    id: "3-months",
    label: "3 Months",
    ageInDays: 90,
    rangeDays: 10,
  },
  {
    id: "4-months",
    label: "4 Months",
    ageInDays: 120,
    rangeDays: 10,
  },
  {
    id: "5-months",
    label: "5 Months",
    ageInDays: 150,
    rangeDays: 10,
  },
  {
    id: "6-months",
    label: "6 Months",
    ageInDays: 182,
    rangeDays: 14,
  },
  {
    id: "9-months",
    label: "9 Months",
    ageInDays: 274,
    rangeDays: 14,
  },
  {
    id: "1-year",
    label: "1 Year",
    ageInDays: 365,
    rangeDays: 14,
  },
  {
    id: "15-months",
    label: "15 Months",
    ageInDays: 456,
    rangeDays: 14,
  },
  {
    id: "18-months",
    label: "18 Months",
    ageInDays: 547,
    rangeDays: 14,
  },
  {
    id: "2-years",
    label: "2 Years",
    ageInDays: 730,
    rangeDays: 21,
  },
  {
    id: "2.5-years",
    label: "2.5 Years",
    ageInDays: 912,
    rangeDays: 21,
  },
  {
    id: "3-years",
    label: "3 Years",
    ageInDays: 1095,
    rangeDays: 21,
  },
  {
    id: "4-years",
    label: "4 Years",
    ageInDays: 1460,
    rangeDays: 30,
  },
  {
    id: "5-years",
    label: "5 Years",
    ageInDays: 1825,
    rangeDays: 30,
  },
];

// Get milestones that are applicable for a child based on their current age
export function getApplicableMilestones(birthDate: Date): Milestone[] {
  const now = new Date();
  const ageInDays = Math.floor(
    (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return MILESTONES.filter(
    (milestone) => milestone.ageInDays - milestone.rangeDays <= ageInDays
  );
}

// Get milestones that all children have reached
export function getCommonMilestones(birthDates: Date[]): Milestone[] {
  if (birthDates.length === 0) return [];

  const now = new Date();
  const ages = birthDates.map((bd) =>
    Math.floor((now.getTime() - bd.getTime()) / (1000 * 60 * 60 * 24))
  );
  const youngestAge = Math.min(...ages);

  return MILESTONES.filter(
    (milestone) => milestone.ageInDays + milestone.rangeDays <= youngestAge
  );
}
