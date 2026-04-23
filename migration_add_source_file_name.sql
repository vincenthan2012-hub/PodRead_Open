-- Migration: Add source_file_name column to chapters table
-- Run this in your Supabase SQL Editor

ALTER TABLE chapters
ADD COLUMN IF NOT EXISTS source_file_name TEXT;

-- For existing records, set source_file_name to title as a fallback
UPDATE chapters
SET source_file_name = title
WHERE source_file_name IS NULL;
