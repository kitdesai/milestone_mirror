# Milestone Mirror - Project Brief

## Project Overview
Milestone Mirror is a web application that helps parents compare photos of their children at the same ages. The app connects to Dropbox and allows users to view photos of different children side-by-side when they were the same age (e.g., both at 3 months old, both at 1 year old, etc.).

## Core Features

### 1. Child Profile Management
- Allow users to add multiple children with their names and birth dates
- Store this information persistently using localStorage
- Ability to edit and delete child profiles

### 2. Dropbox Integration
- Authenticate with Dropbox API using OAuth 2.0
- Fetch photos from a user-specified folder in Dropbox
- Parse photo dates from timestamped filenames (e.g., "2025-12-31 12.01.21.jpg")
- Fall back to file metadata dates when filename parsing isn't available
- Cache scanned photos to minimize API calls

### 3. Age Milestone Comparison
- Predefined age milestones:
  - Newborn: 0-14 days
  - 1 month old
  - 2 months old
  - 3 months old
  - 6 months old
  - 9 months old
  - 1 year old
  - 18 months old
  - 2 years old
  - 3 years old
  - 4 years old
  - 5 years old
- Allow users to select a milestone and see photos of each child at that age
- Display photos side-by-side for easy comparison

### 4. Face Detection Filtering
- Browser-based face detection using face-api.js with TinyFaceDetector model
- Toggle to show only photos containing detected faces
- Filters out landscapes, food photos, etc. to focus on photos of people
- Progress indicator during face scanning
- Results are cached for fast re-filtering

### 5. Photo Display
- Side-by-side comparison view showing photos from each child at the selected age
- Each photo labeled with the child's name and exact age when taken
- Navigation arrows to browse through multiple photos at each milestone
- Lightbox modal for viewing photos in larger format
- Photo count indicator showing current position and total (with filtered count when face filter is active)

## Technical Stack

### Frontend
- Next.js 15 with App Router
- React 19
- TypeScript
- Tailwind CSS with custom warm color palette (peach, rose, sky, cream tones)

### APIs & Libraries
- Dropbox API for photo storage and retrieval
- face-api.js for browser-based face detection
- date-fns for date manipulation

## User Flow
1. User opens the app
2. User adds their children's names and birth dates
3. User connects to Dropbox (OAuth flow)
4. User specifies which folder to scan (e.g., "/Camera Uploads")
5. App scans and caches all photos in the folder
6. User selects an age milestone (e.g., "3 months old")
7. App displays photos of each child at approximately that age
8. User can toggle "Show only photos with faces" to filter results
9. User can navigate between different milestones
10. User can view individual photos in detail via lightbox

## Design
- Warm, nostalgic color palette (peach, rose, soft blue tones)
- Clean, modern interface optimized for both desktop and mobile
- Intuitive comparison view for easy side-by-side viewing
- Responsive grid layout adapting to screen size

## Security & Privacy
- Dropbox tokens stored in localStorage (client-side only)
- Token refresh handled automatically
- Option to disconnect and clear all stored data
- Photos remain in user's Dropbox account - app only reads, never modifies

## Future Enhancement Ideas
- Custom milestone creation (not just predefined ages)
- Export comparison views as a single image or PDF
- Timeline view showing all photos chronologically
- Multiple view modes (side-by-side, grid, carousel)
- Shareable links to specific comparisons
- Support for multiple photo sources (iCloud, local files)
- Face recognition to identify specific children in photos
