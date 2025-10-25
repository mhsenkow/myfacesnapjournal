import React from 'react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useBlueskyStore } from '../../stores/blueskyStore';
import { useApp } from '../../contexts/AppContext';
import { substackService } from '../../services/substackService';
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
  MessageCircle,
  SprayCan,
  Focus,
  Rss,
  Plus,
  Settings,
  Wrench,
  Users,
  Smartphone
} from 'lucide-react';

interface FooterProps {
  isVisible: boolean;
  onToggle: () => void;
}

const Footer: React.FC<FooterProps> = ({ isVisible, onToggle }) => {
  const { state: appState, toggleFeedSource } = useApp();
  const [substackSources] = React.useState(() => substackService.getSources());
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

  const { 
    auth: blueskyAuth,
    algorithm: blueskyAlgorithm,
    setAlgorithm: setBlueskyAlgorithm,
    displayMode: blueskyDisplayMode,
    setDisplayMode: setBlueskyDisplayMode,
    displayLimit: blueskyDisplayLimit,
    setDisplayLimit: setBlueskyDisplayLimit,
    isLiveFeed: blueskyIsLiveFeed,
    setIsLiveFeed: setBlueskyIsLiveFeed,
    liveFeedBatchSize: blueskyLiveFeedBatchSize,
    setLiveFeedBatchSize: setBlueskyLiveFeedBatchSize,
    liveFeedInterval: blueskyLiveFeedInterval,
    setLiveFeedInterval: setBlueskyLiveFeedInterval,
    applyAlgorithm: applyBlueskyAlgorithm
  } = useBlueskyStore();

  // Helper functions to handle algorithm changes for both platforms
  const handleAlgorithmChange = (newAlgorithm: typeof algorithm) => {
    if (auth.isAuthenticated) {
      setAlgorithm(newAlgorithm);
    }
    if (blueskyAuth.isAuthenticated) {
      setBlueskyAlgorithm(newAlgorithm);
    }
  };

  const handleDisplayModeChange = (newMode: typeof displayMode) => {
    if (auth.isAuthenticated) {
      setDisplayMode(newMode);
    }
    if (blueskyAuth.isAuthenticated) {
      setBlueskyDisplayMode(newMode);
    }
  };

  const handleDisplayLimitChange = (newLimit: number) => {
    if (auth.isAuthenticated) {
      setDisplayLimit(newLimit);
    }
    if (blueskyAuth.isAuthenticated) {
      setBlueskyDisplayLimit(newLimit);
    }
  };

  const handleLiveFeedToggle = () => {
    if (auth.isAuthenticated) {
      setIsLiveFeed(!isLiveFeed);
    }
    if (blueskyAuth.isAuthenticated) {
      setBlueskyIsLiveFeed(!blueskyIsLiveFeed);
    }
  };

  const handleLiveFeedBatchSizeChange = (newSize: number) => {
    if (auth.isAuthenticated) {
      setLiveFeedBatchSize(newSize);
    }
    if (blueskyAuth.isAuthenticated) {
      setBlueskyLiveFeedBatchSize(newSize);
    }
  };

  const handleLiveFeedIntervalChange = (newInterval: number) => {
    if (auth.isAuthenticated) {
      setLiveFeedInterval(newInterval);
    }
    if (blueskyAuth.isAuthenticated) {
      setBlueskyLiveFeedInterval(newInterval);
    }
  };

  // Get current values based on which platform is active
  const currentAlgorithm = auth.isAuthenticated ? algorithm : blueskyAlgorithm;
  const currentDisplayMode = auth.isAuthenticated ? displayMode : blueskyDisplayMode;
  const currentDisplayLimit = auth.isAuthenticated ? displayLimit : blueskyDisplayLimit;
  const currentIsLiveFeed = auth.isAuthenticated ? isLiveFeed : blueskyIsLiveFeed;
  const currentLiveFeedBatchSize = auth.isAuthenticated ? liveFeedBatchSize : blueskyLiveFeedBatchSize;
  const currentLiveFeedInterval = auth.isAuthenticated ? liveFeedInterval : blueskyLiveFeedInterval;

  if (!auth.isAuthenticated && !blueskyAuth.isAuthenticated) {
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

      {/* Footer Panel - Responsive positioning with slide-up motion */}
      <div className={`fixed bottom-6 z-40 transition-all duration-300 ease-in-out
          left-4 right-4 sm:left-6 sm:right-6 md:left-20 md:right-20 
          ${appState.sidebarCollapsed ? 'lg:left-6' : 'lg:left-64'} 
          max-w-6xl mx-auto
          ${isVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div className={`glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-2xl shadow-2xl backdrop-blur-xl p-3 sm:p-4 space-y-2 sm:space-y-3 transition-all duration-300 ease-in-out relative
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          
          {/* Menu Action Buttons - Half On/Half Off the footer panel */}
          <div className={`absolute -top-6 right-4 z-50 transition-all duration-300 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}>
            <div className="flex items-center gap-1 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg p-1 shadow-lg backdrop-blur-xl">
              <button
                onClick={() => {
                  // Clear cache functionality
                  if (allPosts.length > 0) {
                    useMastodonStore.setState({ allPosts: [], posts: [] });
                  }
                }}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Clear Cache"
              >
                <SprayCan className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={() => fetchPublicTimeline()}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Refresh Feed"
              >
                <RefreshCw className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={() => window.location.href = '/settings?tab=integrations'}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Manage Integrations"
              >
                <Server className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={() => {
                  // Quick add Substack source
                  const url = prompt('Enter Substack newsletter URL (e.g., https://newsletter.substack.com):');
                  if (url) {
                    const rssUrl = substackService.extractRSSUrl(url);
                    const source = substackService.addSource({
                      name: url.split('/')[2] || 'New Substack',
                      rssUrl,
                      enabled: true
                    });
                    console.log('Added Substack source:', source);
                    // Refresh the footer to show updated count
                    window.location.reload();
                  }
                }}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Add Substack Source"
              >
                <Plus className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={async () => {
                  console.log('Manually refreshing Substack feeds...');
                  try {
                    const posts = await substackService.fetchAllFeeds();
                    console.log('Manual Substack refresh completed:', posts.length, 'posts');
                    alert(`Substack refresh completed! Found ${posts.length} posts.`);
                  } catch (error) {
                    console.error('Manual Substack refresh failed:', error);
                    alert('Substack refresh failed. Check console for details.');
                  }
                }}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Refresh Substack Feeds"
              >
                <Rss className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={() => {
                  const sources = substackService.getSources();
                  const enabledSources = sources.filter(s => s.enabled);
                  console.log('Current Substack sources:', sources);
                  console.log('Enabled sources:', enabledSources);
                  alert(`Substack Debug:\nTotal sources: ${sources.length}\nEnabled sources: ${enabledSources.length}\n\nCheck console for details.`);
                }}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Debug Substack Sources"
              >
                <Settings className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={async () => {
                  const testUrl = 'https://notboring.substack.com/feed';
                  const isWorking = await substackService.testCORSExtension(testUrl);
                  if (isWorking) {
                    alert('✅ CORS extension is working! RSS feeds should now load properly.');
                  } else {
                    substackService.startLocalProxy();
                    alert('❌ CORS extension not working. Check console for setup instructions.');
                  }
                }}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Test CORS Extension"
              >
                <Wrench className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={onToggle}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Close Feed Controls"
              >
                <X className="w-4 h-4 glass-text-primary" />
              </button>
            </div>
          </div>
          
          {/* Floating Title Bubble - Half On/Half Off */}
          <div className={`absolute -top-8 left-4 z-50 transition-all duration-300 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}>
            <div className="glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 shadow-lg backdrop-blur-xl">
              <h3 className="text-sm font-medium glass-text-primary">Feed Controls</h3>
            </div>
          </div>

          {/* Main Controls Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2">
            {/* Feed Source Selector */}
            {(auth.isAuthenticated || blueskyAuth.isAuthenticated) && (
              <div className="flex flex-col">
                <div className="flex items-center gap-1 glass-subtle rounded-lg p-1">
                  <button
                    onClick={() => toggleFeedSource('mastodon')}
                    disabled={!auth.isAuthenticated}
                    className={`p-2 rounded-md transition-colors flex items-center gap-1.5 ${
                      appState.activeFeedSources.mastodon && auth.isAuthenticated
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : auth.isAuthenticated
                        ? 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    title={auth.isAuthenticated ? "Toggle Mastodon feed" : "Connect to Mastodon first"}
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">Mastodon</span>
                  </button>
                  <button
                    onClick={() => toggleFeedSource('bluesky')}
                    disabled={!blueskyAuth.isAuthenticated}
                    className={`p-2 rounded-md transition-colors flex items-center gap-1.5 ${
                      appState.activeFeedSources.bluesky && blueskyAuth.isAuthenticated
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : blueskyAuth.isAuthenticated
                        ? 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                    title={blueskyAuth.isAuthenticated ? "Toggle Bluesky feed" : "Connect to Bluesky first"}
                  >
                    <div className="w-4 h-4 bg-current rounded-sm flex items-center justify-center">
                      <span className="text-xs font-bold text-current">BS</span>
                    </div>
                    <span className="text-xs font-medium hidden sm:inline">Bluesky</span>
                  </button>
                  <button
                    onClick={() => toggleFeedSource('substack')}
                    className={`p-2 rounded-md transition-colors flex items-center gap-1.5 ${
                      appState.activeFeedSources.substack
                        ? 'bg-orange-600 text-white shadow-sm' 
                        : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                    }`}
                    title={`Toggle Substack feed (${substackSources.filter(s => s.enabled).length} sources)`}
                  >
                    <Rss className="w-4 h-4" />
                    <span className="text-xs font-medium hidden sm:inline">Substack</span>
                  </button>
                </div>
                <span className="text-xs glass-text-muted mt-1">Feed Source</span>
              </div>
            )}
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
                  className="w-36 sm:w-48 px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="mastodon.social"
              />
              <span className="text-xs glass-text-muted mt-1">Instance</span>
            </div>

            {/* Sort & Filter */}
            <div className="flex flex-col">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                <option value="all">All</option>
                <option value="with_media">Media</option>
                <option value="with_hashtags">Tags</option>
              </select>
              <span className="text-xs glass-text-muted mt-1">Filter</span>
            </div>

          </div>

          {/* Data Controls Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
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
                      className="w-16 sm:w-20 px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                      className="w-16 sm:w-20 px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
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
                <button
                  onClick={() => setDisplayMode('focused')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'focused'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Focused Feed (Facebook/Twitter Style)"
                >
                  <Focus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDisplayMode('tiktok')}
                  className={`p-2 rounded-md transition-colors ${
                    displayMode === 'tiktok'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="TikTok Style (Vertical Feed)"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs glass-text-muted mt-1">Layout</span>
            </div>

            {/* Algorithm Selection */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 glass-subtle rounded-lg p-1">
                <button
                  onClick={() => handleAlgorithmChange('latest')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'latest'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Latest Posts"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('trending')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'trending'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Trending Posts"
                >
                  <TrendingUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('diverse')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'diverse'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Diverse Mix"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('balanced')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'balanced'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Balanced Selection"
                >
                  <Target className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('viral')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'viral'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Viral Posts (High Engagement Rate)"
                >
                  <Zap className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('fresh')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'fresh'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Fresh Posts (Recent + Engagement)"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('media_rich')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'media_rich'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Media Rich Posts"
                >
                  <Image className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('conversational')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'conversational'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Conversational Posts (Questions, Polls, Replies)"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('following')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'following'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Posts from People You Follow"
                >
                  <Users className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAlgorithmChange('random')}
                  className={`p-2 rounded-md transition-colors ${
                    currentAlgorithm === 'random'
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
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Live Feed Toggle */}
            <div className="flex flex-col">
              <button
                onClick={() => setIsLiveFeed(!isLiveFeed)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-lg transition-colors ${
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
                    className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
      </div>
    </>
  );
};

export default Footer;
