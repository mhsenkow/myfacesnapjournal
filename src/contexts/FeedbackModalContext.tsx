/**
 * Feedback Modal Context for MyFace SnapJournal
 * 
 * This context manages the global state of the feedback modal,
 * allowing it to be opened from anywhere in the app and rendered
 * as a proper full-screen overlay.
 */

import React, { createContext, useContext, useState, ReactNode } from 'react'
import FeedbackModal from '../components/UI/FeedbackModal'

interface FeedbackModalContextType {
  isOpen: boolean
  feedbackType: 'general' | 'bug' | 'feature'
  openModal: (type?: 'general' | 'bug' | 'feature') => void
  closeModal: () => void
}

const FeedbackModalContext = createContext<FeedbackModalContextType | undefined>(undefined)

interface FeedbackModalProviderProps {
  children: ReactNode
}

export const FeedbackModalProvider: React.FC<FeedbackModalProviderProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'feature'>('general')

  const openModal = (type: 'general' | 'bug' | 'feature' = 'general') => {
    setFeedbackType(type)
    setIsOpen(true)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const handleIssueCreated = (issueUrl: string, issueNumber: number) => {
    console.log(`Issue created: #${issueNumber} - ${issueUrl}`)
  }

  return (
    <FeedbackModalContext.Provider value={{ isOpen, feedbackType, openModal, closeModal }}>
      {children}
      <FeedbackModal
        isOpen={isOpen}
        onClose={closeModal}
        onIssueCreated={handleIssueCreated}
      />
    </FeedbackModalContext.Provider>
  )
}

export const useFeedbackModal = (): FeedbackModalContextType => {
  const context = useContext(FeedbackModalContext)
  if (context === undefined) {
    throw new Error('useFeedbackModal must be used within a FeedbackModalProvider')
  }
  return context
}
