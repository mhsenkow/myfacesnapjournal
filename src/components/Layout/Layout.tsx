/**
 * Layout Component for MyFace SnapJournal
 * 
 * This component provides the main application layout including:
 * - Sidebar navigation
 * - Main content area
 * - Floating controls (theme, notifications, user)
 * - Glass footer panel for feed controls
 * - Responsive design for mobile/desktop
 */

import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { useNotificationStore } from '../../stores/notificationStore'
import { useAnalyticsStore } from '../../stores/analyticsStore'
import Sidebar from './Sidebar'
import FloatingControls from './FloatingControls'
import Footer from './Footer'
import FloatingSearch from '../UI/FloatingSearch'
import NotificationPanel from '../Notifications/NotificationPanel'
import SmartAnalyticsPanel from '../UI/SmartAnalyticsPanel'
import { Menu } from 'lucide-react'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { state, toggleSidebar } = useApp()
  const { isPanelOpen } = useNotificationStore()
  const { isPanelOpen: isAnalyticsPanelOpen } = useAnalyticsStore()
  const [footerVisible, setFooterVisible] = useState(false)
  const location = useLocation()
  
  // Check if we're on feed page for styling
  const isFeedPage = location.pathname === '/feed'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 text-neutral-900">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 pointer-events-none" />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Floating Controls */}
      <FloatingControls />
      
      {/* Notification Panel - only render when open */}
      {isPanelOpen && <NotificationPanel />}
      
      {/* Analytics Panel - only render when open */}
      {isAnalyticsPanelOpen && <SmartAnalyticsPanel isOpen={isAnalyticsPanelOpen} onClose={() => useAnalyticsStore.getState().closePanel()} />}
      
      {/* Mobile Menu Button - show when sidebar is collapsed on mobile */}
      {state.sidebarCollapsed && (
        <button
          onClick={toggleSidebar}
          className={`fixed top-4 left-4 z-50 lg:hidden p-3 rounded-xl transition-all duration-200 hover:scale-105 group ${
            isFeedPage 
              ? 'bg-black/20 backdrop-blur-sm border border-white/20' 
              : 'glass'
          }`}
          aria-label="Toggle menu"
        >
          <div className={`p-2 rounded-lg transition-all duration-200 ${
            isFeedPage 
              ? 'group-hover:bg-white/20' 
              : 'group-hover:bg-semantic-neutral-light'
          }`}>
            <Menu className={`w-5 h-5 transition-colors ${
              isFeedPage 
                ? 'text-white group-hover:text-white/80' 
                : 'text-semantic-neutral group-hover:text-semantic-primary'
            }`} />
          </div>
        </button>
      )}

      {/* Main content area */}
      <div className={`relative transition-all duration-300 ease-in-out ${
        state.sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      } ${isPanelOpen || isAnalyticsPanelOpen ? 'mr-0 sm:mr-96' : ''}`}>
        {/* Scrollable Page content */}
        <main className="p-4 sm:p-6 pt-20 sm:pt-16 lg:pt-6 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </main>
      </div>
      
      {/* Floating Search */}
      <FloatingSearch />
      
      {/* Footer Panel */}
      <Footer isVisible={footerVisible} onToggle={() => setFooterVisible(!footerVisible)} />
    </div>
  )
}
