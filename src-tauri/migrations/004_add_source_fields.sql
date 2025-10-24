-- Migration 004: Add source fields to journal_entries table
-- This migration adds support for tracking the source of journal entries

-- Add new columns to journal_entries table
ALTER TABLE journal_entries ADD COLUMN source TEXT;
ALTER TABLE journal_entries ADD COLUMN source_id TEXT;
ALTER TABLE journal_entries ADD COLUMN source_url TEXT;
ALTER TABLE journal_entries ADD COLUMN metadata TEXT;

-- Create indexes for the new fields
CREATE INDEX IF NOT EXISTS idx_journal_entries_source ON journal_entries (source);
CREATE INDEX IF NOT EXISTS idx_journal_entries_source_id ON journal_entries (source_id);
