/**
 * Settings Page for MyFace SnapJournal
 * 
 * This page allows users to configure:
 * - App preferences and settings
 * - Theme customization
 * - AI model configuration
 * - Privacy and security settings
 * - Export/import options
 */

import React, { useState } from 'react'
import { Settings, Palette, Shield, Brain, Database, Download, Upload, ArrowRight, Link, User } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useTheme } from '../contexts/ThemeContext'
import { useNavigate } from 'react-router-dom'
import MastodonImport from '../components/Mastodon/MastodonImport'
import MastodonProfileInfo from '../components/Profile/MastodonProfileInfo'
import BlueskyProfileInfo from '../components/Profile/BlueskyProfileInfo'
import BlueskyIntegration from '../components/Bluesky/BlueskyIntegration'
import { useMastodonStore } from '../stores/mastodonStore'
import { useBlueskyStore } from '../stores/blueskyStore'

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useApp()
  const { theme, setTheme, exportTheme, importTheme } = useTheme()
  
  // Get connection status from stores
  const { auth: mastodonAuth } = useMastodonStore()
  const { auth: blueskyAuth } = useBlueskyStore()
  
  // Check URL params for initial tab (e.g., ?tab=profile)
  const urlParams = new URLSearchParams(window.location.search)
  const initialTab = urlParams.get('tab') || 'profile'
  
  const [activeTab, setActiveTab] = useState(initialTab)
  const navigate = useNavigate()

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'general', label: 'General', icon: Settings },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'ai', label: 'AI Settings', icon: Brain },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'privacy', label: 'Privacy', icon: Shield },

    { id: 'data', label: 'Data', icon: Database }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="glass p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 mb-6">
        <div>
          <h1 className="text-4xl font-light glass-text-primary tracking-wide">Settings</h1>
          <p className="glass-text-tertiary mt-2 text-lg font-light">Configure your journaling experience</p>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="glass rounded-2xl border border-neutral-200 dark:border-neutral-700">
        {/* Tab Navigation */}
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
                  }`}
                >
                  <Icon size={16} className="inline mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Connected Profiles</h3>
                <p className="text-sm text-neutral-500 mb-6">
                  View and manage your connected social media profiles
                </p>
              </div>
              
              {/* Mastodon Profile */}
              {mastodonAuth.isAuthenticated && mastodonAuth.user && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-neutral-800 flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Mastodon Profile
                  </h4>
                  <div className="glass p-6 rounded-lg border border-neutral-200">
                    <MastodonProfileInfo showExtra={true} />
                  </div>
                </div>
              )}
              
              {/* Bluesky Profile */}
              {blueskyAuth.isAuthenticated && blueskyAuth.user && (
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-neutral-800 flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Bluesky Profile
                  </h4>
                  <div className="glass p-6 rounded-lg border border-neutral-200">
                    <BlueskyProfileInfo showExtra={true} />
                  </div>
                </div>
              )}
              
              {/* No profiles connected */}
              {!mastodonAuth.isAuthenticated && !blueskyAuth.isAuthenticated && (
                <div className="glass p-6 rounded-lg border border-neutral-200 text-center">
                  <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">No Profiles Connected</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Connect to Mastodon or Bluesky to see your profile information here
                  </p>
                  <p className="text-xs text-gray-500">
                    Use the Feed tab to connect to your social media accounts
                  </p>
                </div>
              )}
              
              {/* Profile Integration Info */}
              {(mastodonAuth.isAuthenticated || blueskyAuth.isAuthenticated) && (
                <div className="glass p-4 rounded-lg border border-neutral-200 bg-blue-50">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Profile Integration</h4>
                  <p className="text-sm text-blue-700">
                    Your connected profiles are integrated throughout the app. They appear in the sidebar, 
                    settings, and social features. Your display name and avatar are used as your identity 
                    across MyFace SnapJournal.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">General Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Auto-save</label>
                    <p className="text-sm text-neutral-500">Automatically save entries as you type</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => updateSettings({ autoSave: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Auto-save interval (seconds)
                  </label>
                  <input
                    type="number"
                    value={settings.autoSaveInterval}
                    onChange={(e) => updateSettings({ autoSaveInterval: parseInt(e.target.value) })}
                    style={{backgroundColor: 'var(--color-background-primary)', color: 'var(--color-neutral-900)'}}
                    className="w-32 px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="5"
                    max="300"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Notifications</label>
                    <p className="text-sm text-neutral-500">Show desktop notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableNotifications}
                    onChange={(e) => updateSettings({ enableNotifications: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Theme Settings */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">Theme & Appearance</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Theme Mode
                  </label>
                  <div className="flex space-x-2">
                    {(['light', 'dark', 'high-contrast'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setTheme({ mode: mode as 'light' | 'dark' | 'brutalist' })}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          theme.mode === mode
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Theme Preset
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {(['default', 'ocean', 'forest', 'sunset'] as const).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setTheme({ preset })}
                        className={`p-3 rounded-lg border transition-colors ${
                          theme.preset === preset
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-neutral-300 hover:border-neutral-400'
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">{preset}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      const themeData = exportTheme()
                      navigator.clipboard.writeText(themeData)
                    }}
                    className="btn-outline"
                  >
                    <Download size={16} className="mr-2" />
                    Export Theme
                  </button>
                  <button
                    onClick={() => {
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = '.json'
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            const themeData = e.target?.result as string
                            importTheme(themeData)
                          }
                          reader.readAsText(file)
                        }
                      }
                      input.click()
                    }}
                    className="btn-outline"
                  >
                    <Upload size={16} className="mr-2" />
                    Import Theme
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">AI Configuration</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Enable Echo Engine</label>
                    <p className="text-sm text-neutral-500">AI-powered pattern recognition</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableEchoEngine}
                    onChange={(e) => updateSettings({ enableEchoEngine: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Enable AI Companion</label>
                    <p className="text-sm text-neutral-500">AI reflection and conversation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableCompanionPersona}
                    onChange={(e) => updateSettings({ enableCompanionPersona: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    AI Model
                  </label>
                  <select
                    value={settings.aiModel}
                    onChange={(e) => updateSettings({ aiModel: e.target.value as any })}
                    style={{backgroundColor: 'var(--color-background-primary)', color: 'var(--color-neutral-900)'}}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="ollama">Ollama (Recommended)</option>
                    <option value="llama.cpp">llama.cpp</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Integrations */}
          {activeTab === 'integrations' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">External Integrations</h3>
              <p className="text-neutral-600">Connect external services to import content into your journal</p>
              
              <div className="space-y-6">
                {/* Mastodon Integration */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <MastodonImport />
                </div>

                {/* Bluesky Integration */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6">
                  <BlueskyIntegration />
                </div>
                
                {/* Future integrations placeholder */}
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-6">
                  <h4 className="font-medium text-neutral-900 mb-2">More Integrations Coming Soon</h4>
                  <p className="text-sm text-neutral-600">
                    We're working on integrations with Twitter, Instagram, and other social platforms.
                    Stay tuned for updates!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">Privacy & Security</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Private Mode</label>
                    <p className="text-sm text-neutral-500">Disable all sync and federation</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.privateMode}
                    onChange={(e) => updateSettings({ privateMode: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Enable Sync</label>
                    <p className="text-sm text-neutral-500">Sync data across devices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableSync}
                    onChange={(e) => updateSettings({ enableSync: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    disabled={settings.privateMode}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-neutral-700">Enable Federation</label>
                    <p className="text-sm text-neutral-500">Share anonymized insights</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableFederation}
                    onChange={(e) => updateSettings({ enableFederation: e.target.checked })}
                    className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                    disabled={settings.privateMode}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Data Settings */}
          {activeTab === 'data' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-neutral-900">Data Management</h3>
              
              <div className="space-y-4">
                {/* Database Settings Card */}
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-primary-900">Database Settings</h4>
                      <p className="text-sm text-primary-700">Choose where your data is stored locally</p>
                    </div>
                    <button 
                      onClick={() => navigate('/settings/database')}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      <Database size={16} />
                      Manage Database
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button className="btn-outline">
                    <Download size={16} className="mr-2" />
                    Export All Data
                  </button>
                  <button className="btn-outline">
                    <Upload size={16} className="mr-2" />
                    Import Data
                  </button>
                </div>

                <div className="bg-neutral-50 p-4 rounded-lg">
                  <h4 className="font-medium text-neutral-900 mb-2">Storage Information</h4>
                  <div className="text-sm text-neutral-600 space-y-1">
                    <p>Total entries: 156</p>
                    <p>Storage used: 2.4 MB</p>
                    <p>Last backup: 2 days ago</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button className="btn-outline text-error-600 border-error-300 hover:bg-error-50">
                    Clear All Data
                  </button>
                  <button className="btn-outline text-error-600 border-error-300 hover:bg-error-50">
                    Reset Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
