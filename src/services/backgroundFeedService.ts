/**
 * Background Feed Service for MyFace SnapJournal
 * 
 * Handles background loading and refreshing of Mastodon feeds
 * so they work seamlessly while users are on other pages
 */

import { useMastodonStore } from '../stores/mastodonStore';

class BackgroundFeedService {
  private refreshInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private store: any = null;

  constructor() {
    // Initialize when the service is created
    this.initialize();
  }

  private initialize() {
    // Set up store subscription to react to auth and live feed changes
    useMastodonStore.subscribe((state) => {
      // If auth status changed and we're now authenticated, start background loading
      if (state.auth.isAuthenticated && !this.isInitialized) {
        this.startBackgroundLoading();
        this.isInitialized = true;
      } else if (!state.auth.isAuthenticated && this.isInitialized) {
        this.stopBackgroundLoading();
        this.isInitialized = false;
      }
      
      // Handle live feed toggle changes
      if (state.auth.isAuthenticated && this.isInitialized) {
        if (state.isLiveFeed && !this.refreshInterval) {
          this.startPeriodicRefresh(state.liveFeedInterval);
        } else if (!state.isLiveFeed && this.refreshInterval) {
          this.stopBackgroundLoading();
        }
      }
    });
  }

  private async startBackgroundLoading() {
    const { auth, fetchPublicTimeline, isLiveFeed, liveFeedInterval } = useMastodonStore.getState();
    
    if (!auth.isAuthenticated) return;

    console.log('🚀 Starting background feed loading...');
    
    // Initial load
    try {
      await fetchPublicTimeline();
      console.log('✅ Initial background feed load completed');
    } catch (error) {
      console.error('❌ Initial background feed load failed:', error);
    }

    // Set up periodic refresh if live feed is enabled
    if (isLiveFeed) {
      this.startPeriodicRefresh(liveFeedInterval);
    }
  }

  private stopBackgroundLoading() {
    console.log('🛑 Stopping background feed loading...');
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private startPeriodicRefresh(interval: number) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.refreshInterval = setInterval(async () => {
      const { refreshLiveFeed, auth } = useMastodonStore.getState();
      
      if (auth.isAuthenticated) {
        try {
          await refreshLiveFeed();
          console.log('🔄 Background feed refresh completed');
        } catch (error) {
          console.error('❌ Background feed refresh failed:', error);
        }
      }
    }, interval);

    console.log(`⏰ Started periodic refresh every ${interval}ms`);
  }

  // Public method to manually trigger refresh
  public async refreshFeed() {
    const { fetchPublicTimeline, auth } = useMastodonStore.getState();
    
    if (auth.isAuthenticated) {
      try {
        await fetchPublicTimeline();
        console.log('🔄 Manual background refresh completed');
      } catch (error) {
        console.error('❌ Manual background refresh failed:', error);
      }
    }
  }

  // Public method to update refresh interval
  public updateRefreshInterval(newInterval: number) {
    const { isLiveFeed } = useMastodonStore.getState();
    
    if (isLiveFeed) {
      this.startPeriodicRefresh(newInterval);
    }
  }

  // Public method to toggle live feed
  public toggleLiveFeed(enable: boolean) {
    const { liveFeedInterval } = useMastodonStore.getState();
    
    if (enable) {
      this.startPeriodicRefresh(liveFeedInterval);
    } else {
      this.stopBackgroundLoading();
    }
  }

  // Cleanup method
  public destroy() {
    this.stopBackgroundLoading();
  }
}

// Create singleton instance
export const backgroundFeedService = new BackgroundFeedService();

// Export for use in components
export default backgroundFeedService;
