/**
 * GitHub Service for MyFace SnapJournal
 * 
 * This service handles GitHub API interactions for creating and managing issues.
 * It provides functionality to:
 * - Create GitHub issues from user feedback
 * - Track issue status
 * - Manage issue labels and metadata
 */

interface GitHubIssue {
  number: number
  title: string
  body: string
  labels: string[]
  state: 'open' | 'closed'
  created_at: string
  updated_at: string
  html_url: string
  user: {
    login: string
    avatar_url: string
  }
}

interface CreateIssueRequest {
  title: string
  body: string
  labels: string[]
}

interface CreateIssueResponse {
  number: number
  html_url: string
  state: string
  created_at: string
  updated_at: string
}

class GitHubService {
  private readonly REPO_OWNER = 'mhsenkow'
  private readonly REPO_NAME = 'myfacesnapjournal'
  private readonly BASE_URL = `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}`

  /**
   * Create a new GitHub issue using Tauri backend
   */
  async createIssue(issueData: CreateIssueRequest): Promise<CreateIssueResponse> {
    try {
      // Check if GitHub token is available
      const token = localStorage.getItem('github_token')
      if (!token) {
        throw new Error('GitHub token not configured. Please set up GitHub integration in Settings.')
      }

      // Use Tauri backend to create the issue
      const { invoke } = await import('@tauri-apps/api/core')
      
      console.log('Creating GitHub issue via Tauri backend:', {
        title: issueData.title,
        body: issueData.body.substring(0, 100) + '...',
        labels: issueData.labels,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + '...'
      })
      
      const result = await invoke<CreateIssueResponse>('create_github_issue', {
        title: issueData.title,
        body: issueData.body,
        labels: issueData.labels,
        token: token
      })
      
      console.log('GitHub issue created successfully:', result)

      // Store in local storage for tracking
      this.storeLocalIssue(result, issueData.title)

      return result
    } catch (error) {
      console.error('Error creating GitHub issue:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        type: typeof error
      })
      
      // Check if it's a token configuration error
      if (error instanceof Error && error.message.includes('GitHub token not configured')) {
        throw error // Re-throw to be handled by the modal
      }
      
      // Fallback to web-based creation if backend fails
      console.log('Falling back to web-based issue creation due to error:', error)
      return this.createWebBasedIssue(issueData)
    }
  }

  /**
   * Fallback method using GitHub's web interface
   */
  private createWebBasedIssue(issueData: CreateIssueRequest): CreateIssueResponse {
    const issueUrl = this.createGitHubIssueUrl(issueData)
    
    // Store the issue data locally for tracking
    const issueNumber = Date.now() // Use timestamp as temporary number
    const result = {
      number: issueNumber,
      html_url: issueUrl,
      state: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Store in local storage for tracking
    this.storeLocalIssue(result, issueData.title)

    return result
  }

  /**
   * Create a GitHub issue URL with pre-filled data
   */
  private createGitHubIssueUrl(issueData: CreateIssueRequest): string {
    const baseUrl = `https://github.com/${this.REPO_OWNER}/${this.REPO_NAME}/issues/new`
    const params = new URLSearchParams()
    
    // Pre-fill the title
    params.set('title', issueData.title)
    
    // Pre-fill the body with description and labels
    let body = issueData.body
    
    // Add labels as a comment at the end
    if (issueData.labels.length > 0) {
      body += `\n\n**Labels:** ${issueData.labels.join(', ')}`
    }
    
    // Add a note about the source
    body += `\n\n---\n*This issue was created via MyFace SnapJournal feedback system*`
    
    params.set('body', body)
    
    // Add labels as query parameters
    issueData.labels.forEach(label => {
      params.append('labels[]', label)
    })
    
    return `${baseUrl}?${params.toString()}`
  }

  /**
   * Store issue locally for tracking
   */
  private storeLocalIssue(issue: CreateIssueResponse, title: string): void {
    const userIssues = JSON.parse(localStorage.getItem('userIssues') || '[]')
    userIssues.push({
      number: issue.number,
      title: title,
      url: issue.html_url,
      createdAt: issue.created_at,
      status: 'open',
      isPending: true // Flag to indicate it needs to be manually created
    })
    localStorage.setItem('userIssues', JSON.stringify(userIssues))
  }

  /**
   * Get issues created by the user - now fetches from GitHub
   */
  async getUserIssues(): Promise<GitHubIssue[]> {
    try {
      const token = localStorage.getItem('github_token')
      if (!token) {
        // If no token, return local issues only
        const localIssues = JSON.parse(localStorage.getItem('userIssues') || '[]')
        return localIssues.map((issue: any) => ({
          number: issue.number,
          title: issue.title,
          body: '',
          labels: [],
          state: issue.status === 'closed' ? 'closed' : 'open',
          created_at: issue.createdAt,
          updated_at: issue.updatedAt || issue.createdAt,
          html_url: issue.url,
          user: {
            login: 'user',
            avatar_url: ''
          }
        }))
      }

      // Fetch real issues from GitHub
      const { invoke } = await import('@tauri-apps/api/core')
      
      console.log('Fetching GitHub issues...')
      const issues = await invoke<GitHubIssue[]>('get_github_issues', {
        token: token
      })

      console.log('Fetched GitHub issues:', issues)
      return issues
    } catch (error) {
      console.error('Error fetching user issues:', error)
      
      // Fallback to local issues if GitHub fetch fails
      const localIssues = JSON.parse(localStorage.getItem('userIssues') || '[]')
      return localIssues.map((issue: any) => ({
        number: issue.number,
        title: issue.title,
        body: '',
        labels: [],
        state: issue.status === 'closed' ? 'closed' : 'open',
        created_at: issue.createdAt,
        updated_at: issue.updatedAt || issue.createdAt,
        html_url: issue.url,
        user: {
          login: 'user',
          avatar_url: ''
        }
      }))
    }
  }

  /**
   * Get a specific issue by number
   */
  async getIssue(issueNumber: number): Promise<GitHubIssue | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/issues/${issueNumber}`, {
        headers: {
          'Authorization': `token ${process.env.GITHUB_TOKEN || ''}`,
          'User-Agent': 'MyFaceSnapJournal'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return {
        number: result.number,
        title: result.title,
        body: result.body,
        labels: result.labels.map((label: any) => label.name),
        state: result.state,
        created_at: result.created_at,
        updated_at: result.updated_at,
        html_url: result.html_url,
        user: {
          login: result.user.login,
          avatar_url: result.user.avatar_url
        }
      }
    } catch (error) {
      console.error('Error fetching issue:', error)
      return null
    }
  }

  /**
   * Update local issue status
   */
  updateIssueStatus(issueNumber: number, status: 'open' | 'closed'): void {
    const userIssues = JSON.parse(localStorage.getItem('userIssues') || '[]')
    const updatedIssues = userIssues.map((issue: any) => 
      issue.number === issueNumber 
        ? { ...issue, status, updatedAt: new Date().toISOString() }
        : issue
    )
    localStorage.setItem('userIssues', JSON.stringify(updatedIssues))
  }


  /**
   * Get repository information
   */
  async getRepositoryInfo(): Promise<{ name: string; full_name: string; description: string } | null> {
    try {
      const response = await fetch(`${this.BASE_URL}`, {
        headers: {
          'User-Agent': 'MyFaceSnapJournal'
        }
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      return {
        name: result.name,
        full_name: result.full_name,
        description: result.description
      }
    } catch (error) {
      console.error('Error fetching repository info:', error)
      return {
        name: 'MyFace SnapJournal',
        full_name: 'mhsenkow/myfacesnapjournal',
        description: 'Local-first AI journaling app with echo insights and companion personas'
      }
    }
  }
}

export const githubService = new GitHubService()
export type { GitHubIssue, CreateIssueRequest, CreateIssueResponse }
