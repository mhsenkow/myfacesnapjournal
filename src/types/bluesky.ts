/**
 * Bluesky Types
 * 
 * Type definitions for Bluesky AT Protocol integration
 */

export interface BlueskyPost {
  id: string;
  uri: string;
  cid: string;
  author: BlueskyAuthor;
  record: BlueskyRecord;
  replyCount: number;
  repostCount: number;
  likeCount: number;
  indexedAt: string;
  viewer?: {
    repost?: string;
    like?: string;
  };
  labels?: BlueskyLabel[];
}

export interface BlueskyAuthor {
  did: string;
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
  verified?: boolean;
  createdAt?: string;
}

export interface BlueskyRecord {
  text: string;
  createdAt: string;
  reply?: {
    root: {
      uri: string;
      cid: string;
    };
    parent: {
      uri: string;
      cid: string;
    };
  };
  facets?: BlueskyFacet[];
  embed?: BlueskyEmbed;
}

export interface BlueskyFacet {
  index: {
    byteStart: number;
    byteEnd: number;
  };
  features: BlueskyFeature[];
}

export interface BlueskyFeature {
  $type: string;
  uri?: string;
  tag?: string;
}

export interface BlueskyEmbed {
  $type: string;
  external?: {
    uri: string;
    title: string;
    description: string;
    thumb?: string;
  };
  images?: BlueskyImage[];
  record?: {
    uri: string;
    cid: string;
  };
}

export interface BlueskyImage {
  thumb: string;
  fullsize: string;
  alt: string;
  aspectRatio: {
    width: number;
    height: number;
  };
}

export interface BlueskyLabel {
  val: string;
  neg?: boolean;
  cts: string;
}

export interface BlueskySession {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
  email?: string;
}

export interface BlueskyAuth {
  isAuthenticated: boolean;
  session: BlueskySession | null;
  server: string;
  user?: BlueskyAuthor; // Add user profile information
}

export type BlueskyFeedType = 'timeline' | 'following' | 'likes';

export interface BlueskyFeedSettings {
  feedType: BlueskyFeedType;
  limit: number;
  cursor?: string;
}
