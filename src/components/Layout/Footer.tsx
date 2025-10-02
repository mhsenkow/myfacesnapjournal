import React from 'react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useApp } from '../../contexts/AppContext';
import { 
  Globe, 
  Server, 
  RefreshCw, 
  Sparkles, 
  LayoutGrid, 
  Image, 
  BarChart3, 
  List,
  Clock,
  TrendingUp,
  Shuffle,
  Target,
  Dice1,
  Play,
  Pause,
  Radio,
  X,
  Zap,
  MessageCircle
} from 'lucide-react';

interface FooterProps {
  isVisible: boolean;
  onToggle: () => void;
}

const Footer: React.FC<FooterProps> = ({ isVisible, onToggle }) => {
  const { state: appState } = useApp();
  const {
    auth,
    feedType,
    setFeedType,
    instanceUrl,
    setInstanceUrl,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    postLimit,
    setPostLimit,
    displayLimit,
    setDisplayLimit,
    displayMode,
    setDisplayMode,
    algorithm,
    setAlgorithm,
    isLiveFeed,
    setIsLiveFeed,
    liveFeedBatchSize,
    setLiveFeedBatchSize,
    liveFeedInterval,
    setLiveFeedInterval,
    allPosts,
    posts,
    fetchPublicTimeline
  } = useMastodonStore();

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Toggle Button - Positioned to avoid footer */}
      <button
        onClick={onToggle}
        className={`fixed bottom-6 right-6 z-50 p-3 w-12 h-12 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center`}
        title={isVisible ? "Hide Feed Controls" : "Show Feed Controls"}
      >
        <Sparkles className={`w-5 h-5 glass-text-primary transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`} />
      </button>

      {/* Footer Panel - Responsive positioning */}
      {isVisible && (
        <div className={`fixed bottom-6 z-40 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-2xl shadow-2xl backdrop-blur-xl p-4 sm:p-6 space-y-4 transition-all duration-300 
          left-6 right-6 sm:left-20 sm:right-20 
          ${appState.sidebarCollapsed ? 'lg:left-20' : 'lg:left-64'} 
          max-w-7xl mx-auto`}>
          {/* Main Controls Row */}
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            {/* Feed Type */}
            <div className="flex glass-subtle rounded-lg p-1">
              <button
                onClick={() => setFeedType('public')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  feedType === 'public'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                }`}
              >
                <Globe className="w-4 h-4 mr-2 inline" />
                Public
              </button>
              <button
                onClick={() => setFeedType('local')}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  feedType === 'local'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                }`}
              >
                <Server className="w-4 h-4 mr-2 inline" />
                Local
              </button>
            </div>

            {/* Instance Input */}
            <div className="flex flex-col">
              <input
                type="text"
                value={instanceUrl}
                onChange={(e) => setInstanceUrl(e.target.value)}
                className="w-48 px-3 py-2 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="mastodon.social"
              />
              <span className="text-xs glass-text-muted mt-1">Instance</span>
            </div>

            {/* Sort & Filter */}
            <div className="flex flex-col">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="random">Random Order</option>
              </select>
              <span className="text-xs glass-text-muted mt-1">Sort</span>
            </div>

            <div className="flex flex-col">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All</option>
                <option value="with_media">Media</option>
                <option value="with_hashtags">Tags</option>
              </select>
              <span className="text-xs glass-text-muted mt-1">Filter</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchPublicTimeline()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              <button
                onClick={() => {
                  // Clear cache functionality
                  if (allPosts.length > 0) {
                    useMastodonStore.setState({ allPosts: [], posts: [] });
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 glass-subtle glass-text-secondary rounded-lg text-sm hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                title="Clear cached posts"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>

          {/* Data Controls Row */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            {/* Fetch Limit */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={postLimit}
                  onChange={(e) => {
                    const newLimit = parseInt(e.target.value) || 1;
                    setPostLimit(newLimit);
                  }}
                  min="1"
                  max="10000"
                  className="w-24 px-3 py-2 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-sm glass-text-muted">posts</span>
              </div>
              <span className="text-xs glass-text-muted mt-1">
                Fetch {postLimit > 200 && <span className="text-yellow-600 dark:text-yellow-400">⚠️ May hit rate limits</span>}
              </span>
            </div>

            {/* Display Limit */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={displayLimit}
                  onChange={(e) => {
                    const newLimit = parseInt(e.target.value) || 1;
                    setDisplayLimit(newLimit);
                  }}
                  min="1"
                  max="1000"
                  className="w-24 px-3 py-2 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <span className="text-sm glass-text-muted">shown</span>
              </div>
              <span className="text-xs glass-text-muted mt-1">From {allPosts.length} cached</span>
            </div>

            {/* Status Display */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                {allPosts.length >= postLimit ? (
                  <span className="text-sm glass-text-secondary">✅ Complete</span>
                ) : (
                  <span className="text-sm glass-text-secondary">⏳ Fetching...</span>
                )}
                <span className="text-sm glass-text-muted">
                  ({posts.length} of {displayLimit})
                </span>
              </div>
              <span className="text-xs glass-text-muted mt-1">
                Using {algorithm} algorithm
              </span>
            </div>
          </div>

          {/* Display Controls Row */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            {/* Display Mode */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 glass-subtle rounded-lg p-1">
                <button
                  onClick={() => setDisplayMode('refined')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'refined'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Refined Feed"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('cards')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'cards'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Card Layout"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('instagram')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'instagram'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Instagram Style"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('dataviz')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'dataviz'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Data Visualization"
                >
                  <BarChart3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('dense')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'dense'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Dense Grid"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs glass-text-muted mt-1">Layout</span>
            </div>

            {/* Algorithm Selection */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 glass-subtle rounded-lg p-1">
                <button
                  onClick={() => setAlgorithm('latest')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'latest'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Latest Posts"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('trending')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'trending'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Trending Posts"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('diverse')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'diverse'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Diverse Mix"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('balanced')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'balanced'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Balanced Selection"
                >
                  <Target className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('viral')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'viral'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Viral Posts (High Engagement Rate)"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('fresh')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'fresh'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Fresh Posts (Recent + Engagement)"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('media_rich')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'media_rich'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Media Rich Posts"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('conversational')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'conversational'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Conversational Posts (Questions, Polls, Replies)"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlgorithm('random')}
                  className={`p-2 rounded-md transition-colors ${
                    algorithm === 'random'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Random Selection"
                >
                  <Dice1 className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs glass-text-muted mt-1">Algorithm</span>
            </div>
          </div>

          {/* Live Feed Controls Row */}
          <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
            {/* Live Feed Toggle */}
            <div className="flex flex-col">
              <button
                onClick={() => setIsLiveFeed(!isLiveFeed)}
                className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${
                  isLiveFeed
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'glass-subtle glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                }`}
                title={isLiveFeed ? "Live Feed Active" : "Static Feed"}
              >
                {isLiveFeed ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isLiveFeed ? 'Live' : 'Static'}
              </button>
              <span className="text-xs glass-text-muted mt-1">Mode</span>
            </div>

            {/* Batch Size Selector */}
            <div className="flex flex-col">
              <select
                value={liveFeedBatchSize}
                onChange={(e) => setLiveFeedBatchSize(parseInt(e.target.value))}
                className="px-3 py-2 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={!isLiveFeed}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="text-xs glass-text-muted mt-1">Batch</span>
            </div>

            {/* Interval Selector */}
            <div className="flex flex-col">
              <select
                value={liveFeedInterval}
                onChange={(e) => setLiveFeedInterval(parseInt(e.target.value))}
                className="px-3 py-2 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                disabled={!isLiveFeed}
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1m</option>
                <option value={120000}>2m</option>
                <option value={300000}>5m</option>
              </select>
              <span className="text-xs glass-text-muted mt-1">Interval</span>
            </div>

            {/* Live Feed Indicator */}
            {isLiveFeed && (
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-green-600 animate-pulse" />
                  <span className="text-sm text-green-600">Streaming</span>
                </div>
                <span className="text-xs glass-text-muted mt-1">Status</span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
