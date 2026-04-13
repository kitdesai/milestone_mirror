// Child profile types
export interface Child {
  id: string;
  name: string;
  birthDate: string; // ISO date string
  createdAt: string;
}

// Milestone types
export interface Milestone {
  id: string;
  label: string;
  ageInDays: number;
  rangeDays: number; // +/- days to search
}

// Google Photos types
export interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
  mimeType: string;
  mediaMetadata: {
    creationTime: string;
    width: string;
    height: string;
    photo?: {
      cameraMake?: string;
      cameraModel?: string;
    };
  };
}

export interface PhotoWithAge extends GooglePhoto {
  childId: string;
  childName: string;
  ageAtPhoto: string; // Human-readable age (e.g., "3 months, 2 days")
  exactAgeDays: number;
}

// Google Photos API response types
export interface MediaItemsSearchResponse {
  mediaItems?: GooglePhoto[];
  nextPageToken?: string;
}

// Auth types
export interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
}

// App state types
export interface AppState {
  children: Child[];
  selectedMilestone: Milestone | null;
  isConnectedToGoogle: boolean;
}

// User types
export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  tier: "free" | "premium";
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
}

// Frame types
export interface Frame {
  id: string;
  userId: string;
  title: string;
  description?: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface FrameImage {
  id: string;
  frameId: string;
  childId: string;
  imageKey: string;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  createdAt: string;
}

// Extended frame with images and child info for UI
export interface FrameWithImages extends Frame {
  images: (FrameImage & { childName: string })[];
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
