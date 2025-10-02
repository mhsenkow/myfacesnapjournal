/**
 * Theme Context for MyFace SnapJournal
 * 
 * This context manages the application's theme system, including:
 * - Light/dark mode switching
 * - Custom theme customization
 * - Theme persistence in localStorage
 * - CSS variable injection for dynamic theming
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

// Theme types
export type ThemeMode = 'light' | 'dark' | 'brutalist'
export type ThemePreset = 'default' | 'ocean' | 'forest' | 'sunset' | 'custom'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
}

export interface ThemeSettings {
  mode: ThemeMode
  preset: ThemePreset
  colors: ThemeColors
  fontSize: 'small' | 'medium' | 'large'
  spacing: 'compact' | 'comfortable' | 'spacious'
  borderRadius: 'sharp' | 'rounded' | 'pill'
}

interface ThemeContextType {
  theme: ThemeSettings
  setTheme: (theme: Partial<ThemeSettings>) => void
  toggleMode: () => void
  resetTheme: () => void
  exportTheme: () => string
  importTheme: (themeData: string) => boolean
}

// Default theme settings
const defaultTheme: ThemeSettings = {
  mode: 'light',
  preset: 'default',
  colors: {
    primary: '#8b5cf6',
    secondary: '#f59e0b',
    accent: '#10b981',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#171717'
  },
  fontSize: 'medium',
  spacing: 'comfortable',
  borderRadius: 'rounded'
}

// Theme presets
const themePresets: Record<ThemePreset, Partial<ThemeSettings>> = {
  default: defaultTheme,
  ocean: {
    colors: {
      primary: '#0ea5e9',
      secondary: '#06b6d4',
      accent: '#10b981',
      background: '#f0f9ff',
      surface: '#e0f2fe',
      text: '#0c4a6e'
    }
  },
  forest: {
    colors: {
      primary: '#059669',
      secondary: '#65a30d',
      accent: '#f59e0b',
      background: '#f0fdf4',
      surface: '#dcfce7',
      text: '#14532d'
    }
  },
  sunset: {
    colors: {
      primary: '#dc2626',
      secondary: '#ea580c',
      accent: '#fbbf24',
      background: '#fef2f2',
      surface: '#fee2e2',
      text: '#7f1d1d'
    }
  },
  custom: {}
}

// Create context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider component
export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeSettings>(() => {
    // Load theme from localStorage or use default
    const saved = localStorage.getItem('myface-theme')
    if (saved) {
      try {
        return { ...defaultTheme, ...JSON.parse(saved) }
      } catch {
        return defaultTheme
      }
    }
    return defaultTheme
  })

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement
    
    // Set theme mode
    root.setAttribute('data-theme', theme.mode)
    
    // Apply custom colors if preset is custom
    if (theme.preset === 'custom') {
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--color-${key}`, value)
      })
    }
    
    // Apply font size
    const fontSizeMap = {
      small: '0.875rem',
      medium: '1rem',
      large: '1.125rem'
    }
    root.style.setProperty('--text-base', fontSizeMap[theme.fontSize])
    
    // Apply spacing
    const spacingMap = {
      compact: '0.75rem',
      comfortable: '1rem',
      spacious: '1.25rem'
    }
    root.style.setProperty('--spacing-md', spacingMap[theme.spacing])
    
    // Apply border radius
    const radiusMap = {
      sharp: '0.125rem',
      rounded: '0.375rem',
      pill: '0.5rem'
    }
    root.style.setProperty('--radius-md', radiusMap[theme.borderRadius])
    
    // Save to localStorage
    localStorage.setItem('myface-theme', JSON.stringify(theme))
  }, [theme])

  // Update theme function
  const setTheme = (updates: Partial<ThemeSettings>) => {
    setThemeState(prev => {
      const newTheme = { ...prev, ...updates }
      
      // If preset changed, apply preset colors
      if (updates.preset && updates.preset !== 'custom') {
        const preset = themePresets[updates.preset]
        if (preset.colors) {
          newTheme.colors = { ...newTheme.colors, ...preset.colors }
        }
      }
      
      return newTheme
    })
  }

  // Toggle between light, dark, and brutalist modes
  const toggleMode = () => {
    const modeCycle = { 'light': 'dark', 'dark': 'brutalist', 'brutalist': 'light' } as const
    setTheme({
      mode: modeCycle[theme.mode]
    })
  }

  // Reset to default theme
  const resetTheme = () => {
    setThemeState(defaultTheme)
  }

  // Export theme as JSON string
  const exportTheme = () => {
    return JSON.stringify(theme, null, 2)
  }

  // Import theme from JSON string
  const importTheme = (themeData: string): boolean => {
    try {
      const imported = JSON.parse(themeData)
      setThemeState({ ...defaultTheme, ...imported })
      return true
    } catch {
      return false
    }
  }

  const value: ThemeContextType = {
    theme,
    setTheme,
    toggleMode,
    resetTheme,
    exportTheme,
    importTheme
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
