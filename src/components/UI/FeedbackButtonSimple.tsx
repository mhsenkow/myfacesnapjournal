/**
 * Simple Feedback Button Component for MyFace SnapJournal
 * 
 * This component provides feedback buttons that trigger the global feedback modal.
 * It's designed to be used within the sidebar without rendering the modal itself.
 */

import React from 'react'
import { MessageCircle, Bug, Lightbulb } from 'lucide-react'
import { useFeedbackModal } from '../../contexts/FeedbackModalContext'

interface FeedbackButtonSimpleProps {
  variant?: 'inline' | 'floating'
  className?: string
}

const FeedbackButtonSimple: React.FC<FeedbackButtonSimpleProps> = ({ 
  variant = 'inline', 
  className = '' 
}) => {
  const { openModal } = useFeedbackModal()

  const handleFeedbackClick = (type: 'general' | 'bug' | 'feature') => {
    openModal(type)
  }

  const buttonClasses = variant === 'inline' 
    ? "p-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-200 group flex items-center gap-2 w-full"
    : "p-3 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"

  const iconClasses = variant === 'inline' 
    ? "w-4 h-4 glass-text-primary"
    : "w-5 h-5 glass-text-primary"

  if (variant === 'inline') {
    return (
      <div className={`space-y-2 ${className}`}>
        <button
          onClick={() => handleFeedbackClick('bug')}
          className={buttonClasses}
          title="Report a Bug"
        >
          <Bug className={`${iconClasses} group-hover:text-red-600 transition-colors`} />
          <span className="text-sm font-medium">Report Bug</span>
        </button>
        
        <button
          onClick={() => handleFeedbackClick('feature')}
          className={buttonClasses}
          title="Suggest a Feature"
        >
          <Lightbulb className={`${iconClasses} group-hover:text-yellow-600 transition-colors`} />
          <span className="text-sm font-medium">Suggest Feature</span>
        </button>
        
        <button
          onClick={() => handleFeedbackClick('general')}
          className={buttonClasses}
          title="Send Feedback"
        >
          <MessageCircle className={`${iconClasses} group-hover:text-blue-600 transition-colors`} />
          <span className="text-sm font-medium">Send Feedback</span>
        </button>
      </div>
    )
  }

  return (
    <div className={`fixed bottom-20 left-4 z-[60] flex flex-col gap-2 ${className}`}>
      <button
        onClick={() => handleFeedbackClick('bug')}
        className={buttonClasses}
        title="Report a Bug"
      >
        <Bug className={`${iconClasses} group-hover:text-red-600 transition-colors`} />
      </button>
      
      <button
        onClick={() => handleFeedbackClick('feature')}
        className={buttonClasses}
        title="Suggest a Feature"
      >
        <Lightbulb className={`${iconClasses} group-hover:text-yellow-600 transition-colors`} />
      </button>
      
      <button
        onClick={() => handleFeedbackClick('general')}
        className={buttonClasses}
        title="Send Feedback"
      >
        <MessageCircle className={`${iconClasses} group-hover:text-blue-600 transition-colors`} />
      </button>
    </div>
  )
}

export default FeedbackButtonSimple
