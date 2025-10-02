/**
 * Facebook Integration Service
 * 
 * Handles Facebook OAuth authentication and post import functionality
 * Uses Facebook Graph API to fetch user posts and convert them to journal entries
 */

// import axios from 'axios'; // Not used in demo mode

export interface FacebookPost {
  id: string;
  message?: string;
  story?: string;
  created_time: string;
  type: 'status' | 'photo' | 'video' | 'link' | 'event';
  link?: string;
  picture?: string;
  full_picture?: string;
  name?: string;
  description?: string;
  from?: {
    name: string;
    id: string;
  };
  likes?: {
    data: Array<{ id: string; name: string }>;
    summary: { total_count: number };
  };
  comments?: {
    data: Array<{
      id: string;
      message: string;
      created_time: string;
      from: { name: string; id: string };
    }>;
    summary: { total_count: number };
  };
}

export interface FacebookAuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookUser {
  id: string;
  name: string;
  email?: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

class FacebookService {
  // For demo purposes, we'll use a test app ID
  // In production, you'd create your own Facebook App
  private readonly APP_ID = '1234567890123456'; // Demo app ID
  private readonly REDIRECT_URI = 'http://localhost:1420/auth/facebook/callback';
  private readonly SCOPE = 'user_posts,user_photos,user_videos,email';
  
  private accessToken: string | null = null;
  private user: FacebookUser | null = null;

  /**
   * Get Facebook OAuth URL for user authentication
   */
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.APP_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: this.SCOPE,
      response_type: 'code',
      state: 'random_state_string' // In production, use a secure random string
    });

    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<FacebookAuthResponse> {
    try {
      // For demo purposes, we'll simulate a successful token exchange
      // In production, you'd make the actual API call
      console.log('Simulating Facebook token exchange for code:', code);
      
      const mockResponse: FacebookAuthResponse = {
        access_token: 'demo_access_token_' + Date.now(),
        token_type: 'bearer',
        expires_in: 3600
      };

      this.accessToken = mockResponse.access_token;
      return mockResponse;
    } catch (error) {
      console.error('Failed to exchange code for token:', error);
      throw new Error('Failed to authenticate with Facebook');
    }
  }

  /**
   * Get current user information
   */
  async getCurrentUser(): Promise<FacebookUser> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Make real API call to Facebook Graph API
      const response = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${this.accessToken}&fields=id,name,email,picture`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const userData = await response.json();
      
      if (userData.error) {
        throw new Error(userData.error.message || 'Failed to get user information');
      }

      const user: FacebookUser = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        picture: userData.picture
      };

      this.user = user;
      return user;
    } catch (error) {
      console.error('Failed to get user info:', error);
      throw new Error('Failed to get user information');
    }
  }

  /**
   * Fetch user's posts from Facebook
   * Since user_posts requires app review, we'll create sample posts based on user profile
   */
  async getUserPosts(limit: number = 25): Promise<FacebookPost[]> {
    if (!this.accessToken) {
      throw new Error('No access token available');
    }

    try {
      // Get user profile information
      const userResponse = await fetch(
        `https://graph.facebook.com/v21.0/me?access_token=${this.accessToken}&fields=id,name,email,picture`
      );
      
      if (!userResponse.ok) {
        throw new Error(`Failed to get user profile: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      
      if (userData.error) {
        throw new Error(userData.error.message || 'Failed to get user profile');
      }

      // Create sample posts based on user profile (since we can't access real posts without app review)
      const samplePosts: FacebookPost[] = [
        {
          id: `sample_1_${userData.id}`,
          message: `Hello from ${userData.name}! This is a sample post created for development purposes.`,
          created_time: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          type: 'status',
          from: {
            name: userData.name,
            id: userData.id
          }
        },
        {
          id: `sample_2_${userData.id}`,
          message: `Welcome to MyFace SnapJournal! This is how your Facebook posts would appear here once you have the proper permissions.`,
          created_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          type: 'status',
          from: {
            name: userData.name,
            id: userData.id
          }
        },
        {
          id: `sample_3_${userData.id}`,
          message: `To import your real Facebook posts, you'll need to submit your app for Facebook review and get approval for the user_posts permission.`,
          created_time: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
          type: 'status',
          from: {
            name: userData.name,
            id: userData.id
          }
        }
      ];

      console.log('Created sample posts for development:', samplePosts);
      return samplePosts.slice(0, limit);
      
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      throw new Error('Failed to fetch Facebook posts');
    }
  }

  /**
   * Convert Facebook post to journal entry format
   */
  convertPostToJournalEntry(post: FacebookPost): {
    id: string;
    title: string;
    content: string;
    tags: string[];
    mood: string;
    privacy: 'public';
    source: 'facebook';
    sourceId: string;
    sourceUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: any;
  } {
    // Extract content from post
    const content = post.message || post.story || post.description || '';
    
    // Create title from content (first 50 characters)
    const title = content.length > 50 
      ? content.substring(0, 50) + '...' 
      : content || `Facebook ${post.type}`;

    // Generate tags based on post type and content
    const tags = ['facebook'];
    if (post.type) tags.push(post.type);
    if (post.link) tags.push('link');
    if (post.picture || post.full_picture) tags.push('photo');
    
    // Add content-based tags (simple keyword extraction)
    const contentWords = content.toLowerCase().split(' ');
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    const keywords = contentWords
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 3);
    tags.push(...keywords);

    // Determine mood based on content (simple sentiment analysis)
    const positiveWords = ['happy', 'great', 'awesome', 'amazing', 'love', 'excited', 'wonderful', 'fantastic'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed'];
    
    const contentLower = content.toLowerCase();
    const hasPositive = positiveWords.some(word => contentLower.includes(word));
    const hasNegative = negativeWords.some(word => contentLower.includes(word));
    
    let mood = 'neutral';
    if (hasPositive && !hasNegative) mood = 'happy';
    else if (hasNegative && !hasPositive) mood = 'sad';
    else if (hasPositive && hasNegative) mood = 'neutral';

    return {
      id: `fb_${post.id}`,
      title,
      content: content || `Imported from Facebook: ${post.type} post`,
      tags,
      mood,
      privacy: 'public' as const,
      source: 'facebook' as const,
      sourceId: post.id,
      sourceUrl: post.link,
      createdAt: new Date(post.created_time),
      updatedAt: new Date(),
      metadata: {
        facebookPost: post,
        importDate: new Date(),
        likes: post.likes?.summary?.total_count || 0,
        comments: post.comments?.summary?.total_count || 0,
        type: post.type
      }
    };
  }

  /**
   * Import Facebook posts as journal entries
   */
  async importPostsAsEntries(limit: number = 25): Promise<any[]> {
    try {
      const posts = await this.getUserPosts(limit);
      return posts.map(post => this.convertPostToJournalEntry(post));
    } catch (error) {
      console.error('Failed to import posts:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Set access token (for persistence)
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
  }

  /**
   * Get current user
   */
  getCurrentUserData(): FacebookUser | null {
    return this.user;
  }

  /**
   * Logout and clear stored data
   */
  logout(): void {
    this.accessToken = null;
    this.user = null;
  }
}

export const facebookService = new FacebookService();
