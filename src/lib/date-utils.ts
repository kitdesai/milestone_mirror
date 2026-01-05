import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  addDays,
  format,
  parseISO,
} from "date-fns";
import { Milestone } from "@/types";

// Calculate a human-readable age string from birth date to photo date
export function calculateAge(birthDate: Date, photoDate: Date): string {
  const years = differenceInYears(photoDate, birthDate);
  const months = differenceInMonths(photoDate, birthDate) % 12;
  const days = differenceInDays(photoDate, birthDate) % 30;

  const parts: string[] = [];

  if (years > 0) {
    parts.push(`${years} year${years > 1 ? "s" : ""}`);
  }
  if (months > 0) {
    parts.push(`${months} month${months > 1 ? "s" : ""}`);
  }
  if (days > 0 && years === 0) {
    parts.push(`${days} day${days > 1 ? "s" : ""}`);
  }

  return parts.length > 0 ? parts.join(", ") : "Newborn";
}

// Calculate exact age in days
export function calculateAgeInDays(birthDate: Date, photoDate: Date): number {
  return differenceInDays(photoDate, birthDate);
}

// Get the date range for a milestone based on a child's birth date
export function getMilestoneDateRange(
  birthDate: Date,
  milestone: Milestone
): { startDate: Date; endDate: Date } {
  const targetDate = addDays(birthDate, milestone.ageInDays);
  const startDate = addDays(targetDate, -milestone.rangeDays);
  const endDate = addDays(targetDate, milestone.rangeDays);

  return { startDate, endDate };
}

// Format date for Google Photos API (YYYY-MM-DD format becomes year/month/day object)
export function formatDateForGooglePhotos(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // Google API uses 1-indexed months
    day: date.getDate(),
  };
}

// Format date for display
export function formatDisplayDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "MMMM d, yyyy");
}

// Parse ISO date string safely
export function parseDateSafe(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}
