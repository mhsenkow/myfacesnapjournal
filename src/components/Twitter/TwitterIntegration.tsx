/**
 * Twitter Integration Component for Settings Page
 * 
 * Handles Twitter/X API authentication and feed management
 */

import React, { useState, useEffect } from 'react';
import { Twitter, LogOut, RefreshCw, CheckCircle, AlertCircle, Download, Loader2, Key } from 'lucide-react';
import { useTwitterStore } from '../../stores/twitterStore';
import { useNotificationStore } from '../../stores/notificationStore';

const TwitterIntegration: React.FC = () => {
  const { 
    auth, 
    posts, 
    allPosts,
    isLoading, 
    error,
    refreshFeed,
    login,
    logout,
    restoreSession 
  } = useTwitterStore();
  
  const { notifyGeneral } = useNotificationStore();
  const [bearerToken, setBearerToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  useEffect(() => {
    // Try to restore session on mount
    if (!auth.isAuthenticated) {
      restoreSession();
    }
  }, [auth.isAuthenticated, restoreSession]);

  const handleConnect = async () => {
    if (!bearerToken.trim()) {
      notifyGeneral('error', 'Token Required', 'Please enter your Twitter Bearer Token');
      return;
    }

    try {
      await login(bearerToken);
      setBearerToken('');
      setShowTokenInput(false);
      notifyGeneral('success', 'Connected', 'Successfully connected to Twitter/X');
    } catch (error) {
      console.error('Twitter login error:', error);
      notifyGeneral('error', 'Connection Failed', error instanceof Error ? error.message : 'Failed to connect to Twitter');
    }
  };

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect from Twitter/X?')) {
      logout();
      notifyGeneral('info', 'Disconnected', 'Disconnected from Twitter/X');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshFeed();
      notifyGeneral('success', 'Feed Refreshed', 'Twitter feed updated successfully');
    } catch (error) {
      console.error('Failed to refresh Twitter feed:', error);
      notifyGeneral('error', 'Refresh Failed', 'Failed to refresh Twitter feed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
          <Twitter className="w-5 h-5 text-white" />
        </div>
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">Twitter/X Integration</h4>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Connect your Twitter/X account using a Bearer Token
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
                  Connected as {auth.user?.username || 'Twitter User'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Connected to Twitter/X • {posts.length} posts available
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh Feed
            </button>
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Instructions */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Key className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  Get Your Twitter Bearer Token
                </p>
                <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Twitter Developer Portal</a></li>
                  <li>Create a new app or use an existing one</li>
                  <li>Navigate to "Keys and tokens" tab</li>
                  <li>Copy your "Bearer Token"</li>
                  <li>Paste it below and click Connect</li>
                </ol>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  Note: Free tier allows read-only access. Write operations require paid API access.
                </p>
              </div>
            </div>
          </div>

          {/* Token Input */}
          {showTokenInput ? (
            <div className="space-y-2">
              <input
                type="password"
                value={bearerToken}
                onChange={(e) => setBearerToken(e.target.value)}
                placeholder="Enter your Bearer Token"
                className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleConnect();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleConnect}
                  disabled={isLoading || !bearerToken.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowTokenInput(false);
                    setBearerToken('');
                  }}
                  className="px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowTokenInput(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Connect to Twitter/X
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TwitterIntegration;

