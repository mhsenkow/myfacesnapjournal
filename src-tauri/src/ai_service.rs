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
            chat_model: "llama2:7b".to_string(),             // Default chat model
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

    /// Generate chat response using Ollama
    async fn generate_ollama_chat(&self, request: ChatRequest) -> Result<ChatResponse> {
        let model = request.model.unwrap_or_else(|| self.chat_model.clone());

        let prompt = if let Some(context) = request.context {
            format!(
                "Context: {}\n\nUser: {}\n\nAssistant:",
                context, request.message
            )
        } else {
            format!("User: {}\n\nAssistant:", request.message)
        };

        let output = Command::new("ollama")
            .arg("run")
            .arg(&model)
            .arg(&prompt)
            .output()
            .await
            .context("Failed to run Ollama chat command")?;

        if !output.status.success() {
            return Err(anyhow::anyhow!(
                "Ollama chat failed: {}",
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        let response = String::from_utf8_lossy(&output.stdout);

        Ok(ChatResponse {
            response: response.trim().to_string(),
            model,
            tokens_used: None, // Ollama doesn't provide token count in simple mode
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

    /// Analyze journal entries for echo patterns
    pub async fn analyze_echo_patterns(&self, entries: Vec<String>) -> Result<EchoAnalysis> {
        // This is a simplified implementation
        // In a real implementation, you'd use embeddings and clustering algorithms

        let mut patterns = Vec::new();
        let mut insights = Vec::new();
        let mut mood_trends = HashMap::new();

        // Mock analysis - in reality, this would use ML algorithms
        if entries.len() > 5 {
            patterns.push(EchoPattern {
                id: uuid::Uuid::new_v4().to_string(),
                title: "Frequent Gratitude".to_string(),
                description: "You frequently express gratitude in your entries".to_string(),
                strength: 0.85,
                entry_ids: entries[0..3].to_vec(),
                tags: vec!["gratitude".to_string(), "positive".to_string()],
                pattern_type: "emotion".to_string(),
            });

            insights.push("You tend to write more positively in the morning".to_string());
            insights.push("Your entries show a pattern of reflection and growth".to_string());
        }

        mood_trends.insert("positive".to_string(), 0.7);
        mood_trends.insert("neutral".to_string(), 0.2);
        mood_trends.insert("negative".to_string(), 0.1);

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
