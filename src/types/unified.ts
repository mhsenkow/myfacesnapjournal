/**
 * Unified Types
 * 
 * Type definitions for unified handling of posts from different platforms
 */

import { MastodonPost } from './mastodon';
import { BlueskyPost } from './bluesky';
import { extractBlueskyMedia, extractBlueskyHashtags, extractBlueskyMentions } from '../utils/blueskyHelpers';

export type PostPlatform = 'mastodon' | 'bluesky';

export interface UnifiedPost {
  // Platform identification
  platform: PostPlatform;
  
  // Common fields
  id: string;
  createdAt: string;
  content: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
    verified?: boolean;
  };
  
  // Engagement metrics
  likeCount: number;
  repostCount: number;
  replyCount: number;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  
  // Platform-specific data
  mastodonData?: MastodonPost;
  blueskyData?: BlueskyPost;
  
  // Additional metadata
  media?: Array<{
    id: string;
    type: 'image' | 'video' | 'audio';
    url: string;
    previewUrl?: string;
    description?: string;
  }>;
  
  tags?: Array<{
    name: string;
    url?: string;
  }>;
  
  mentions?: Array<{
    username: string;
    url?: string;
  }>;
}

// Helper functions to convert platform-specific posts to unified format
export function convertMastodonPost(post: MastodonPost): UnifiedPost {
  return {
    platform: 'mastodon',
    id: post.id,
    createdAt: post.created_at,
    content: post.content,
    author: {
      id: post.account.id,
      username: post.account.username,
      displayName: post.account.display_name,
      avatar: post.account.avatar,
      verified: false, // Mastodon doesn't have verified status
    },
    likeCount: post.favourites_count,
    repostCount: post.reblogs_count,
    replyCount: post.replies_count,
    isLiked: post.favourited,
    isReposted: post.reblogged,
    isBookmarked: post.bookmarked,
    mastodonData: post,
    media: post.media_attachments.map(media => ({
      id: media.id,
      type: media.type as 'image' | 'video' | 'audio',
      url: media.url,
      previewUrl: media.preview_url,
      description: media.description,
    })),
    tags: post.tags.map(tag => ({
      name: tag.name,
      url: tag.url,
    })),
    mentions: post.mentions.map(mention => ({
      username: mention.username,
      url: mention.url,
    })),
  };
}

export function convertBlueskyPost(post: BlueskyPost): UnifiedPost {
  return {
    platform: 'bluesky',
    id: post.id,
    createdAt: post.record.createdAt,
    content: post.record.text,
    author: {
      id: post.author.did,
      username: post.author.handle,
      displayName: post.author.displayName || post.author.handle,
      avatar: post.author.avatar,
      verified: post.author.verified,
    },
    likeCount: post.likeCount,
    repostCount: post.repostCount,
    replyCount: post.replyCount,
    isLiked: !!post.viewer?.like,
    isReposted: !!post.viewer?.repost,
    isBookmarked: false, // Bluesky doesn't have bookmarks
    blueskyData: post,
    media: extractBlueskyMedia(post).map(media => ({
      id: media.id,
      type: media.type as 'image' | 'video' | 'audio',
      url: media.url,
      previewUrl: media.preview_url,
      description: media.description,
    })),
    tags: extractBlueskyHashtags(post).map(tag => ({
      name: tag,
    })),
    mentions: extractBlueskyMentions(post).map(mention => ({
      username: mention.username,
    })),
  };
}
