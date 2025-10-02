/**
 * App Context for MyFace SnapJournal
 * 
 * This context manages global application state including:
 * - User preferences and settings
 * - App configuration
 * - Global UI state
 * - Feature flags and capabilities
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// App settings interface
export interface AppSettings {
  // User preferences
  autoSave: boolean
  autoSaveInterval: number // in seconds
  defaultPrivacy: 'public' | 'private' | 'friends'
  enableNotifications: boolean
  enableSounds: boolean
  
  // AI settings
  enableEchoEngine: boolean
  enableIntrospectionAI: boolean
  aiModel: 'ollama' | 'llama.cpp' | 'disabled'
  aiModelPath: string
  
  // Sync settings
  enableSync: boolean
  enableFederation: boolean
  privateMode: boolean
  
  // Editor settings
  editorFontSize: number
  editorFontFamily: string
  editorLineHeight: number
  enableSpellCheck: boolean
  
  // Performance settings
  enableAnimations: boolean
  enableSmoothScrolling: boolean
  maxEntriesInMemory: number
}

// App state interface
export interface AppState {
  // UI state
  sidebarCollapsed: boolean
  currentView: 'journal' | 'echo' | 'companion' | 'settings' | 'vault'
  modalOpen: string | null
  toastQueue: ToastMessage[]
  
  // App status
  isInitialized: boolean
  isOnline: boolean
  lastSyncTime: Date | null
  syncStatus: 'idle' | 'syncing' | 'error' | 'success'
  
  // Feature capabilities
  features: {
    ai: boolean
    sync: boolean
    encryption: boolean
    audio: boolean
    export: boolean
  }
}

// Toast message interface
export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Default app settings
const defaultAppSettings: AppSettings = {
  autoSave: true,
  autoSaveInterval: 30,
  defaultPrivacy: 'private',
  enableNotifications: true,
  enableSounds: true,
  enableEchoEngine: true,
  enableIntrospectionAI: true,
  aiModel: 'ollama',
  aiModelPath: '',
  enableSync: false,
  enableFederation: false,
  privateMode: true,
  editorFontSize: 16,
  editorFontFamily: 'Inter',
  editorLineHeight: 1.6,
  enableSpellCheck: true,
  enableAnimations: true,
  enableSmoothScrolling: true,
  maxEntriesInMemory: 100
}

// Default app state
const defaultAppState: AppState = {
  sidebarCollapsed: false,
  currentView: 'journal',
  modalOpen: null,
  toastQueue: [],
  isInitialized: false,
  isOnline: navigator.onLine,
  lastSyncTime: null,
  syncStatus: 'idle',
  features: {
    ai: true,
    sync: false,
    encryption: true,
    audio: true,
    export: true
  }
}

interface AppContextType {
  settings: AppSettings
  state: AppState
  updateSettings: (updates: Partial<AppSettings>) => void
  updateState: (updates: Partial<AppState>) => void
  toggleSidebar: () => void
  setCurrentView: (view: AppState['currentView']) => void
  openModal: (modalId: string) => void
  closeModal: () => void
  addToast: (toast: Omit<ToastMessage, 'id'>) => void
  removeToast: (id: string) => void
  resetSettings: () => void
  checkCapabilities: () => Promise<void>
}

// Create context
const AppContext = createContext<AppContextType | undefined>(undefined)

// App provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // Load settings from localStorage
    const saved = localStorage.getItem('myface-settings')
    if (saved) {
      try {
        return { ...defaultAppSettings, ...JSON.parse(saved) }
      } catch {
        return defaultAppSettings
      }
    }
    return defaultAppSettings
  })

  const [state, setState] = useState<AppState>(defaultAppState)

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('myface-settings', JSON.stringify(settings))
  }, [settings])

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check app capabilities on mount
  useEffect(() => {
    checkCapabilities()
  }, [])

  // Update settings function
  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }

  // Update state function
  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }))
  }

  // Set current view
  const setCurrentView = (view: AppState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }))
  }

  // Open modal
  const openModal = (modalId: string) => {
    setState(prev => ({ ...prev, modalOpen: modalId }))
  }

  // Close modal
  const closeModal = () => {
    setState(prev => ({ ...prev, modalOpen: null }))
  }

  // Add toast message
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: ToastMessage = {
      id,
      duration: 5000,
      ...toast
    }

    setState(prev => ({
      ...prev,
      toastQueue: [...prev.toastQueue, newToast]
    }))

    // Auto-remove toast after duration
    if (newToast.duration) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
  }

  // Remove toast message
  const removeToast = (id: string) => {
    setState(prev => ({
      ...prev,
      toastQueue: prev.toastQueue.filter(toast => toast.id !== id)
    }))
  }

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultAppSettings)
  }

  // Check app capabilities
  const checkCapabilities = async () => {
    try {
      // Check for AI capabilities
      const aiCapable = await checkAICapabilities()
      
      // Check for encryption capabilities
      const encryptionCapable = await checkEncryptionCapabilities()
      
      // Check for audio capabilities
      const audioCapable = await checkAudioCapabilities()
      
      // Check for sync capabilities
      const syncCapable = await checkSyncCapabilities()

      setState(prev => ({
        ...prev,
        features: {
          ai: aiCapable,
          sync: syncCapable,
          encryption: encryptionCapable,
          audio: audioCapable,
          export: true
        },
        isInitialized: true
      }))
    } catch (error) {
      console.error('Failed to check capabilities:', error)
      setState(prev => ({ ...prev, isInitialized: true }))
    }
  }

  // Check AI capabilities
  const checkAICapabilities = async (): Promise<boolean> => {
    try {
      // Check if Ollama is available
      if (settings.aiModel === 'ollama') {
        // This would be a Tauri command in the real app
        return true
      }
      
      // Check if llama.cpp is available
      if (settings.aiModel === 'llama.cpp') {
        // This would check for llama.cpp binaries
        return true
      }
      
      return false
    } catch {
      return false
    }
  }

  // Check encryption capabilities
  const checkEncryptionCapabilities = async (): Promise<boolean> => {
    try {
      // Check if Web Crypto API is available
      return typeof crypto !== 'undefined' && crypto.subtle !== undefined
    } catch {
      return false
    }
  }

  // Check audio capabilities
  const checkAudioCapabilities = async (): Promise<boolean> => {
    try {
      // Check if Web Audio API is available
      return typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined'
    } catch {
      return false
    }
  }

  // Check sync capabilities
  const checkSyncCapabilities = async (): Promise<boolean> => {
    try {
      // Check if IndexedDB is available
      return typeof indexedDB !== 'undefined'
    } catch {
      return false
    }
  }

  const value: AppContextType = {
    settings,
    state,
    updateSettings,
    updateState,
    toggleSidebar,
    setCurrentView,
    openModal,
    closeModal,
    addToast,
    removeToast,
    resetSettings,
    checkCapabilities
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Hook to use app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
