/**
 * Substack Integration Component
 * 
 * Provides UI for managing Substack RSS feed subscriptions
 */

import React, { useState, useEffect } from 'react';
import { Rss, Plus, Trash2, ExternalLink, Settings, CheckCircle, AlertCircle, TrendingUp, Star, Filter } from 'lucide-react';
import { substackService, SubstackSource, PopularSubstack } from '../../services/substackService';

const SubstackIntegration: React.FC = () => {
  const [sources, setSources] = useState<SubstackSource[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    enabled: true
  });

  useEffect(() => {
    loadSources();
  }, []);

  const loadSources = () => {
    const loadedSources = substackService.getSources();
    setSources(loadedSources);
  };

  const handleAddSource = () => {
    if (!newSource.name.trim() || !newSource.url.trim()) {
      alert('Please fill in both name and URL');
      return;
    }

    try {
      const rssUrl = substackService.extractRSSUrl(newSource.url);
      const source = substackService.addSource({
        name: newSource.name.trim(),
        rssUrl,
        enabled: newSource.enabled
      });

      console.log('Added Substack source:', source);
      
      // Reset form
      setNewSource({ name: '', url: '', enabled: true });
      setIsAdding(false);
      loadSources();
    } catch (error) {
      console.error('Error adding Substack source:', error);
      alert('Error adding source. Please check the URL and try again.');
    }
  };

  const handleToggleSource = (id: string) => {
    const source = sources.find(s => s.id === id);
    if (source) {
      substackService.updateSource(id, { enabled: !source.enabled });
      loadSources();
    }
  };

  const handleDeleteSource = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Substack source?')) {
      substackService.removeSource(id);
      loadSources();
    }
  };

  const handleRefreshAll = async () => {
    console.log('Refreshing all Substack feeds...');
    try {
      const posts = await substackService.fetchAllFeeds();
      if (posts.length === 0) {
        alert('No new posts found. Some feeds may be temporarily unavailable due to CORS restrictions. Try again later.');
      } else {
        alert(`Successfully refreshed feeds! Found ${posts.length} new posts.`);
      }
    } catch (error) {
      console.error('Error refreshing feeds:', error);
      alert('Error refreshing feeds. Some RSS feeds may be temporarily unavailable due to CORS restrictions. This is a known limitation when fetching external RSS feeds from a web browser.');
    }
  };

  const handleAddPopularNewsletter = (newsletter: PopularSubstack) => {
    try {
      substackService.addPopularNewsletter(newsletter);
      loadSources();
      alert(`Added ${newsletter.name} to your sources!`);
    } catch (error) {
      console.error('Error adding popular newsletter:', error);
      alert('Error adding newsletter. It may already be in your sources.');
    }
  };

  const getPopularNewsletters = () => {
    if (selectedCategory === 'All') {
      return substackService.getPopularNewsletters();
    }
    return substackService.getPopularNewsletters(selectedCategory);
  };

  const getCategories = () => {
    return ['All', ...substackService.getCategories()];
  };

  const isNewsletterAlreadyAdded = (newsletter: PopularSubstack) => {
    return sources.some(source => source.rssUrl === newsletter.rssUrl);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Rss className="w-5 h-5 text-orange-600" />
            Substack Integration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Subscribe to Substack newsletters and import their posts into your feed
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDiscovery(!showDiscovery)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            {showDiscovery ? 'Hide' : 'Discover'} Popular
          </button>
          <button
            onClick={handleRefreshAll}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Refresh All
          </button>
        </div>
      </div>

      {/* Add New Source */}
      <div className="glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Add Substack Source</h4>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isAdding && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Newsletter Name
              </label>
              <input
                type="text"
                value={newSource.name}
                onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., The Pragmatic Engineer"
                className="w-full px-3 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Substack URL
              </label>
              <input
                type="url"
                value={newSource.url}
                onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                placeholder="https://newsletter.substack.com"
                className="w-full px-3 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newSource.enabled}
                  onChange={(e) => setNewSource(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded border-neutral-300 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable immediately</span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  if (!newSource.url.trim()) {
                    alert('Please enter a URL first');
                    return;
                  }
                  
                  const rssUrl = substackService.extractRSSUrl(newSource.url);
                  const test = await substackService.testRSSFeed(rssUrl);
                  
                  if (test.success) {
                    alert(`✅ ${test.message}`);
                    handleAddSource();
                  } else {
                    alert(`❌ ${test.message}\n\nNote: RSS feeds may be temporarily unavailable due to CORS restrictions. You can still add the source and it will be checked when fetching feeds.`);
                    // Still allow adding the source even if test fails
                    handleAddSource();
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Test & Add
              </button>
              <button
                onClick={handleAddSource}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Add Source
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discovery Section */}
      {showDiscovery && (
        <div className="glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-4 h-4 text-purple-600" />
              Popular Substack Newsletters
            </h4>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1 text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {getCategories().map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getPopularNewsletters().map((newsletter) => (
              <div
                key={newsletter.rssUrl}
                className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                    {newsletter.name}
                    {newsletter.isPopular && (
                      <Star className="w-3 h-3 text-yellow-500 inline ml-1" />
                    )}
                  </h5>
                  <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-2 py-1 rounded">
                    {newsletter.category}
                  </span>
                </div>
                
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {newsletter.description}
                </p>
                
                {newsletter.subscribers && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                    {newsletter.subscribers} subscribers
                  </p>
                )}
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleAddPopularNewsletter(newsletter)}
                    disabled={isNewsletterAlreadyAdded(newsletter)}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors ${
                      isNewsletterAlreadyAdded(newsletter)
                        ? 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed'
                        : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                  >
                    {isNewsletterAlreadyAdded(newsletter) ? 'Added' : 'Add to Feed'}
                  </button>
                  <a
                    href={newsletter.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                    title="Visit newsletter"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sources List */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900 dark:text-white">
          Subscribed Sources ({sources.length})
        </h4>
        
        {sources.length === 0 ? (
          <div className="text-center py-8 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-xl">
            <Rss className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No Substack sources added yet</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Add your first Substack newsletter to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sources.map((source) => (
              <div
                key={source.id}
                className="glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-gray-900 dark:text-white">{source.name}</h5>
                      {source.enabled ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {source.rssUrl}
                    </p>
                    {source.lastFetched && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Last fetched: {new Date(source.lastFetched).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSource(source.id)}
                      className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                        source.enabled
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}
                    >
                      {source.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                    <a
                      href={source.rssUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                      title="Open RSS feed"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDeleteSource(source.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete source"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-xl p-4">
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">How to use:</h4>
        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
          <li>• Add Substack newsletter URLs to automatically import their posts</li>
          <li>• Posts will appear in your feed alongside Mastodon and Bluesky content</li>
          <li>• Use the toggle in the feed controls to enable/disable Substack content</li>
          <li>• Feeds are cached for 30 minutes to improve performance</li>
        </ul>
      </div>

      {/* CORS Limitations Notice */}
      <div className="glass-panel glass-subtle border border-orange-200 dark:border-orange-800 rounded-xl p-4 bg-orange-50 dark:bg-orange-900/20">
        <h4 className="font-medium text-orange-900 dark:text-orange-200 mb-2 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Important Note About RSS Feeds
        </h4>
        <div className="text-sm text-orange-800 dark:text-orange-300 space-y-2">
          <p>
            RSS feeds from external websites may sometimes fail to load due to CORS (Cross-Origin Resource Sharing) restrictions. 
            This is a browser security feature that prevents websites from accessing content from other domains.
          </p>
          <p>
            <strong>What this means:</strong> Some Substack newsletters may not load immediately, but they should work intermittently 
            as we try multiple proxy servers. The feeds will be checked again when you refresh.
          </p>
          <p>
            <strong>Workaround:</strong> Try adding multiple newsletters - some will work while others may be temporarily unavailable. 
            The system will automatically retry failed feeds on subsequent refreshes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubstackIntegration;
