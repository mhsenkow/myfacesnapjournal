mod ai_service;
/**
 * MyFace SnapJournal - Tauri Backend
 *
 * This is the main Rust entry point for the desktop application backend.
 * It handles database operations, AI integration, and provides Tauri commands.
 */

#[cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]
mod database;

use ai_service::{AIService, ChatRequest, EmbeddingRequest};
use anyhow::Result;
use chrono::Utc;
use database::{Database, JournalEntry};
use serde_json::Value;
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{Manager, State, WebviewWindowBuilder, WebviewUrl};
use tokio::sync::Mutex;
use uuid::Uuid;

// App state
struct AppState {
    database: Arc<Mutex<Option<Database>>>,
    ai_service: Arc<Mutex<Option<AIService>>>,
    database_path: Arc<Mutex<Option<PathBuf>>>,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .manage(AppState {
            database: Arc::new(Mutex::new(None)),
            ai_service: Arc::new(Mutex::new(None)),
            database_path: Arc::new(Mutex::new(None)),
        })
        .setup(|app| {
            // Set window title
            let window = app.get_webview_window("main").unwrap();
            window.set_title("MyFace SnapJournal").unwrap();

            // Initialize database and AI service
            let app_handle = app.app_handle().clone();
            tauri::async_runtime::spawn(async move {
                if let Err(e) = initialize_services(app_handle).await {
                    eprintln!("Failed to initialize services: {}", e);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_app_info,
            get_system_info,
            init_database,
            get_database_path,
            set_database_path,
            create_journal_entry,
            get_journal_entry,
            update_journal_entry,
            delete_journal_entry,
            delete_journal_entries,
            list_journal_entries,
            search_journal_entries,
            generate_embedding,
            generate_chat_response,
            analyze_echo_patterns,
            get_ai_models,
            check_ai_availability,
            open_oauth_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

async fn initialize_services(app_handle: tauri::AppHandle) -> Result<()> {
    // Initialize database
    let data_dir = app_handle.path().app_data_dir()?;
    let db_path = data_dir.join("journal.db");

    let database = Database::new(db_path.clone()).await?;

    // Initialize AI service (default to Ollama)
    let ai_service = AIService::new("ollama", "")?;

    // Store in app state
    let state = app_handle.state::<AppState>();
    *state.database.lock().await = Some(database);
    *state.ai_service.lock().await = Some(ai_service);
    *state.database_path.lock().await = Some(db_path);

    Ok(())
}

// Utility commands
#[tauri::command]
async fn get_app_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "name": "MyFace SnapJournal",
        "version": env!("CARGO_PKG_VERSION"),
        "description": "Local-first AI journaling app",
        "author": "MyFace Team"
    }))
}

#[tauri::command]
async fn get_system_info() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "rust_version": "unknown"
    }))
}

// Database commands
#[tauri::command]
async fn init_database(state: State<'_, AppState>, db_path: String) -> Result<(), String> {
    let path = PathBuf::from(db_path);
    let database = Database::new(path.clone())
        .await
        .map_err(|e| e.to_string())?;

    *state.database.lock().await = Some(database);
    *state.database_path.lock().await = Some(path);
    Ok(())
}

#[tauri::command]
async fn get_database_path(state: State<'_, AppState>) -> Result<Option<String>, String> {
    let path_guard = state.database_path.lock().await;
    Ok(path_guard.as_ref().map(|p| p.to_string_lossy().to_string()))
}

#[tauri::command]
async fn set_database_path(state: State<'_, AppState>, db_path: String) -> Result<(), String> {
    let path = PathBuf::from(db_path);
    let database = Database::new(path.clone())
        .await
        .map_err(|e| e.to_string())?;

    *state.database.lock().await = Some(database);
    *state.database_path.lock().await = Some(path);
    Ok(())
}


#[tauri::command]
async fn create_journal_entry(
    state: State<'_, AppState>,
    title: String,
    content: String,
    tags: Vec<String>,
    mood: Option<String>,
    privacy: String,
) -> Result<JournalEntry, String> {
    let db_guard = state.database.lock().await;
    let database = db_guard.as_ref().ok_or("Database not initialized")?;

    let entry = JournalEntry {
        id: Uuid::new_v4().to_string(),
        title,
        content,
        tags,
        mood,
        privacy,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    database
        .create_entry(&entry)
        .await
        .map_err(|e| e.to_string())?;

    Ok(entry)
}

#[tauri::command]
async fn get_journal_entry(
    state: State<'_, AppState>,
    id: String,
) -> Result<Option<JournalEntry>, String> {
    let db_guard = state.database.lock().await;
    let database = db_guard.as_ref().ok_or("Database not initialized")?;

    database.get_entry(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_journal_entry(
    state: State<'_, AppState>,
    id: String,
    title: String,
    content: String,
    tags: Vec<String>,
    mood: Option<String>,
    privacy: String,
) -> Result<(), String> {
    let db_guard = state.database.lock().await;
    let database = db_guard.as_ref().ok_or("Database not initialized")?;

    let mut entry = database
        .get_entry(&id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Entry not found")?;

    entry.title = title;
    entry.content = content;
    entry.tags = tags;
    entry.mood = mood;
    entry.privacy = privacy;
    entry.updated_at = Utc::now();

    database
        .update_entry(&entry)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_journal_entry(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let db_guard = state.database.lock().await;
    let database = db_guard.as_ref().ok_or("Database not initialized")?;

    database.delete_entry(&id).await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn delete_journal_entries(
    state: State<'_, AppState>,
    ids: Vec<String>,
) -> Result<(), String> {
    let db_guard = state.database.lock().await;
    let database = db_guard.as_ref().ok_or("Database not initialized")?;

    for id in ids {
        database
            .delete_entry(&id)
            .await
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
async fn list_journal_entries(
    state: State<'_, AppState>,
    limit: Option<i64>,
    offset: Option<i64>,
) -> Result<Vec<JournalEntry>, String> {
    let db_guard = state.database.lock().await;
    let database = db_guard.as_ref().ok_or("Database not initialized")?;

    database
        .list_entries(limit, offset)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn search_journal_entries(
    state: State<'_, AppState>,
    query: String,
) -> Result<Vec<JournalEntry>, String> {
    let db_guard = state.database.lock().await;
    let database = db_guard.as_ref().ok_or("Database not initialized")?;

    database
        .search_entries(&query)
        .await
        .map_err(|e| e.to_string())
}

// AI commands
#[tauri::command]
async fn generate_embedding(
    state: State<'_, AppState>,
    text: String,
    model: Option<String>,
) -> Result<Vec<f32>, String> {
    let ai_guard = state.ai_service.lock().await;
    let ai_service = ai_guard.as_ref().ok_or("AI service not initialized")?;

    let request = EmbeddingRequest { text, model };
    let response = ai_service
        .generate_embedding(request)
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.embedding)
}

#[tauri::command]
async fn generate_chat_response(
    state: State<'_, AppState>,
    message: String,
    context: Option<String>,
    model: Option<String>,
) -> Result<String, String> {
    let ai_guard = state.ai_service.lock().await;
    let ai_service = ai_guard.as_ref().ok_or("AI service not initialized")?;

    let request = ChatRequest {
        message,
        context,
        model,
    };
    let response = ai_service
        .generate_chat(request)
        .await
        .map_err(|e| e.to_string())?;

    Ok(response.response)
}

#[tauri::command]
async fn analyze_echo_patterns(
    state: State<'_, AppState>,
    entries: Vec<String>,
) -> Result<Value, String> {
    let ai_guard = state.ai_service.lock().await;
    let ai_service = ai_guard.as_ref().ok_or("AI service not initialized")?;

    let analysis = ai_service
        .analyze_echo_patterns(entries)
        .await
        .map_err(|e| e.to_string())?;

    Ok(serde_json::to_value(analysis).map_err(|e| e.to_string())?)
}

#[tauri::command]
async fn get_ai_models(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let ai_guard = state.ai_service.lock().await;
    let ai_service = ai_guard.as_ref().ok_or("AI service not initialized")?;

    ai_service.list_models().await.map_err(|e| e.to_string())
}

#[tauri::command]
async fn check_ai_availability(state: State<'_, AppState>) -> Result<bool, String> {
    let ai_guard = state.ai_service.lock().await;
    let ai_service = ai_guard.as_ref().ok_or("AI service not initialized")?;

    ai_service
        .check_availability()
        .await
        .map_err(|e| e.to_string())
}

// OAuth commands
#[tauri::command]
async fn open_oauth_window(app_handle: tauri::AppHandle, url: String) -> Result<String, String> {
    let webview = WebviewWindowBuilder::new(
        &app_handle,
        "oauth",
        WebviewUrl::External(url.parse().map_err(|e| e.to_string())?),
    )
    .title("Mastodon Authentication")
    .inner_size(600.0, 700.0)
    .center()
    .resizable(false)
    .build()
    .map_err(|e| e.to_string())?;

    Ok("OAuth window opened".to_string())
}
