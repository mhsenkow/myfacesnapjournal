/**
 * Twitter/X Types
 * 
 * Type definitions for Twitter API v2 integration
 */

export interface TwitterPost {
  id: string;
  text: string;
  created_at: string;
  author_id: string;
  public_metrics: {
    retweet_count: number;
    like_count: number;
    reply_count: number;
    quote_count: number;
  };
  possibly_sensitive?: boolean;
  lang?: string;
  source?: string;
  in_reply_to_user_id?: string;
  referenced_tweets?: Array<{
    type: 'replied_to' | 'quoted' | 'retweeted';
    id: string;
  }>;
  attachments?: {
    media_keys?: string[];
  };
  author?: TwitterUser;
  media?: TwitterMedia[];
}

export interface TwitterUser {
  id: string;
  username: string;
  name: string;
  description?: string;
  profile_image_url?: string;
  verified?: boolean;
  public_metrics?: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  created_at?: string;
}

export interface TwitterMedia {
  media_key: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
  alt_text?: string;
}

export interface TwitterAuth {
  isAuthenticated: boolean;
  bearerToken?: string;
  user?: TwitterUser;
  lastAuthDate?: Date;
}

export interface TwitterFeedSettings {
  feedType: 'home' | 'user' | 'search';
  limit: number;
  maxResults?: number;
}

