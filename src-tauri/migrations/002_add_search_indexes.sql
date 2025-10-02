-- Add search indexes for better performance
-- This migration adds full-text search capabilities

-- Create FTS5 virtual table for full-text search
CREATE VIRTUAL TABLE IF NOT EXISTS journal_entries_fts USING fts5(
    title,
    content,
    tags,
    content='journal_entries',
    content_rowid='rowid'
);

-- Create triggers to keep FTS table in sync
CREATE TRIGGER IF NOT EXISTS journal_entries_fts_insert 
    AFTER INSERT ON journal_entries
    BEGIN
        INSERT INTO journal_entries_fts(rowid, title, content, tags) 
        VALUES (NEW.rowid, NEW.title, NEW.content, NEW.tags);
    END;

CREATE TRIGGER IF NOT EXISTS journal_entries_fts_delete 
    AFTER DELETE ON journal_entries
    BEGIN
        DELETE FROM journal_entries_fts WHERE rowid = OLD.rowid;
    END;

CREATE TRIGGER IF NOT EXISTS journal_entries_fts_update 
    AFTER UPDATE ON journal_entries
    BEGIN
        DELETE FROM journal_entries_fts WHERE rowid = OLD.rowid;
        INSERT INTO journal_entries_fts(rowid, title, content, tags) 
        VALUES (NEW.rowid, NEW.title, NEW.content, NEW.tags);
    END;

-- Populate FTS table with existing data
INSERT INTO journal_entries_fts(rowid, title, content, tags)
SELECT rowid, title, content, tags FROM journal_entries;
