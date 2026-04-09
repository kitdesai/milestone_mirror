# Milestone Mirror

## What This Is
A web app for parents to compare photos of their children at the same ages (e.g., both kids at 3 months old). Deployed at https://milestone-mirror.pages.dev

## Tech Stack
- **Frontend:** Next.js 15, React 19, TypeScript, Tailwind CSS (brand colors: coral, slate, taupe, sand, cream, blush)
- **Backend:** Cloudflare Workers (Edge runtime)
- **Database:** Cloudflare D1 (SQLite) - users, sessions, children, frames, frame_images, verification_codes, oauth_accounts
- **Storage:** Cloudflare R2 (user-uploaded images for frames)
- **Auth:** Lucia Auth with email magic codes + Sign in with Apple (via `jose` for JWT)
- **External:** Dropbox OAuth for photo access
- **Face Detection:** face-api.js (client-side)

## Key Architecture Decisions
- `wrangler.toml` must have `compatibility_date = "2025-01-01"` or later for `async_hooks` support (required by `@cloudflare/next-on-pages` getRequestContext)
- D1/R2 bindings must be at top level in wrangler.toml (not under `[env.production]`) for Pages
- Auth uses email verification codes (Resend API) + Apple OAuth (jose for JWT verification)
- Apple Sign In gracefully disabled when env vars not set (APPLE_CLIENT_ID, APPLE_TEAM_ID, APPLE_KEY_ID, APPLE_PRIVATE_KEY)
- Email codes: 6-digit, 10min expiry, rate limited to 5/email/hour

## Main Features
1. **Photo Comparison** - Dropbox integration, milestone-based photo matching, face detection filter
2. **Custom Frames** - User-created milestone collections with uploaded images
   - Mobile: carousel view with arrows
   - Desktop: side-by-side grid for comparison (full-width cards)

## Project Structure
```
src/app/api/       - API routes (auth, children, frames, images)
src/components/    - React components (FrameCard, PhotoComparison, etc.)
src/contexts/      - AuthContext for session management
src/lib/           - Utilities (auth, dropbox, r2, face-detection, email, verification-code, apple-auth)
db/schema.sql      - D1 database schema
wrangler.toml      - Cloudflare config (D1, R2 bindings)
```

## Commands
```bash
npm run dev              # Local development
npm run pages:build      # Build for Cloudflare Pages
npm run pages:deploy     # Build and deploy
npx wrangler d1 execute DB --remote --file=./db/schema.sql  # Apply schema
```

## Current State
- TypeScript has `ignoreBuildErrors: true` in next.config.ts - many `res.json()` calls need type annotations
- ESLint warnings for unused variables and missing useEffect dependencies
- Fully functional and deployed

## Database Tables
- `users` / `sessions` - Lucia auth
- `verification_codes` - Email magic code flow (6-digit codes with expiry)
- `oauth_accounts` - Apple Sign In (provider + provider_user_id → user_id)
- `children` - Child profiles with birth dates
- `frames` / `frame_images` - Custom milestone frames with R2 image references
