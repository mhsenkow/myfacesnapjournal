/**
 * Facebook Web Scraping Service
 * 
 * Alternative approach to Facebook API that uses web scraping
 * This bypasses the need for app review but requires user interaction
 */

export interface ScrapedFacebookPost {
  id: string;
  content: string;
  timestamp: string;
  type: 'post' | 'photo' | 'video' | 'link';
  url?: string;
  images?: string[];
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface ScrapingInstructions {
  method: 'manual_export' | 'browser_extension' | 'bookmarklet';
  steps: string[];
  estimatedTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

class FacebookScrapingService {
  
  /**
   * Get instructions for different scraping methods
   */
  getScrapingInstructions(): ScrapingInstructions[] {
    return [
      {
        method: 'manual_export',
        steps: [
          'Go to Facebook Settings & Privacy > Settings',
          'Click "Your Facebook Information"',
          'Click "Download Your Information"',
          'Select "Posts" and choose date range',
          'Choose "JSON" format and click "Create File"',
          'Download the file when ready (may take a few hours)',
          'Upload the file to this app'
        ],
        estimatedTime: '2-4 hours (mostly waiting)',
        difficulty: 'easy'
      },
      {
        method: 'browser_extension',
        steps: [
          'Install a Facebook data export browser extension',
          'Log into Facebook',
          'Run the extension to scrape your posts',
          'Export the data as JSON',
          'Upload the file to this app'
        ],
        estimatedTime: '10-30 minutes',
        difficulty: 'medium'
      },
      {
        method: 'bookmarklet',
        steps: [
          'Add our custom bookmarklet to your browser',
          'Go to your Facebook profile',
          'Click the bookmarklet to start scraping',
          'Wait for it to collect your posts',
          'Download the JSON file',
          'Upload to this app'
        ],
        estimatedTime: '5-15 minutes',
        difficulty: 'medium'
      }
    ];
  }

  /**
   * Parse Facebook data export JSON file
   */
  parseFacebookExport(jsonData: any): ScrapedFacebookPost[] {
    const posts: ScrapedFacebookPost[] = [];
    
    try {
      // Facebook export structure varies, but typically has posts array
      const postsData = jsonData.posts || jsonData.data || jsonData;
      
      if (Array.isArray(postsData)) {
        postsData.forEach((post: any, index: number) => {
          if (post.data && Array.isArray(post.data)) {
            // Handle nested structure
            post.data.forEach((item: any) => {
              const scrapedPost = this.convertToScrapedPost(item, index);
              if (scrapedPost) posts.push(scrapedPost);
            });
          } else {
            // Handle direct structure
            const scrapedPost = this.convertToScrapedPost(post, index);
            if (scrapedPost) posts.push(scrapedPost);
          }
        });
      }
      
      return posts;
    } catch (error) {
      console.error('Error parsing Facebook export:', error);
      throw new Error('Failed to parse Facebook export file');
    }
  }

  /**
   * Convert Facebook export item to our format
   */
  private convertToScrapedPost(item: any, index: number): ScrapedFacebookPost | null {
    try {
      // Extract content from various possible fields
      const content = item.post || item.message || item.text || item.content || '';
      const timestamp = item.timestamp || item.created_time || item.date || new Date().toISOString();
      
      if (!content && !item.attachments) {
        return null; // Skip empty posts
      }

      return {
        id: item.id || `scraped_${index}_${Date.now()}`,
        content: content || 'Shared content',
        timestamp: timestamp,
        type: this.determinePostType(item),
        url: item.uri || item.url,
        images: this.extractImages(item),
        likes: item.likes?.length || 0,
        comments: item.comments?.length || 0,
        shares: item.shares || 0
      };
    } catch (error) {
      console.error('Error converting post:', error);
      return null;
    }
  }

  /**
   * Determine post type from Facebook data
   */
  private determinePostType(item: any): 'post' | 'photo' | 'video' | 'link' {
    if (item.attachments) {
      const attachments = Array.isArray(item.attachments) ? item.attachments : [item.attachments];
      
      for (const attachment of attachments) {
        if (attachment.data) {
          const data = Array.isArray(attachment.data) ? attachment.data : [attachment.data];
          
          for (const dataItem of data) {
            if (dataItem.media) {
              if (dataItem.media.photo) return 'photo';
              if (dataItem.media.video) return 'video';
            }
            if (dataItem.external_context) return 'link';
          }
        }
      }
    }
    
    return 'post';
  }

  /**
   * Extract images from Facebook post data
   */
  private extractImages(item: any): string[] {
    const images: string[] = [];
    
    if (item.attachments) {
      const attachments = Array.isArray(item.attachments) ? item.attachments : [item.attachments];
      
      attachments.forEach((attachment: any) => {
        if (attachment.data) {
          const data = Array.isArray(attachment.data) ? attachment.data : [attachment.data];
          
          data.forEach((dataItem: any) => {
            if (dataItem.media?.photo?.uri) {
              images.push(dataItem.media.photo.uri);
            }
          });
        }
      });
    }
    
    return images;
  }

  /**
   * Generate bookmarklet code for manual scraping
   */
  generateBookmarklet(): string {
    const bookmarkletCode = `
      (function() {
        const posts = [];
        const postElements = document.querySelectorAll('[data-pagelet*="FeedUnit"]');
        
        postElements.forEach((element, index) => {
          try {
            const textElement = element.querySelector('[data-ad-preview="message"]');
            const timeElement = element.querySelector('a[role="link"] time');
            const likeElement = element.querySelector('[aria-label*="like"]');
            
            if (textElement) {
              posts.push({
                id: 'scraped_' + index + '_' + Date.now(),
                content: textElement.textContent || '',
                timestamp: timeElement ? timeElement.getAttribute('datetime') : new Date().toISOString(),
                type: 'post',
                likes: likeElement ? parseInt(likeElement.textContent) || 0 : 0
              });
            }
          } catch (e) {
            console.error('Error scraping post:', e);
          }
        });
        
        const dataStr = JSON.stringify(posts, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'facebook_posts_' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert('Scraped ' + posts.length + ' posts! Download should start automatically.');
      })();
    `;
    
    return `javascript:${encodeURIComponent(bookmarkletCode)}`;
  }

  /**
   * Convert scraped post to journal entry format
   */
  convertToJournalEntry(post: ScrapedFacebookPost): {
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
    // Create title from content (first 50 characters)
    const title = post.content.length > 50 
      ? post.content.substring(0, 50) + '...' 
      : post.content || `Facebook ${post.type}`;

    // Generate tags based on post type and content
    const tags = ['facebook', 'scraped', post.type];
    
    // Add content-based tags (simple keyword extraction)
    const contentWords = post.content.toLowerCase().split(' ');
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'];
    const keywords = contentWords
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 3);
    tags.push(...keywords);

    // Determine mood based on content (simple sentiment analysis)
    const positiveWords = ['happy', 'great', 'awesome', 'amazing', 'love', 'excited', 'wonderful', 'fantastic'];
    const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'disappointed'];
    
    const contentLower = post.content.toLowerCase();
    const hasPositive = positiveWords.some(word => contentLower.includes(word));
    const hasNegative = negativeWords.some(word => contentLower.includes(word));
    
    let mood = 'neutral';
    if (hasPositive && !hasNegative) mood = 'happy';
    else if (hasNegative && !hasPositive) mood = 'sad';
    else if (hasPositive && hasNegative) mood = 'neutral';

    return {
      id: post.id,
      title,
      content: post.content || `Imported from Facebook: ${post.type} post`,
      tags,
      mood,
      privacy: 'public' as const,
      source: 'facebook' as const,
      sourceId: post.id,
      sourceUrl: post.url,
      createdAt: new Date(post.timestamp),
      updatedAt: new Date(),
      metadata: {
        scrapedPost: post,
        importDate: new Date(),
        likes: post.likes || 0,
        comments: post.comments || 0,
        shares: post.shares || 0,
        type: post.type,
        images: post.images || []
      }
    };
  }
}

export const facebookScrapingService = new FacebookScrapingService();
