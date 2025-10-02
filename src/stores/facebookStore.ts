/**
 * Facebook Store - Zustand store for Facebook integration
 * 
 * Manages Facebook authentication state, import settings, and imported posts
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { facebookService } from '../services/facebookService';
import { FacebookImportSettings, FacebookAuthState, FacebookJournalEntry } from '../types/facebook';

interface FacebookState {
  // Authentication
  auth: FacebookAuthState;
  
  // Import settings
  importSettings: FacebookImportSettings;
  
  // Imported posts
  importedPosts: FacebookJournalEntry[];
  
  // UI state
  isImporting: boolean;
  importProgress: number;
  lastImportError?: string;
}

interface FacebookActions {
  // Authentication
  setAuthState: (auth: FacebookAuthState) => void;
  login: (authResponse?: any) => Promise<void>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
  
  // Import settings
  updateImportSettings: (settings: Partial<FacebookImportSettings>) => void;
  
  // Import functionality
  importPosts: (limit?: number) => Promise<FacebookJournalEntry[]>;
  clearImportedPosts: () => void;
  
  // UI state
  setIsImporting: (importing: boolean) => void;
  setImportProgress: (progress: number) => void;
  setLastImportError: (error?: string) => void;
}

export const useFacebookStore = create<FacebookState & FacebookActions>()(
  persist(
    (set, get) => ({
      // Initial state
      auth: {
        isAuthenticated: false,
      },
      
      importSettings: {
        enabled: false,
        autoImport: false,
        importInterval: 24, // 24 hours
        importLimit: 25,
        includePhotos: true,
        includeVideos: true,
        includeLinks: true,
        includeStatusUpdates: true,
      },
      
      importedPosts: [],
      isImporting: false,
      importProgress: 0,
      
      // Authentication actions
      setAuthState: (auth) => {
        set({ auth });
        if (auth.accessToken) {
          facebookService.setAccessToken(auth.accessToken);
        }
      },
      
      login: async (authResponse?: any) => {
        try {
          if (!authResponse) {
            throw new Error('No authentication response provided');
          }

          console.log('Processing Facebook authentication response:', authResponse);
          
          // Set the access token
          facebookService.setAccessToken(authResponse.accessToken);
          
          // Get user info
          const user = await facebookService.getCurrentUser();
          
          const auth: FacebookAuthState = {
            isAuthenticated: true,
            accessToken: authResponse.accessToken,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              picture: user.picture?.data?.url
            },
            lastAuthDate: new Date()
          };
          
          set({ auth });
          console.log('Facebook authentication successful:', auth);
        } catch (error) {
          console.error('Facebook login failed:', error);
          set({ lastImportError: 'Login failed' });
          throw error;
        }
      },
      
      logout: () => {
        facebookService.logout();
        set({ 
          auth: { isAuthenticated: false },
          importedPosts: [],
          lastImportError: undefined
        });
      },
      
      checkAuthStatus: async () => {
        try {
          const token = facebookService.getAccessToken();
          if (!token) {
            set({ auth: { isAuthenticated: false } });
            return false;
          }
          
          // In a real app, you'd validate the token with Facebook
          const isAuthenticated = facebookService.isAuthenticated();
          set({ auth: { ...get().auth, isAuthenticated } });
          return isAuthenticated;
        } catch (error) {
          console.error('Auth check failed:', error);
          set({ auth: { isAuthenticated: false } });
          return false;
        }
      },
      
      // Import settings actions
      updateImportSettings: (settings) => {
        set(state => ({
          importSettings: { ...state.importSettings, ...settings }
        }));
      },
      
      // Import functionality
      importPosts: async () => {
        const { auth, importSettings } = get();
        
        if (!auth.isAuthenticated) {
          throw new Error('Not authenticated with Facebook');
        }
        
        set({ isImporting: true, importProgress: 0, lastImportError: undefined });
        
        try {
          // Simulate import progress
          set({ importProgress: 25 });
          
          // Fetch actual posts from Facebook service
          const posts = await facebookService.getUserPosts(importSettings.importLimit);
          console.log('Fetched posts from Facebook:', posts);
          
          set({ importProgress: 50 });
          
          // Convert posts to journal entries
          const journalEntries = posts.map(post => facebookService.convertPostToJournalEntry(post));
          console.log('Converted to journal entries:', journalEntries);
          
          set({ importProgress: 75 });
          
          // Filter posts based on settings
          const filteredPosts = journalEntries.filter(entry => {
            if (!importSettings.includeStatusUpdates && entry.metadata?.type === 'status') return false;
            if (!importSettings.includePhotos && entry.metadata?.type === 'photo') return false;
            if (!importSettings.includeVideos && entry.metadata?.type === 'video') return false;
            if (!importSettings.includeLinks && entry.metadata?.type === 'link') return false;
            return true;
          });
          
          set({ importProgress: 100 });
          
          // Add to imported posts
          set(state => ({
            importedPosts: [...state.importedPosts, ...filteredPosts],
            importSettings: {
              ...state.importSettings,
              lastImportDate: new Date()
            }
          }));
          
          set({ isImporting: false, importProgress: 0 });
          return filteredPosts;
          
        } catch (error) {
          console.error('Import failed:', error);
          set({ 
            isImporting: false, 
            importProgress: 0,
            lastImportError: error instanceof Error ? error.message : 'Import failed'
          });
          throw error;
        }
      },
      
      clearImportedPosts: () => {
        set({ importedPosts: [] });
      },
      
      // UI state actions
      setIsImporting: (importing) => {
        set({ isImporting: importing });
      },
      
      setImportProgress: (progress) => {
        set({ importProgress: progress });
      },
      
      setLastImportError: (error) => {
        set({ lastImportError: error });
      },
    }),
    {
      name: 'facebook-store',
      partialize: (state) => ({
        auth: state.auth,
        importSettings: state.importSettings,
        importedPosts: state.importedPosts,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert date strings back to Date objects after rehydration
          if (state.auth.lastAuthDate && typeof state.auth.lastAuthDate === 'string') {
            state.auth.lastAuthDate = new Date(state.auth.lastAuthDate);
          }
          if (state.importSettings.lastImportDate && typeof state.importSettings.lastImportDate === 'string') {
            state.importSettings.lastImportDate = new Date(state.importSettings.lastImportDate);
          }
          if (state.importedPosts) {
            state.importedPosts = state.importedPosts.map(post => ({
              ...post,
              createdAt: new Date(post.createdAt),
              updatedAt: new Date(post.updatedAt),
              metadata: post.metadata ? {
                ...post.metadata,
                importDate: new Date(post.metadata.importDate)
              } : undefined
            }));
          }
        }
      },
    }
  )
);
