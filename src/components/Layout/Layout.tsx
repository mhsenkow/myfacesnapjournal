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
import { useApp } from '../../contexts/AppContext'
import { useNotificationStore } from '../../stores/notificationStore'
import Sidebar from './Sidebar'
import FloatingControls from './FloatingControls'
import Footer from './Footer'
import FloatingSearch from '../UI/FloatingSearch'
import NotificationPanel from '../Notifications/NotificationPanel'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { state } = useApp()
  const { isPanelOpen } = useNotificationStore()
  const [footerVisible, setFooterVisible] = useState(false)

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
      
      {/* Main content area */}
      <div className={`relative transition-all duration-normal ease-in-out ${
        state.sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Scrollable Page content */}
        <main className="p-6 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
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
