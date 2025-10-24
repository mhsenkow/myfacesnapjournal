/**
 * Echo Store - Zustand store for AI-powered journal analytics
 * 
 * This store handles:
 * - AI pattern analysis of journal entries
 * - Echo pattern detection and tracking
 * - Resonance network analysis
 * - Real-time metrics calculation
 */

import { create } from 'zustand';
import { JournalEntry } from './journalStore';
import { webAIService } from '../services/webAIService';

// Check if we're running in Tauri (desktop) or browser
const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;

// Dynamic import for Tauri API
const getInvoke = async () => {
  if (isTauri) {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke;
  }
  return null;
};

export interface EchoPattern {
  id: string;
  title: string;
  description: string;
  strength: number;
  entryIds: string[];
  tags: string[];
  patternType: string;
}

export interface EchoInsight {
  id: string;
  text: string;
  type: 'pattern' | 'trend' | 'correlation' | 'recommendation';
  confidence: number;
  createdAt: Date;
}

export interface MoodTrend {
  mood: string;
  percentage: number;
}

export interface EchoAnalysis {
  patterns: EchoPattern[];
  insights: EchoInsight[];
  moodTrends: Record<string, number>;
}

export interface EchoMetrics {
  totalEchos: number;
  activePatterns: number;
  resonanceConnections: number;
  newInsights: number;
  averageEntryLength: number;
  mostCommonTags: Array<{ tag: string; count: number }>;
  writingFrequency: number; // entries per week
  moodDistribution: Record<string, number>;
}

interface EchoState {
  analysis: EchoAnalysis | null;
  metrics: EchoMetrics | null;
  isLoading: boolean;
  lastAnalysisDate: Date | null;
  error: string | null;
}

interface EchoActions {
  // Analysis
  analyzeJournalEntries: (entryIds?: string[]) => Promise<void>;
  generateInsights: (message: string, context?: string) => Promise<string>;
  
  // Metrics
  calculateMetrics: (entries: JournalEntry[]) => EchoMetrics;
  refreshMetrics: () => Promise<void>;
  
  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearAnalysis: () => void;
}

export const useEchoStore = create<EchoState & EchoActions>((set, get) => ({
  // State
  analysis: null,
  metrics: null,
  isLoading: false,
  lastAnalysisDate: null,
  error: null,

  // Actions
  analyzeJournalEntries: async (entryIds?: string[]) => {
    set({ isLoading: true, error: null });
    
    try {
      // Check if we're in Tauri environment
      if (!isTauri) {
        // Use web AI service for browser environment
        const { entries } = await import('./journalStore').then(store => store.useJournalStore.getState());
        
        // Check if Ollama is available
        const isOllamaAvailable = await webAIService.checkAvailability();
        
        if (isOllamaAvailable && entries.length > 0) {
          // Use real AI analysis via web service
          const entryContents = entries.map(entry => `${entry.title}: ${entry.content}`);
          const webAnalysis = await webAIService.analyzeEntries({ entryContents });
          
          const analysis: EchoAnalysis = {
            patterns: webAnalysis.patterns,
            insights: webAnalysis.insights.map((insight, index) => ({
              id: `insight-${index}`,
              text: insight,
              type: 'pattern' as const,
              confidence: 0.8,
              createdAt: new Date()
            })),
            moodTrends: webAnalysis.moodTrends
          };
          
          set({ 
            analysis,
            isLoading: false,
            lastAnalysisDate: new Date(),
            error: null
          });
        } else {
          // Fallback for when Ollama is not available
          const mockAnalysis: EchoAnalysis = {
            patterns: [
              {
                id: 'mock-1',
                title: 'Writing Consistency',
                description: 'You maintain regular journaling habits',
                strength: 0.75,
                entryIds: entries.slice(0, 3).map(e => e.id),
                tags: ['consistency', 'habit'],
                patternType: 'behavior'
              }
            ],
            insights: [
              {
                id: 'insight-1',
                text: 'Your journal entries show a pattern of thoughtful reflection',
                type: 'pattern',
                confidence: 0.8,
                createdAt: new Date()
              }
            ],
            moodTrends: { 'positive': 0.6, 'neutral': 0.3, 'negative': 0.1 }
          };
          
          set({ 
            analysis: mockAnalysis,
            isLoading: false,
            lastAnalysisDate: new Date(),
            error: isOllamaAvailable ? null : 'Ollama not available - using mock analysis'
          });
        }
        
        get().refreshMetrics();
        return;
      }

      // If no entry IDs provided, analyze all entries
      if (!entryIds) {
        const { entries } = await import('./journalStore').then(store => store.useJournalStore.getState());
        entryIds = entries.map(entry => entry.id);
      }

      if (entryIds.length === 0) {
        set({ 
          analysis: { patterns: [], insights: [], moodTrends: {} },
          isLoading: false,
          lastAnalysisDate: new Date()
        });
        return;
      }

      // Get Tauri invoke function
      const invoke = await getInvoke();
      if (!invoke) {
        throw new Error('Tauri API not available');
      }

      // Call Tauri command for AI analysis
      const analysisData = await invoke('analyze_echo_patterns', { entryIds }) as any;
      
      // Convert the analysis data to our format
      const analysis: EchoAnalysis = {
        patterns: analysisData.patterns || [],
        insights: (analysisData.insights || []).map((insight: string, index: number) => ({
          id: `insight-${index}`,
          text: insight,
          type: 'pattern' as const,
          confidence: 0.8,
          createdAt: new Date()
        })),
        moodTrends: analysisData.mood_trends || {}
      };

      set({ 
        analysis,
        isLoading: false,
        lastAnalysisDate: new Date(),
        error: null
      });

      // Calculate metrics after analysis
      get().refreshMetrics();

    } catch (error) {
      console.error('Failed to analyze journal entries:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Analysis failed',
        isLoading: false 
      });
    }
  },

  generateInsights: async (message: string, context?: string) => {
    try {
      // Check if we're in Tauri environment
      if (!isTauri) {
        // Use web AI service for browser environment
        const isOllamaAvailable = await webAIService.checkAvailability();
        
        if (isOllamaAvailable) {
          // Use real AI chat via web service
          const response = await webAIService.generateChat({
            message,
            context,
            model: undefined // Use default model
          });
          
          return response.response;
        } else {
          // Fallback for when Ollama is not available
          return `I understand you're asking about "${message}". Ollama is not currently available, but I can help you reflect on your thoughts. What aspects of this topic would you like to explore further?`;
        }
      }

      // Get Tauri invoke function
      const invoke = await getInvoke();
      if (!invoke) {
        throw new Error('Tauri API not available');
      }

      const response = await invoke('generate_chat_response', {
        message,
        context: context,
        model: null
      });
      
      return response as string;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      throw error;
    }
  },

  calculateMetrics: (entries: JournalEntry[]): EchoMetrics => {
    if (entries.length === 0) {
      return {
        totalEchos: 0,
        activePatterns: 0,
        resonanceConnections: 0,
        newInsights: 0,
        averageEntryLength: 0,
        mostCommonTags: [],
        writingFrequency: 0,
        moodDistribution: {}
      };
    }

    // Calculate average entry length
    const totalLength = entries.reduce((sum, entry) => sum + entry.content.length, 0);
    const averageEntryLength = Math.round(totalLength / entries.length);

    // Calculate most common tags
    const tagCounts: Record<string, number> = {};
    entries.forEach(entry => {
      entry.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const mostCommonTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }));

    // Calculate writing frequency (entries per week)
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const recentEntries = entries.filter(entry => 
      new Date(entry.createdAt) >= oneWeekAgo
    );
    const writingFrequency = recentEntries.length;

    // Calculate mood distribution
    const moodCounts: Record<string, number> = {};
    entries.forEach(entry => {
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }
    });
    const totalMoodEntries = Object.values(moodCounts).reduce((sum, count) => sum + count, 0);
    const moodDistribution: Record<string, number> = {};
    Object.entries(moodCounts).forEach(([mood, count]) => {
      moodDistribution[mood] = totalMoodEntries > 0 ? count / totalMoodEntries : 0;
    });

    // Get current analysis for pattern counts
    const { analysis } = get();
    const totalEchos = analysis?.patterns.length || 0;
    const activePatterns = analysis?.patterns.filter(p => p.strength > 0.5).length || 0;
    const resonanceConnections = Math.floor(totalEchos * 0.3); // Estimate based on patterns
    const newInsights = analysis?.insights.filter(i => 
      new Date(i.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length || 0;

    return {
      totalEchos,
      activePatterns,
      resonanceConnections,
      newInsights,
      averageEntryLength,
      mostCommonTags,
      writingFrequency,
      moodDistribution
    };
  },

  refreshMetrics: async () => {
    try {
      const { entries } = await import('./journalStore').then(store => store.useJournalStore.getState());
      const metrics = get().calculateMetrics(entries);
      set({ metrics });
    } catch (error) {
      console.error('Failed to refresh metrics:', error);
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  clearAnalysis: () => set({ analysis: null, metrics: null, lastAnalysisDate: null })
}));
