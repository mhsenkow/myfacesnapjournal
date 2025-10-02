/**
 * Header Component for MyFace SnapJournal
 * 
 * This component provides the main application header including:
 * - Theme toggle (light/dark mode)
 * - Global search
 * - User menu and notifications
 * - Breadcrumb navigation
 */

import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useMastodonStore } from '../../stores/mastodonStore'
import { 
  Sun, 
  Moon, 
  Zap, 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Menu,
  Rss,
  Globe,
  Server,
  RefreshCw,
  LayoutGrid,
  Image,
  BarChart3,
  List,
  Sparkles,
  Clock,
  TrendingUp,
  Shuffle,
  Target,
  Dice1,
  Play,
  Pause,
  Radio
} from 'lucide-react'

const Header: React.FC = () => {
  const { toggleSidebar } = useApp()
  const { theme, toggleMode } = useTheme()
  const { 
    auth, 
    feedType, 
    sortBy, 
    filterBy, 
    searchQuery, 
    instanceUrl,
    displayMode,
    postLimit,
    displayLimit,
    algorithm,
    posts,
    allPosts,
    isLiveFeed,
    liveFeedBatchSize,
    liveFeedInterval,
    setFeedType,
    setSortBy,
    setFilterBy,
    setSearchQuery,
    setInstanceUrl,
    setDisplayMode,
    setPostLimit,
    setDisplayLimit,
    setAlgorithm,
    setIsLiveFeed,
    setLiveFeedBatchSize,
    setLiveFeedInterval,
    fetchPublicTimeline,
    refreshLiveFeed
  } = useMastodonStore()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const isFeedPage = location.pathname === '/feed'

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname
    switch (path) {
      case '/journal':
        return 'Journal'
      case '/echo':
        return 'Echo Engine'
      case '/companion':
        return 'AI Introspection'
      case '/feed':
        return 'Feed'
      case '/settings':
        return 'Settings'
      case '/vault':
        return 'Vault'
      default:
        return 'MyFace SnapJournal'
    }
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement search functionality
    console.log('Searching for:', searchQuery)
  }

  // Toggle user menu
  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
  }

  return (
    <header className="glass px-6 py-3">
      {/* Main header row - more compact */}
      <div className="flex items-center justify-between">
        {/* Left side - Page title and feed controls */}
        <div className="flex items-center gap-6">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-neutral-200 transition-colors"
            title="Toggle menu"
          >
            <Menu size={18} />
          </button>
          
          {/* Page title with icon */}
          <div className="flex items-center gap-2">
            {isFeedPage && <Rss className="w-5 h-5 text-purple-600" />}
            <h1 className="text-xl font-bold glass-text-primary">{getPageTitle()}</h1>
          </div>

          {/* Feed Controls (only on feed page) */}
          {isFeedPage && auth.isAuthenticated && (
            <div className="space-y-3">
              {/* Main Controls Row */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Feed Type */}
                <div className="flex bg-neutral-100 dark:bg-neutral-700 rounded-lg">
                  <button
                    onClick={() => setFeedType('public')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      feedType === 'public'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    <Globe className="w-3 h-3 mr-1 inline" />
                    Public
                  </button>
                  <button
                    onClick={() => setFeedType('local')}
                    className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      feedType === 'local'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                  >
                    <Server className="w-3 h-3 mr-1 inline" />
                    Local
                  </button>
        </div>

                {/* Instance Input */}
                <div className="flex flex-col">
            <input
              type="text"
                    value={instanceUrl}
                    onChange={(e) => setInstanceUrl(e.target.value)}
                    className="w-40 px-2 py-1.5 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    placeholder="mastodon.social"
                  />
                  <span className="text-[10px] glass-text-muted mt-0.5">Instance</span>
                </div>

                {/* Sort & Filter */}
                <div className="flex flex-col">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1.5 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="popular">Popular</option>
                  </select>
                  <span className="text-[10px] glass-text-muted mt-0.5">Sort</span>
                </div>

                <div className="flex flex-col">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value as any)}
                    className="px-2 py-1.5 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All</option>
                    <option value="with_media">Media</option>
                    <option value="with_hashtags">Tags</option>
                  </select>
                  <span className="text-[10px] glass-text-muted mt-0.5">Filter</span>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={() => fetchPublicTimeline()}
                  className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Refresh
                </button>
              </div>

              {/* Data Controls Row */}
              <div className="flex items-center gap-4 flex-wrap">
                {/* Fetch Limit */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={postLimit}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value) || 1;
                        setPostLimit(newLimit);
                      }}
                      min="1"
                      max="10000"
                      className="w-20 px-2 py-1.5 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-xs glass-text-muted">posts</span>
                  </div>
                  <span className="text-[10px] glass-text-muted mt-0.5">
                    Fetch {postLimit > 200 && <span className="text-yellow-600 dark:text-yellow-400">⚠️ May hit rate limits</span>}
                  </span>
                </div>

                {/* Display Limit */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={displayLimit}
                      onChange={(e) => {
                        const newLimit = parseInt(e.target.value) || 1;
                        setDisplayLimit(newLimit);
                      }}
                      min="1"
                      max="1000"
                      className="w-20 px-2 py-1.5 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                    />
                    <span className="text-xs glass-text-muted">shown</span>
                  </div>
                  <span className="text-[10px] glass-text-muted mt-0.5">From {allPosts.length} cached</span>
                </div>

                {/* Status Display */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {allPosts.length >= postLimit ? (
                      <span className="text-xs glass-text-secondary">✅ Complete</span>
                    ) : (
                      <span className="text-xs glass-text-secondary">⏳ Fetching...</span>
                    )}
                    <span className="text-xs glass-text-muted">
                      ({posts.length} of {displayLimit})
                    </span>
                  </div>
                  <span className="text-[10px] glass-text-muted mt-0.5">
                    Using {algorithm} algorithm
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Display Controls (only on feed page) */}
          {isFeedPage && auth.isAuthenticated && (
            <div className="flex items-center gap-4 flex-wrap">
              {/* Display Mode */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
                  <button
                    onClick={() => setDisplayMode('refined')}
                    className={`p-1.5 rounded transition-colors ${
                      displayMode === 'refined'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Refined Feed"
                  >
                    <Sparkles className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDisplayMode('cards')}
                    className={`p-1.5 rounded transition-colors ${
                      displayMode === 'cards'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Card Layout"
                  >
                    <LayoutGrid className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDisplayMode('instagram')}
                    className={`p-1.5 rounded transition-colors ${
                      displayMode === 'instagram'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Instagram Style"
                  >
                    <Image className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDisplayMode('dataviz')}
                    className={`p-1.5 rounded transition-colors ${
                      displayMode === 'dataviz'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Data Visualization"
                  >
                    <BarChart3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setDisplayMode('dense')}
                    className={`p-1.5 rounded transition-colors ${
                      displayMode === 'dense'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Dense Grid"
                  >
                    <List className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] glass-text-muted mt-1">Layout</span>
              </div>

              {/* Algorithm Selection */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-700 rounded-lg p-1">
                  <button
                    onClick={() => setAlgorithm('latest')}
                    className={`p-1.5 rounded transition-colors ${
                      algorithm === 'latest'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Latest Posts"
                  >
                    <Clock className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setAlgorithm('trending')}
                    className={`p-1.5 rounded transition-colors ${
                      algorithm === 'trending'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Trending Posts"
                  >
                    <TrendingUp className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setAlgorithm('diverse')}
                    className={`p-1.5 rounded transition-colors ${
                      algorithm === 'diverse'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Diverse Mix"
                  >
                    <Shuffle className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setAlgorithm('balanced')}
                    className={`p-1.5 rounded transition-colors ${
                      algorithm === 'balanced'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Balanced Selection"
                  >
                    <Target className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => setAlgorithm('random')}
                    className={`p-1.5 rounded transition-colors ${
                      algorithm === 'random'
                        ? 'bg-purple-600 text-white'
                        : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                    }`}
                    title="Random Selection"
                  >
                    <Dice1 className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-[10px] glass-text-muted mt-1">Algorithm</span>
              </div>
            </div>
          )}

          {/* Live Feed Controls (only on feed page) */}
          {isFeedPage && auth.isAuthenticated && (
            <div className="flex items-center gap-4 flex-wrap">
              {/* Live Feed Toggle */}
              <div className="flex flex-col">
                <button
                  onClick={() => setIsLiveFeed(!isLiveFeed)}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded transition-colors ${
                    isLiveFeed
                      ? 'bg-green-600 text-white'
                      : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                  }`}
                  title={isLiveFeed ? "Live Feed Active" : "Static Feed"}
                >
                  {isLiveFeed ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {isLiveFeed ? 'Live' : 'Static'}
                </button>
                <span className="text-[10px] glass-text-muted mt-1">Mode</span>
              </div>

              {/* Batch Size Selector */}
              <div className="flex flex-col">
                <select
                  value={liveFeedBatchSize}
                  onChange={(e) => setLiveFeedBatchSize(parseInt(e.target.value))}
                  className="px-2 py-1.5 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  disabled={!isLiveFeed}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-[10px] glass-text-muted mt-1">Batch</span>
              </div>

              {/* Interval Selector */}
              <div className="flex flex-col">
                <select
                  value={liveFeedInterval}
                  onChange={(e) => setLiveFeedInterval(parseInt(e.target.value))}
                  className="px-2 py-1.5 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  disabled={!isLiveFeed}
                >
                  <option value={10000}>10s</option>
                  <option value={30000}>30s</option>
                  <option value={60000}>1m</option>
                  <option value={120000}>2m</option>
                  <option value={300000}>5m</option>
                </select>
                <span className="text-[10px] glass-text-muted mt-1">Interval</span>
              </div>

              {/* Live Feed Indicator */}
              {isLiveFeed && (
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-green-600 animate-pulse" />
                    <span className="text-xs text-green-600">Streaming</span>
                  </div>
                  <span className="text-[10px] glass-text-muted mt-1">Status</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={toggleMode}
            className="p-2 rounded-md hover:bg-neutral-200 transition-colors relative"
            title={`Current: ${theme.mode}. Click to cycle themes`}
          >
            {theme.mode === 'light' && <Sun size={18} className="text-yellow-600" />}
            {theme.mode === 'dark' && <Moon size={18} className="text-blue-400" />}
            {theme.mode === 'brutalist' && <Zap size={18} className="text-red-600" />}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-md hover:bg-neutral-200 transition-colors relative">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={toggleUserMenu}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-neutral-200 transition-colors"
            >
              <div className="w-7 h-7 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">U</span>
              </div>
              <ChevronDown size={14} className="text-neutral-500" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-neutral-200 py-1 z-50">
                <button className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                  <User size={16} className="mr-3" />
                  Profile
                </button>
                <button className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                  <Settings size={16} className="mr-3" />
                  Settings
                </button>
                <hr className="my-1 border-neutral-200" />
                <button className="w-full flex items-center px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100 transition-colors">
                  <LogOut size={16} className="mr-3" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


    </header>
  )
}

export default Header
