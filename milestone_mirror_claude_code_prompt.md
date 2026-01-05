# Milestone Mirror - Project Brief for Claude Code

## Project Overview
I want to build a web application called "Milestone Mirror" that helps parents compare photos of their children at the same ages. The app should connect to the Google Photos API and allow users to view photos of different children side-by-side when they were the same age (e.g., both at 3 months old, both at 1 year old, etc.).

## Core Features

### 1. Child Profile Management
- Allow users to add multiple children with their names and birth dates
- Store this information persistently (consider using localStorage or a simple database)
- Ability to edit and delete child profiles

### 2. Google Photos Integration
- Authenticate with Google Photos API using OAuth 2.0
- Fetch photos from the user's Google Photos library
- Filter photos by date ranges based on each child's age milestones
- Use "babies" and/or solo filter to make sure we're seeing only pictures of children

### 3. Age Milestone Comparison
- Define common age milestones (examples):
  - Newborn: 0-7 days
  - 1 month old
  - 3 months old
  - 6 months old
  - 9 months old
  - 1 year old
  - 18 months old
  - 2 years old
  - And so on...
- Allow users to select a milestone and see photos of each child at that age
- Display photos side-by-side for easy comparison

### 4. Photo Display
- Grid or carousel view showing photos from each child at the selected age
- Each photo should be labeled with the child's name and exact age when the photo was taken
- Option to view photos in a larger format

## Technical Requirements

### Frontend
- Use React (or Next.js) for the UI
- Responsive design that works on desktop and mobile
- Clean, modern interface with a warm, nostalgic aesthetic
- Consider using Tailwind CSS for styling

### Backend/API
- Google Photos API integration
  - OAuth 2.0 authentication flow
  - Photo search and retrieval by date
  - Handle API rate limits and errors gracefully
- Consider whether you need a backend server or can do everything client-side (I don't believe we'll need a backend server, but you can let me know)

### Data Storage
- Store child profiles (name, birth date)
- Store Google Photos API tokens securely
- Cache photo data to minimize API calls

### Date Calculations
- Calculate date ranges for each milestone based on birth dates
- Account for timezone differences
- Handle edge cases (premature births, etc.)

## User Flow
1. User opens the app
2. User adds their children's names and birth dates
3. User connects to Google Photos (OAuth flow)
4. User selects an age milestone (e.g., "3 months old")
5. App displays photos of each child at approximately that age
6. User can navigate between different milestones
7. User can view individual photos in detail

## Design Considerations
- Use the "Milestone Mirror" branding with warm, nostalgic colors (peach, rose, soft blue tones)
- Logo concepts are available (I have several designs focusing on mirrored frames and timelines)
- Prioritize ease of use - parents often use apps while managing kids
- Make the comparison view intuitive and visually appealing

## Nice-to-Have Features (Future Enhancements)
- Custom milestone creation (not just predefined ages)
- Photo filtering by detected faces (if child is in the photo)
- Export comparison views as a single image or PDF
- Timeline view showing all photos chronologically
- Multiple view modes (side-by-side, grid, carousel)
- Shareable links to specific comparisons

## Security & Privacy
- Ensure Google Photos tokens are stored securely
- Only request necessary permissions from Google Photos
- Make it clear to users that photos stay in their Google account
- Consider adding option to disconnect/revoke access

## Questions to Consider
1. Should this be a purely client-side app or do we need a backend?
2. What's the best way to handle Google Photos API authentication?
3. How should we handle photos that span multiple children (family photos)?
4. Should we allow manual photo selection or rely purely on date-based filtering?

## Getting Started
Please help me:
1. Set up the project structure
2. Implement Google Photos API integration
3. Build the child profile management system
4. Create the milestone comparison interface
5. Style the application with a clean, modern design

Let me know if you need any clarification on the requirements or have suggestions for improving the architecture! Please ask clarifying questions along the way.
