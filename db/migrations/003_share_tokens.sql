-- Add share token to frames for public sharing
ALTER TABLE frames ADD COLUMN share_token TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_frames_share_token ON frames(share_token);
