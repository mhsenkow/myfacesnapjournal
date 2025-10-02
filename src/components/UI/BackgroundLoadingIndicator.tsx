/**
 * Background Loading Indicator for MyFace SnapJournal
 * 
 * Shows subtle loading indicators when feeds are loading in the background
 */

import React, { useState, useEffect } from 'react';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useLocation } from 'react-router-dom';

const BackgroundLoadingIndicator: React.FC = () => {
  const { auth, isLoadingPosts, isLiveFeed, posts, allPosts } = useMastodonStore();
  const location = useLocation();
  const [showIndicator, setShowIndicator] = useState(false);

  // Only show indicator when:
  // 1. User is authenticated
  // 2. Feed is loading
  // 3. User is NOT on the feed page
  // 4. We have some posts to show progress
  useEffect(() => {
    const shouldShow = auth.isAuthenticated && 
                      isLoadingPosts && 
                      location.pathname !== '/feed' &&
                      (posts.length > 0 || allPosts.length > 0);

    setShowIndicator(shouldShow);
  }, [auth.isAuthenticated, isLoadingPosts, location.pathname, posts.length, allPosts.length]);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <div className="glass-subtle rounded-lg p-3 shadow-lg border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center gap-3">
          {/* Loading Spinner */}
          <div className="relative">
            <Loader2 className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
            {isLiveFeed && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Status Text */}
          <div className="flex flex-col">
            <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {isLiveFeed ? 'Live Feed' : 'Feed Loading'}
            </span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {posts.length} posts ready
            </span>
          </div>

          {/* Connection Status */}
          <div className="flex items-center">
            {auth.isAuthenticated ? (
              <Wifi className="w-3 h-3 text-green-500" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-500" />
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
          <div 
            className="bg-purple-600 h-1 rounded-full transition-all duration-300"
            style={{ 
              width: allPosts.length > 0 ? `${Math.min((posts.length / allPosts.length) * 100, 100)}%` : '0%' 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BackgroundLoadingIndicator;
