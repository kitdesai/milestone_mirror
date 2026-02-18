import { PhotoWithAge, Child, Milestone } from "@/types";
import { getMilestoneDateRange, calculateAge, calculateAgeInDays } from "./date-utils";
import { getStoredTokens, isTokenExpired } from "./storage";

const DROPBOX_API_BASE = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT_BASE = "https://content.dropboxapi.com/2";

export interface DropboxFile {
  id: string;
  name: string;
  path_lower: string;
  path_display: string;
  client_modified: string;
  server_modified: string;
  size: number;
  content_hash?: string;
  media_info?: {
    metadata: {
      dimensions?: {
        width: number;
        height: number;
      };
      time_taken?: string;
    };
  };
}

interface DropboxListFolderResponse {
  entries: DropboxFile[];
  cursor: string;
  has_more: boolean;
}

// Get current access token, refreshing if needed
async function getAccessToken(): Promise<string | null> {
  const tokens = getStoredTokens();
  if (!tokens) return null;

  if (isTokenExpired(tokens)) {
    try {
      const response = await fetch("/api/auth/dropbox/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: tokens.refresh_token }),
      });

      if (!response.ok) {
        return null;
      }

      const newTokens = await response.json();
      return newTokens.access_token;
    } catch {
      return null;
    }
  }

  return tokens.access_token;
}

// List all photos in a folder recursively
export async function listPhotos(path: string = ""): Promise<DropboxFile[]> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated with Dropbox");
  }

  const allPhotos: DropboxFile[] = [];
  const imageExtensions = [".jpg", ".jpeg", ".png", ".heic", ".webp", ".gif"];

  let hasMore = true;
  let cursor: string | null = null;

  while (hasMore) {
    const endpoint = cursor
      ? `${DROPBOX_API_BASE}/files/list_folder/continue`
      : `${DROPBOX_API_BASE}/files/list_folder`;

    const body = cursor
      ? { cursor }
      : {
          path: path || "",
          recursive: true,
          include_media_info: false, // Skip media info for faster listing
          limit: 2000,
        };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Dropbox API error: ${error}`);
    }

    const data: DropboxListFolderResponse = await response.json();

    // Filter for image files
    const photos = data.entries.filter((entry) => {
      const lowerName = entry.name.toLowerCase();
      return imageExtensions.some((ext) => lowerName.endsWith(ext));
    });

    allPhotos.push(...photos);
    hasMore = data.has_more;
    cursor = data.cursor;
  }

  return allPhotos;
}

// Parse date from filename like "2025-12-31 12.01.21.jpg" or "2025-12-31 12.01.21-1.jpg"
function parseDateFromFilename(filename: string): Date | null {
  // Match patterns like "2025-12-31 12.01.21" or "2025-12-31 12.01.21-1"
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2})\.(\d{2})\.(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return new Date(
      parseInt(year),
      parseInt(month) - 1, // months are 0-indexed
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }
  return null;
}

// Get the date a photo was taken
function getPhotoDate(file: DropboxFile): Date {
  // First, try to parse from filename (fastest, most reliable for timestamped files)
  const filenameDate = parseDateFromFilename(file.name);
  if (filenameDate) {
    return filenameDate;
  }

  // Fall back to time_taken from media_info if available
  if (file.media_info?.metadata?.time_taken) {
    return new Date(file.media_info.metadata.time_taken);
  }

  // Last resort: client_modified
  return new Date(file.client_modified);
}

// Get thumbnail URL for a photo
export async function getThumbnailUrl(path: string): Promise<string> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated with Dropbox");
  }

  const response = await fetch(`${DROPBOX_CONTENT_BASE}/files/get_thumbnail_v2`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Arg": JSON.stringify({
        resource: { ".tag": "path", path },
        format: "jpeg",
        size: "w640h480",
        mode: "fitone_bestfit",
      }),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get thumbnail");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Get full photo
export async function getPhotoUrl(path: string): Promise<string> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated with Dropbox");
  }

  const response = await fetch(`${DROPBOX_CONTENT_BASE}/files/download`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Dropbox-API-Arg": JSON.stringify({ path }),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to download photo");
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// Get temporary link for a photo (valid for 4 hours)
export async function getTemporaryLink(path: string): Promise<string> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Not authenticated with Dropbox");
  }

  const response = await fetch(`${DROPBOX_API_BASE}/files/get_temporary_link`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ path }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get temporary link: ${error}`);
  }

  const data = await response.json();
  return data.link;
}

// Cache for scanned photos
let cachedPhotos: DropboxFile[] | null = null;

// Scan and cache all photos from Dropbox
export async function scanPhotos(path: string = "", onProgress?: (count: number) => void): Promise<number> {
  console.log(`Starting scan of folder: "${path || '/'}"...`);
  cachedPhotos = await listPhotos(path);

  // Log some stats
  const withParsedDates = cachedPhotos.filter(p => parseDateFromFilename(p.name) !== null);
  console.log(`Scanned ${cachedPhotos.length} photos from Dropbox`);
  console.log(`  - ${withParsedDates.length} photos with parseable timestamps in filename`);
  console.log(`  - ${cachedPhotos.length - withParsedDates.length} photos using fallback date`);

  if (cachedPhotos.length > 0) {
    console.log(`  - Sample files:`, cachedPhotos.slice(0, 3).map(p => p.name));
  }

  return cachedPhotos.length;
}

// Get photos for a specific date range
export function getPhotosInDateRange(startDate: Date, endDate: Date): DropboxFile[] {
  if (!cachedPhotos) return [];

  return cachedPhotos.filter((photo) => {
    const photoDate = getPhotoDate(photo);
    return photoDate >= startDate && photoDate <= endDate;
  });
}

// Get comparison photos for multiple children at a milestone
export async function getComparisonPhotos(
  children: Child[],
  milestone: Milestone
): Promise<Map<string, PhotoWithAge[]>> {
  const photosByChild = new Map<string, PhotoWithAge[]>();

  if (!cachedPhotos) {
    await scanPhotos();
  }

  for (const child of children) {
    const birthDate = new Date(child.birthDate);
    const { startDate, endDate } = getMilestoneDateRange(birthDate, milestone);
    const matchingPhotos = getPhotosInDateRange(startDate, endDate);

    const photosWithAge: PhotoWithAge[] = await Promise.all(
      matchingPhotos.map(async (photo) => {
        const photoDate = getPhotoDate(photo);
        // Get temporary link for displaying
        let baseUrl: string;
        try {
          baseUrl = await getTemporaryLink(photo.path_lower);
        } catch {
          baseUrl = "";
        }

        return {
          id: photo.id,
          baseUrl,
          filename: photo.name,
          mimeType: "image/jpeg",
          mediaMetadata: {
            creationTime: photoDate.toISOString(),
            width: String(photo.media_info?.metadata?.dimensions?.width || 0),
            height: String(photo.media_info?.metadata?.dimensions?.height || 0),
          },
          childId: child.id,
          childName: child.name,
          ageAtPhoto: calculateAge(birthDate, photoDate),
          exactAgeDays: calculateAgeInDays(birthDate, photoDate),
        };
      })
    );

    // Sort by age
    photosWithAge.sort((a, b) => a.exactAgeDays - b.exactAgeDays);
    photosByChild.set(child.id, photosWithAge);
  }

  return photosByChild;
}

// Check if connected to Dropbox
export function isConnectedToDropbox(): boolean {
  const tokens = getStoredTokens();
  return tokens !== null;
}

// Get cached photo count
export function getPhotoCount(): number {
  return cachedPhotos?.length || 0;
}

// Clear cache
export function clearCache(): void {
  cachedPhotos = null;
}
