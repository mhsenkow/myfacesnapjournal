/**
 * Loading Screen Component for MyFace SnapJournal
 * 
 * This component displays while the app is initializing:
 * - App logo and branding
 * - Loading animation
 * - Progress indicators
 * - Initialization status
 */

import React from 'react'
import { Brain, BookOpen, MessageCircle, Shield } from 'lucide-react'

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
      <div className="text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Brain size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-primary-600">MyFace</h1>
          </div>
          <p className="text-xl text-neutral-600 font-medium">SnapJournal</p>
        </div>

        {/* Loading Animation */}
        <div className="flex items-center justify-center space-x-2">
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-3 h-3 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        {/* Status Message */}
        <div className="space-y-2">
          <p className="text-neutral-600">Initializing your journal...</p>
          <p className="text-sm text-neutral-500">Setting up secure storage and AI capabilities</p>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center justify-center space-x-8 pt-8">
          <div className="flex flex-col items-center space-y-2 text-neutral-400">
            <BookOpen size={24} />
            <span className="text-xs">Journal</span>
          </div>
          <div className="flex flex-col items-center space-y-2 text-neutral-400">
            <Brain size={24} />
            <span className="text-xs">Echo</span>
          </div>
          <div className="flex flex-col items-center space-y-2 text-neutral-400">
            <MessageCircle size={24} />
            <span className="text-xs">Companion</span>
          </div>
          <div className="flex flex-col items-center space-y-2 text-neutral-400">
            <Shield size={24} />
            <span className="text-xs">Vault</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-64 mx-auto">
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
