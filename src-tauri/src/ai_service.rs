/**
 * AI Service module for MyFace SnapJournal
 *
 * This module handles:
 * - Local AI model integration (Ollama, llama.cpp)
 * - Text embeddings generation
 * - Echo pattern detection
 * - Companion AI responses
 */
use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tokio::process::Command;
use reqwest;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingRequest {
    pub text: String,
    pub model: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EmbeddingResponse {
    pub embedding: Vec<f32>,
    pub model: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatRequest {
    pub message: String,
    pub context: Option<String>,
    pub model: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatResponse {
    pub response: String,
    pub model: String,
    pub tokens_used: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EchoAnalysis {
    pub patterns: Vec<EchoPattern>,
    pub insights: Vec<String>,
    pub mood_trends: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EchoPattern {
    pub id: String,
    pub title: String,
    pub description: String,
    pub strength: f64,
    pub entry_ids: Vec<String>,
    pub tags: Vec<String>,
    pub pattern_type: String,
}

pub enum AIModel {
    Ollama(()),
    LlamaCpp(String),
}

pub struct AIService {
    model: AIModel,
    embedding_model: String,
    chat_model: String,
    ollama_url: String,
}

impl AIService {
    pub fn new(model_type: &str, model_path: &str) -> Result<Self> {
        let model = match model_type {
            "ollama" => AIModel::Ollama(()),
            "llama.cpp" => AIModel::LlamaCpp(model_path.to_string()),
            _ => return Err(anyhow::anyhow!("Unsupported AI model type: {}", model_type)),
        };

        Ok(AIService {
            model,
            embedding_model: "nomic-embed-text".to_string(), // Default embedding model
            chat_model: "llama3.2".to_string(),              // Default chat model
            ollama_url: std::env::var("OLLAMA_URL").unwrap_or_else(|_| "http://localhost:11434".to_string()),
        })
    }

    /// Check if the AI service is available
    pub async fn check_availability(&self) -> Result<bool> {
        match &self.model {
            AIModel::Ollama(_) => {
                let output = Command::new("ollama").arg("list").output().await;

                Ok(output.is_ok())
            }
            AIModel::LlamaCpp(path) => {
                let output = Command::new(path).arg("--help").output().await;

                Ok(output.is_ok())
            }
        }
    }

    /// Generate embeddings for text
    pub async fn generate_embedding(&self, request: EmbeddingRequest) -> Result<EmbeddingResponse> {
        match &self.model {
            AIModel::Ollama(_) => self.generate_ollama_embedding(request).await,
            AIModel::LlamaCpp(_) => {
                // For now, return a mock embedding since llama.cpp doesn't have direct embedding support
                // In a real implementation, you'd use a separate embedding model
                Ok(EmbeddingResponse {
                    embedding: self.mock_embedding(&request.text),
                    model: "mock-embedding".to_string(),
                })
            }
        }
    }

    /// Generate embedding using Ollama
    async fn generate_ollama_embedding(
        &self,
        request: EmbeddingRequest,
    ) -> Result<EmbeddingResponse> {
        let model = request
            .model
            .unwrap_or_else(|| self.embedding_model.clone());

        let output = Command::new("ollama")
            .arg("run")
            .arg(&model)
            .arg(&format!("Generate embedding for: {}", request.text))
            .output()
            .await
            .context("Failed to run Ollama embedding command")?;

        if !output.status.success() {
            return Err(anyhow::anyhow!(
                "Ollama embedding failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        // Parse the output (this is a simplified version)
        // In a real implementation, you'd parse the actual embedding vector
        let _response = String::from_utf8_lossy(&output.stdout);
        let embedding = self.mock_embedding(&request.text);

        Ok(EmbeddingResponse { embedding, model })
    }

    /// Generate a chat response
    pub async fn generate_chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        match &self.model {
            AIModel::Ollama(_) => self.generate_ollama_chat(request).await,
            AIModel::LlamaCpp(path) => self.generate_llamacpp_chat(request, path).await,
        }
    }

    /// Generate chat response using Ollama HTTP API
    async fn generate_ollama_chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let model_name = request.model.unwrap_or_else(|| self.chat_model.clone());
        let model = model_name.clone();

        // Build system prompt with context
        let system_prompt = if let Some(context) = request.context {
            format!(
                "You are a helpful AI introspection companion for MyFace SnapJournal. \
                You help users reflect on their journal entries and social media posts. \
                Use the following context about the user's entries:\n\n{}\n\n \
                Be empathetic, insightful, and encouraging. Help them discover patterns and insights in their writing.",
                context
            )
        } else {
            "You are a helpful AI introspection companion for MyFace SnapJournal. \
            You help users reflect on their journal entries and social media posts. \
            Be empathetic, insightful, and encouraging.".to_string()
        };

        #[derive(Serialize, Deserialize)]
        struct ChatRequestBody {
            model: String,
            messages: Vec<Message>,
            stream: bool,
        }

        #[derive(Serialize, Deserialize)]
        struct Message {
            role: String,
            content: String,
        }

        let messages = vec![
            Message {
                role: "system".to_string(),
                content: system_prompt,
            },
            Message {
                role: "user".to_string(),
                content: request.message,
            },
        ];

        let body = ChatRequestBody {
            model: model_name,
            messages,
            stream: false,
        };

        let client = reqwest::Client::new();
        let url = format!("{}/api/chat", self.ollama_url);
        
        let response = client
            .post(&url)
            .json(&body)
            .send()
            .await
            .context("Failed to send request to Ollama")?;

        #[derive(Deserialize)]
        struct ChatResponseBody {
            message: Message,
            #[serde(default)]
            done: bool,
        }

        let chat_response: ChatResponseBody = response
            .json()
            .await
            .context("Failed to parse Ollama response")?;

        Ok(ChatResponse {
            response: chat_response.message.content,
            model,
            tokens_used: None,
        })
    }

    /// Generate chat response using llama.cpp
    async fn generate_llamacpp_chat(
        &self,
        request: ChatRequest,
        path: &str,
    ) -> Result<ChatResponse> {
        let prompt = if let Some(context) = request.context {
            format!(
                "Context: {}\n\nUser: {}\n\nAssistant:",
                context, request.message
            )
        } else {
            format!("User: {}\n\nAssistant:", request.message)
        };

        let output = Command::new(path)
            .arg("-p")
            .arg(&prompt)
            .arg("-n")
            .arg("256") // Number of tokens to generate
            .output()
            .await
            .context("Failed to run llama.cpp chat command")?;

        if !output.status.success() {
            return Err(anyhow::anyhow!(
                "llama.cpp chat failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        let response = String::from_utf8_lossy(&output.stdout);

        Ok(ChatResponse {
            response: response.trim().to_string(),
            model: "llama.cpp".to_string(),
            tokens_used: None,
        })
    }

    /// Analyze journal entries for echo patterns using AI
    pub async fn analyze_echo_patterns(&self, entry_contents: Vec<String>) -> Result<EchoAnalysis> {
        let mut patterns = Vec::new();
        let mut insights = Vec::new();
        let mut mood_trends = HashMap::new();

        if entry_contents.is_empty() {
            return Ok(EchoAnalysis {
                patterns,
                insights,
                mood_trends,
            });
        }

        // Combine all entries into context for analysis
        let combined_entries = entry_contents.join("\n\n---\n\n");
        
        // Use AI to analyze patterns
        let analysis_prompt = format!(
            "Analyze the following journal entries and identify patterns, themes, and insights. \
            Look for recurring topics, emotions, daily rhythms, and personal growth patterns.\n\n\
            Journal Entries:\n{}\n\n\
            Provide your analysis in this format:\n\
            PATTERNS:\n- [pattern name]: [description]\n\
            INSIGHTS:\n- [insight]\n\
            MOODS:\n- [mood]: [percentage]",
            combined_entries
        );

        let analysis_request = ChatRequest {
            message: analysis_prompt,
            context: None,
            model: Some(self.chat_model.clone()),
        };

        match self.generate_chat(analysis_request).await {
            Ok(response) => {
                // Parse the AI response to extract patterns
                let analysis_text = response.response;
                
                // Extract patterns section
                if let Some(patterns_section) = analysis_text.split("PATTERNS:").nth(1) {
                    if let Some(insights_section) = patterns_section.split("INSIGHTS:").next() {
                        for line in insights_section.lines() {
                            if line.contains(':') && line.starts_with("- ") {
                                let parts: Vec<&str> = line[2..].splitn(2, ':').collect();
                                if parts.len() == 2 {
                                    patterns.push(EchoPattern {
                                        id: uuid::Uuid::new_v4().to_string(),
                                        title: parts[0].trim().to_string(),
                                        description: parts[1].trim().to_string(),
                                        strength: 0.8, // Default strength
                                        entry_ids: vec![], // Will be populated separately
                                        tags: vec![],
                                        pattern_type: "custom".to_string(),
                                    });
                                }
                            }
                        }
                    }
                }

                // Extract insights section
                if let Some(insights_section) = analysis_text.split("INSIGHTS:").nth(1) {
                    if let Some(moods_section) = insights_section.split("MOODS:").next() {
                        for line in moods_section.lines() {
                            if line.starts_with("- ") {
                                insights.push(line[2..].trim().to_string());
                            }
                        }
                    }
                }

                // Extract mood trends
                if let Some(moods_section) = analysis_text.split("MOODS:").nth(1) {
                    for line in moods_section.lines() {
                        if line.starts_with("- ") && line.contains(':') {
                            let parts: Vec<&str> = line[2..].splitn(2, ':').collect();
                            if parts.len() == 2 {
                                if let Ok(value) = parts[1].trim().replace('%', "").parse::<f64>() {
                                    mood_trends.insert(parts[0].trim().to_string(), value / 100.0);
                                }
                            }
                        }
                    }
                }

                // Fallback: if no patterns found, generate some basic insights
                if patterns.is_empty() && entry_contents.len() > 3 {
                    patterns.push(EchoPattern {
                        id: uuid::Uuid::new_v4().to_string(),
                        title: "Regular Journaling".to_string(),
                        description: "You maintain a consistent journaling habit".to_string(),
                        strength: 0.7,
                        entry_ids: vec![],
                        tags: vec!["consistency".to_string()],
                        pattern_type: "habit".to_string(),
                    });
                }
            }
            Err(e) => {
                // Fallback to basic analysis if AI fails
                eprintln!("AI analysis failed: {}", e);
                mood_trends.insert("neutral".to_string(), 0.5);
                mood_trends.insert("positive".to_string(), 0.3);
                mood_trends.insert("negative".to_string(), 0.2);
            }
        }

        Ok(EchoAnalysis {
            patterns,
            insights,
            mood_trends,
        })
    }

    /// Generate a mock embedding (for development/testing)
    fn mock_embedding(&self, text: &str) -> Vec<f32> {
        // Generate a deterministic mock embedding based on text hash
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        text.hash(&mut hasher);
        let hash = hasher.finish();

        // Generate a 384-dimensional vector (common embedding size)
        let mut embedding = Vec::with_capacity(384);
        for i in 0..384 {
            let seed = hash.wrapping_add(i);
            let value = (seed as f32 / u64::MAX as f32) * 2.0 - 1.0; // Normalize to [-1, 1]
            embedding.push(value);
        }

        embedding
    }

    /// Get available models
    pub async fn list_models(&self) -> Result<Vec<String>> {
        match &self.model {
            AIModel::Ollama(_) => {
                let output = Command::new("ollama")
                    .arg("list")
                    .output()
                    .await
                    .context("Failed to list Ollama models")?;

                if !output.status.success() {
                    return Ok(vec![]);
                }

                let output_str = String::from_utf8_lossy(&output.stdout);
                let models: Vec<String> = output_str
                    .lines()
                    .skip(1) // Skip header
                    .filter_map(|line| line.split_whitespace().next().map(|s| s.to_string()))
                    .collect();

                Ok(models)
            }
            AIModel::LlamaCpp(_) => {
                // For llama.cpp, we'd need to scan for model files
                Ok(vec!["llama2:7b".to_string(), "codellama:7b".to_string()])
            }
        }
    }
}
