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
import { useBlueskyStore } from '../../stores/blueskyStore'
import FeedbackButtonSimple from '../UI/FeedbackButtonSimple'
import { 
  BookOpen, 
  Brain, 
  Users, 
  Settings, 
  Shield, 
  ChevronLeft, 
  ChevronRight,
  Rss,
  User
} from 'lucide-react'

const Sidebar: React.FC = () => {
  const { state, toggleSidebar, setCurrentView } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { auth: mastodonAuth } = useMastodonStore()
  const { auth: blueskyAuth } = useBlueskyStore()

  // Determine which profile to show (prioritize Mastodon, then Bluesky)
  const getActiveProfile = () => {
    if (mastodonAuth.isAuthenticated && mastodonAuth.user) {
      return {
        type: 'mastodon',
        user: mastodonAuth.user,
        avatar: mastodonAuth.user.avatar_static || mastodonAuth.user.avatar,
        displayName: mastodonAuth.user.display_name || mastodonAuth.user.username,
        handle: `@${mastodonAuth.user.acct}`
      }
    }
    if (blueskyAuth.isAuthenticated && blueskyAuth.user) {
      return {
        type: 'bluesky',
        user: blueskyAuth.user,
        avatar: blueskyAuth.user.avatar,
        displayName: blueskyAuth.user.displayName || blueskyAuth.user.handle,
        handle: `@${blueskyAuth.user.handle}`
      }
    }
    return null
  }

  const activeProfile = getActiveProfile()

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
    <>
      {/* Mobile Backdrop Overlay */}
      {!state.sidebarCollapsed && (
        <div 
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => toggleSidebar()}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-50 h-screen glass-sidebar transition-all duration-300 ease-in-out flex flex-col ${
        state.sidebarCollapsed ? 'w-16' : 'w-72 sm:w-64'
      } ${state.sidebarCollapsed ? 'lg:translate-x-0 -translate-x-full' : 'translate-x-0'}`}>
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-md border-b border-semantic-neutral-light flex-shrink-0">
        {!state.sidebarCollapsed && (
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">MF</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-brand-text">
              MyFace
            </h1>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-sm rounded-lg hover:bg-semantic-neutral-light transition-all duration-200 hover:scale-105"
          title={state.sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {state.sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-md overflow-y-auto">
        <ul className="space-y-xs">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center px-md py-lg rounded-xl transition-all duration-200 group relative touch-manipulation ${
                    active
                      ? 'bg-semantic-primary-light text-semantic-primary shadow-sm'
                      : 'text-semantic-neutral hover:bg-semantic-neutral-light hover:text-semantic-neutral-dark hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  title={state.sidebarCollapsed ? item.description : undefined}
                >
                  <div className={`p-xs rounded-lg transition-all duration-200 ${
                    active 
                      ? 'bg-semantic-primary text-white shadow-md' 
                      : 'group-hover:bg-semantic-neutral-light'
                  }`}>
                    <Icon size={16} className="flex-shrink-0" />
                  </div>
                  {!state.sidebarCollapsed && (
                    <span className="ml-md text-sm font-medium">{item.label}</span>
                  )}
                  {active && !state.sidebarCollapsed && (
                    <div className="ml-auto w-2 h-2 bg-semantic-primary rounded-full"></div>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

      </nav>

      {/* Feedback Section - Above Profile */}
      {!state.sidebarCollapsed && (
        <div className="p-md border-t border-semantic-neutral-light flex-shrink-0">
          <div className="mb-md">
            <h3 className="text-sm font-medium text-semantic-neutral mb-md">Feedback</h3>
            <FeedbackButtonSimple variant="inline" />
          </div>
        </div>
      )}

      {/* User Profile Section - Now at Bottom */}
      {!state.sidebarCollapsed && (
        <div className="p-md border-t border-semantic-neutral-light flex-shrink-0">
          {activeProfile ? (
            <button 
              onClick={() => {
                navigate('/settings?tab=profile')
                setCurrentView('settings' as any)
              }}
              className="flex items-center gap-md w-full p-md hover:bg-semantic-neutral-light rounded-xl transition-all duration-200 hover:scale-[1.02] group"
              title="Click to view your profile"
            >
              <div className="relative">
                {activeProfile.avatar ? (
                  <img
                    src={activeProfile.avatar}
                    alt={activeProfile.displayName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800 shadow-md"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 ${activeProfile.type === 'mastodon' ? 'bg-semantic-secondary' : 'bg-semantic-primary'} rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-800 shadow-md ${activeProfile.avatar ? 'hidden' : ''}`}>
                  <span className="text-white text-lg font-bold">
                    {activeProfile.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                {/* Online indicator */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 ${activeProfile.type === 'mastodon' ? 'bg-semantic-secondary' : 'bg-semantic-primary'} rounded-full border-2 border-white dark:border-neutral-800 flex items-center justify-center`}>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-semantic-neutral truncate group-hover:text-semantic-primary transition-colors">
                  {activeProfile.displayName}
                </p>
                <div className="flex items-center gap-xs text-xs text-semantic-neutral truncate">
                  <div className={`w-2 h-2 ${activeProfile.type === 'mastodon' ? 'bg-semantic-secondary' : 'bg-semantic-primary'} rounded-full flex-shrink-0`}></div>
                  <span className="truncate">{activeProfile.handle}</span>
                </div>
              </div>
              <div className="flex-shrink-0">
                <Settings className="w-4 h-4 text-semantic-neutral group-hover:text-semantic-primary transition-colors" />
              </div>
            </button>
          ) : (
            /* Default Profile */
            <div className="flex items-center gap-md p-md">
              <div className="w-12 h-12 bg-semantic-neutral rounded-full flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-semantic-neutral truncate">Welcome!</p>
                <p className="text-xs text-semantic-neutral truncate">
                  Connect to get started
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed User Profile */}
      {state.sidebarCollapsed && (
        <div className="absolute bottom-md left-1/2 transform -translate-x-1/2">
          <button 
            onClick={() => {
              navigate('/settings?tab=profile')
              setCurrentView('settings' as any)
            }}
            className="relative hover:scale-110 transition-all duration-200 group"
            title={activeProfile ? `${activeProfile.displayName} - Click to view profile` : 'Click to view profile'}
          >
            <div className="relative">
              {activeProfile?.avatar ? (
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.displayName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-neutral-800 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-10 h-10 ${activeProfile?.type === 'mastodon' ? 'bg-gradient-to-br from-purple-500 to-purple-600' : activeProfile?.type === 'bluesky' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-neutral-400 to-neutral-500'} rounded-full flex items-center justify-center ring-2 ring-white dark:ring-neutral-800 shadow-lg ${activeProfile?.avatar ? 'hidden' : ''}`}>
                <span className="text-white text-sm font-bold">
                  {activeProfile 
                    ? activeProfile.displayName.charAt(0).toUpperCase()
                    : 'U'
                  }
                </span>
              </div>
              {/* Online indicator for collapsed view */}
              {activeProfile && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${activeProfile.type === 'mastodon' ? 'bg-purple-500' : 'bg-blue-500'} rounded-full border-2 border-white dark:border-neutral-800`}>
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse m-auto mt-0.5"></div>
                </div>
              )}
            </div>
            {/* Tooltip on hover */}
            <div className="absolute left-full ml-sm top-1/2 transform -translate-y-1/2 bg-neutral-900 text-white text-xs px-sm py-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
              {activeProfile ? activeProfile.displayName : 'Profile'}
            </div>
          </button>
        </div>
      )}
    </aside>
    </>
  )
}

export default Sidebar
