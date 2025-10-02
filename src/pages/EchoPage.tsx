/**
 * Echo Page for MyFace SnapJournal
 * 
 * This page displays AI-powered insights and patterns from journal entries:
 * - Echo cards showing recurring themes
 * - Resonance patterns between entries
 * - Clustering of similar content
 * - Trend analysis over time
 */

import React, { useState } from 'react'
import { Brain, TrendingUp, Users, Lightbulb, BarChart3, Calendar } from 'lucide-react'

const EchoPage: React.FC = () => {
  const [selectedEcho, setSelectedEcho] = useState<string | null>(null)

  // Mock echo data - will be replaced with real AI insights
  const mockEchos = [
    {
      id: '1',
      title: 'Gratitude Patterns',
      description: 'You frequently express gratitude in morning entries',
      strength: 0.85,
      entries: 12,
      tags: ['gratitude', 'morning', 'reflection'],
      lastSeen: new Date('2024-01-15T08:00:00Z'),
      type: 'pattern'
    },
    {
      id: '2',
      title: 'Creative Inspiration',
      description: 'Project ideas often emerge after learning sessions',
      strength: 0.72,
      entries: 8,
      tags: ['creativity', 'learning', 'projects'],
      lastSeen: new Date('2024-01-14T15:30:00Z'),
      type: 'correlation'
    },
    {
      id: '3',
      title: 'Stress Indicators',
      description: 'Increased stress levels detected in evening entries',
      strength: 0.68,
      entries: 15,
      tags: ['stress', 'evening', 'emotions'],
      lastSeen: new Date('2024-01-13T20:00:00Z'),
      type: 'trend'
    }
  ]

  // Mock resonance data
  const mockResonance = [
    {
      id: '1',
      sourceEcho: 'Gratitude Patterns',
      targetEcho: 'Creative Inspiration',
      strength: 0.78,
      description: 'Gratitude often leads to creative thinking'
    },
    {
      id: '2',
      sourceEcho: 'Learning Notes',
      targetEcho: 'Project Ideas',
      strength: 0.85,
      description: 'Learning directly influences project development'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <span className="font-extralight">Echo Engine</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-lg font-light">AI-powered insights from your journal entries</p>
          </div>
          <button className="glass-subtle px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-light">
            <Brain size={20} className="mr-2 text-blue-600" />
            Generate Insights
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg">
              <Brain size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">Total Echos</p>
              <p className="text-3xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide">{mockEchos.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">Active Patterns</p>
              <p className="text-3xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide">8</p>
            </div>
          </div>
        </div>

        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-pink-500 to-red-600 rounded-xl shadow-lg">
              <Users size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">Resonance</p>
              <p className="text-3xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide">{mockResonance.length}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl shadow-lg">
              <Lightbulb size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">New Insights</p>
              <p className="text-3xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide">3</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Echo Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide">Echo Patterns</h2>

          {mockEchos.map((echo) => (
            <div
              key={echo.id}
              className={`p-6 glass-subtle border rounded-xl cursor-pointer transition-all duration-300 hover:glass group ${
                selectedEcho === echo.id ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20' : 'border-neutral-200 dark:border-neutral-700'
              }`}
              onClick={() => setSelectedEcho(echo.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-lg tracking-wide group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{echo.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light mt-1">{echo.description}</p>

                  {/* Strength indicator */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400 mb-2 font-light">
                      <span>Strength</span>
                      <span>{Math.round(echo.strength * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${echo.strength * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Meta info */}
                  <div className="flex items-center space-x-6 mt-4 text-sm text-neutral-400 dark:text-neutral-500 font-light">
                    <div className="flex items-center gap-1">
                      <BarChart3 size={14} className="text-purple-500" />
                      {echo.entries} entries
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-blue-500" />
                      {echo.lastSeen.toLocaleDateString()}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {echo.tags.map((tag) => (
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
          ))}
        </div>

        {/* Resonance View */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Resonance Network</h2>
          
          {mockResonance.map((resonance) => (
            <div key={resonance.id} className="p-4 bg-white border border-neutral-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-neutral-900">Connection</h4>
                <span className="text-sm text-neutral-500">
                  {Math.round(resonance.strength * 100)}% match
                </span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                  <span className="text-sm text-neutral-700">{resonance.sourceEcho}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-secondary-500 rounded-full"></div>
                  <span className="text-sm text-neutral-700">{resonance.targetEcho}</span>
                </div>
              </div>
              
              <p className="text-sm text-neutral-600 mt-2">{resonance.description}</p>
              
              {/* Connection strength */}
              <div className="mt-3">
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-secondary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${resonance.strength * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
          
          {/* Empty state */}
          {mockResonance.length === 0 && (
            <div className="p-8 text-center text-neutral-500">
              <Brain size={48} className="mx-auto mb-4 opacity-50" />
              <p>No resonance patterns detected yet.</p>
              <p className="text-sm">Write more entries to discover connections.</p>
            </div>
          )}
        </div>
      </div>

      {/* Selected Echo Details */}
      {selectedEcho && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Echo Details</h3>
          <p className="text-neutral-600">
            Detailed analysis and recommendations for the selected echo pattern.
          </p>
          {/* TODO: Add detailed echo analysis */}
        </div>
      )}
    </div>
  )
}

export default EchoPage
