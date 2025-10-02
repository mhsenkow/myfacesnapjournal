/**
 * Sidebar Component for MyFace SnapJournal
 * 
 * This component provides the main navigation sidebar including:
 * - Navigation menu items
 * - Collapse/expand functionality
 * - User profile section
 * - Quick actions
 */

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useApp } from '../../contexts/AppContext'
import { 
  BookOpen, 
  Brain, 
  Users, 
  Settings, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Rss
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { state, toggleSidebar, setCurrentView } = useApp()
  const navigate = useNavigate()
  const location = useLocation()

  // Navigation items
  const navItems = [
    {
      id: 'journal',
      label: 'Journal',
      icon: BookOpen,
      path: '/journal',
      description: 'Write and organize your thoughts'
    },
    {
      id: 'echo',
      label: 'Echo',
      icon: Users,
      path: '/echo',
      description: 'AI-powered insights and patterns'
    },
    {
      id: 'companion',
      label: 'AI Introspection',
      icon: Brain,
      path: '/companion',
      description: 'AI-powered introspection and reflection'
    },
    {
      id: 'feed',
      label: 'Feed',
      icon: Rss,
      path: '/feed',
      description: 'Explore Mastodon public feeds'
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: Shield,
      path: '/vault',
      description: 'Secure storage and export'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      path: '/settings',
      description: 'App preferences and configuration'
    }
  ]

  // Handle navigation
  const handleNavClick = (item: typeof navItems[0]) => {
    setCurrentView(item.id as any)
    navigate(item.path)
  }

  // Check if item is active
  const isActive = (path: string) => location.pathname === path

  return (
    <aside className={`fixed left-0 top-0 z-50 h-screen glass border-r border-neutral-200 transition-all duration-normal ease-in-out ${
      state.sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
        {!state.sidebarCollapsed && (
          <h1 className="text-xl font-bold text-primary-600">MyFace</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md hover:bg-neutral-200 transition-colors"
          title={state.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {state.sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>


      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center px-3 py-2 rounded-md transition-all duration-fast ${
                    isActive(item.path)
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-500'
                      : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  title={state.sidebarCollapsed ? item.description : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!state.sidebarCollapsed && (
                    <span className="ml-3 text-sm font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      {!state.sidebarCollapsed && (
        <div className="p-4 border-t border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">U</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">User</p>
              <p className="text-xs text-neutral-500 truncate">user@example.com</p>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed User Profile */}
      {state.sidebarCollapsed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">U</span>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
