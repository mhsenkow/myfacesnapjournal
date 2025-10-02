/**
 * Toast Container Component for MyFace SnapJournal
 * 
 * This component displays toast notifications for user feedback:
 * - Success, error, warning, and info messages
 * - Auto-dismiss functionality
 * - Action buttons for user interaction
 * - Stacked notification display
 */

import React from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { ToastMessage } from '../../contexts/AppContext'

interface ToastContainerProps {
  toasts: ToastMessage[]
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  const { removeToast } = useApp()

  // Get icon for toast type
  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-success-600" />
      case 'error':
        return <AlertCircle size={20} className="text-error-600" />
      case 'warning':
        return <AlertTriangle size={20} className="text-warning-600" />
      case 'info':
        return <Info size={20} className="text-primary-600" />
      default:
        return <Info size={20} className="text-neutral-600" />
    }
  }

  // Get background color for toast type
  const getBackgroundColor = (type: ToastMessage['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success-50 border-success-200'
      case 'error':
        return 'bg-error-50 border-error-200'
      case 'warning':
        return 'bg-warning-50 border-warning-200'
      case 'info':
        return 'bg-primary-50 border-primary-200'
      default:
        return 'bg-neutral-50 border-neutral-200'
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`max-w-sm w-full p-4 rounded-lg glass-subtle transition-all duration-300 ease-in-out ${getBackgroundColor(toast.type)}`}
        >
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(toast.type)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-neutral-900 mb-1">
                {toast.title}
              </h4>
              {toast.message && (
                <p className="text-sm text-neutral-600 mb-2">
                  {toast.message}
                </p>
              )}
              
              {/* Action Button */}
              {toast.action && (
                <button
                  onClick={toast.action.onClick}
                  className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                >
                  {toast.action.label}
                </button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 p-1 hover:bg-neutral-200 rounded transition-colors"
            >
              <X size={16} className="text-neutral-500" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default ToastContainer
