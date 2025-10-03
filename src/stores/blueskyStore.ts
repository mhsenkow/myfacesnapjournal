/**
 * Bluesky Store - Zustand store for managing Bluesky integration
 * 
 * This store handles:
 * - Bluesky authentication and session management
 * - Fetching and caching Bluesky posts
 * - Feed management and filtering
 * - Local storage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BskyAgent } from '@bluesky-social/api';
import { BlueskyPost, BlueskyAuth, BlueskySession, BlueskyFeedType, BlueskyFeedSettings } from '../types/bluesky';

interface BlueskyState {
  // Authentication
  auth: BlueskyAuth;
  
  // Posts and feeds
  posts: BlueskyPost[];
  allPosts: BlueskyPost[];
  isLoading: boolean;
  error: string | null;
  
  // Feed settings
  feedSettings: BlueskyFeedSettings;
  
  // Pagination
  cursor: string | null;
  hasMore: boolean;
  
  // Agent instance
  agent: BskyAgent | null;
}

interface BlueskyActions {
  // Authentication
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<void>;
  
  // Feed management
  fetchPosts: (limit?: number) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // Settings
  setFeedType: (feedType: BlueskyFeedType) => void;
  setLimit: (limit: number) => void;
  
  // Post interactions
  likePost: (uri: string, cid: string) => Promise<void>;
  repostPost: (uri: string, cid: string) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  clearPosts: () => void;
}

export const useBlueskyStore = create<BlueskyState & BlueskyActions>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        isAuthenticated: false,
        session: null,
        server: 'https://bsky.social'
      },
      
      posts: [],
      allPosts: [],
      isLoading: false,
      error: null,
      
      feedSettings: {
        feedType: 'timeline',
        limit: 50
      },
      
      cursor: null,
      hasMore: true,
      agent: null,

      // Actions
      login: async (identifier: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const agent = new BskyAgent({ service: 'https://bsky.social' });
          
          // Create session
          const response = await agent.login({
            identifier,
            password
          });
          
          if (response.success) {
            const session: BlueskySession = {
              did: response.data.did,
              handle: response.data.handle,
              accessJwt: response.data.accessJwt,
              refreshJwt: response.data.refreshJwt,
              email: response.data.email
            };
            
            set({
              auth: {
                isAuthenticated: true,
                session,
                server: 'https://bsky.social'
              },
              agent,
              isLoading: false
            });
            
            // Fetch initial posts
            await get().fetchPosts();
          } else {
            throw new Error('Login failed');
          }
        } catch (error) {
          console.error('Bluesky login error:', error);
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: () => {
        set({
          auth: {
            isAuthenticated: false,
            session: null,
            server: 'https://bsky.social'
          },
          posts: [],
          allPosts: [],
          cursor: null,
          hasMore: true,
          agent: null,
          error: null
        });
      },

      refreshSession: async () => {
        const { auth, agent } = get();
        if (!auth.isAuthenticated || !agent || !auth.session) return;
        
        try {
          // For now, we'll just re-login if session expires
          // In a production app, you'd implement proper token refresh
          console.log('Session refresh not implemented yet');
        } catch (error) {
          console.error('Failed to refresh Bluesky session:', error);
          // If refresh fails, logout user
          get().logout();
        }
      },

      fetchPosts: async (limit = 50) => {
        const { auth, agent, feedSettings } = get();
        if (!auth.isAuthenticated || !agent) return;
        
        set({ isLoading: true, error: null });
        
        try {
          let response;
          
          switch (feedSettings.feedType) {
            case 'timeline':
              response = await agent.getTimeline({
                limit,
                cursor: get().cursor || undefined
              });
              break;
            case 'following':
              response = await agent.getAuthorFeed({
                actor: auth.session!.handle,
                limit,
                cursor: get().cursor || undefined
              });
              break;
            case 'likes':
              response = await agent.getActorLikes({
                actor: auth.session!.handle,
                limit,
                cursor: get().cursor || undefined
              });
              break;
            default:
              throw new Error(`Unknown feed type: ${feedSettings.feedType}`);
          }
          
          if (response.success) {
            const newPosts: BlueskyPost[] = response.data.feed.map(item => ({
              id: item.post.uri,
              uri: item.post.uri,
              cid: item.post.cid,
              author: {
                did: item.post.author.did,
                handle: item.post.author.handle,
                displayName: item.post.author.displayName,
                description: (item.post.author as any).description,
                avatar: item.post.author.avatar,
                verified: (item.post.author as any).verified,
                createdAt: (item.post.author as any).createdAt
              },
              record: {
                text: (item.post.record as any).text || '',
                createdAt: (item.post.record as any).createdAt || new Date().toISOString(),
                reply: (item.post.record as any).reply,
                facets: (item.post.record as any).facets,
                embed: (item.post.record as any).embed
              },
              replyCount: item.post.replyCount || 0,
              repostCount: item.post.repostCount || 0,
              likeCount: item.post.likeCount || 0,
              indexedAt: item.post.indexedAt,
              viewer: item.post.viewer,
              labels: item.post.labels
            }));
            
            set({
              posts: newPosts,
              allPosts: [...get().allPosts, ...newPosts],
              cursor: response.data.cursor,
              hasMore: !!response.data.cursor,
              isLoading: false
            });
          } else {
            throw new Error('Failed to fetch posts');
          }
        } catch (error) {
          console.error('Bluesky fetch error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch posts',
            isLoading: false
          });
        }
      },

      loadMorePosts: async () => {
        const { hasMore, isLoading } = get();
        if (!hasMore || isLoading) return;
        
        await get().fetchPosts();
      },

      refreshFeed: async () => {
        set({ cursor: null, allPosts: [], hasMore: true });
        await get().fetchPosts();
      },

      setFeedType: (feedType: BlueskyFeedType) => {
        set({
          feedSettings: {
            ...get().feedSettings,
            feedType
          },
          cursor: null,
          allPosts: [],
          hasMore: true
        });
        
        // Fetch new feed type
        get().fetchPosts();
      },

      setLimit: (limit: number) => {
        set({
          feedSettings: {
            ...get().feedSettings,
            limit
          }
        });
      },

      likePost: async (uri: string, cid: string) => {
        const { agent } = get();
        if (!agent) return;
        
        try {
          const response = await agent.like(uri, cid);
          // Update the post in the store
          const updatedPosts = get().posts.map(post => 
            post.uri === uri 
              ? {
                  ...post,
                  likeCount: post.likeCount + 1,
                  viewer: {
                    ...post.viewer,
                    like: response.uri
                  }
                }
              : post
          );
          
          set({ posts: updatedPosts });
        } catch (error) {
          console.error('Failed to like post:', error);
        }
      },

      repostPost: async (uri: string, cid: string) => {
        const { agent } = get();
        if (!agent) return;
        
        try {
          const response = await agent.repost(uri, cid);
          // Update the post in the store
          const updatedPosts = get().posts.map(post => 
            post.uri === uri 
              ? {
                  ...post,
                  repostCount: post.repostCount + 1,
                  viewer: {
                    ...post.viewer,
                    repost: response.uri
                  }
                }
              : post
          );
          
          set({ posts: updatedPosts });
        } catch (error) {
          console.error('Failed to repost:', error);
        }
      },

      clearError: () => {
        set({ error: null });
      },

      clearPosts: () => {
        set({
          posts: [],
          allPosts: [],
          cursor: null,
          hasMore: true
        });
      }
    }),
    {
      name: 'bluesky-store',
      partialize: (state) => ({
        auth: state.auth,
        feedSettings: state.feedSettings
      })
    }
  )
);
