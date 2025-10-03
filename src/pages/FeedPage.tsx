/**
 * Feed Page Component - Mastodon Social Feed Integration
 * 
 * This is the crown jewel of MyFace SnapJournal - a sophisticated social feed browser
 * that transforms Mastodon's public and local timelines into beautiful, interactive experiences.
 * 
 * 🎯 **Key Features:**
 * - OAuth authentication with any Mastodon instance
 * - 5 distinct display modes (Refined, Cards, Instagram, DataViz, Dense)
 * - Real-time image loading and media display
 * - Smart pagination (up to 10,000 posts)
 * - Advanced filtering and search capabilities
 * - Visual pattern encoding for data visualization
 * - Glass morphism UI with theme-aware styling
 * 
 * 🔧 **Technical Implementation:**
 * - Zustand store for state management
 * - Paginated API calls with error handling
 * - Responsive grid layouts with CSS Grid
 * - Image lazy loading with fallback handling
 * - Scroll-based animations and hover effects
 * - TypeScript type safety throughout
 * 
 * 📊 **Display Modes:**
 * 1. **Refined**: Elegant cards with enhanced typography
 * 2. **Cards**: Responsive grid with compact info
 * 3. **Instagram**: Square images with engagement overlays
 * 4. **DataViz**: Compact pills with visual pattern encoding
 * 5. **Dense**: Ultra-compact layout for power users
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Rss, 
  Heart,
  MessageCircle,
  Repeat2,
  Clock,
  User,
  Hash,
  EyeOff,
  RefreshCw,
  Image,
  BarChart3,
  AtSign,
  Lock,
  Globe,
  Bookmark,
  Search
} from 'lucide-react';
import { useMastodonStore } from '../stores/mastodonStore';
import { useBlueskyStore } from '../stores/blueskyStore';
import { useApp } from '../contexts/AppContext';
import { MastodonPost } from '../types/mastodon';
import PostInspector from '../components/UI/PostInspector';

// Feed Layout Component
interface FeedLayoutProps {
  posts: MastodonPost[];
  displayMode: 'cards' | 'instagram' | 'dataviz' | 'dense' | 'refined' | 'focused';
  isScrolling: boolean;
  formatContent: (content: string) => string;
  formatRelativeTime: (dateString: string) => string;
  getPostAnimationClass: (postId: string, currentIndex: number) => string;
  toggleLike: (postId: string) => Promise<void>;
  toggleBookmark: (postId: string) => Promise<void>;
  onInspectPost: (post: any) => void;
}

const FeedLayout: React.FC<FeedLayoutProps> = ({ 
  posts, 
  displayMode, 
  isScrolling, 
  formatContent, 
  formatRelativeTime,
  getPostAnimationClass,
  toggleLike,
  toggleBookmark,
  onInspectPost
}) => {
  // Helper function to render platform badge
  const renderPlatformBadge = (post: any) => {
    const isBluesky = post.url?.includes('bsky.app');
    if (isBluesky) {
      return (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 z-10">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>Bluesky</span>
        </div>
      );
    } else {
      return (
        <div className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1 z-10">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          <span>Mastodon</span>
        </div>
      );
    }
  };

  // Helper function to get platform-specific border classes
  const getPlatformBorderClasses = (post: any) => {
    const isBluesky = post.url?.includes('bsky.app');
    return isBluesky 
      ? 'border-blue-300 dark:border-blue-600' 
      : 'border-purple-300 dark:border-purple-600';
  };
  // Refined Layout (Default)
  if (displayMode === 'refined') {
    return (
      <div className="space-y-6">
        {posts.map((post, index) => (
          <div key={`${post.url?.includes('bsky.app') ? 'bluesky' : 'mastodon'}-${post.id}`} className={`glass-subtle border ${getPlatformBorderClasses(post)} rounded-xl p-6 hover:glass transition-all duration-500 hover:scale-[1.02] hover:shadow-xl relative ${getPostAnimationClass(post.id, index)}`}>
            {/* Platform Badge */}
            {renderPlatformBadge(post)}
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                {post.account.avatar ? (
                  <img
                    src={post.account.avatar}
                    alt={post.account.display_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center ${post.account.avatar ? 'hidden' : ''}`}>
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`font-semibold text-primary scroll-animate ${
                    isScrolling ? 'bounce-on-scroll' : ''
                  }`}>{post.account.display_name}</span>
                  <span className="text-muted-custom">@{post.account.username}</span>
                  <span className="text-muted-custom">·</span>
                  <span className="text-muted-custom flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(post.created_at)}
                  </span>
                </div>
                
                <p className={`text-secondary scroll-animate leading-relaxed ${
                  isScrolling ? 'bounce-on-scroll' : ''
                } mb-4 whitespace-pre-wrap`}>
                  {formatContent(post.content)}
                </p>
                
                {/* Hashtags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span key={tag.name} className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full shadow-sm">
                        <Hash className="w-3 h-3" />
                        {tag.name}
                      </span>
                    ))}
                  </div>
                )}
                
                {/* Media */}
                {post.media_attachments && post.media_attachments.length > 0 && (
                  <div className="mb-4">
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mb-2 flex items-center gap-1">
                      <Image className="w-4 h-4" />
                      {post.media_attachments.length} media attachment{post.media_attachments.length > 1 ? 's' : ''}
                    </div>
                  </div>
                )}
                
                {/* Actions */}
                <div className="flex items-center gap-6 text-neutral-500 dark:text-neutral-400 flex-wrap">
                  {/* Core Engagement */}
                  <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors group">
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{post.replies_count}</span>
                  </button>
                  <button className="flex items-center gap-1.5 hover:text-green-600 transition-colors group">
                    <Repeat2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-medium">{post.reblogs_count}</span>
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('💖 Like button clicked for post:', post.id);
                      toggleLike(post.id);
                    }}
                    className={`post-action-button flex items-center gap-1.5 transition-colors group ${
                      post.favourited 
                        ? 'text-red-600 heart-liked' 
                        : 'text-neutral-500 dark:text-neutral-400 hover:text-red-600'
                    }`}
                  >
                    <Heart 
                      className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                        post.favourited ? 'fill-current' : ''
                      }`} 
                    />
                    <span className="text-sm font-medium">{post.favourites_count}</span>
                  </button>
                      <button 
                        onClick={() => toggleBookmark(post.id)}
                        className={`post-action-button flex items-center gap-1.5 transition-colors group ${
                          post.bookmarked 
                            ? 'text-yellow-600 bookmark-saved' 
                            : 'text-neutral-500 dark:text-neutral-400 hover:text-yellow-600'
                        }`}
                      >
                        <Bookmark 
                          className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                            post.bookmarked ? 'fill-current' : ''
                          }`} 
                        />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onInspectPost(post);
                        }}
                        className="post-action-button flex items-center gap-1.5 transition-colors group text-neutral-500 dark:text-neutral-400 hover:text-blue-600"
                        title="Inspect post details"
                      >
                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      </button>
                  
                  {/* Content Indicators */}
                  {post.media_attachments.length > 0 && (
                    <div className="flex items-center gap-1.5 text-purple-500">
                      <Image className="w-4 h-4" />
                      <span className="text-sm font-medium">{post.media_attachments.length}</span>
                    </div>
                  )}
                  {post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 text-blue-500">
                      <Hash className="w-4 h-4" />
                      <span className="text-sm font-medium">{post.tags.length}</span>
                    </div>
                  )}
                  {post.poll && (
                    <div className="flex items-center gap-1.5 text-orange-500">
                      <BarChart3 className="w-4 h-4" />
                      <span className="text-sm font-medium">{post.poll.votes_count}</span>
                    </div>
                  )}
                  {post.mentions.length > 0 && (
                    <div className="flex items-center gap-1.5 text-cyan-500">
                      <AtSign className="w-4 h-4" />
                      <span className="text-sm font-medium">{post.mentions.length}</span>
                    </div>
                  )}
                  
                  {/* Status Indicators */}
                  {post.sensitive && (
                    <div className="flex items-center gap-1.5 text-yellow-600">
                      <EyeOff className="w-4 h-4" />
                      <span className="text-sm">CW</span>
                    </div>
                  )}
                  {post.visibility !== 'public' && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      {post.visibility === 'unlisted' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Card Layout
  if (displayMode === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <div key={`${post.url?.includes('bsky.app') ? 'bluesky' : 'mastodon'}-${post.id}`} className={`glass border ${getPlatformBorderClasses(post)} rounded-2xl p-6 hover:glass-strong sequence-animate transition-all duration-300 hover:scale-105 hover:shadow-2xl group relative ${getPostAnimationClass(post.id, index)}`}
               style={{ animationDelay: `${index * 50}ms` }}>
            {/* Platform Badge */}
            {renderPlatformBadge(post)}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md overflow-hidden">
                {post.account.avatar ? (
                  <img
                    src={post.account.avatar}
                    alt={post.account.display_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center ${post.account.avatar ? 'hidden' : ''}`}>
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-primary truncate">{post.account.display_name}</div>
                <div className="text-sm text-muted-custom">@{post.account.username}</div>
              </div>
              <div className="text-xs text-muted-custom">
                {formatRelativeTime(post.created_at)}
              </div>
            </div>
            
            <p className="text-secondary mb-4 line-clamp-4 leading-relaxed">
              {formatContent(post.content)}
            </p>
            
            {/* Hashtags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {post.tags.slice(0, 3).map((tag) => (
                  <span key={tag.name} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    <Hash className="w-3 h-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-3 text-neutral-500 dark:text-neutral-400 flex-wrap">
                {/* Core Engagement */}
                <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span className="text-sm">{post.replies_count}</span>
                </button>
                <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                  <Repeat2 className="w-4 h-4" />
                  <span className="text-sm">{post.reblogs_count}</span>
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('💖 Cards like button clicked for post:', post.id);
                    toggleLike(post.id);
                  }}
                  className={`post-action-button flex items-center gap-1 transition-colors ${
                    post.favourited 
                      ? 'text-red-600 heart-liked' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-red-600'
                  }`}
                >
                  <Heart 
                    className={`w-4 h-4 ${post.favourited ? 'fill-current' : ''}`} 
                  />
                  <span className="text-sm">{post.favourites_count}</span>
                </button>
                <button 
                  onClick={() => toggleBookmark(post.id)}
                  className={`post-action-button flex items-center gap-1 transition-colors ${
                    post.bookmarked 
                      ? 'text-yellow-600 bookmark-saved' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-yellow-600'
                  }`}
                >
                  <Bookmark 
                    className={`w-4 h-4 ${post.bookmarked ? 'fill-current' : ''}`} 
                  />
                </button>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onInspectPost(post);
                  }}
                  className="post-action-button flex items-center gap-1 transition-colors text-neutral-500 dark:text-neutral-400 hover:text-blue-600"
                  title="Inspect post details"
                >
                  <Search className="w-4 h-4" />
                </button>
                
                {/* Content Indicators */}
                {post.media_attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-purple-500">
                    <Image className="w-4 h-4" />
                    <span className="text-sm">{post.media_attachments.length}</span>
                  </div>
                )}
                {post.poll && (
                  <div className="flex items-center gap-1 text-orange-500">
                    <BarChart3 className="w-4 h-4" />
                    <span className="text-sm">{post.poll.votes_count}</span>
                  </div>
                )}
                {post.mentions.length > 0 && (
                  <div className="flex items-center gap-1 text-cyan-500">
                    <AtSign className="w-4 h-4" />
                    <span className="text-sm">{post.mentions.length}</span>
                  </div>
                )}
                
                {/* Status Indicators */}
                {post.sensitive && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <EyeOff className="w-4 h-4" />
                    <span className="text-sm">CW</span>
                  </div>
                )}
                {post.visibility !== 'public' && (
                  <div className="flex items-center gap-1 text-gray-500">
                    {post.visibility === 'unlisted' ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Instagram Layout
  if (displayMode === 'instagram') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posts.map((post, index) => (
          <div key={`${post.url?.includes('bsky.app') ? 'bluesky' : 'mastodon'}-${post.id}`} className={`glass border ${getPlatformBorderClasses(post)} rounded-xl overflow-hidden hover:glass-strong transition-all duration-300 hover:scale-105 group relative ${getPostAnimationClass(post.id, index)}`}>
            {/* Platform Badge */}
            {renderPlatformBadge(post)}
            {/* Media Display - Square aspect ratio */}
            <div className="aspect-square bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 relative overflow-hidden">
              {post.media_attachments && post.media_attachments.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Main Image */}
                  <img 
                    src={post.media_attachments[0].preview_url || post.media_attachments[0].url}
                    alt={post.media_attachments[0].description || 'Post media'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  
                  {/* Fallback placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 hidden">
                    <div className="text-white text-center">
                      <Image className="w-12 h-12 mx-auto mb-2" />
                      <div className="text-sm font-medium">{post.media_attachments.length} media</div>
                    </div>
                  </div>
                  
                  {/* Multiple media indicator */}
                  {post.media_attachments.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full font-medium">
                      +{post.media_attachments.length - 1}
                    </div>
                  )}
                  
                  {/* Media type indicator */}
                  {post.media_attachments[0].type === 'video' && (
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Video
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-center">
                    {post.account.avatar ? (
                      <img
                        src={post.account.avatar}
                        alt={post.account.display_name}
                        className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-white shadow-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${post.account.avatar ? 'hidden' : ''}`}>
                      <User className="w-12 h-12 mx-auto mb-2" />
                    </div>
                    <div className="text-sm font-medium">{post.account.display_name}</div>
                  </div>
                </div>
              )}
              
              {/* Overlay gradient with interactive engagement stats */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-3 w-full">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(post.id);
                        }}
                        className={`post-action-button flex items-center gap-1 transition-colors group ${
                          post.favourited 
                            ? 'text-red-400 heart-liked' 
                            : 'text-white hover:text-red-400'
                        }`}
                        title={post.favourited ? 'Unlike' : 'Like'}
                      >
                        <Heart 
                          className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                            post.favourited ? 'fill-current' : ''
                          }`}
                        />
                        <span className="text-sm font-medium">{post.favourites_count}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.replies_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Repeat2 className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.reblogs_count}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(post.id);
                      }}
                      className={`post-action-button p-1 rounded transition-colors group ${
                        post.bookmarked 
                          ? 'text-yellow-400 bookmark-saved' 
                          : 'text-white hover:text-yellow-400'
                      }`}
                      title={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
                    >
                      <Bookmark 
                        className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                          post.bookmarked ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {post.account.avatar ? (
                    <img
                      src={post.account.avatar}
                      alt={post.account.display_name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center ${post.account.avatar ? 'hidden' : ''}`}>
                    <User className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-primary text-sm truncate">{post.account.display_name}</div>
                </div>
              </div>
              
              <p className="text-secondary text-sm line-clamp-3 leading-relaxed">
                {formatContent(post.content)}
              </p>
              
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Data Visualization Layout - Compact Pills with Visual Patterns
  if (displayMode === 'dataviz') {
    return (
      <div className="flex flex-wrap gap-1">
        {posts.map((post, index) => {
          const totalEngagement = post.favourites_count + post.reblogs_count + post.replies_count;
          const hasMedia = post.media_attachments && post.media_attachments.length > 0;
          const hasHashtags = post.tags && post.tags.length > 0;
          const contentLength = post.content.length;
          
          // Visual encoding based on post characteristics
          const getEngagementColor = (engagement: number) => {
            if (engagement >= 50) return 'from-red-400 to-pink-500'; // High engagement
            if (engagement >= 20) return 'from-orange-400 to-yellow-500'; // Medium engagement
            if (engagement >= 5) return 'from-blue-400 to-cyan-500'; // Low engagement
            return 'from-gray-400 to-gray-500'; // Very low engagement
          };
          
          const getBorderRadius = (length: number) => {
            if (length > 200) return 'rounded-none'; // Long posts = sharp corners
            if (length > 100) return 'rounded-lg'; // Medium posts = normal corners
            return 'rounded-full'; // Short posts = pill shape
          };
          
          const getIcon = () => {
            if (hasMedia && hasHashtags) return <Image className="w-3 h-3" />;
            if (hasMedia) return <Image className="w-3 h-3" />;
            if (hasHashtags) return <Hash className="w-3 h-3" />;
            if (contentLength > 200) return <MessageCircle className="w-3 h-3" />;
            return <User className="w-3 h-3" />;
          };
          
          const getSize = (engagement: number) => {
            if (engagement >= 50) return 'px-4 py-2 text-sm'; // Large for high engagement
            if (engagement >= 20) return 'px-3 py-1.5 text-xs'; // Medium
            return 'px-2 py-1 text-xs'; // Small for low engagement
          };
          
          return (
            <div 
              key={`${post.url?.includes('bsky.app') ? 'bluesky' : 'mastodon'}-${post.id}`} 
              className={`
                relative glass-subtle border border-neutral-200 dark:border-neutral-700 
                ${getBorderRadius(contentLength)} ${getSize(totalEngagement)}
                hover:glass transition-all duration-300 hover:scale-105 
                bg-gradient-to-r ${getEngagementColor(totalEngagement)}
                text-white shadow-md hover:shadow-lg
                cursor-pointer group ${getPostAnimationClass(post.id, index)}
              `}
              title={`${post.account.display_name}: ${formatContent(post.content).substring(0, 100)}...`}
            >
              <div className="flex items-center gap-2">
                {/* Icon based on content type */}
                <div className="flex-shrink-0">
                  {getIcon()}
                </div>
                
                {/* Username (truncated) */}
                <span className="font-medium truncate max-w-20">
                  {post.account.display_name}
                </span>
                
                {/* Interactive engagement indicator */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {totalEngagement > 0 && (
                    <>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(post.id);
                        }}
                        className={`post-action-button flex items-center gap-1 transition-colors group ${
                          post.favourited 
                            ? 'text-red-200 hover:text-red-100' 
                            : 'text-white hover:text-red-200'
                        }`}
                        title={post.favourited ? 'Unlike' : 'Like'}
                      >
                        <Heart 
                          className={`w-2 h-2 group-hover:scale-125 transition-transform ${
                            post.favourited ? 'fill-current' : ''
                          }`}
                        />
                        <span className="text-xs font-bold">
                          {post.favourites_count}
                        </span>
                      </button>
                    </>
                  )}
                  {!totalEngagement && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(post.id);
                      }}
                      className={`post-action-button p-1 rounded transition-colors group ${
                        post.favourited 
                          ? 'text-red-200 hover:text-red-100' 
                          : 'text-white hover:text-red-200'
                      }`}
                      title={post.favourited ? 'Unlike' : 'Like'}
                    >
                      <Heart 
                        className={`w-2 h-2 group-hover:scale-125 transition-transform ${
                          post.favourited ? 'fill-current' : ''
                        }`}
                      />
                    </button>
                  )}
                </div>
                
                {/* Content type indicators */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {hasMedia && (
                    <div className="w-1 h-1 bg-white rounded-full opacity-60" title="Has media"></div>
                  )}
                  {hasHashtags && (
                    <div className="w-1 h-1 bg-white rounded-full opacity-60" title="Has hashtags"></div>
                  )}
                </div>
              </div>
              
              {/* Hover tooltip with full content */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                            bg-neutral-900 text-white text-xs rounded-lg px-3 py-2 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-200
                            pointer-events-none whitespace-nowrap z-10 max-w-xs">
                <div className="font-medium mb-1">{post.account.display_name}</div>
                <div className="text-neutral-300 line-clamp-2">
                  {formatContent(post.content)}
                </div>
                <div className="flex items-center gap-2 mt-1 text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {post.favourites_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Repeat2 className="w-3 h-3" />
                    {post.reblogs_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {post.replies_count}
                  </span>
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                              border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Dense Grid Layout
  if (displayMode === 'dense') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {posts.map((post, index) => (
          <div key={`${post.url?.includes('bsky.app') ? 'bluesky' : 'mastodon'}-${post.id}`} className={`glass-subtle border ${getPlatformBorderClasses(post)} rounded-lg p-3 hover:glass transition-all duration-200 hover:scale-[1.02] group relative ${getPostAnimationClass(post.id, index)}`}>
            {/* Platform Badge */}
            {renderPlatformBadge(post)}
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                {post.account.avatar ? (
                  <img
                    src={post.account.avatar}
                    alt={post.account.display_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center ${post.account.avatar ? 'hidden' : ''}`}>
                  <User className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-primary text-xs truncate">{post.account.display_name}</div>
                <div className="text-muted-custom text-xs">@{post.account.username}</div>
              </div>
              <div className="text-xs text-muted-custom">
                {formatRelativeTime(post.created_at)}
              </div>
            </div>
            
            <p className="text-secondary text-sm mb-2 line-clamp-3 leading-snug">
              {formatContent(post.content)}
            </p>
            
            {/* Interactive compact metrics */}
            <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400">
              <button 
                onClick={() => toggleLike(post.id)}
                className={`post-action-button flex items-center gap-1 transition-colors group ${
                  post.favourited 
                    ? 'text-red-600 heart-liked' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-red-600'
                }`}
                title={post.favourited ? 'Unlike' : 'Like'}
              >
                <Heart 
                  className={`w-3 h-3 group-hover:scale-110 transition-transform ${
                    post.favourited ? 'fill-current' : ''
                  }`}
                />
                <span className="font-medium">{post.favourites_count}</span>
              </button>
              <button 
                onClick={() => toggleBookmark(post.id)}
                className={`post-action-button p-1 rounded transition-colors group ${
                  post.bookmarked 
                    ? 'text-yellow-600 bookmark-saved' 
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-yellow-600'
                }`}
                title={post.bookmarked ? 'Remove bookmark' : 'Bookmark'}
              >
                <Bookmark 
                  className={`w-3 h-3 group-hover:scale-110 transition-transform ${
                    post.bookmarked ? 'fill-current' : ''
                  }`}
                />
              </button>
              <span className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3" />
                {post.reblogs_count}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {post.replies_count}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Focused Layout - Single centered card with full image (Facebook/Twitter style)
  if (displayMode === 'focused') {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        {posts.map((post, index) => (
          <div key={`${post.url?.includes('bsky.app') ? 'bluesky' : 'mastodon'}-${post.id}`} className={`glass-subtle border ${getPlatformBorderClasses(post)} rounded-2xl overflow-hidden hover:glass transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl group relative ${getPostAnimationClass(post.id, index)}`}>
            {/* Platform Badge */}
            {renderPlatformBadge(post)}
            {/* Header */}
            <div className="flex items-center gap-4 p-6 pb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg overflow-hidden">
                {post.account.avatar ? (
                  <img
                    src={post.account.avatar}
                    alt={post.account.display_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center ${post.account.avatar ? 'hidden' : ''}`}>
                  <User className="w-7 h-7 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-bold text-primary text-lg">{post.account.display_name}</h3>
                  <span className="text-muted-custom text-sm">@{post.account.username}</span>
                  <span className="text-muted-custom">·</span>
                  <span className="text-muted-custom flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(post.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-4">
              <p className="text-secondary text-lg leading-relaxed mb-4">
                {formatContent(post.content)}
              </p>

              {/* Hashtags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span key={tag.name} className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full shadow-sm font-medium">
                      <Hash className="w-3 h-3" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Media Display - Full width with aspect ratio */}
            {post.media_attachments && post.media_attachments.length > 0 && (
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 relative overflow-hidden">
                  <img 
                    src={post.media_attachments[0].preview_url || post.media_attachments[0].url}
                    alt={post.media_attachments[0].description || 'Post media'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                  
                  {/* Fallback placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 hidden">
                    <div className="text-white text-center">
                      <Image className="w-16 h-16 mx-auto mb-3" />
                      <div className="text-lg font-medium">{post.media_attachments.length} media</div>
                    </div>
                  </div>
                  
                  {/* Multiple media indicator */}
                  {post.media_attachments.length > 1 && (
                    <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1.5 rounded-full font-medium">
                      +{post.media_attachments.length - 1} more
                    </div>
                  )}
                  
                  {/* Media type indicator */}
                  {post.media_attachments[0].type === 'video' && (
                    <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white text-sm px-3 py-1.5 rounded-full flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                      </svg>
                      Video
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-8">
                {/* Reply */}
                <button className="flex items-center gap-2 hover:text-blue-600 transition-colors group">
                  <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{post.replies_count}</span>
                </button>
                
                {/* Reblog */}
                <button className="flex items-center gap-2 hover:text-green-600 transition-colors group">
                  <Repeat2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">{post.reblogs_count}</span>
                </button>
                
                {/* Like */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleLike(post.id);
                  }}
                  className={`post-action-button flex items-center gap-2 transition-colors group ${
                    post.favourited 
                      ? 'text-red-600 heart-liked' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-red-600'
                  }`}
                >
                  <Heart 
                    className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                      post.favourited ? 'fill-current' : ''
                    }`} 
                  />
                  <span className="font-medium">{post.favourites_count}</span>
                </button>
                
                {/* Bookmark */}
                <button 
                  onClick={() => toggleBookmark(post.id)}
                  className={`post-action-button flex items-center gap-2 transition-colors group ${
                    post.bookmarked 
                      ? 'text-yellow-600 bookmark-saved' 
                      : 'text-neutral-500 dark:text-neutral-400 hover:text-yellow-600'
                  }`}
                >
                  <Bookmark 
                    className={`w-5 h-5 group-hover:scale-110 transition-transform ${
                      post.bookmarked ? 'fill-current' : ''
                    }`} 
                  />
                </button>
              </div>
              
              {/* Content Indicators */}
              <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                {post.media_attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-purple-500">
                    <Image className="w-4 h-4" />
                    <span>{post.media_attachments.length}</span>
                  </div>
                )}
                {post.tags.length > 0 && (
                  <div className="flex items-center gap-1 text-blue-500">
                    <Hash className="w-4 h-4" />
                    <span>{post.tags.length}</span>
                  </div>
                )}
                {post.mentions.length > 0 && (
                  <div className="flex items-center gap-1 text-cyan-500">
                    <AtSign className="w-4 h-4" />
                    <span>{post.mentions.length}</span>
                  </div>
                )}
                {post.sensitive && (
                  <div className="flex items-center gap-1 text-yellow-600">
                    <EyeOff className="w-4 h-4" />
                    <span>CW</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const FeedPage: React.FC = () => {
  const { state: appState, toggleFeedSource } = useApp();
  const { 
    auth, 
    posts, 
    isLoadingPosts, 
    lastImportError,
    displayMode,
    isLiveFeed,
    liveFeedInterval,
    refreshLiveFeed,
    toggleLike,
    toggleBookmark
  } = useMastodonStore();

  const { 
    auth: blueskyAuth,
    posts: blueskyPosts,
    isLoading: blueskyIsLoading,
    fetchPosts: fetchBlueskyPosts,
    restoreSession: restoreBlueskySession,
    toggleLike: toggleBlueskyLike
  } = useBlueskyStore();
  
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const [previousPosts, setPreviousPosts] = useState<MastodonPost[]>([]);
  const [, setAnimationKey] = useState(0);
  const [inspectedPost, setInspectedPost] = useState<any>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Handle post inspection
  const handleInspectPost = (post: any) => {
    setInspectedPost(post);
    setIsInspectorOpen(true);
  };

  const handleCloseInspector = () => {
    setIsInspectorOpen(false);
    setInspectedPost(null);
  };

  // Unified toggleLike function that handles both Mastodon and Bluesky posts
  const handleToggleLike = async (postId: string, platform?: string, uri?: string, cid?: string) => {
    console.log('🔄 handleToggleLike called:', { postId, platform, uri, cid });

    if (platform === 'bluesky' && uri && cid) {
      // Handle Bluesky post
      console.log('🔵 Handling Bluesky post like:', { uri, cid });
      await toggleBlueskyLike(uri, cid);
    } else {
      // Handle Mastodon post (default behavior)
      console.log('🟣 Handling Mastodon post like:', { postId });
      await toggleLike(postId);
    }
  };

  // Note: Feed loading is now handled by background service
  // This ensures feeds load even when user is on other pages

  // Handle scroll events for bounce animation
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true);
      
      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set timeout to stop bouncing after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    // Add scroll listener to the main content area
    const mainElement = document.querySelector('main');
    if (mainElement) {
      mainElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (mainElement) {
        mainElement.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Handle post changes for animations
  useEffect(() => {
    if (posts.length > 0 && previousPosts.length > 0) {
      // Posts have changed - trigger animation
      setAnimationKey(prev => prev + 1);
    }
    
    // Update previous posts after a short delay to allow animations to complete
    const timeout = setTimeout(() => {
      setPreviousPosts(posts);
    }, 600); // Match animation duration
    
    return () => clearTimeout(timeout);
  }, [posts]);

  // Initialize previous posts on first load
  useEffect(() => {
    if (posts.length > 0 && previousPosts.length === 0) {
      setPreviousPosts(posts);
    }
  }, [posts, previousPosts.length]);

  // Live feed auto-refresh
  useEffect(() => {
    if (!isLiveFeed || !auth.isAuthenticated) {
      return;
    }

    const interval = setInterval(() => {
      refreshLiveFeed();
    }, liveFeedInterval);

    return () => clearInterval(interval);
  }, [isLiveFeed, auth.isAuthenticated, liveFeedInterval, refreshLiveFeed]);

  // Fetch Bluesky posts when authenticated and Bluesky feed is active
  useEffect(() => {
    console.log('Bluesky useEffect triggered:', { 
      isAuthenticated: blueskyAuth.isAuthenticated, 
      activeFeedSources: appState.activeFeedSources,
      blueskyActive: appState.activeFeedSources.bluesky 
    });
    
    if (blueskyAuth.isAuthenticated && appState.activeFeedSources.bluesky) {
      console.log('Fetching Bluesky posts...', { blueskyAuth, appState });
      fetchBlueskyPosts();
    } else {
      console.log('Bluesky fetch skipped:', { 
        authenticated: blueskyAuth.isAuthenticated, 
        blueskyActive: appState.activeFeedSources.bluesky 
      });
    }
  }, [blueskyAuth.isAuthenticated, appState.activeFeedSources.bluesky, fetchBlueskyPosts]);

  // Restore Bluesky session on mount
  useEffect(() => {
    const initializeBluesky = async () => {
      console.log('Initializing Bluesky session...');
      const restored = await restoreBlueskySession();
      console.log('Bluesky session restoration result:', restored);
    };
    initializeBluesky();
  }, [restoreBlueskySession]);

  // Auto-enable feed sources when authenticated (only if user hasn't manually set preference)
  useEffect(() => {
    if (auth.isAuthenticated && 
        !appState.activeFeedSources.mastodon && 
        appState.userFeedPreferences.mastodon === null) {
      console.log('Auto-enabling Mastodon feed source');
      toggleFeedSource('mastodon');
    }
  }, [auth.isAuthenticated, appState.activeFeedSources.mastodon, appState.userFeedPreferences.mastodon, toggleFeedSource]);

  useEffect(() => {
    if (blueskyAuth.isAuthenticated && 
        !appState.activeFeedSources.bluesky && 
        appState.userFeedPreferences.bluesky === null) {
      console.log('Auto-enabling Bluesky feed source');
      toggleFeedSource('bluesky');
    }
  }, [blueskyAuth.isAuthenticated, appState.activeFeedSources.bluesky, appState.userFeedPreferences.bluesky, toggleFeedSource]);

  // Also fetch Bluesky posts when Bluesky auth changes (for manual refresh)
  useEffect(() => {
    if (blueskyAuth.isAuthenticated) {
      console.log('Bluesky authenticated, fetching posts...');
      fetchBlueskyPosts();
    }
  }, [blueskyAuth.isAuthenticated, fetchBlueskyPosts]);

  // Helper function to determine animation class for a post with directional context
  const getPostAnimationClass = (postId: string, currentIndex: number) => {
    const wasPresent = previousPosts.some(p => p.id === postId);
    const isPresent = posts.some(p => p.id === postId);
    
    if (!wasPresent && isPresent) {
      // New post - decide enter direction based on engagement vs current posts
      const post = posts.find(p => p.id === postId);
      const totalEngagement = post ? post.favourites_count + post.reblogs_count + post.replies_count : 0;
      const isHighEngagement = totalEngagement >= 20;
      
      if (isHighEngagement && currentIndex < 5) {
        return 'animate-post-enter-high'; // High engagement at top - descend from above
      } else {
        return 'animate-post-enter'; // Regular - grow in place
      }
    } else if (wasPresent && !isPresent) {
      // Disappearing post - decide exit direction
      const oldIndex = previousPosts.findIndex(p => p.id === postId);
      if (oldIndex < 3) {
        return 'animate-post-exit-up'; // Was at top - slide up and fade
      } else {
        return 'animate-post-exit-down'; // Was lower - shrink down
      }
    } else if (wasPresent && isPresent) {
      // Staying post - determine movement direction
      const oldIndex = previousPosts.findIndex(p => p.id === postId);
      const newIndex = posts.findIndex(p => p.id === postId);
      
      if (newIndex < oldIndex) {
        return 'animate-post-move-up'; // Moved up in feed
      } else if (newIndex > oldIndex) {
        return 'animate-post-move-down'; // Moved down in feed
      } else {
        return 'animate-post-stable'; // Same position - subtle wiggle
      }
    }
    return ''; // No animation
  };

  // Format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
  };

  // Format post content (basic HTML stripping and link handling)
  const formatContent = (content: string) => {
    return content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .trim();
  };

  return (
    <div className="space-y-6">


      {/* Error Message */}
      {lastImportError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{lastImportError}</p>
          </div>
        </div>
      )}

      {/* Posts List */}
      {(auth.isAuthenticated || blueskyAuth.isAuthenticated) && (
        <>
          {(() => {
            // Combine posts from both platforms
            let combinedPosts: any[] = [];
            
            if (appState.activeFeedSources.mastodon && auth.isAuthenticated) {
              combinedPosts = [...combinedPosts, ...posts];
            }
            
            if (appState.activeFeedSources.bluesky && blueskyAuth.isAuthenticated) {
              // Convert Bluesky posts to Mastodon format for compatibility
              const convertedBlueskyPosts = blueskyPosts.map(blueskyPost => ({
                id: blueskyPost.uri,
                created_at: blueskyPost.record.createdAt,
                content: blueskyPost.record.text,
                account: {
                  id: blueskyPost.author.did,
                  username: blueskyPost.author.handle,
                  display_name: blueskyPost.author.displayName || blueskyPost.author.handle,
                  avatar: blueskyPost.author.avatar || '',
                  acct: blueskyPost.author.handle
                },
                replies_count: blueskyPost.replyCount,
                reblogs_count: blueskyPost.repostCount,
                favourites_count: blueskyPost.likeCount,
                favourited: !!blueskyPost.viewer?.like,
                reblogged: !!blueskyPost.viewer?.repost,
                bookmarked: false, // Bluesky doesn't have bookmarks
                // Add platform metadata for unified handling
                platform: 'bluesky',
                uri: blueskyPost.uri,
                cid: blueskyPost.cid,
                url: `https://bsky.app/post/${blueskyPost.uri.split('/').pop()}`,
                media_attachments: [], // TODO: Extract from Bluesky embeds
                mentions: [], // TODO: Extract from Bluesky facets
                tags: [], // TODO: Extract from Bluesky facets
                emojis: [],
                sensitive: false,
                spoiler_text: '',
                visibility: 'public' as const,
                language: 'en',
                in_reply_to_id: null,
                in_reply_to_account_id: null
              }));
              combinedPosts = [...combinedPosts, ...convertedBlueskyPosts];
            }
            
            const isLoading = isLoadingPosts || (blueskyAuth.isAuthenticated && blueskyIsLoading);
            
            if (isLoading) {
              return (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                  <span className="ml-3 text-neutral-600 dark:text-neutral-400">Loading posts...</span>
                </div>
              );
            }
            
            if (combinedPosts.length === 0) {
              return (
                <div className="text-center py-12">
                  <Rss className="w-12 h-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-600 dark:text-neutral-400">No posts found. Try adjusting your filters or search query.</p>
                </div>
              );
            }
            
            return (
              <FeedLayout 
                posts={combinedPosts} 
                displayMode={displayMode} 
                isScrolling={isScrolling}
                formatContent={formatContent}
                formatRelativeTime={formatRelativeTime}
                getPostAnimationClass={getPostAnimationClass}
                toggleLike={async (postId: string) => {
                  // Get the post to check if it's Bluesky or Mastodon
                  const post = combinedPosts.find(p => p.id === postId);
                  if (post?.platform === 'bluesky') {
                    await handleToggleLike(postId, 'bluesky', post.uri, post.cid);
                  } else {
                    await handleToggleLike(postId); // Mastodon
                  }
                }}
                toggleBookmark={toggleBookmark}
                onInspectPost={handleInspectPost}
              />
            );
          })()}
        </>
      )}

      {/* Post Inspector */}
      <PostInspector 
        post={inspectedPost}
        isOpen={isInspectorOpen}
        onClose={handleCloseInspector}
      />

    </div>
  );
};

export default FeedPage;
