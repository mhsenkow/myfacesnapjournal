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
import { useJournalStore } from './journalStore';

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
  restoreSession: () => Promise<boolean>;
  
  // Profile management
  fetchUserProfile: () => Promise<void>;
  
  // Feed management
  fetchPosts: (limit?: number) => Promise<void>;
  loadMorePosts: () => Promise<void>;
  refreshFeed: () => Promise<void>;
  
  // Settings
  setFeedType: (feedType: BlueskyFeedType) => void;
  setLimit: (limit: number) => void;
  
  // Post interactions
  likePost: (uri: string, cid: string) => Promise<void>;
  toggleLike: (uri: string, cid: string) => Promise<void>;
  repostPost: (uri: string, cid: string) => Promise<void>;
  
  // Utilities
  clearError: () => void;
  clearPosts: () => void;
  importPosts: () => Promise<void>;
  fetchMyPosts: () => Promise<BlueskyPost[] | undefined>;
}

export const useBlueskyStore = create<BlueskyState & BlueskyActions>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        isAuthenticated: false,
        session: null,
        server: 'https://bsky.social',
        user: undefined
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
            
            // Persist session to localStorage
            localStorage.setItem('bluesky-session', JSON.stringify(session));
            
            // Fetch user profile
            await get().fetchUserProfile();
            
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
        localStorage.removeItem('bluesky-session');
        set({
          auth: {
            isAuthenticated: false,
            session: null,
            server: 'https://bsky.social',
            user: undefined
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

      fetchUserProfile: async () => {
        const { auth } = get();
        if (!auth.isAuthenticated || !auth.session) {
          console.log('Bluesky fetchUserProfile: Not authenticated');
          return;
        }

        try {
          // Create a fresh agent for this request
          const agent = new BskyAgent({ service: 'https://bsky.social' });
          await agent.resumeSession(auth.session as any);

          // Fetch user profile
          const response = await agent.getProfile({
            actor: auth.session.did
          });

          if (response.success) {
            const profile = response.data;
            const userProfile = {
              did: profile.did,
              handle: profile.handle,
              displayName: profile.displayName,
              description: profile.description,
              avatar: profile.avatar,
              verified: false, // Bluesky doesn't have verified status like Twitter
              createdAt: profile.createdAt
            };

            set({
              auth: {
                ...auth,
                user: userProfile
              }
            });

            console.log('Bluesky user profile fetched successfully:', userProfile);
          }
        } catch (error) {
          console.error('Failed to fetch Bluesky user profile:', error);
        }
      },

      fetchPosts: async (limit = 50) => {
        const { auth, feedSettings } = get();
        if (!auth.isAuthenticated || !auth.session) {
          console.log('Bluesky fetchPosts: Not authenticated or no session', { 
            isAuthenticated: auth.isAuthenticated, 
            hasSession: !!auth.session,
            authSession: auth.session
          });
          return;
        }

        // Create a fresh agent for this request
        const agent = new BskyAgent({ service: 'https://bsky.social' });
        try {
          await agent.resumeSession(auth.session as any);
          console.log('Bluesky agent created and session resumed successfully');
        } catch (error) {
          console.error('Failed to resume session for fetchPosts:', error);
          return;
        }
        
        console.log('Bluesky fetchPosts: Starting fetch', { feedSettings, limit });
        set({ isLoading: true, error: null });
        
        try {
          let response;
          
          switch (feedSettings.feedType) {
            case 'timeline':
              console.log('Bluesky fetchPosts: Fetching timeline');
              response = await agent.getTimeline({
                limit,
                cursor: get().cursor || undefined
              });
              break;
            case 'following':
              console.log('Bluesky fetchPosts: Fetching author feed for', auth.session!.handle);
              console.log('Bluesky fetchPosts: Using DID for actor:', auth.session!.did);
              response = await agent.getAuthorFeed({
                actor: auth.session!.did, // Use DID instead of handle
                filter: 'posts_no_replies',
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
          
          console.log('Bluesky fetchPosts: API response', { 
            success: response.success, 
            feedLength: response.data?.feed?.length,
            firstPost: response.data?.feed?.[0] ? {
              uri: response.data.feed[0].post.uri,
              author: {
                did: response.data.feed[0].post.author.did,
                handle: response.data.feed[0].post.author.handle
              }
            } : null
          });
          
          if (response.success) {
            console.log('Bluesky fetchPosts: Processing posts', { feedLength: response.data.feed.length });
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

      // Restore session from localStorage
      restoreSession: async () => {
        try {
          const storedSession = localStorage.getItem('bluesky-session');
          if (storedSession) {
            const session = JSON.parse(storedSession);
            const agent = new BskyAgent({ service: 'https://bsky.social' });
            
            // Restore the session in the agent using the resume method
            try {
              await agent.resumeSession(session);
            } catch (resumeError) {
              console.warn('Failed to resume Bluesky session, will need to re-login:', resumeError);
              localStorage.removeItem('bluesky-session');
              return false;
            }
            
            set({
              auth: {
                isAuthenticated: true,
                session,
                server: 'https://bsky.social'
              },
              agent,
              isLoading: false
            });
            
            // Verify the agent was actually set in the store
            const storeState = get();
            console.log('Bluesky session restored from localStorage, agent set:', !!agent);
            console.log('Store state after setting agent:', {
              hasAgent: !!storeState.agent,
              agentType: typeof storeState.agent,
              agentConstructor: storeState.agent?.constructor?.name
            });
            
            // Trigger a fetch after successful session restoration
            setTimeout(() => {
              console.log('Auto-fetching posts after session restoration...');
              get().fetchPosts();
            }, 100);
            
            return true;
          }
        } catch (error) {
          console.error('Failed to restore Bluesky session:', error);
          localStorage.removeItem('bluesky-session');
        }
        return false;
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

      toggleLike: async (uri: string, cid: string) => {
        const { agent, posts } = get();
        if (!agent) return;
        
        // Find the post to check if it's already liked
        const post = posts.find(p => p.uri === uri);
        if (!post) return;
        
        const isLiked = !!post.viewer?.like;
        
        try {
          console.log('🔄 Bluesky toggleLike:', { uri, cid, isLiked, action: isLiked ? 'unlike' : 'like' });
          
          let updatedPosts: BlueskyPost[];
          
          if (isLiked) {
            // Unlike the post
            await agent.deleteLike(post.viewer!.like!);
            updatedPosts = posts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    likeCount: Math.max(0, p.likeCount - 1),
                    viewer: {
                      ...p.viewer,
                      like: undefined
                    }
                  }
                : p
            );
          } else {
            // Like the post
            const response = await agent.like(uri, cid);
            updatedPosts = posts.map(p => 
              p.uri === uri 
                ? {
                    ...p,
                    likeCount: p.likeCount + 1,
                    viewer: {
                      ...p.viewer,
                      like: response.uri
                    }
                  }
                : p
            );
          }
          
          set({ posts: updatedPosts });
          console.log(`✅ Bluesky post ${isLiked ? 'unliked' : 'liked'} successfully`);
        } catch (error) {
          console.error('Failed to toggle like:', error);
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
      },

      fetchMyPosts: async () => {
        const { auth, agent } = get();
        
        if (!auth.isAuthenticated || !auth.session || !agent) {
          console.error('❌ Cannot fetch my posts - not authenticated');
          return;
        }

        console.log('📱 Fetching MY Bluesky posts for journal import...');
        console.log('👤 My DID:', auth.session.did);
        console.log('👤 My Handle:', auth.session.handle);
        
        try {
          // Try accessing your repository directly using raw AT Protocol
          console.log('🔍 Trying to access YOUR repository directly...');
          console.log('👤 My DID:', auth.session.did);
          console.log('👤 My Handle:', auth.session.handle);
          
          // Method 1: Try getProfile first to verify we can access your data
          console.log('🔄 Step 1: Getting your profile...');
          const profileResponse = await agent.getProfile({
            actor: auth.session.handle
          });
          
          console.log('📡 Profile response:', {
            success: profileResponse.success,
            handle: profileResponse.data?.handle,
            did: profileResponse.data?.did,
            postsCount: profileResponse.data?.postsCount,
            followersCount: profileResponse.data?.followersCount,
            followsCount: profileResponse.data?.followsCount
          });
          
          if (!profileResponse.success) {
            throw new Error('Cannot access your profile - authentication issue');
          }
          
          // Method 2: Try getAuthorFeed with your handle
          console.log('🔄 Step 2: Getting your posts with getAuthorFeed...');
          const feedResponse = await agent.getAuthorFeed({
            actor: auth.session.handle,
            filter: 'posts_no_replies',
            limit: 100
          });
          
          console.log('📡 getAuthorFeed response:', {
            success: feedResponse.success,
            feedLength: feedResponse.data?.feed?.length,
            firstPostAuthor: feedResponse.data?.feed?.[0]?.post?.author?.did,
            firstPostAuthorHandle: feedResponse.data?.feed?.[0]?.post?.author?.handle,
            myDID: auth.session.did,
            myHandle: auth.session.handle,
            isMyPost: feedResponse.data?.feed?.[0]?.post?.author?.did === auth.session.did
          });
          
          // Method 3: If getAuthorFeed doesn't work, try with DID
          if (!feedResponse.success || feedResponse.data.feed.length === 0) {
            console.log('🔄 Step 3: Trying getAuthorFeed with DID...');
            const feedResponse2 = await agent.getAuthorFeed({
              actor: auth.session.did,
              filter: 'posts_no_replies',
              limit: 100
            });
            
            console.log('📡 getAuthorFeed (DID) response:', {
              success: feedResponse2.success,
              feedLength: feedResponse2.data?.feed?.length,
              firstPostAuthor: feedResponse2.data?.feed?.[0]?.post?.author?.did,
              firstPostAuthorHandle: feedResponse2.data?.feed?.[0]?.post?.author?.handle,
              isMyPost: feedResponse2.data?.feed?.[0]?.post?.author?.did === auth.session.did
            });
            
            if (feedResponse2.success && feedResponse2.data.feed.length > 0) {
              feedResponse.data.feed = feedResponse2.data.feed;
            }
          }
          
          // Method 4: Try listRecords with different approach
          if (!feedResponse.success || feedResponse.data.feed.length === 0) {
            console.log('🔄 Step 4: Trying listRecords with your repository...');
            const listResponse = await agent.com.atproto.repo.listRecords({
              repo: auth.session.did,
              collection: 'app.bsky.feed.post',
              limit: 100
            });
            
            console.log('📡 listRecords response:', {
              success: listResponse.success,
              recordsLength: listResponse.data?.records?.length,
              firstRecord: listResponse.data?.records?.[0] ? {
                uri: listResponse.data.records[0].uri,
                collection: listResponse.data.records[0].collection
              } : null
            });
            
            // Convert listRecords to feed format if successful
            if (listResponse.success && listResponse.data.records.length > 0) {
              feedResponse.success = true;
              feedResponse.data = {
                feed: listResponse.data.records.map(record => ({
                  post: {
                    uri: record.uri,
                    cid: record.cid,
                    author: {
                      did: auth.session.did,
                      handle: auth.session.handle,
                      displayName: auth.session.handle
                    },
                    record: record.value,
                    replyCount: 0,
                    repostCount: 0,
                    likeCount: 0,
                    indexedAt: new Date().toISOString(),
                    viewer: {},
                    labels: []
                  }
                }))
              };
            }
          }
          
          // Process the results
          if (feedResponse.success && feedResponse.data.feed.length > 0) {
            console.log('Bluesky fetchMyPosts: Processing posts', { feedLength: feedResponse.data.feed.length });
            
            // Filter to only YOUR posts
            const myPosts = feedResponse.data.feed
              .filter(item => item.post.author.did === auth.session.did)
              .map(item => ({
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
            
            console.log(`✅ Found ${myPosts.length} of MY posts after filtering`);
            
            // Store these posts separately for journal import
            set({ 
              allPosts: myPosts, // Replace with only MY posts
              isLoading: false 
            });
            
            return myPosts;
          } else {
            console.log('❌ No posts found with any method');
            throw new Error('No posts found - you may not have any posts on Bluesky');
          }
        } catch (error) {
          console.error('Bluesky fetchMyPosts error:', error);
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch my posts',
            isLoading: false
          });
          throw error;
        }
      },

      importPosts: async () => {
        const { auth } = get();
        
        if (!auth.isAuthenticated || !auth.session) {
          console.error('❌ Cannot import posts - not authenticated');
          return;
        }

        console.log('📱 Starting Bluesky post import to journal...');
        
        try {
          // First, fetch MY posts specifically
          await get().fetchMyPosts();
          
          // Now get the updated allPosts with MY posts
          const { allPosts } = get();
          
          // Filter for MY posts (should be all of them now since fetchMyPosts only gets MY posts)
          const myPosts = allPosts.filter(post => {
            const isMyPost = post.author.did === auth.session!.did;
            console.log(`📋 Post ${post.id}: author DID "${post.author.did}" vs my DID "${auth.session!.did}" = ${isMyPost}`);
            return isMyPost;
          });
          
          console.log(`🔍 Found ${myPosts.length} of my posts out of ${allPosts.length} total posts`);
          
          let successCount = 0;
          let errorCount = 0;
          
          for (const post of myPosts) {
            try {
              console.log(`🔄 Creating journal entry for Bluesky post:`, post.id, post.record.text?.substring(0, 50));
              await useJournalStore.getState().createEntryFromSocialPost(post, 'bluesky');
              successCount++;
              console.log(`✅ Successfully imported Bluesky post ${post.id} to journal`);
            } catch (error) {
              errorCount++;
              console.error('❌ Failed to import Bluesky post to journal:', post.id, error);
            }
          }
          
          console.log(`📊 Bluesky import complete: ${successCount} successful, ${errorCount} errors`);
        } catch (error) {
          console.error('❌ Failed to fetch my posts for import:', error);
          throw error;
        }
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
