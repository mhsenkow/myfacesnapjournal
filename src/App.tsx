/**
 * MyFace SnapJournal - Main App Component
 * 
 * This component sets up the main application structure including:
 * - Routing between different views
 * - Layout with sidebar and main content
 * - Theme switching
 * - Global state management
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useApp } from './contexts/AppContext'
import Layout from './components/Layout/Layout'
import JournalPage from './pages/JournalPage'
import EchoPage from './pages/EchoPage'
import CompanionPage from './pages/CompanionPage'
import FeedPage from './pages/FeedPage'
import SettingsPage from './pages/SettingsPage'
import DatabaseSettingsPage from './pages/DatabaseSettingsPage'
import VaultPage from './pages/VaultPage'
import ToastContainer from './components/UI/ToastContainer'
import LoadingScreen from './components/UI/LoadingScreen'

function AppContent() {
  const { state } = useApp()

  // Show loading screen while app initializes
  if (!state.isInitialized) {
    return <LoadingScreen />
  }

  return (
    <div className="app theme-transition">
      <Layout>
        <Routes>
          {/* Default route redirects to journal */}
          <Route path="/" element={<Navigate to="/journal" replace />} />
          
          {/* Main app routes */}
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/echo" element={<EchoPage />} />
          <Route path="/companion" element={<CompanionPage />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/database" element={<DatabaseSettingsPage />} />
          <Route path="/vault" element={<VaultPage />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/journal" replace />} />
        </Routes>
      </Layout>
      
      {/* Global toast notifications */}
      <ToastContainer toasts={state.toastQueue} />
    </div>
  )
}

export default AppContent
