/**
 * Layout Component for MyFace SnapJournal
 * 
 * This component provides the main application layout including:
 * - Sidebar navigation
 * - Main content area
 * - Header with theme toggle and user menu
 * - Responsive design for mobile/desktop
 */

import React from 'react'
import { useApp } from '../../contexts/AppContext'
import Sidebar from './Sidebar'
import Header from './Header'
import FloatingSearch from '../UI/FloatingSearch'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const { state } = useApp()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 text-neutral-900">
      {/* Fixed Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-50 to-pink-100 dark:from-slate-900 dark:via-purple-900 dark:to-blue-900 pointer-events-none" />
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Fixed Header - positioned relative to sidebar */}
      <div className={`fixed top-0 z-30 transition-all duration-normal ease-in-out ${
        state.sidebarCollapsed ? 'left-16' : 'left-64'
      } right-0`}>
        <Header />
      </div>
      
      {/* Main content area */}
      <div className={`relative transition-all duration-normal ease-in-out ${
        state.sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Scrollable Page content with proper top padding */}
        <main className="pt-32 p-6 overflow-y-auto h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* Floating Search */}
      <FloatingSearch />
    </div>
  )
}
