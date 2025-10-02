-- Initial schema for MyFace SnapJournal
-- This migration creates the core tables for the journal application

-- Create journal_entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags TEXT NOT NULL DEFAULT '[]', -- JSON array of strings
    mood TEXT, -- Optional mood value
    privacy TEXT NOT NULL DEFAULT 'private' CHECK (privacy IN ('private', 'public', 'friends')),
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_updated_at ON journal_entries(updated_at);
CREATE INDEX IF NOT EXISTS idx_journal_entries_privacy ON journal_entries(privacy);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);

-- Create embeddings table for AI features (future use)
CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    entry_id TEXT NOT NULL,
    model_name TEXT NOT NULL,
    embedding_data BLOB NOT NULL, -- Vector embedding data
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
);

-- Create index for embeddings
CREATE INDEX IF NOT EXISTS idx_embeddings_entry_id ON embeddings(entry_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_model_name ON embeddings(model_name);

-- Create echo_patterns table for pattern analysis (future use)
CREATE TABLE IF NOT EXISTS echo_patterns (
    id TEXT PRIMARY KEY,
    pattern_type TEXT NOT NULL,
    pattern_data TEXT NOT NULL, -- JSON data
    confidence REAL NOT NULL DEFAULT 0.0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

-- Create index for echo patterns
CREATE INDEX IF NOT EXISTS idx_echo_patterns_type ON echo_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_echo_patterns_confidence ON echo_patterns(confidence);

-- Create app_settings table for application configuration
CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO app_settings (key, value) VALUES 
    ('database_version', '1'),
    ('app_version', '0.1.0'),
    ('last_backup', ''),
    ('theme', 'light'),
    ('auto_save', 'true'),
    ('privacy_mode', 'private');

-- Create triggers to automatically update updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_journal_entries_updated_at 
    AFTER UPDATE ON journal_entries
    FOR EACH ROW
    BEGIN
        UPDATE journal_entries SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_echo_patterns_updated_at 
    AFTER UPDATE ON echo_patterns
    FOR EACH ROW
    BEGIN
        UPDATE echo_patterns SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_app_settings_updated_at 
    AFTER UPDATE ON app_settings
    FOR EACH ROW
    BEGIN
        UPDATE app_settings SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE key = NEW.key;
    END;
