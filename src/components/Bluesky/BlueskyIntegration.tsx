/**
 * Bluesky Integration Component for Settings Page
 * 
 * Similar to MastodonImport but for Bluesky integration
 */

import React, { useState } from 'react';
import { ExternalLink, LogOut, RefreshCw, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import { useBlueskyStore } from '../../stores/blueskyStore';
import BlueskyLoginModal from './BlueskyLoginModal';

const BlueskyIntegration: React.FC = () => {
  const { 
    auth, 
    posts, 
    isLoading, 
    error,
    refreshFeed,
    logout 
  } = useBlueskyStore();
  
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleConnect = () => {
    setIsLoginModalOpen(true);
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect from Bluesky?')) {
      logout();
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshFeed();
    } catch (error) {
      console.error('Failed to refresh Bluesky feed:', error);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">BS</span>
        </div>
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Bluesky Integration</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Connect your Bluesky account to import posts and interact with your timeline
          </p>
        </div>
      </div>

      {/* Connection Status */}
      {auth.isAuthenticated ? (
        <div className="space-y-4">
          {/* Connected Status */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Connected as {auth.session?.handle}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Connected to Bluesky • {posts.length} posts available
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                >
                  {isLoading ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Refresh
                </button>
                <button
                  onClick={handleDisconnect}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Disconnect
                </button>
              </div>
            </div>
          </div>

          {/* Feed Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {posts.length}
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Posts Loaded</div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Timeline
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Feed Type</div>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3 text-center">
              <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Live
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400">Status</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                // Navigate to feed page
                window.location.href = '/feed';
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Feed
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Not Connected */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Not connected to Bluesky
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400">
                  Connect your account to import posts and interact with your timeline
                </p>
              </div>
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleConnect}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <span className="text-blue-600 font-bold text-xs">BS</span>
            </div>
            Connect to Bluesky
          </button>

          {/* Help Text */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            You'll need your Bluesky handle and an app password. 
            <a 
              href="https://bsky.app/settings/app-passwords" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-1"
            >
              Learn how to create an app password
              <ExternalLink className="w-3 h-3 inline ml-1" />
            </a>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">Error</p>
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <BlueskyLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default BlueskyIntegration;
