/**
 * Mastodon API Types
 * 
 * Type definitions for Mastodon API responses and data structures
 */

export interface MastodonUser {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  avatar: string;
  avatar_static: string;
  header: string;
  header_static: string;
  locked: boolean;
  bot: boolean;
  discoverable?: boolean;
  group: boolean;
  created_at: string;
  note: string;
  url: string;
  followers_count: number;
  following_count: number;
  statuses_count: number;
  last_status_at?: string;
}

export interface MastodonPost {
  id: string;
  created_at: string;
  in_reply_to_id?: string;
  in_reply_to_account_id?: string;
  sensitive: boolean;
  spoiler_text: string;
  visibility: 'public' | 'unlisted' | 'private' | 'direct';
  language?: string;
  uri: string;
  url: string;
  replies_count: number;
  reblogs_count: number;
  favourites_count: number;
  content: string;
  reblog?: MastodonPost;
  account: MastodonUser;
  media_attachments: MastodonMedia[];
  mentions: MastodonMention[];
  tags: MastodonTag[];
  emojis: MastodonEmoji[];
  card?: MastodonCard;
  poll?: MastodonPoll;
  application?: MastodonApplication;
}

export interface MastodonMedia {
  id: string;
  type: 'image' | 'video' | 'gifv' | 'audio';
  url: string;
  preview_url: string;
  remote_url?: string;
  description?: string;
  blurhash?: string;
  meta?: {
    small?: { width: number; height: number; size: string; aspect: number };
    original?: { width: number; height: number; size: string; aspect: number };
  };
}

export interface MastodonMention {
  id: string;
  username: string;
  url: string;
  acct: string;
}

export interface MastodonTag {
  name: string;
  url: string;
}

export interface MastodonEmoji {
  shortcode: string;
  url: string;
  static_url: string;
  visible_in_picker: boolean;
}

export interface MastodonCard {
  url: string;
  title: string;
  description: string;
  type: 'link' | 'photo' | 'video' | 'rich';
  author_name?: string;
  author_url?: string;
  provider_name?: string;
  provider_url?: string;
  html?: string;
  width?: number;
  height?: number;
  image?: string;
  embed_url?: string;
}

export interface MastodonPoll {
  id: string;
  expires_at?: string;
  expired: boolean;
  multiple: boolean;
  votes_count: number;
  voters_count?: number;
  voted?: boolean;
  own_votes?: number[];
  options: Array<{
    title: string;
    votes_count?: number;
  }>;
}

export interface MastodonApplication {
  name: string;
  website?: string;
}

export interface MastodonAuthResponse {
  access_token: string;
  token_type: string;
  scope: string;
  created_at: number;
}

export interface MastodonInstance {
  uri: string;
  title: string;
  description: string;
  short_description: string;
  email: string;
  version: string;
  urls: {
    streaming_api: string;
  };
  stats: {
    user_count: number;
    status_count: number;
    domain_count: number;
  };
  thumbnail?: string;
  languages: string[];
  registrations: boolean;
  approval_required: boolean;
  invites_enabled: boolean;
  configuration: {
    statuses: {
      max_characters: number;
      max_media_attachments: number;
      characters_reserved_per_url: number;
    };
    media_attachments: {
      supported_mime_types: string[];
      image_size_limit: number;
      image_matrix_limit: number;
      video_size_limit: number;
      video_frame_rate_limit: number;
      video_matrix_limit: number;
    };
    polls: {
      max_options: number;
      max_characters_per_option: number;
      min_expiration: number;
      max_expiration: number;
    };
  };
}

export interface MastodonAuth {
  isAuthenticated: boolean;
  instance: string;
  accessToken?: string;
  user?: MastodonUser;
  lastAuthDate?: Date;
}

export interface MastodonImportSettings {
  importLimit: number;
  importInterval: number;
  includeReplies: boolean;
  includeReblogs: boolean;
  includeMedia: boolean;
  lastImportDate?: Date;
}

export interface MastodonError {
  error: string;
  error_description?: string;
}
