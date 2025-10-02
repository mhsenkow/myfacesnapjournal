/**
 * Mastodon Service
 * 
 * Handles all Mastodon API interactions including authentication,
 * fetching posts, and managing user data
 */

import {
  MastodonUser,
  MastodonPost,
  MastodonAuthResponse,
  MastodonInstance
} from '../types/mastodon';
import { JournalEntry, EntrySource } from '../types/journal';

class MastodonService {
  private clientId: string = '';
  private clientSecret: string = '';

  constructor() {
    // We'll use dynamic client registration
    // For mastodon.social, we have a pre-registered client to avoid rate limits
  }

  /**
   * Get pre-registered client credentials for specific instances
   */
  private getPreRegisteredClient(instanceUrl: string): {client_id: string, client_secret: string} | null {
    // Pre-registered client for mastodon.social to avoid rate limits
    if (instanceUrl === 'https://mastodon.social') {
      return {
        client_id: 'UKWXDbRVZ1HWrtGvaaIuOfR6cC2FPD5NRnJXn7SBOkY',
        client_secret: 'w6-sUWvOkF9Mf6qWr9W3M98vUpCwlLIH9_2fGPr1XNU'
      };
    }
    return null;
  }


  /**
   * Register a new OAuth client with a Mastodon instance
   */
  async registerClient(instanceUrl: string, redirectUri: string): Promise<{client_id: string, client_secret: string}> {
    try {
      console.log('Registering client with:', { instanceUrl, redirectUri });
      
      // Check if we have pre-registered credentials for this instance
      const preRegisteredClient = this.getPreRegisteredClient(instanceUrl);
      if (preRegisteredClient) {
        console.log('Using pre-registered client for:', instanceUrl);
        console.log('Client ID set:', preRegisteredClient.client_id ? 'Yes' : 'No');
        console.log('Client Secret set:', preRegisteredClient.client_secret ? 'Yes' : 'No');
        this.clientId = preRegisteredClient.client_id;
        this.clientSecret = preRegisteredClient.client_secret;
        return preRegisteredClient;
      }
      
      const response = await fetch(`${instanceUrl}/api/v1/apps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: 'MyFace SnapJournal',
          redirect_uris: redirectUri,
          scopes: 'read:accounts read:statuses',
          website: window.location.origin
        })
      });

      console.log('Registration response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Registration failed:', errorText);
        
        // If we get rate limited, try to use a fallback approach
        if (response.status === 429) {
          console.log('Rate limited, trying fallback client registration...');
          return await this.tryFallbackRegistration(instanceUrl, redirectUri);
        }
        
        throw new Error(`Failed to register client: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const clientData = await response.json();
      console.log('Client registered successfully:', { client_id: clientData.client_id });
      
      this.clientId = clientData.client_id;
      this.clientSecret = clientData.client_secret;
      
      return clientData;
    } catch (error) {
      console.error('Client registration error:', error);
      throw error;
    }
  }

  private async tryFallbackRegistration(instanceUrl: string, redirectUri: string): Promise<{client_id: string, client_secret: string}> {
    // For instances that have rate limiting, we can try a simpler approach
    // or use a pre-registered client if available
    
    // Try with a different client name to avoid conflicts
    const fallbackName = `MyFace SnapJournal ${Date.now()}`;
    
    try {
      console.log('Trying fallback registration with name:', fallbackName);
      
      const response = await fetch(`${instanceUrl}/api/v1/apps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_name: fallbackName,
          redirect_uris: redirectUri,
          scopes: 'read:accounts read:statuses',
          website: window.location.origin
        })
      });

      if (response.ok) {
        const clientData = await response.json();
        console.log('Fallback registration successful:', { client_id: clientData.client_id });
        
        this.clientId = clientData.client_id;
        this.clientSecret = clientData.client_secret;
        
        return clientData;
      }
    } catch (error) {
      console.error('Fallback registration also failed:', error);
    }
    
    // If all else fails, throw a helpful error
    throw new Error(`Unable to register with this Mastodon instance. It may have rate limiting enabled. Try a different instance like mastodon.online or mstdn.social.`);
  }

  /**
   * Get instance information
   */
  async getInstanceInfo(instanceUrl: string): Promise<MastodonInstance> {
    const response = await fetch(`${instanceUrl}/api/v1/instance`);
    if (!response.ok) {
      throw new Error(`Failed to fetch instance info: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get the authorization URL for OAuth
   */
  getAuthUrl(instanceUrl: string, redirectUri: string, clientId?: string): string {
    const params = new URLSearchParams({
      client_id: clientId || this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'read:accounts read:statuses',
      force_login: 'false'
    });

    return `${instanceUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(
    instanceUrl: string,
    code: string,
    redirectUri: string
  ): Promise<MastodonAuthResponse> {
    console.log('Token exchange request:', {
      url: `${instanceUrl}/oauth/token`,
      client_id: this.clientId ? this.clientId.substring(0, 10) + '...' : 'NOT SET',
      redirect_uri: redirectUri,
      code: code.substring(0, 10) + '...'
    });

    const response = await fetch(`${instanceUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: redirectUri,
        code: code
      })
    });

    console.log('Token exchange response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token exchange failed:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error_description: errorText };
      }
      throw new Error(errorData.error_description || `Failed to exchange code for token: ${response.status}`);
    }

    const result = await response.json();
    console.log('Token exchange successful:', { 
      access_token: result.access_token ? 'Present' : 'Missing',
      token_type: result.token_type,
      scope: result.scope
    });

    return result;
  }

  /**
   * Get current user information
   */
  async getCurrentUser(instanceUrl: string, accessToken: string): Promise<MastodonUser> {
    const response = await fetch(`${instanceUrl}/api/v1/accounts/verify_credentials`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to verify credentials');
    }

    return response.json();
  }

  /**
   * Get user's posts
   */
  async getUserPosts(
    instanceUrl: string,
    accessToken: string,
    userId: string,
    limit: number = 20,
    maxId?: string
  ): Promise<MastodonPost[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      exclude_replies: 'false',
      exclude_reblogs: 'false'
    });

    if (maxId) {
      params.append('max_id', maxId);
    }

    const response = await fetch(
      `${instanceUrl}/api/v1/accounts/${userId}/statuses?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user posts');
    }

    return response.json();
  }

  /**
   * Get public timeline (public or local)
   */
  async getPublicTimeline(
    instanceUrl: string,
    accessToken: string,
    type: 'public' | 'local' = 'public',
    limit: number = 20,
    maxId?: string
  ): Promise<MastodonPost[]> {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    // For local timeline, add local=true parameter
    if (type === 'local') {
      params.append('local', 'true');
    }

    if (maxId) {
      params.append('max_id', maxId);
    }

    const response = await fetch(
      `${instanceUrl}/api/v1/timelines/public?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} timeline`);
    }

    return response.json();
  }

  /**
   * Get public timeline with pagination to fetch large numbers of posts
   */
  async getPublicTimelinePaginated(
    instanceUrl: string,
    accessToken: string,
    type: 'public' | 'local' = 'public',
    totalLimit: number = 40
  ): Promise<MastodonPost[]> {
    const allPosts: MastodonPost[] = [];
    const perRequestLimit = 40; // Mastodon's max per request
    let maxId: string | undefined;
    let requestsMade = 0;
    const maxRequests = Math.ceil(totalLimit / perRequestLimit);

    console.log(`Fetching ${totalLimit} posts with pagination (${maxRequests} requests)`);

    while (allPosts.length < totalLimit && requestsMade < maxRequests) {
      try {
        const posts = await this.getPublicTimeline(
          instanceUrl,
          accessToken,
          type,
          perRequestLimit,
          maxId
        );

        if (posts.length === 0) {
          console.log('No more posts available');
          break;
        }

        allPosts.push(...posts);
        requestsMade++;

        // Set maxId for next request (oldest post ID - 1)
        const oldestPost = posts[posts.length - 1];
        maxId = oldestPost.id;

        console.log(`Request ${requestsMade}: fetched ${posts.length} posts, total: ${allPosts.length}`);

        // Small delay to be respectful to the API
        if (requestsMade < maxRequests && allPosts.length < totalLimit) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        break;
      }
    }

    // Trim to exact limit if we got more than requested
    const result = allPosts.slice(0, totalLimit);
    console.log(`Final result: ${result.length} posts`);
    
    return result;
  }

  /**
   * Get user's timeline (includes posts from followed accounts)
   */
  async getTimeline(
    instanceUrl: string,
    accessToken: string,
    limit: number = 20,
    maxId?: string
  ): Promise<MastodonPost[]> {
    const params = new URLSearchParams({
      limit: limit.toString()
    });

    if (maxId) {
      params.append('max_id', maxId);
    }

    const response = await fetch(
      `${instanceUrl}/api/v1/timelines/home?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch timeline');
    }

    return response.json();
  }

  /**
   * Convert Mastodon post to journal entry format
   */
  convertToJournalEntry(post: MastodonPost, instanceUrl: string): Partial<JournalEntry> {
    // Clean HTML content
    const cleanContent = this.stripHtml(post.content);
    
    // Extract hashtags
    const hashtags = post.tags.map(tag => tag.name);
    
    // Determine mood based on content (simple heuristic)
    const mood = this.determineMood(post.content);
    
    // Extract media URLs
    const mediaUrls = post.media_attachments.map(media => media.url);

    return {
      title: this.generateTitle(post.content),
      content: cleanContent,
      tags: hashtags,
      mood,
      privacy: post.visibility === 'public' ? 'public' : 'private' as 'public' | 'private' | 'secret',
      source: EntrySource.MASTODON,
      sourceId: post.id,
      sourceUrl: post.url,
      metadata: {
        instance: instanceUrl,
        account: post.account.acct,
        displayName: post.account.display_name,
        avatar: post.account.avatar,
        reblogsCount: post.reblogs_count,
        favouritesCount: post.favourites_count,
        repliesCount: post.replies_count,
        mediaAttachments: mediaUrls,
        createdAt: post.created_at,
        visibility: post.visibility,
        language: post.language,
        spoilerText: post.spoiler_text,
        sensitive: post.sensitive
      }
    };
  }

  /**
   * Strip HTML tags from content
   */
  private stripHtml(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  }

  /**
   * Generate a title from post content
   */
  private generateTitle(content: string): string {
    const cleanContent = this.stripHtml(content);
    const words = cleanContent.split(' ');
    
    if (words.length <= 6) {
      return cleanContent;
    }
    
    return words.slice(0, 6).join(' ') + '...';
  }

  /**
   * Determine mood from post content (simple heuristic)
   */
  private determineMood(content: string): 'happy' | 'sad' | 'neutral' | 'excited' | 'anxious' | 'grateful' {
    const positiveWords = ['happy', 'joy', 'love', 'amazing', 'wonderful', 'great', 'awesome', 'excited', 'grateful', 'thankful'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'worried', 'anxious', 'depressed', 'tired'];
    const neutralWords = ['thinking', 'wondering', 'considering', 'reflecting'];
    
    const lowerContent = content.toLowerCase();
    
    const positiveCount = positiveWords.filter(word => lowerContent.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerContent.includes(word)).length;
    const neutralCount = neutralWords.filter(word => lowerContent.includes(word)).length;
    
    if (positiveCount > negativeCount && positiveCount > neutralCount) {
      if (lowerContent.includes('excited') || lowerContent.includes('awesome')) {
        return 'excited';
      }
      if (lowerContent.includes('grateful') || lowerContent.includes('thankful')) {
        return 'grateful';
      }
      return 'happy';
    } else if (negativeCount > positiveCount && negativeCount > neutralCount) {
      if (lowerContent.includes('anxious') || lowerContent.includes('worried')) {
        return 'anxious';
      }
      return 'sad';
    }
    
    return 'neutral';
  }

  /**
   * Validate Mastodon instance URL
   */
  validateInstanceUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Get popular Mastodon instances for user convenience
   */
  getPopularInstances(): Array<{name: string, url: string, description: string}> {
    return [
      {
        name: 'mastodon.social',
        url: 'https://mastodon.social',
        description: 'The original Mastodon instance'
      },
      {
        name: 'mastodon.online',
        url: 'https://mastodon.online',
        description: 'Large general-purpose instance'
      },
      {
        name: 'mstdn.social',
        url: 'https://mstdn.social',
        description: 'Popular general instance'
      },
      {
        name: 'mastodon.art',
        url: 'https://mastodon.art',
        description: 'Art-focused community'
      },
      {
        name: 'tech.lgbt',
        url: 'https://tech.lgbt',
        description: 'LGBTQ+ tech community'
      },
      {
        name: 'fosstodon.org',
        url: 'https://fosstodon.org',
        description: 'Free and open source software community'
      }
    ];
  }

  /**
   * Test connection to a Mastodon instance
   */
  async testConnection(instanceUrl: string): Promise<boolean> {
    try {
      const instanceInfo = await this.getInstanceInfo(instanceUrl);
      return !!instanceInfo.uri;
    } catch {
      return false;
    }
  }
}

export const mastodonService = new MastodonService();
export default mastodonService;
