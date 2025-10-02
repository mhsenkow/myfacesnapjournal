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
import { useMastodonStore } from '../../stores/mastodonStore'
import { 
  BookOpen, 
  Brain, 
  Users, 
  Settings, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Rss,
  Globe,
  User
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { state, toggleSidebar, setCurrentView } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { auth } = useMastodonStore()

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
                      : 'glass-text-secondary hover:bg-neutral-100 hover:text-neutral-900'
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
          {auth.isAuthenticated && auth.user ? (
            /* Mastodon Profile */
            <button 
              onClick={() => {
                navigate('/settings?tab=profile')
                setCurrentView('settings' as any)
              }}
              className="flex items-center space-x-3 w-full hover:bg-neutral-100 rounded-md p-1 transition-colors"
              title="Click to view your profile"
            >
              {auth.user.avatar_static || auth.user.avatar ? (
                <img
                  src={auth.user.avatar_static || auth.user.avatar}
                  alt={auth.user.display_name}
                  className="w-8 h-8 rounded-full object-cover cursor-pointer"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer ${auth.user.avatar_static || auth.user.avatar ? 'hidden' : ''}`}>
                <span className="text-white text-sm font-medium">
                  {auth.user.display_name ? auth.user.display_name.charAt(0).toUpperCase() : auth.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium glass-text-primary truncate">
                  {auth.user.display_name || auth.user.username}
                </p>
                <p className="text-xs glass-text-muted truncate flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  @{auth.user.acct}
                </p>
              </div>
            </button>
          ) : (
            /* Default Profile */
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium glass-text-primary truncate">MyFace User</p>
                <p className="text-xs glass-text-muted truncate">
                  Connect to Mastodon for profile
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed User Profile */}
      {state.sidebarCollapsed && (
        <button 
          onClick={() => {
            navigate('/settings?tab=profile')
            setCurrentView('settings' as any)
          }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 hover:scale-105 transition-transform"
          title="Click to view your profile"
        >
          {auth.isAuthenticated && auth.user ? (
            auth.user.avatar_static || auth.user.avatar ? (
              <img
                src={auth.user.avatar_static || auth.user.avatar}
                alt={auth.user.display_name}
                className="w-8 h-8 rounded-full object-cover cursor-pointer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null
          ) : null}
          <div className={`w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center cursor-pointer ${auth.isAuthenticated && auth.user && (auth.user.avatar_static || auth.user.avatar) ? 'hidden' : ''}`}>
            <span className="text-white text-sm font-medium">
              {auth.isAuthenticated && auth.user 
                ? (auth.user.display_name ? auth.user.display_name.charAt(0).toUpperCase() : auth.user.username.charAt(0).toUpperCase())
                : 'U'
              }
            </span>
          </div>
        </button>
      )}
    </aside>
  )
}

export default Sidebar
