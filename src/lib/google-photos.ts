import {
  GooglePhoto,
  MediaItemsSearchResponse,
  PhotoWithAge,
  Child,
  Milestone,
} from "@/types";
import { getMilestoneDateRange, formatDateForGooglePhotos, calculateAge, calculateAgeInDays } from "./date-utils";
import { getStoredTokens, isTokenExpired } from "./storage";

const PHOTOS_API_BASE = "https://photoslibrary.googleapis.com/v1";

// Get current access token, refreshing if needed
async function getAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  if (isTokenExpired(tokens)) {
    // Refresh the token via our API route
    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });

      if (!response.ok) {
        return null;
      }

      // The refresh endpoint will update localStorage
      const newTokens = await response.json();
      return newTokens.access_token;
    } catch {
      return null;
    }
  }

  return tokens.access_token;
}

// Search for photos in a date range with content filters
export async function searchPhotos(
  startDate: Date,
  endDate: Date
): Promise<GooglePhoto[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated with Google Photos");
  }

  const allPhotos: GooglePhoto[] = [];
  let pageToken: string | undefined;

  do {
    const requestBody: Record<string, unknown> = {
      pageSize: 100,
      filters: {
        dateFilter: {
          ranges: [
            {
              startDate: formatDateForGooglePhotos(startDate),
              endDate: formatDateForGooglePhotos(endDate),
            },
          ],
        },
        contentFilter: {
          includedContentCategories: ["PEOPLE"],
        },
        mediaTypeFilter: {
          mediaTypes: ["PHOTO"],
        },
      },
    };

    if (pageToken) {
      requestBody.pageToken = pageToken;
    }

    const response = await fetch(`${PHOTOS_API_BASE}/mediaItems:search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Google Photos API error: ${error}`);
    }

    const data: MediaItemsSearchResponse = await response.json();

    if (data.mediaItems) {
      allPhotos.push(...data.mediaItems);
    }

    pageToken = data.nextPageToken;
  } while (pageToken);

  return allPhotos;
}

// Get photos for a specific child at a specific milestone
export async function getPhotosForMilestone(
  child: Child,
  milestone: Milestone
): Promise<PhotoWithAge[]> {
  const birthDate = new Date(child.birthDate);
  const { startDate, endDate } = getMilestoneDateRange(birthDate, milestone);

  const photos = await searchPhotos(startDate, endDate);

  return photos.map((photo) => {
    const photoDate = new Date(photo.mediaMetadata.creationTime);
    return {
      ...photo,
      childId: child.id,
      childName: child.name,
      ageAtPhoto: calculateAge(birthDate, photoDate),
      exactAgeDays: calculateAgeInDays(birthDate, photoDate),
    };
  });
}

// Get photos for multiple children at the same milestone
export async function getComparisonPhotos(
  children: Child[],
  milestone: Milestone
): Promise<Map<string, PhotoWithAge[]>> {
  const photosByChild = new Map<string, PhotoWithAge[]>();

  // Fetch photos for all children in parallel
  const results = await Promise.all(
    children.map(async (child) => {
      try {
        const photos = await getPhotosForMilestone(child, milestone);
        return { childId: child.id, photos };
      } catch (error) {
        console.error(`Error fetching photos for ${child.name}:`, error);
        return { childId: child.id, photos: [] };
      }
    })
  );

  results.forEach(({ childId, photos }) => {
    photosByChild.set(childId, photos);
  });

  return photosByChild;
}

// Get a fresh base URL for a photo (base URLs expire after ~1 hour)
export function getPhotoUrl(
  baseUrl: string,
  width: number = 800,
  height: number = 600
): string {
  return `${baseUrl}=w${width}-h${height}`;
}

// Check if we're connected to Google Photos
export function isConnectedToGooglePhotos(): boolean {
  const tokens = getStoredTokens();
  return tokens !== null;
}
