/**
 * Documents Store - Zustand store for managing documents
 * 
 * This store handles:
 * - Creating, reading, updating, and deleting documents
 * - Local storage persistence
 * - Search and filtering
 */

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Document } from '../types/document';

// Re-export types
export type { Document };

// Check if we're running in Tauri (desktop) or browser
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;

interface DocumentsState {
  documents: Document[];
  selectedDocument: Document | null;
  searchQuery: string;
  selectedTags: string[];
  isInitialized: boolean;
}

interface DocumentsActions {
  // Document CRUD
  createDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  selectDocument: (document: Document | null) => void;
  loadDocuments: () => Promise<void>;
  
  // Search and filtering
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  
  // Computed values
  filteredDocuments: () => Document[];
  allTags: () => string[];
  
  // Utilities
  clearFilters: () => void;
}

export const useDocumentsStore = create<DocumentsState & DocumentsActions>()(
  (set, get) => ({
    // State
    documents: [],
    selectedDocument: null,
    searchQuery: '',
    selectedTags: [],
    isInitialized: false,

    // Actions
    createDocument: async (documentData) => {
      if (isTauri) {
        try {
          // For now, use journal_entry table as documents are similar
          // In the future, we might want a separate documents table
          const newEntry = await invoke<any>('create_journal_entry', {
            title: documentData.title,
            content: documentData.content,
            tags: documentData.tags,
            mood: null,
            privacy: 'private',
            source: null,
            sourceId: null,
            sourceUrl: null,
            metadata: { type: 'document', ...documentData.metadata },
          });
          
          // Convert entry to Document format
          const newDocument: Document = {
            id: newEntry.id,
            title: newEntry.title,
            content: newEntry.content,
            tags: newEntry.tags || [],
            createdAt: new Date(newEntry.created_at || newEntry.createdAt),
            updatedAt: new Date(newEntry.updated_at || newEntry.updatedAt),
            metadata: newEntry.metadata,
          };
          
          set((state) => ({
            documents: [newDocument, ...state.documents],
            selectedDocument: newDocument,
          }));
        } catch (error) {
          console.error('Failed to create document:', error);
          throw error;
        }
      } else {
        // Browser fallback - use localStorage
        const newDocument: Document = {
          ...documentData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => {
          const newState = {
            documents: [newDocument, ...state.documents],
            selectedDocument: newDocument,
          };
          
          // Persist to localStorage
          try {
            localStorage.setItem('documents', JSON.stringify(newState.documents));
          } catch (error) {
            console.error('Failed to save documents to localStorage:', error);
          }
          
          return newState;
        });
      }
    },

    updateDocument: async (id, updates) => {
      if (isTauri) {
        try {
          await invoke('update_journal_entry', {
            id,
            title: updates.title || '',
            content: updates.content || '',
            tags: updates.tags || [],
            mood: null,
            privacy: 'private',
            source: null,
            sourceId: null,
            sourceUrl: null,
            metadata: { type: 'document', ...updates.metadata },
          });
          
          set((state) => {
            const newState = {
              documents: state.documents.map((doc) =>
                doc.id === id
                  ? { ...doc, ...updates, updatedAt: new Date() }
                  : doc
              ),
              selectedDocument: state.selectedDocument?.id === id
                ? { ...state.selectedDocument, ...updates, updatedAt: new Date() }
                : state.selectedDocument,
            };
            
            return newState;
          });
        } catch (error) {
          console.error('Failed to update document:', error);
          throw error;
        }
      } else {
        // Browser fallback - use localStorage
        set((state) => {
          const newState = {
            documents: state.documents.map((doc) =>
              doc.id === id
                ? { ...doc, ...updates, updatedAt: new Date() }
                : doc
            ),
            selectedDocument: state.selectedDocument?.id === id
              ? { ...state.selectedDocument, ...updates, updatedAt: new Date() }
              : state.selectedDocument,
          };
          
          // Persist to localStorage
          try {
            localStorage.setItem('documents', JSON.stringify(newState.documents));
          } catch (error) {
            console.error('Failed to save documents to localStorage:', error);
          }
          
          return newState;
        });
      }
    },

    deleteDocument: async (id) => {
      if (isTauri) {
        try {
          await invoke('delete_journal_entry', { id });
          
          set((state) => ({
            documents: state.documents.filter((doc) => doc.id !== id),
            selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument,
          }));
        } catch (error) {
          console.error('Failed to delete document:', error);
          throw error;
        }
      } else {
        // Browser fallback - use localStorage
        set((state) => {
          const newState = {
            documents: state.documents.filter((doc) => doc.id !== id),
            selectedDocument: state.selectedDocument?.id === id ? null : state.selectedDocument,
          };
          
          // Persist to localStorage
          try {
            localStorage.setItem('documents', JSON.stringify(newState.documents));
          } catch (error) {
            console.error('Failed to save documents to localStorage:', error);
          }
          
          return newState;
        });
      }
    },

    selectDocument: (document) => {
      set({ selectedDocument: document });
    },

    loadDocuments: async () => {
      const { isInitialized } = get();
      if (isInitialized) return; // Prevent multiple loads
      
      if (isTauri) {
        try {
          // Load all entries and filter for documents
          const entries = await invoke<any[]>('list_journal_entries', {
            limit: null,
            offset: null,
          });
          
          // Filter for documents (entries with metadata.type === 'document')
          const documents = entries
            .filter((entry: any) => {
              // Check if metadata exists and has type === 'document'
              const metadata = entry.metadata;
              return metadata && typeof metadata === 'object' && metadata.type === 'document';
            })
            .map((entry: any) => ({
              id: entry.id,
              title: entry.title,
              content: entry.content,
              tags: entry.tags || [],
              createdAt: new Date(entry.created_at || entry.createdAt),
              updatedAt: new Date(entry.updated_at || entry.updatedAt),
              metadata: entry.metadata,
            }));
          
          set({ documents, isInitialized: true });
        } catch (error) {
          console.error('Failed to load documents from database:', error);
          set({ isInitialized: true });
        }
      } else {
        // Browser fallback - use localStorage
        try {
          const stored = localStorage.getItem('documents');
          if (stored) {
            const documents = JSON.parse(stored).map((doc: any) => ({
              ...doc,
              createdAt: new Date(doc.createdAt),
              updatedAt: new Date(doc.updatedAt),
            }));
            set({ documents, isInitialized: true });
          } else {
            set({ isInitialized: true });
          }
        } catch (error) {
          console.error('Failed to load documents from localStorage:', error);
          set({ isInitialized: true });
        }
      }
    },

    setSearchQuery: (query) => {
      set({ searchQuery: query });
    },

    setSelectedTags: (tags) => {
      set({ selectedTags: tags });
    },

    // Computed values
    filteredDocuments: () => {
      const { documents, searchQuery, selectedTags } = get();
      
      return documents.filter((doc) => {
        // Search query
        if (searchQuery) {
          const searchLower = searchQuery.toLowerCase();
          const matchesSearch = 
            doc.title.toLowerCase().includes(searchLower) ||
            doc.content.toLowerCase().includes(searchLower) ||
            doc.tags.some(tag => tag.toLowerCase().includes(searchLower));
          
          if (!matchesSearch) return false;
        }

        // Tags filter
        if (selectedTags.length > 0) {
          const matchesTags = selectedTags.every(tag => doc.tags.includes(tag));
          if (!matchesTags) return false;
        }

        return true;
      }).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    },

    allTags: () => {
      const { documents } = get();
      const tagSet = new Set<string>();
      documents.forEach(doc => doc.tags.forEach(tag => tagSet.add(tag)));
      return Array.from(tagSet).sort();
    },

    clearFilters: () => {
      set({
        searchQuery: '',
        selectedTags: [],
      });
    },
  })
);

