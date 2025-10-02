-- Add analytics and statistics tables
-- This migration adds tables for tracking usage patterns and insights

-- Create analytics_events table for tracking user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data TEXT NOT NULL DEFAULT '{}', -- JSON data
    user_id TEXT NOT NULL DEFAULT 'default',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

-- Create index for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

-- Create journal_statistics table for aggregated stats
CREATE TABLE IF NOT EXISTS journal_statistics (
    id TEXT PRIMARY KEY,
    stat_type TEXT NOT NULL,
    stat_value REAL NOT NULL,
    stat_date DATE NOT NULL,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    UNIQUE(stat_type, stat_date)
);

-- Create index for statistics
CREATE INDEX IF NOT EXISTS idx_journal_statistics_type ON journal_statistics(stat_type);
CREATE INDEX IF NOT EXISTS idx_journal_statistics_date ON journal_statistics(stat_date);

-- Create tags table for better tag management
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#3B82F6',
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
);

-- Create index for tags
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON tags(usage_count);

-- Create trigger to update tag usage count
CREATE TRIGGER IF NOT EXISTS update_tag_usage_count 
    AFTER INSERT ON journal_entries
    FOR EACH ROW
    BEGIN
        -- This would need to be implemented in application code
        -- to parse JSON tags and update usage counts
    END;

-- Create trigger to update tags updated_at
CREATE TRIGGER IF NOT EXISTS update_tags_updated_at 
    AFTER UPDATE ON tags
    FOR EACH ROW
    BEGIN
        UPDATE tags SET updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE id = NEW.id;
    END;
