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
