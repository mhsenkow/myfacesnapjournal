/**
 * Bluesky Helper Functions
 * 
 * Utility functions for extracting and converting Bluesky data
 */

import { BlueskyPost } from '../types/bluesky';

/**
 * Extract media attachments from Bluesky embeds
 */
export function extractBlueskyMedia(post: BlueskyPost): any[] {
  const media: any[] = [];
  
  if (post.record?.embed) {
    const embed = post.record.embed;
    
    // Extract images
    if (embed.images && Array.isArray(embed.images)) {
      media.push(...embed.images.map(img => ({
        id: img.fullsize,
        type: 'image',
        url: img.fullsize,
        preview_url: img.thumb,
        description: img.alt,
        meta: {
          aspect_ratio: img.aspectRatio
        }
      })));
    }
    
    // Extract external media (videos, links with thumbnails)
    if (embed.external) {
      media.push({
        id: embed.external.uri,
        type: 'link',
        url: embed.external.uri,
        preview_url: embed.external.thumb,
        description: embed.external.description,
        title: embed.external.title
      });
    }
    
    // Extract record embeds (quote posts)
    if (embed.record) {
      media.push({
        id: embed.record.uri,
        type: 'quote',
        url: embed.record.uri
      });
    }
  }
  
  return media;
}

/**
 * Extract mentions from Bluesky facets
 */
export function extractBlueskyMentions(post: BlueskyPost): any[] {
  const mentions: any[] = [];
  
  if (post.record?.facets) {
    for (const facet of post.record.facets) {
      for (const feature of facet.features) {
        if (feature.$type === 'app.bsky.richtext.facet#mention' && feature.uri) {
          mentions.push({
            id: feature.uri,
            username: feature.uri.replace('at://', '').split('/').pop() || '',
            acct: feature.uri.replace('at://', '').split('/').pop() || '',
            url: feature.uri
          });
        }
      }
    }
  }
  
  return mentions;
}

/**
 * Extract hashtags from Bluesky facets
 */
export function extractBlueskyHashtags(post: BlueskyPost): string[] {
  const hashtags: string[] = [];
  
  if (post.record?.facets) {
    for (const facet of post.record.facets) {
      for (const feature of facet.features) {
        if (feature.$type === 'app.bsky.richtext.facet#tag' && feature.tag) {
          hashtags.push(feature.tag);
        }
      }
    }
  }
  
  return hashtags;
}

/**
 * Extract links from Bluesky facets
 */
export function extractBlueskyLinks(post: BlueskyPost): any[] {
  const links: any[] = [];
  
  if (post.record?.facets) {
    for (const facet of post.record.facets) {
      for (const feature of facet.features) {
        if (feature.$type === 'app.bsky.richtext.facet#link' && feature.uri) {
          links.push({
            url: feature.uri,
            text: feature.uri
          });
        }
      }
    }
  }
  
  return links;
}

/**
 * Complete Bluesky post metadata extraction
 */
export function extractBlueskyMetadata(post: BlueskyPost) {
  return {
    media: extractBlueskyMedia(post),
    mentions: extractBlueskyMentions(post),
    tags: extractBlueskyHashtags(post),
    links: extractBlueskyLinks(post)
  };
}
