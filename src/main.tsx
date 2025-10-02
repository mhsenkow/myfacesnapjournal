/**
 * MyFace SnapJournal - Main Entry Point
 * 
 * This file initializes the React application with routing, theme context,
 * and global state management. It's the entry point for the entire app.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import AppContent from './App'
import { ThemeProvider } from './contexts/ThemeContext'
import { AppProvider } from './contexts/AppContext'
import './styles/index.css'

// Initialize the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ThemeProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
