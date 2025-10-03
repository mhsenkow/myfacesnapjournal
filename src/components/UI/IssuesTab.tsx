/**
 * Issues Tab Component for MyFace SnapJournal Settings
 * 
 * This component displays a list of GitHub issues created by the user,
 * allowing them to track the status of their feedback and bug reports.
 */

import React, { useState, useEffect } from 'react'
import { 
  ExternalLink, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Bug, 
  Lightbulb, 
  MessageCircle,
  RefreshCw,
  Filter,
  Search
} from 'lucide-react'
import { githubService, GitHubIssue } from '../../services/githubService'

interface UserIssue {
  number: number
  title: string
  url: string
  createdAt: string
  status: 'open' | 'closed'
  labels: string[]
  isPending?: boolean
}

const IssuesTab: React.FC = () => {
  const [issues, setIssues] = useState<UserIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [githubConnected, setGithubConnected] = useState<boolean | null>(null)

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    setLoading(true)
    try {
      console.log('Loading issues...')
      
      // Check if GitHub token is configured
      const token = localStorage.getItem('github_token')
      console.log('GitHub token configured:', !!token)
      setGithubConnected(!!token)
      
      const githubIssues = await githubService.getUserIssues()
      console.log('GitHub issues received:', githubIssues)
      
      const userIssues: UserIssue[] = githubIssues.map(issue => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        createdAt: issue.created_at,
        status: issue.state,
        labels: issue.labels || [],
        isPending: (issue as any).isPending || false
      }))
      
      console.log('Processed user issues:', userIssues)
      setIssues(userIssues)
    } catch (error) {
      console.error('Error loading issues:', error)
      setGithubConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const refreshIssues = async () => {
    console.log('Refresh button clicked')
    setRefreshing(true)
    await loadIssues()
    setRefreshing(false)
  }

  const clearAllIssues = () => {
    if (window.confirm('Are you sure you want to clear all local issues? This will remove all locally stored issues and cannot be undone.')) {
      // Clear local storage
      localStorage.removeItem('userIssues')
      localStorage.removeItem('user_issues')
      
      // Clear current state
      setIssues([])
      
      // Reload to show fresh state
      loadIssues()
      
      console.log('All local issues cleared')
    }
  }

  const filteredIssues = issues.filter(issue => {
    const matchesFilter = filter === 'all' || issue.status === filter
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getIssueIcon = (labels: string[]) => {
    if (labels.includes('bug')) return <Bug className="w-4 h-4 text-red-600" />
    if (labels.includes('feature')) return <Lightbulb className="w-4 h-4 text-yellow-600" />
    return <MessageCircle className="w-4 h-4 text-blue-600" />
  }

  const getStatusIcon = (status: 'open' | 'closed') => {
    return status === 'open' 
      ? <AlertCircle className="w-4 h-4 text-orange-600" />
      : <CheckCircle className="w-4 h-4 text-green-600" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: 'open' | 'closed') => {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
        status === 'open'
          ? 'bg-orange-100 text-orange-700 border border-orange-200'
          : 'bg-green-100 text-green-700 border border-green-200'
      }`}>
        {getStatusIcon(status)}
        {status === 'open' ? 'Open' : 'Closed'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-light glass-text-primary">Your Issues</h2>
            <p className="glass-text-tertiary mt-1">Track the status of your feedback and bug reports</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 glass-text-tertiary">
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading your issues...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-light glass-text-primary">Your Issues</h2>
          <p className="glass-text-tertiary mt-1">Track the status of your feedback and bug reports</p>
          {githubConnected !== null && (
            <div className="mt-2">
              {githubConnected ? (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected to GitHub
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Local issues only - <a href="/settings?tab=integrations" className="underline">Set up GitHub integration</a>
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={clearAllIssues}
            className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Clear all local issues"
          >
            <AlertCircle className="w-4 h-4" />
            Clear All
          </button>
          <button
            onClick={refreshIssues}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 glass-text-tertiary" />
          <input
            type="text"
            placeholder="Search issues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 glass-text-tertiary" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'open' | 'closed')}
            className="px-3 py-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          >
            <option value="all">All Issues</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Issues List */}
      {filteredIssues.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-12 h-12 glass-text-tertiary mx-auto mb-4" />
          <h3 className="text-lg font-medium glass-text-secondary mb-2">
            {searchTerm || filter !== 'all' ? 'No matching issues' : 'No issues yet'}
          </h3>
          <p className="glass-text-tertiary">
            {searchTerm || filter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Submit your first feedback using the feedback button in the bottom left corner'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredIssues.map((issue) => (
            <div
              key={issue.number}
              className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 hover:glass transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {getIssueIcon(issue.labels)}
                    <h3 className="font-medium glass-text-primary truncate">
                      {issue.title}
                    </h3>
                    <span className="text-sm glass-text-tertiary">
                      #{issue.number}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-sm glass-text-tertiary mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDate(issue.createdAt)}
                    </div>
                    {issue.isPending ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    ) : (
                      getStatusBadge(issue.status)
                    )}
                  </div>
                  
                  {issue.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {issue.labels.map((label) => (
                        <span
                          key={label}
                          className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-full"
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={() => window.open(issue.url, '_blank')}
                  className="flex items-center gap-2 px-3 py-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  {issue.isPending ? 'Create' : 'View'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {issues.length > 0 && (
        <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="glass-text-secondary">
              Total Issues: {issues.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                {issues.filter(i => i.status === 'open').length} Open
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {issues.filter(i => i.status === 'closed').length} Closed
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IssuesTab
