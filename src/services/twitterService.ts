/**
 * Twitter Service - Twitter/X API Integration
 * 
 * Handles Twitter API v2 integration for fetching tweets and user data
 * 
 * Note: Twitter API v2 requires API keys. You'll need:
 * - Bearer Token for read-only access (free tier available)
 * - Or OAuth 2.0 for user-specific actions
 */

import { TwitterPost, TwitterUser, TwitterAuth, TwitterMedia } from '../types/twitter';
import { logger } from '../utils/logger';

const TWITTER_API_BASE = 'https://api.twitter.com/2';

// Check if we're running in Tauri (desktop) or browser
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;

// Check if we're in development mode
const IS_DEV = import.meta.env.DEV;

// CORS proxies for browser fallback (Twitter API requires authentication, so these may not work perfectly)
const CORS_PROXIES = [
  // Local Vite proxy (development only)
  ...(IS_DEV ? ['/api/twitter/2'] : []),
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?',
  'https://cors-anywhere.herokuapp.com/', // Note: May require activation
];

// Dynamic import for Tauri API
const getInvoke = async () => {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke;
  }
  return null;
};

class TwitterService {
  private bearerToken: string = '';

  /**
   * Set Bearer Token for API authentication
   */
  setBearerToken(token: string) {
    this.bearerToken = token;
  }

  /**
   * Helper method to make Twitter API requests
   * Tries in order: Tauri backend > Direct fetch > CORS proxy fallback
   */
  private async makeTwitterRequest(
    method: 'GET' | 'POST' | 'DELETE',
    url: string,
    body?: any
  ): Promise<any> {
    if (!this.bearerToken) {
      throw new Error('Twitter Bearer Token not set');
    }

    // Strategy 1: Try Tauri backend first (best option - bypasses CORS)
    try {
      const invoke = await getInvoke();
      if (invoke) {
        const result = await invoke<any>('fetch_twitter_api', {
          method,
          url,
          bearerToken: this.bearerToken,
          body: body ? JSON.stringify(body) : undefined
        });
        return result;
      }
    } catch (tauriError) {
      logger.debug('Tauri backend not available, trying direct fetch:', tauriError);
    }

    // Strategy 2: Try direct fetch (works if CORS allows, or in some environments)
    try {
      const fetchHeaders = new Headers();
      fetchHeaders.set('Authorization', `Bearer ${this.bearerToken}`);
      fetchHeaders.set('Content-Type', 'application/json');

      const fetchOptions: RequestInit = {
        method,
        headers: fetchHeaders,
      };

      if (body && (method === 'POST' || method === 'PUT')) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: response.statusText }));
        throw new Error(`Twitter API error: ${error.detail || response.statusText}`);
      }

      return await response.json();
    } catch (directError: any) {
      // If it's a CORS error, try proxy fallback
      if (directError.message?.includes('CORS') || directError.message?.includes('Failed to fetch')) {
        logger.debug('Direct fetch failed due to CORS, trying proxy fallback');
        
        // Strategy 3: Try CORS proxy fallback (may not work with authenticated requests)
        // Note: Most CORS proxies don't support authenticated requests well
        // This is a best-effort fallback
        for (const proxy of CORS_PROXIES) {
          try {
            let proxyUrl: string;
            let proxyHeaders = new Headers();
            proxyHeaders.set('Authorization', `Bearer ${this.bearerToken}`);
            proxyHeaders.set('Content-Type', 'application/json');

            // Check if this is the local Vite proxy (development)
            if (proxy.startsWith('/')) {
              // Local proxy - no encoding needed, just prepend the path
              proxyUrl = proxy + url.replace('https://api.twitter.com', '');
              // Headers work normally with local proxy
            } else {
              // External proxy - encode the URL
              proxyUrl = proxy + encodeURIComponent(url);
              // External proxies often strip auth headers, but we try anyway
            }

            const proxyOptions: RequestInit = {
              method,
              headers: proxyHeaders,
            };

            if (body && (method === 'POST' || method === 'PUT')) {
              proxyOptions.body = JSON.stringify(body);
            }

            const response = await fetch(proxyUrl, proxyOptions);
            
            if (response.ok) {
              // For local proxy, response is direct JSON
              // For external proxies, might need parsing
              const responseData = await response.json();
              return responseData;
            }
          } catch (proxyError) {
            logger.debug(`Proxy ${proxy} failed:`, proxyError);
            continue; // Try next proxy
          }
        }

        // If we get here, all methods failed
        throw new Error(
          'Twitter API requests are blocked by CORS. ' +
          'To use Twitter integration, please use the desktop app (Tauri) or configure a CORS proxy. ' +
          'Alternatively, you can use browser extensions that enable CORS for development.'
        );
      }

      // Re-throw non-CORS errors
      throw directError;
    }
  }

  /**
   * Get authenticated user's profile
   */
  async getMe(): Promise<TwitterUser> {
    try {
      const url = `${TWITTER_API_BASE}/users/me?user.fields=profile_image_url,description,verified,public_metrics,created_at`;
      const data = await this.makeTwitterRequest('GET', url);
      return data.data;
    } catch (error) {
      logger.error('Failed to get Twitter user:', error);
      throw error;
    }
  }

  /**
   * Get user's home timeline
   * Note: Twitter API v2 doesn't have a direct "home timeline" endpoint
   * This uses mentions as a proxy, or you can use getUserTweets for a specific user
   */
  async getHomeTimeline(limit: number = 20, paginationToken?: string): Promise<{ tweets: TwitterPost[], nextToken?: string }> {
    if (!this.bearerToken) {
      throw new Error('Twitter Bearer Token not set');
    }

    try {
      // Get authenticated user first
      const me = await this.getMe();
      
      // Use user's tweets as "home timeline" (you can customize this)
      // Alternatively, you could use search with specific criteria
      return await this.getUserTweets(me.username, limit, paginationToken);
    } catch (error) {
      logger.error('Failed to get Twitter timeline:', error);
      throw error;
    }
  }

  /**
   * Get tweets by user ID or username
   */
  async getUserTweets(username: string, limit: number = 20, paginationToken?: string): Promise<{ tweets: TwitterPost[], nextToken?: string }> {
    try {
      // First get user ID from username
      const userUrl = `${TWITTER_API_BASE}/users/by/username/${username}`;
      const userData = await this.makeTwitterRequest('GET', userUrl);
      const userId = userData.data.id;

      // Get user's tweets
      const params = new URLSearchParams({
        max_results: limit.toString(),
        'tweet.fields': 'created_at,author_id,public_metrics,possibly_sensitive,lang,source,in_reply_to_user_id,referenced_tweets,attachments',
        'expansions': 'author_id,attachments.media_keys',
        'user.fields': 'username,name,profile_image_url,verified,description,public_metrics',
        'media.fields': 'type,url,preview_image_url,width,height,alt_text'
      });

      if (paginationToken) {
        params.append('pagination_token', paginationToken);
      }

      const tweetsUrl = `${TWITTER_API_BASE}/users/${userId}/tweets?${params.toString()}`;
      const data = await this.makeTwitterRequest('GET', tweetsUrl);

      // Map response to TwitterPost format
      const tweets: TwitterPost[] = (data.data || []).map((tweet: any) => {
        const author = data.includes?.users?.find((u: TwitterUser) => u.id === tweet.author_id);
        const media = tweet.attachments?.media_keys?.map((key: string) => 
          data.includes?.media?.find((m: TwitterMedia) => m.media_key === key)
        ).filter(Boolean) || [];

        return {
          ...tweet,
          author: author || {
            id: tweet.author_id,
            username: username,
            name: username
          },
          media
        };
      });

      return {
        tweets,
        nextToken: data.meta?.next_token
      };
    } catch (error) {
      logger.error('Failed to get user tweets:', error);
      throw error;
    }
  }

  /**
   * Search tweets
   */
  async searchTweets(query: string, limit: number = 20, paginationToken?: string): Promise<{ tweets: TwitterPost[], nextToken?: string }> {
    try {
      const params = new URLSearchParams({
        query,
        max_results: limit.toString(),
        'tweet.fields': 'created_at,author_id,public_metrics,possibly_sensitive,lang,source,in_reply_to_user_id,referenced_tweets,attachments',
        'expansions': 'author_id,attachments.media_keys',
        'user.fields': 'username,name,profile_image_url,verified,description,public_metrics',
        'media.fields': 'type,url,preview_image_url,width,height,alt_text'
      });

      if (paginationToken) {
        params.append('pagination_token', paginationToken);
      }

      const url = `${TWITTER_API_BASE}/tweets/search/recent?${params.toString()}`;
      const data = await this.makeTwitterRequest('GET', url);

      // Map response to TwitterPost format
      const tweets: TwitterPost[] = (data.data || []).map((tweet: any) => {
        const author = data.includes?.users?.find((u: TwitterUser) => u.id === tweet.author_id);
        const media = tweet.attachments?.media_keys?.map((key: string) => 
          data.includes?.media?.find((m: TwitterMedia) => m.media_key === key)
        ).filter(Boolean) || [];

        return {
          ...tweet,
          author,
          media
        };
      });

      return {
        tweets,
        nextToken: data.meta?.next_token
      };
    } catch (error) {
      logger.error('Failed to search tweets:', error);
      throw error;
    }
  }

  /**
   * Like a tweet (requires OAuth 2.0 with write permissions)
   */
  async likeTweet(tweetId: string): Promise<void> {
    try {
      const url = `${TWITTER_API_BASE}/users/me/likes`;
      await this.makeTwitterRequest('POST', url, { tweet_id: tweetId });
    } catch (error) {
      logger.error('Failed to like tweet:', error);
      throw error;
    }
  }

  /**
   * Unlike a tweet
   */
  async unlikeTweet(tweetId: string): Promise<void> {
    try {
      const url = `${TWITTER_API_BASE}/users/me/likes/${tweetId}`;
      await this.makeTwitterRequest('DELETE', url);
    } catch (error) {
      logger.error('Failed to unlike tweet:', error);
      throw error;
    }
  }

  /**
   * Retweet a tweet (requires OAuth 2.0 with write permissions)
   */
  async retweet(tweetId: string): Promise<void> {
    try {
      const url = `${TWITTER_API_BASE}/users/me/retweets`;
      await this.makeTwitterRequest('POST', url, { tweet_id: tweetId });
    } catch (error) {
      logger.error('Failed to retweet:', error);
      throw error;
    }
  }

  /**
   * Unretweet a tweet
   */
  async unretweet(tweetId: string): Promise<void> {
    try {
      const url = `${TWITTER_API_BASE}/users/me/retweets/${tweetId}`;
      await this.makeTwitterRequest('DELETE', url);
    } catch (error) {
      logger.error('Failed to unretweet:', error);
      throw error;
    }
  }
}

export const twitterService = new TwitterService();

