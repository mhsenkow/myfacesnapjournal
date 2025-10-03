/**
 * GitHub Service for MyFace SnapJournal
 * 
 * This service handles GitHub API interactions for creating and managing issues.
 * It provides functionality to create GitHub issues from user feedback.
 */

use anyhow::Result;
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateIssueRequest {
    pub title: String,
    pub body: String,
    pub labels: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CreateIssueResponse {
    pub number: u32,
    pub html_url: String,
    pub state: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubIssue {
    pub number: u32,
    pub title: String,
    pub body: String,
    pub labels: Vec<GitHubLabel>,
    pub state: String,
    pub created_at: String,
    pub updated_at: String,
    pub html_url: String,
    pub user: GitHubUser,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubLabel {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct GitHubUser {
    pub login: String,
    pub avatar_url: String,
}

pub struct GitHubService {
    client: Client,
    repo_owner: String,
    repo_name: String,
    base_url: String,
}

impl GitHubService {
    pub fn new() -> Self {
        let repo_owner = "mhsenkow".to_string();
        let repo_name = "myfacesnapjournal".to_string();
        let base_url = format!("https://api.github.com/repos/{}/{}", repo_owner, repo_name);
        
        Self {
            client: Client::new(),
            repo_owner,
            repo_name,
            base_url,
        }
    }

    /// Create a new GitHub issue
    pub async fn create_issue(&self, issue_data: CreateIssueRequest, token: String) -> Result<CreateIssueResponse> {
        if token.is_empty() {
            return Err(anyhow::anyhow!("GitHub token not provided."));
        }

        let url = format!("{}/issues", self.base_url);
        
        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("token {}", token))
            .header("User-Agent", "MyFaceSnapJournal")
            .header("Accept", "application/vnd.github.v3+json")
            .json(&issue_data)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!(
                "GitHub API error: {} - {}",
                status,
                error_text
            ));
        }

        let issue: GitHubIssue = response.json().await?;
        
        Ok(CreateIssueResponse {
            number: issue.number,
            html_url: issue.html_url,
            state: issue.state,
            created_at: issue.created_at,
            updated_at: issue.updated_at,
        })
    }

    /// Get a specific issue by number
    pub async fn get_issue(&self, issue_number: u32) -> Result<GitHubIssue> {
        let token = env::var("GITHUB_TOKEN").unwrap_or_default();
        
        if token.is_empty() {
            return Err(anyhow::anyhow!("GitHub token not configured"));
        }

        let url = format!("{}/issues/{}", self.base_url, issue_number);
        
        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("token {}", token))
            .header("User-Agent", "MyFaceSnapJournal")
            .header("Accept", "application/vnd.github.v3+json")
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!(
                "GitHub API error: {} - {}",
                status,
                error_text
            ));
        }

        let issue: GitHubIssue = response.json().await?;
        Ok(issue)
    }

    /// Get all issues from the repository
    pub async fn get_issues(&self, token: String) -> Result<Vec<GitHubIssue>> {
        if token.is_empty() {
            return Err(anyhow::anyhow!("GitHub token not provided."));
        }

        let url = format!("{}/issues", self.base_url);
        
        let response = self
            .client
            .get(&url)
            .header("Authorization", format!("token {}", token))
            .header("User-Agent", "MyFaceSnapJournal")
            .header("Accept", "application/vnd.github.v3+json")
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let error_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!(
                "GitHub API error: {} - {}",
                status,
                error_text
            ));
        }

        let issues: Vec<GitHubIssue> = response.json().await?;
        Ok(issues)
    }

    /// Get repository information
    pub async fn get_repository_info(&self) -> Result<serde_json::Value> {
        let url = format!("https://api.github.com/repos/{}/{}", self.repo_owner, self.repo_name);
        
        let response = self
            .client
            .get(&url)
            .header("User-Agent", "MyFaceSnapJournal")
            .header("Accept", "application/vnd.github.v3+json")
            .send()
            .await?;

        if !response.status().is_success() {
            return Err(anyhow::anyhow!("Failed to fetch repository info"));
        }

        let repo_info: serde_json::Value = response.json().await?;
        Ok(repo_info)
    }
}

impl Default for GitHubService {
    fn default() -> Self {
        Self::new()
    }
}
