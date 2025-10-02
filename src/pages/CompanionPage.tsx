/**
 * Companion Page for MyFace SnapJournal
 * 
 * This page provides an AI companion for reflection and conversation:
 * - Chat interface with AI persona
 * - Reflection prompts and questions
 * - Mood tracking and analysis
 * - Personalized insights and advice
 */

import React, { useState } from 'react'
import { Send, Brain, Heart, Lightbulb, Bot } from 'lucide-react'

const CompanionPage: React.FC = () => {
  const [message, setMessage] = useState('')
  const [conversation, setConversation] = useState([
    {
      id: '1',
      type: 'bot',
      content: 'Hello! I\'m here to help you reflect and explore your thoughts. How are you feeling today?',
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

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot' as const,
        content: 'That\'s interesting! Tell me more about that feeling.',
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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">AI Companion</h1>
          <p className="text-neutral-600 mt-1">Your personal AI friend for reflection and growth</p>
        </div>
        <button className="btn-primary">
          <Brain size={20} className="mr-2" />
          New Conversation
        </button>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-lg h-[600px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-neutral-200 bg-neutral-50">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900">Reflection Companion</h3>
                  <p className="text-sm text-neutral-600">Always here to listen and help</p>
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {conversation.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      msg.type === 'user'
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-900'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-neutral-200">
              <div className="flex space-x-2">
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={2}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className="btn-primary self-end"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-outline text-left">
                <Heart size={16} className="mr-2" />
                How am I feeling?
              </button>
              <button className="w-full btn-outline text-left">
                <Lightbulb size={16} className="mr-2" />
                Give me a prompt
              </button>
              <button className="w-full btn-outline text-left">
                <Brain size={16} className="mr-2" />
                Analyze my mood
              </button>
            </div>
          </div>

          {/* Mood Tracker */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Today's Mood</h3>
            <div className="space-y-2">
              {['😊', '😐', '😔', '😤', '😴'].map((emoji, index) => (
                <button
                  key={index}
                  className="w-full p-2 text-center hover:bg-neutral-100 rounded transition-colors"
                >
                  <span className="text-2xl">{emoji}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conversation History */}
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Recent Conversations</h3>
            <div className="space-y-2 text-sm text-neutral-600">
              <div className="p-2 hover:bg-neutral-100 rounded cursor-pointer">
                <p className="font-medium text-neutral-900">Morning Reflection</p>
                <p className="text-xs">2 hours ago</p>
              </div>
              <div className="p-2 hover:bg-neutral-100 rounded cursor-pointer">
                <p className="font-medium text-neutral-900">Project Discussion</p>
                <p className="text-xs">Yesterday</p>
              </div>
              <div className="p-2 hover:bg-neutral-100 rounded cursor-pointer">
                <p className="font-medium text-neutral-900">Stress Management</p>
                <p className="text-xs">3 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanionPage
