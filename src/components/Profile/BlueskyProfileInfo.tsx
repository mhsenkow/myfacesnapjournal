/**
 * Bluesky Profile Info Component
 * 
 * Displays comprehensive Bluesky profile information including:
 * - Profile avatar and basic info
 * - Connection status and handle
 * - Profile bio/description
 */

import React, { useState } from 'react';
import { Calendar, ExternalLink, Globe } from 'lucide-react';
import { useBlueskyStore } from '../../stores/blueskyStore';

interface BlueskyProfileInfoProps {
  showExtra?: boolean;
}

const BlueskyProfileInfo: React.FC<BlueskyProfileInfoProps> = ({ showExtra = false }) => {
  const { auth } = useBlueskyStore();
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No Bluesky Connection</h3>
        <p className="text-sm">Connect to Bluesky to see your profile information</p>
      </div>
    );
  }

  const user = auth.user;
  
  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      {/* Profile Info */}
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName || user.handle}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
              onLoad={() => setAvatarLoaded(true)}
              onError={() => setAvatarLoaded(false)}
              style={{ display: avatarLoaded ? 'block' : 'none' }}
            />
          ) : null}
          <div className={`w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg ${avatarLoaded && user.avatar ? 'hidden' : ''}`}>
            <span className="text-white text-2xl font-bold">
              {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.handle.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Main Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {user.displayName || user.handle}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            @{user.handle}
          </p>
          
          {user.description && (
            <p className="text-gray-700 dark:text-gray-200 text-sm mt-2 leading-relaxed">
              {user.description}
            </p>
          )}
          
          {showExtra && user.createdAt && (
            <div className="flex items-center space-x-1 text-gray-500 text-sm mt-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(user.createdAt)}</span>
            </div>
          )}
        </div>

        {/* External Link */}
        <a
          href={`https://bsky.app/profile/${user.handle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="View profile on Bluesky"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Connection Status */}
      {showExtra && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-blue-800 dark:text-blue-200 text-sm font-medium">
              Connected to Bluesky
            </span>
          </div>
          <p className="text-blue-600 dark:text-blue-300 text-xs mt-1">
            Your Bluesky profile is integrated with MyFace SnapJournal
          </p>
        </div>
      )}
    </div>
  );
};

export default BlueskyProfileInfo;
