/**
 * Mastodon Import Component
 * 
 * Provides UI for Mastodon authentication and post import functionality
 */

import React, { useState, useEffect } from 'react';
import { Globe, Download, Settings, LogOut, AlertCircle, CheckCircle, Loader2, Eye, MessageSquare, Heart, Repeat2, Hash } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useJournalStore } from '../../stores/journalStore';
import MastodonLoginModal from './MastodonLoginModal';
import { MastodonPost } from '../../types/mastodon';
import { EntrySource } from '../../types/journal';

const MastodonImport: React.FC = () => {
  const {
    auth,
    importSettings,
    isImporting,
    importProgress,
    lastImportError,
    posts,
    isLoadingPosts,
    login,
    logout,
    checkAuthStatus,
    updateImportSettings,
    importPosts,
    fetchPosts,
    clearImportedPosts,
    setLastImportError
  } = useMastodonStore();

  const { createEntry } = useJournalStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPosts, setShowPosts] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Fetch posts when authenticated
  useEffect(() => {
    if (auth.isAuthenticated && posts.length === 0) {
      fetchPosts(10);
    }
  }, [auth.isAuthenticated, fetchPosts, posts.length]);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = async (authResponse: any) => {
    try {
      await login(authResponse);
      setShowLoginModal(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLoginError = (error: string) => {
    setLastImportError(error);
  };

  const handleImport = async () => {
    try {
      setLastImportError(undefined);
      const importedPosts = await importPosts(importSettings.importLimit);
      
      // Convert Mastodon posts to journal entries and add them
      for (const post of importedPosts) {
        try {
          const journalEntry = {
            title: generateTitle(post),
            content: stripHtml(post.content),
            tags: post.tags.map(tag => tag.name),
            mood: determineMood(post.content),
            privacy: post.visibility === 'public' ? 'public' : 'private' as 'public' | 'private' | 'secret',
            source: EntrySource.MASTODON,
            sourceId: post.id,
            sourceUrl: post.url,
            metadata: {
              instance: auth.instance,
              account: post.account.acct,
              displayName: post.account.display_name,
              avatar: post.account.avatar,
              reblogsCount: post.reblogs_count,
              favouritesCount: post.favourites_count,
              repliesCount: post.replies_count,
              mediaAttachments: post.media_attachments.map(media => media.url),
              createdAt: post.created_at,
              visibility: post.visibility,
              language: post.language,
              spoilerText: post.spoiler_text,
              sensitive: post.sensitive
            }
          };
          
          await createEntry(journalEntry);
        } catch (entryError) {
          console.error('Error creating journal entry:', entryError);
        }
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    clearImportedPosts();
    setShowPosts(false);
  };

  const handleRefreshPosts = async () => {
    await fetchPosts(20);
  };

  const generateTitle = (post: MastodonPost): string => {
    const cleanContent = stripHtml(post.content);
    const words = cleanContent.split(' ');
    
    if (words.length <= 6) {
      return cleanContent;
    }
    
    return words.slice(0, 6).join(' ') + '...';
  };

  const stripHtml = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const determineMood = (content: string): 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'grateful' => {
    const positiveWords = ['happy', 'joy', 'love', 'amazing', 'wonderful', 'great', 'awesome', 'excited', 'grateful', 'thankful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'depressed', 'tired'];
    const neutralWords = ['thinking', 'wondering', 'considering', 'reflecting'];
    
    const lowerContent = content.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    const neutralCount = neutralWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      if (lowerContent.includes('excited') || lowerContent.includes('awesome')) {
        return 'excited';
      }
      if (lowerContent.includes('grateful') || lowerContent.includes('thankful')) {
        return 'grateful';
      }
      return 'happy';
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      if (lowerContent.includes('anxious') || lowerContent.includes('worried')) {
        return 'anxious';
      }
      return 'sad';
    }
    
    return 'neutral';
  };


  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Mastodon Integration</h3>
        </div>
        {auth.isAuthenticated && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Authentication Status */}
      {auth.isAuthenticated ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Connected as {auth.user?.display_name} (@{auth.user?.acct})
                </p>
                <p className="text-xs text-green-600">
                  Instance: {auth.instance} • Last connected: {auth.lastAuthDate instanceof Date ? auth.lastAuthDate.toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Not connected to Mastodon
              </p>
              <p className="text-xs text-gray-600">
                Connect to import your Mastodon posts as journal entries
              </p>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Globe className="w-4 h-4" />
            Connect to Mastodon
          </button>
        </div>
      )}

      {/* Import Settings */}
      {showSettings && auth.isAuthenticated && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Import Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Limit
              </label>
              <input
                type="number"
                value={importSettings.importLimit}
                onChange={(e) => updateImportSettings({ importLimit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Import (hours)
              </label>
              <input
                type="number"
                value={importSettings.importInterval}
                onChange={(e) => updateImportSettings({ importInterval: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                min="1"
                max="168"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.includeReplies}
                onChange={(e) => updateImportSettings({ includeReplies: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include replies</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.includeReblogs}
                onChange={(e) => updateImportSettings({ includeReblogs: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include reblogs</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.includeMedia}
                onChange={(e) => updateImportSettings({ includeMedia: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include media attachments</span>
            </label>
          </div>
        </div>
      )}

      {/* Import Actions */}
      {auth.isAuthenticated && (
        <div className="space-y-3">
          {isImporting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Importing posts...</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {lastImportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{lastImportError}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isImporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isImporting ? 'Importing...' : 'Import Posts'}
            </button>

            <button
              onClick={() => setShowPosts(!showPosts)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4" />
              {showPosts ? 'Hide' : 'Preview'}
            </button>

            <button
              onClick={handleRefreshPosts}
              disabled={isLoadingPosts}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              <Loader2 className={`w-4 h-4 ${isLoadingPosts ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      )}

      {/* Posts Preview */}
      {showPosts && auth.isAuthenticated && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Recent Posts</h4>
          
          {isLoadingPosts ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-600">Loading posts...</span>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No posts found</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts.slice(0, 10).map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={post.account.avatar}
                      alt={post.account.display_name}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{post.account.display_name}</span>
                        <span className="text-gray-500">@{post.account.acct}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500 text-sm">{formatRelativeTime(post.created_at)}</span>
                      </div>
                      
                      <div className="text-gray-800 text-sm mb-2">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                      </div>
                      
                      {/* Post Stats */}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {post.replies_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Repeat2 className="w-3 h-3" />
                          {post.reblogs_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.favourites_count}
                        </div>
                        {post.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Hash className="w-3 h-3" />
                            {post.tags.length}
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag.name}
                              className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Last Import Info */}
      {importSettings.lastImportDate && (
        <div className="text-xs text-gray-500 text-center">
          Last import: {importSettings.lastImportDate instanceof Date ? importSettings.lastImportDate.toLocaleString() : 'Unknown'}
        </div>
      )}

      {/* Login Modal */}
      <MastodonLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </div>
  );
};

export default MastodonImport;
