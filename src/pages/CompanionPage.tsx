/**
 * AI Introspection Page for MyFace SnapJournal
 * 
 * This page provides AI-powered introspection and deep reflection:
 * - Advanced chat interface with AI introspection specialist
 * - Deep reflection prompts and psychological insights
 * - Emotional intelligence analysis and mood tracking
 * - Personalized introspection exercises and mindfulness
 */

import React, { useState, useRef, useEffect } from 'react'
import { Send, Brain, Heart, Lightbulb, Bot, Moon, Sun, Eye, Zap, Target, Sparkles } from 'lucide-react'

const CompanionPage: React.FC = () => {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [conversation, setConversation] = useState([
    {
      id: '1',
      type: 'bot',
      content: 'Welcome to your AI Introspection session. I\'m here to guide you through deep self-reflection and help you explore the inner workings of your mind. What would you like to explore today?',
      timestamp: new Date()
    }
  ])

  const handleSendMessage = () => {
    if (!message.trim()) return

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      type: 'user' as const,
      content: message,
      timestamp: new Date()
    }

    setConversation(prev => [...prev, userMessage])
    setMessage('')

    // Simulate AI response with more introspective language
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: 'That\'s a fascinating insight. Let\'s dive deeper into that thought pattern. What underlying emotions do you think are driving this perspective?',
        timestamp: new Date()
      }
      setConversation(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handlePromptClick = (promptText: string) => {
    setMessage(promptText)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const handleExerciseClick = (exerciseTitle: string) => {
    const exerciseMessage = `I'd like to try the ${exerciseTitle} exercise. Can you guide me through it?`
    setMessage(exerciseMessage)
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 100)
  }

  const introspectionPrompts = [
    { icon: Eye, text: "What patterns do I notice in my thoughts?", color: "purple" },
    { icon: Heart, text: "How do my emotions guide my decisions?", color: "pink" },
    { icon: Target, text: "What core values drive my actions?", color: "blue" },
    { icon: Zap, text: "Where do I find my greatest energy?", color: "yellow" }
  ]

  const mindfulnessExercises = [
    { title: "Body Scan Meditation", duration: "10 min", icon: Moon },
    { title: "Gratitude Reflection", duration: "5 min", icon: Sun },
    { title: "Emotional Check-in", duration: "3 min", icon: Heart },
    { title: "Future Self Visualization", duration: "8 min", icon: Sparkles }
  ]

  return (
    <div className="min-h-screen space-y-6">
      {/* Page Header with Glass Morphism */}
      <div className="glass p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light glass-text-primary flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl shadow-lg">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <span className="font-extralight tracking-wide">AI Introspection</span>
            </h1>
            <p className="glass-text-tertiary mt-3 text-lg font-light">
              Deep self-reflection powered by artificial intelligence
            </p>
          </div>
          <button className="glass-subtle px-5 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-light">
            <Brain size={20} className="mr-2 text-purple-600" />
            New Session
          </button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl border border-neutral-200 dark:border-neutral-700 h-[700px] flex flex-col overflow-hidden">
            {/* Chat Header */}
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bot size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium glass-text-primary text-xl tracking-wide">Introspection Specialist</h3>
                  <p className="text-sm glass-text-tertiary font-light">Guiding your journey of self-discovery</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-2xl px-6 py-4 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-gradient-to-br from-purple-500 to-blue-600 text-white shadow-lg'
                        : 'glass-subtle border border-neutral-200 dark:border-neutral-700 glass-text-primary'
                    }`}
                  >
                    <p className="text-sm leading-relaxed font-light">{msg.content}</p>
                    <p className={`text-xs mt-2 font-light ${
                      msg.type === 'user' ? 'text-purple-100' : 'glass-text-muted'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex space-x-4">
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Share your thoughts, feelings, or questions for deep introspection..."
                    className="w-full px-4 py-3 glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent placeholder-neutral-400 dark:placeholder-neutral-500 font-light"
                    rows={3}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="px-6 py-3 bg-gradient-to-br from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center gap-2"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Introspection Prompts */}
          <div className="glass rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-medium glass-text-primary mb-4 flex items-center gap-2 text-lg tracking-wide">
              <Lightbulb size={18} className="text-yellow-500" />
              Introspection Prompts
            </h3>
            <div className="space-y-3">
              {introspectionPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt.text)}
                  className="w-full p-3 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${prompt.color}-100 dark:bg-${prompt.color}-900/30`}>
                      <prompt.icon size={16} className={`text-${prompt.color}-600 dark:text-${prompt.color}-400`} />
                    </div>
                    <span className="text-sm glass-text-secondary group-hover:text-neutral-900 dark:group-hover:text-neutral-100 font-light">
                      {prompt.text}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Mindfulness Exercises */}
          <div className="glass rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-medium glass-text-primary mb-4 flex items-center gap-2 text-lg tracking-wide">
              <Moon size={18} className="text-blue-500" />
              Mindfulness Exercises
            </h3>
            <div className="space-y-3">
              {mindfulnessExercises.map((exercise, index) => (
                <button
                  key={index}
                  onClick={() => handleExerciseClick(exercise.title)}
                  className="w-full p-3 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <exercise.icon size={16} className="text-neutral-600 dark:text-neutral-400" />
                      <span className="text-sm font-light glass-text-secondary group-hover:text-neutral-900 dark:group-hover:text-neutral-100">
                        {exercise.title}
                      </span>
                    </div>
                    <span className="text-xs glass-text-muted font-light">
                      {exercise.duration}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Session History */}
          <div className="glass rounded-2xl border border-neutral-200 dark:border-neutral-700 p-6">
            <h3 className="font-medium glass-text-primary mb-4 flex items-center gap-2 text-lg tracking-wide">
              <Eye size={18} className="text-purple-500" />
              Recent Sessions
            </h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <p className="font-light glass-text-primary">Deep Self-Analysis</p>
                <p className="text-xs glass-text-muted mt-1 font-light">2 hours ago</p>
              </div>
              <div className="p-3 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <p className="font-light glass-text-primary">Emotional Processing</p>
                <p className="text-xs glass-text-muted mt-1 font-light">Yesterday</p>
              </div>
              <div className="p-3 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                <p className="font-light glass-text-primary">Values Exploration</p>
                <p className="text-xs glass-text-muted mt-1 font-light">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanionPage