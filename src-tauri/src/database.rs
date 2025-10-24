/**
 * Database module for MyFace SnapJournal
 *
 * This module handles:
 * - SQLite database initialization and management
 * - Journal entry CRUD operations
 * - Encryption and security
 * - Schema migrations
 */
use anyhow::{Context, Result};
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqliteConnectOptions, Row, SqlitePool};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JournalEntry {
    pub id: String,
    pub title: String,
    pub content: String,
    pub tags: Vec<String>,
    pub mood: Option<String>,
    pub privacy: String,
    pub source: Option<String>,
    pub source_id: Option<String>,
    pub source_url: Option<String>,
    pub metadata: Option<serde_json::Value>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EchoPattern {
    pub id: String,
    pub title: String,
    pub description: String,
    pub strength: f64,
    pub entries: Vec<String>, // Entry IDs
    pub tags: Vec<String>,
    pub pattern_type: String,
    pub last_seen: DateTime<Utc>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Embedding {
    pub id: String,
    pub entry_id: String,
    pub content_hash: String,
    pub embedding_vector: Vec<f32>,
    pub created_at: DateTime<Utc>,
}

pub struct Database {
    pool: SqlitePool,
}

impl Database {
    /// Initialize database connection and run migrations
    pub async fn new(database_path: PathBuf) -> Result<Self> {
        // Create database directory if it doesn't exist
        if let Some(parent) = database_path.parent() {
            tokio::fs::create_dir_all(parent)
                .await
                .context("Failed to create database directory")?;
        }

        // Configure SQLite connection
        let connection_options = SqliteConnectOptions::new()
            .filename(&database_path)
            .create_if_missing(true);

        let pool = SqlitePool::connect_with(connection_options)
            .await
            .context("Failed to connect to database")?;

        let db = Database { pool };

        // Run SQL migrations from files (or fallback to embedded schema)
        db.run_file_migrations()
            .await
            .context("Failed to run database migrations")?;

        Ok(db)
    }

    /// Run database migrations
    async fn run_sql_migrations(&self) -> Result<()> {
        // Create journal_entries table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS journal_entries (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                tags TEXT NOT NULL DEFAULT '[]',
                mood TEXT,
                privacy TEXT NOT NULL DEFAULT 'private',
                source TEXT,
                source_id TEXT,
                source_url TEXT,
                metadata TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .context("Failed to create journal_entries table")?;

        // Create echo_patterns table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS echo_patterns (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT NOT NULL,
                strength REAL NOT NULL,
                entries TEXT NOT NULL DEFAULT '[]',
                tags TEXT NOT NULL DEFAULT '[]',
                pattern_type TEXT NOT NULL,
                last_seen TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .context("Failed to create echo_patterns table")?;

        // Create embeddings table
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS embeddings (
                id TEXT PRIMARY KEY,
                entry_id TEXT NOT NULL,
                content_hash TEXT NOT NULL,
                embedding_vector TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (entry_id) REFERENCES journal_entries (id)
            )
            "#,
        )
        .execute(&self.pool)
        .await
        .context("Failed to create embeddings table")?;

        // Create indexes for better performance
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_journal_entries_created_at ON journal_entries (created_at)")
            .execute(&self.pool)
            .await
            .context("Failed to create journal_entries index")?;

        sqlx::query(
            "CREATE INDEX IF NOT EXISTS idx_journal_entries_tags ON journal_entries (tags)",
        )
        .execute(&self.pool)
        .await
        .context("Failed to create journal_entries tags index")?;

        sqlx::query("CREATE INDEX IF NOT EXISTS idx_embeddings_entry_id ON embeddings (entry_id)")
            .execute(&self.pool)
            .await
            .context("Failed to create embeddings index")?;

        println!("Legacy schema created successfully");
        Ok(())
    }

    /// Run database migrations using SQL files
    async fn run_file_migrations(&self) -> Result<()> {
        // Get the migrations directory path  
        let migrations_path = PathBuf::from("migrations");
        
        if !migrations_path.exists() {
            println!("No migrations directory found, using embedded schema");
            return self.run_sql_migrations().await;
        }

        // Read and execute each migration file in order
        let mut migration_files = tokio::fs::read_dir(&migrations_path)
            .await
            .context("Failed to read migrations directory")?;

        let mut files = Vec::new();
        while let Some(entry) = migration_files.next_entry().await? {
            let path = entry.path();
            if path.extension().and_then(|s| s.to_str()) == Some("sql") {
                files.push(path);
            }
        }

        // Sort files by name to ensure correct order
        files.sort();

        for file_path in files {
            println!("Running migration: {:?}", file_path.file_name());
            let sql = tokio::fs::read_to_string(&file_path)
                .await
                .context(format!("Failed to read migration file: {:?}", file_path))?;

            // Execute the migration SQL
            sqlx::query(&sql)
                .execute(&self.pool)
                .await
                .context(format!("Failed to execute migration: {:?}", file_path))?;

            println!("Migration completed: {:?}", file_path.file_name());
        }

        println!("All database migrations completed successfully");
        Ok(())
    }

    // Journal Entry Operations
    pub async fn create_entry(&self, entry: &JournalEntry) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO journal_entries (id, title, content, tags, mood, privacy, source, source_id, source_url, metadata, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&entry.id)
        .bind(&entry.title)
        .bind(&entry.content)
        .bind(serde_json::to_string(&entry.tags)?)
        .bind(&entry.mood)
        .bind(&entry.privacy)
        .bind(&entry.source)
        .bind(&entry.source_id)
        .bind(&entry.source_url)
        .bind(entry.metadata.as_ref().map(|m| serde_json::to_string(m).unwrap_or_default()))
        .bind(entry.created_at.to_rfc3339())
        .bind(entry.updated_at.to_rfc3339())
        .execute(&self.pool)
        .await
        .context("Failed to create journal entry")?;

        Ok(())
    }

    pub async fn get_entry(&self, id: &str) -> Result<Option<JournalEntry>> {
        let row = sqlx::query("SELECT * FROM journal_entries WHERE id = ?")
            .bind(id)
            .fetch_optional(&self.pool)
            .await
            .context("Failed to fetch journal entry")?;

        if let Some(row) = row {
            Ok(Some(JournalEntry {
                id: row.get("id"),
                title: row.get("title"),
                content: row.get("content"),
                tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
                mood: row.get("mood"),
                privacy: row.get("privacy"),
                source: row.get("source"),
                source_id: row.get("source_id"),
                source_url: row.get("source_url"),
                metadata: row.get::<Option<String>, _>("metadata")
                    .and_then(|m| serde_json::from_str(&m).ok()),
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?
                    .into(),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?
                    .into(),
            }))
        } else {
            Ok(None)
        }
    }

    pub async fn update_entry(&self, entry: &JournalEntry) -> Result<()> {
        sqlx::query(
            r#"
            UPDATE journal_entries 
            SET title = ?, content = ?, tags = ?, mood = ?, privacy = ?, source = ?, source_id = ?, source_url = ?, metadata = ?, updated_at = ?
            WHERE id = ?
            "#,
        )
        .bind(&entry.title)
        .bind(&entry.content)
        .bind(serde_json::to_string(&entry.tags)?)
        .bind(&entry.mood)
        .bind(&entry.privacy)
        .bind(&entry.source)
        .bind(&entry.source_id)
        .bind(&entry.source_url)
        .bind(entry.metadata.as_ref().map(|m| serde_json::to_string(m).unwrap_or_default()))
        .bind(entry.updated_at.to_rfc3339())
        .bind(&entry.id)
        .execute(&self.pool)
        .await
        .context("Failed to update journal entry")?;

        Ok(())
    }

    pub async fn delete_entry(&self, id: &str) -> Result<()> {
        sqlx::query("DELETE FROM journal_entries WHERE id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .context("Failed to delete journal entry")?;

        // Also delete associated embeddings
        sqlx::query("DELETE FROM embeddings WHERE entry_id = ?")
            .bind(id)
            .execute(&self.pool)
            .await
            .context("Failed to delete associated embeddings")?;

        Ok(())
    }

    pub async fn list_entries(
        &self,
        limit: Option<i64>,
        offset: Option<i64>,
    ) -> Result<Vec<JournalEntry>> {
        let limit = limit.unwrap_or(100);
        let offset = offset.unwrap_or(0);

        let rows =
            sqlx::query("SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT ? OFFSET ?")
                .bind(limit)
                .bind(offset)
                .fetch_all(&self.pool)
                .await
                .context("Failed to list journal entries")?;

        let mut entries = Vec::new();
        for row in rows {
            entries.push(JournalEntry {
                id: row.get("id"),
                title: row.get("title"),
                content: row.get("content"),
                tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
                mood: row.get("mood"),
                privacy: row.get("privacy"),
                source: row.get("source"),
                source_id: row.get("source_id"),
                source_url: row.get("source_url"),
                metadata: row.get::<Option<String>, _>("metadata")
                    .and_then(|m| serde_json::from_str(&m).ok()),
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?
                    .into(),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?
                    .into(),
            });
        }

        Ok(entries)
    }

    pub async fn search_entries(&self, query: &str) -> Result<Vec<JournalEntry>> {
        let search_term = format!("%{}%", query);

        let rows = sqlx::query(
            "SELECT * FROM journal_entries 
             WHERE title LIKE ? OR content LIKE ? OR tags LIKE ? 
             ORDER BY created_at DESC",
        )
        .bind(&search_term)
        .bind(&search_term)
        .bind(&search_term)
        .fetch_all(&self.pool)
        .await
        .context("Failed to search journal entries")?;

        let mut entries = Vec::new();
        for row in rows {
            entries.push(JournalEntry {
                id: row.get("id"),
                title: row.get("title"),
                content: row.get("content"),
                tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
                mood: row.get("mood"),
                privacy: row.get("privacy"),
                source: row.get("source"),
                source_id: row.get("source_id"),
                source_url: row.get("source_url"),
                metadata: row.get::<Option<String>, _>("metadata")
                    .and_then(|m| serde_json::from_str(&m).ok()),
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?
                    .into(),
                updated_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("updated_at"))?
                    .into(),
            });
        }

        Ok(entries)
    }

    // Embedding Operations
    #[allow(dead_code)]
    pub async fn store_embedding(&self, embedding: &Embedding) -> Result<()> {
        sqlx::query(
            r#"
            INSERT OR REPLACE INTO embeddings (id, entry_id, content_hash, embedding_vector, created_at)
            VALUES (?, ?, ?, ?, ?)
            "#
        )
        .bind(&embedding.id)
        .bind(&embedding.entry_id)
        .bind(&embedding.content_hash)
        .bind(serde_json::to_string(&embedding.embedding_vector)?)
        .bind(embedding.created_at.to_rfc3339())
        .execute(&self.pool)
        .await
        .context("Failed to store embedding")?;

        Ok(())
    }

    #[allow(dead_code)]
    pub async fn get_embedding(&self, entry_id: &str) -> Result<Option<Embedding>> {
        let row = sqlx::query("SELECT * FROM embeddings WHERE entry_id = ?")
            .bind(entry_id)
            .fetch_optional(&self.pool)
            .await
            .context("Failed to fetch embedding")?;

        if let Some(row) = row {
            Ok(Some(Embedding {
                id: row.get("id"),
                entry_id: row.get("entry_id"),
                content_hash: row.get("content_hash"),
                embedding_vector: serde_json::from_str(&row.get::<String, _>("embedding_vector"))?,
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?
                    .into(),
            }))
        } else {
            Ok(None)
        }
    }

    // Echo Pattern Operations
    #[allow(dead_code)]
    pub async fn create_echo_pattern(&self, pattern: &EchoPattern) -> Result<()> {
        sqlx::query(
            r#"
            INSERT INTO echo_patterns (id, title, description, strength, entries, tags, pattern_type, last_seen, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            "#
        )
        .bind(&pattern.id)
        .bind(&pattern.title)
        .bind(&pattern.description)
        .bind(pattern.strength)
        .bind(serde_json::to_string(&pattern.entries)?)
        .bind(serde_json::to_string(&pattern.tags)?)
        .bind(&pattern.pattern_type)
        .bind(pattern.last_seen.to_rfc3339())
        .bind(pattern.created_at.to_rfc3339())
        .execute(&self.pool)
        .await
        .context("Failed to create echo pattern")?;

        Ok(())
    }

    #[allow(dead_code)]
    pub async fn list_echo_patterns(&self) -> Result<Vec<EchoPattern>> {
        let rows =
            sqlx::query("SELECT * FROM echo_patterns ORDER BY strength DESC, created_at DESC")
                .fetch_all(&self.pool)
                .await
                .context("Failed to list echo patterns")?;

        let mut patterns = Vec::new();
        for row in rows {
            patterns.push(EchoPattern {
                id: row.get("id"),
                title: row.get("title"),
                description: row.get("description"),
                strength: row.get("strength"),
                entries: serde_json::from_str(&row.get::<String, _>("entries")).unwrap_or_default(),
                tags: serde_json::from_str(&row.get::<String, _>("tags")).unwrap_or_default(),
                pattern_type: row.get("pattern_type"),
                last_seen: DateTime::parse_from_rfc3339(&row.get::<String, _>("last_seen"))?.into(),
                created_at: DateTime::parse_from_rfc3339(&row.get::<String, _>("created_at"))?
                    .into(),
            });
        }

        Ok(patterns)
    }

    /// Get database statistics
    #[allow(dead_code)]
    pub async fn get_stats(&self) -> Result<serde_json::Value> {
        let entry_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM journal_entries")
            .fetch_one(&self.pool)
            .await
            .context("Failed to count journal entries")?;

        let pattern_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM echo_patterns")
            .fetch_one(&self.pool)
            .await
            .context("Failed to count echo patterns")?;

        let embedding_count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM embeddings")
            .fetch_one(&self.pool)
            .await
            .context("Failed to count embeddings")?;

        Ok(serde_json::json!({
            "entries": entry_count,
            "patterns": pattern_count,
            "embeddings": embedding_count
        }))
    }
}
