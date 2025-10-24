/**
 * Echo Page for MyFace SnapJournal
 * 
 * This page displays AI-powered insights and patterns from journal entries:
 * - Echo cards showing recurring themes
 * - Resonance patterns between entries
 * - Clustering of similar content
 * - Trend analysis over time
 */

import React, { useState, useEffect } from 'react'
import { Brain, TrendingUp, Users, Lightbulb, BarChart3, Calendar, RefreshCw, AlertCircle } from 'lucide-react'
import { useEchoStore } from '../stores/echoStore'
import { useJournalStore } from '../stores/journalStore'

const EchoPage: React.FC = () => {
  const [selectedEcho, setSelectedEcho] = useState<string | null>(null)
  
  // Store hooks
  const { 
    analysis, 
    metrics, 
    isLoading, 
    error, 
    analyzeJournalEntries, 
    refreshMetrics,
    setLoading 
  } = useEchoStore()
  
  const { entries, loadEntries } = useJournalStore()

  // Load data on component mount
  useEffect(() => {
    const initializeData = async () => {
      await loadEntries()
      await refreshMetrics()
      
      // Only analyze if we have entries and no recent analysis
      if (entries.length > 0 && !analysis) {
        await analyzeJournalEntries()
      }
    }
    
    initializeData()
  }, [])

  // Handle generate insights button
  const handleGenerateInsights = async () => {
    setLoading(true)
    try {
      await analyzeJournalEntries()
    } catch (error) {
      console.error('Failed to generate insights:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light glass-text-primary tracking-wide flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span className="font-extralight">Echo Engine</span>
            </h1>
            <p className="glass-text-tertiary mt-3 text-lg font-light">
              AI-powered insights from your journal entries
              {typeof window !== 'undefined' && !(window as any).__TAURI__ && (
                <span className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                  Web Mode
                </span>
              )}
            </p>
          </div>
          <button 
            onClick={handleGenerateInsights}
            disabled={isLoading || entries.length === 0}
            className="glass-subtle px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-light disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <RefreshCw size={20} className="mr-2 text-blue-600 animate-spin" />
            ) : (
              <Brain size={20} className="mr-2 text-blue-600" />
            )}
            {isLoading ? 'Analyzing...' : 'Generate Insights'}
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-subtle p-4 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
            <div>
              <p className="text-red-800 dark:text-red-200 font-medium">Analysis Error</p>
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <Brain size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm glass-text-muted font-light">Total Echos</p>
              <p className="text-3xl font-light glass-text-primary tracking-wide">
                {metrics?.totalEchos || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm glass-text-muted font-light">Active Patterns</p>
              <p className="text-3xl font-light glass-text-primary tracking-wide">
                {metrics?.activePatterns || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl shadow-lg">
              <Users size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm glass-text-muted font-light">Resonance</p>
              <p className="text-3xl font-light glass-text-primary tracking-wide">
                {metrics?.resonanceConnections || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
              <Lightbulb size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm glass-text-muted font-light">New Insights</p>
              <p className="text-3xl font-light glass-text-primary tracking-wide">
                {metrics?.newInsights || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Echo Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-light glass-text-primary tracking-wide">Echo Patterns</h2>

          {isLoading ? (
            <div className="glass-subtle p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 text-center">
              <RefreshCw size={32} className="mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="glass-text-tertiary font-light">Analyzing your journal entries...</p>
            </div>
          ) : analysis?.patterns && analysis.patterns.length > 0 ? (
            analysis.patterns.map((pattern) => (
              <div
                key={pattern.id}
                className={`p-6 glass-subtle border rounded-xl cursor-pointer transition-all duration-300 hover:glass group ${
                  selectedEcho === pattern.id ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20' : 'border-neutral-200 dark:border-neutral-700'
                }`}
                onClick={() => setSelectedEcho(pattern.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium glass-text-primary text-lg tracking-wide group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{pattern.title}</h3>
                    <p className="text-sm glass-text-tertiary font-light mt-1">{pattern.description}</p>

                    {/* Strength indicator */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm glass-text-muted mb-2 font-light">
                        <span>Strength</span>
                        <span>{Math.round(pattern.strength * 100)}%</span>
                      </div>
                      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${pattern.strength * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta info */}
                    <div className="flex items-center space-x-6 mt-4 text-sm glass-text-muted font-light">
                      <div className="flex items-center gap-1">
                        <BarChart3 size={14} className="text-purple-500" />
                        {pattern.entryIds.length} entries
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-blue-500" />
                        {pattern.patternType}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {pattern.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-light"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-subtle p-8 rounded-xl border border-neutral-200 dark:border-neutral-700 text-center">
              <Brain size={48} className="mx-auto mb-4 text-neutral-400" />
              <p className="glass-text-tertiary font-light mb-2">No patterns detected yet</p>
              <p className="text-sm glass-text-muted">Write more journal entries to discover patterns</p>
            </div>
          )}
        </div>

        {/* Resonance View */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold glass-text-primary">Resonance Network</h2>
          
          {analysis?.insights && analysis.insights.length > 0 ? (
            analysis.insights.map((insight, index) => (
              <div key={insight.id} className="p-4 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium glass-text-primary">Insight #{index + 1}</h4>
                  <span className="text-sm glass-text-muted">
                    {Math.round(insight.confidence * 100)}% confidence
                  </span>
                </div>
                
                <p className="text-sm glass-text-tertiary">{insight.text}</p>
                
                {/* Confidence indicator */}
                <div className="mt-3">
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${insight.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-neutral-500">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>No insights available yet.</p>
              <p className="text-sm">Generate analysis to discover insights.</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Echo Details */}
      {selectedEcho && analysis && (
        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700">
          <h3 className="text-lg font-semibold glass-text-primary mb-4">Pattern Details</h3>
          {(() => {
            const pattern = analysis.patterns.find(p => p.id === selectedEcho);
            if (!pattern) return null;
            
            return (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium glass-text-primary">{pattern.title}</h4>
                  <p className="text-sm glass-text-tertiary mt-1">{pattern.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm glass-text-muted">Pattern Type</p>
                    <p className="font-medium glass-text-primary">{pattern.patternType}</p>
                  </div>
                  <div>
                    <p className="text-sm glass-text-muted">Strength</p>
                    <p className="font-medium glass-text-primary">{Math.round(pattern.strength * 100)}%</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm glass-text-muted mb-2">Related Entries</p>
                  <p className="text-sm glass-text-tertiary">{pattern.entryIds.length} entries contribute to this pattern</p>
                </div>
                
                <div>
                  <p className="text-sm glass-text-muted mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {pattern.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  )
}

export default EchoPage
