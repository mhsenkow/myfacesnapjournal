/**
 * Mastodon Profile Info Component
 * 
 * Displays comprehensive Mastodon profile information including:
 * - Profile avatar, header, and basic info
 * - Followers/following count and post count
 * - Connection status and last activity
 * - Profile bio/note
 * - Instance information
 */

import React, { useState } from 'react';
import { Calendar, Users, MessageSquare, ExternalLink, Globe } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';

interface MastodonProfileInfoProps {
  showExtra?: boolean; // Whether to show extra details like bio, stats, etc.
}

const MastodonProfileInfo: React.FC<MastodonProfileInfoProps> = ({ showExtra = false }) => {
  const { auth } = useMastodonStore();
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [headerLoaded, setHeaderLoaded] = useState(false);

  if (!auth.isAuthenticated || !auth.user) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium mb-2">No Mastodon Connection</h3>
        <p className="text-sm">Connect to Mastodon to see your profile information</p>
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

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  // Clean HTML from bio (basic)
  const cleanBio = (bio: string) => {
    return bio
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
      .trim();
  };

  return (
    <div className="space-y-4">
      {/* Header Image */}
      {showExtra && user.header && (
        <div className="relative h-32 w-full overflow-hidden rounded-lg">
          {user.header_static || user.header ? (
            <img
              src={user.header_static || user.header}
              alt="Profile header"
              className="w-full h-full object-cover"
              onLoad={() => setHeaderLoaded(true)}
              style={{ display: headerLoaded ? 'block' : 'none' }}
            />
          ) : null}
          {!headerLoaded && (
            <div className="w-full h-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
              <Globe className="w-12 h-12 text-white opacity-50" />
            </div>
          )}
        </div>
      )}

      {/* Profile Info */}
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className="relative">
          {user.avatar_static || user.avatar ? (
            <img
              src={user.avatar_static || user.avatar}
              alt={user.display_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-lg"
              onLoad={() => setAvatarLoaded(true)}
              style={{ display: avatarLoaded ? 'block' : 'none' }}
            />
          ) : null}
          <div className={`w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white shadow-lg ${avatarLoaded ? 'hidden' : ''}`}>
            <span className="text-white text-2xl font-bold">
              {user.display_name ? user.display_name.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Main Info */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">
            {user.display_name || user.username}
          </h2>
          <p className="text-gray-600 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            @{user.acct}
          </p>
          
          {showExtra && (
            <div className="mt-2 text-sm text-gray-600">
              {user.locked && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 mb-2">
                  🔒 Protected Account
                </span>
              )}
              {user.bot && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mb-2">
                  🤖 Bot Account
                </span>
              )}
              {user.group && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mb-2">
                  👥 Group Account
                </span>
              )}
            </div>
          )}
        </div>

        {/* External Link */}
        <a
          href={user.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
          title="View profile on Mastodon"
        >
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>

      {/* Bio */}
      {showExtra && user.note && (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">
            {cleanBio(user.note)}
          </p>
        </div>
      )}

      {/* Stats */}
      {showExtra && (
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.statuses_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Posts
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.following_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              Following
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {user.followers_count.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
              <Users className="w-4 h-4" />
              Followers
            </div>
          </div>
        </div>
      )}

      {/* Account Details */}
      {showExtra && (
        <div className="space-y-3 pt-4 border-t border-gray-200 text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Joined {formatDate(user.created_at)}</span>
          </div>
          
          {user.last_status_at && (
            <div className="flex items-center gap-3 text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span>Last active {formatRelativeTime(user.last_status_at)}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3 text-gray-600">
            <Globe className="w-4 h-4" />
            <span>Instance: {auth.instance}</span>
          </div>

          {auth.lastAuthDate && (
            <div className="flex items-center gap-3 text-gray-600">
              <ExternalLink className="w-4 h-4" />
              <span>Connected {formatRelativeTime(auth.lastAuthDate.toISOString())}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MastodonProfileInfo;
