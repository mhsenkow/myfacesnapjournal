/**
 * Feedback Modal Component for MyFace SnapJournal
 * 
 * This component provides a modal for users to submit feedback and create GitHub issues.
 * Features include:
 * - Issue title and description
 * - Image upload/paste functionality
 * - Issue labels and priority selection
 * - GitHub issue creation
 */

import React, { useState, useRef } from 'react'
import { X, Upload, Image, AlertCircle, CheckCircle, Copy, ExternalLink, Tag } from 'lucide-react'
import { githubService } from '../../services/githubService'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onIssueCreated?: (issueUrl: string, issueNumber: number) => void
}

interface IssueForm {
  title: string
  description: string
  labels: string[]
  priority: 'low' | 'medium' | 'high' | 'critical'
  images: string[]
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, onIssueCreated }) => {
  const [form, setForm] = useState<IssueForm>({
    title: '',
    description: '',
    labels: [],
    priority: 'medium',
    images: []
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error' | 'token-error'>('idle')
  const [createdIssue, setCreatedIssue] = useState<{ url: string; number: number } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Available labels for issues
  const availableLabels = [
    'bug', 'feature', 'enhancement', 'documentation', 'help wanted',
    'good first issue', 'ui/ux', 'performance', 'security', 'accessibility'
  ]

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-green-600 bg-green-100' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-600 bg-yellow-100' },
    { value: 'high', label: 'High', color: 'text-orange-600 bg-orange-100' },
    { value: 'critical', label: 'Critical', color: 'text-red-600 bg-red-100' }
  ]

  const handleInputChange = (field: keyof IssueForm, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleLabelToggle = (label: string) => {
    setForm(prev => ({
      ...prev,
      labels: prev.labels.includes(label)
        ? prev.labels.filter(l => l !== label)
        : [...prev.labels, label]
    }))
  }

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          setForm(prev => ({
            ...prev,
            images: [...prev.images, result]
          }))
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleImagePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            setForm(prev => ({
              ...prev,
              images: [...prev.images, result]
            }))
          }
          reader.readAsDataURL(file)
        }
      }
    }
  }

  const removeImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const createGitHubIssue = async () => {
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      // Prepare issue body with images
      let body = form.description
      
      if (form.images.length > 0) {
        body += '\n\n## Screenshots\n'
        form.images.forEach((image, index) => {
          body += `![Screenshot ${index + 1}](${image})\n`
        })
      }

      body += `\n\n---\n**Priority:** ${form.priority}\n**Labels:** ${form.labels.join(', ')}\n**Submitted via MyFace SnapJournal**`

      const issueData = {
        title: form.title,
        body: body,
        labels: [...form.labels, form.priority]
      }

      // Use GitHub service to create the issue
      const result = await githubService.createIssue(issueData)
      
      setCreatedIssue({
        url: result.html_url,
        number: result.number
      })
      setSubmitStatus('success')

      onIssueCreated?.(result.html_url, result.number)

    } catch (error) {
      console.error('Error creating issue:', error)
      setSubmitStatus('error')
      
      // Check if it's a token configuration error
      if (error instanceof Error && error.message.includes('GitHub token not configured')) {
        // Show a more helpful error message
        setSubmitStatus('token-error')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      labels: [],
      priority: 'medium',
      images: []
    })
    setSubmitStatus('idle')
    setCreatedIssue(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-2xl font-light glass-text-primary">Submit Feedback</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 glass-text-tertiary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium glass-text-secondary mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Brief description of the issue or suggestion"
              className="w-full px-4 py-3 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium glass-text-secondary mb-2">
              Description *
            </label>
            <textarea
              ref={textareaRef}
              value={form.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              onPaste={handleImagePaste}
              placeholder="Please describe the issue or feature request in detail..."
              className="w-full px-4 py-3 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
              rows={6}
              required
            />
            <p className="text-xs glass-text-tertiary mt-1">
              You can paste images directly into this field or use the upload button below.
            </p>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium glass-text-secondary mb-2">
              Priority
            </label>
            <div className="flex gap-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleInputChange('priority', option.value)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    form.priority === option.value
                      ? option.color
                      : 'glass-subtle border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div>
            <label className="block text-sm font-medium glass-text-secondary mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2">
              {availableLabels.map((label) => (
                <button
                  key={label}
                  onClick={() => handleLabelToggle(label)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
                    form.labels.includes(label)
                      ? 'bg-primary-100 text-primary-700 border border-primary-300'
                      : 'glass-subtle border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Tag className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium glass-text-secondary mb-2">
              Screenshots (Optional)
            </label>
            
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
                dragOver
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-neutral-300 dark:border-neutral-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragOver(false)
                handleImageUpload(e.dataTransfer.files)
              }}
            >
              <Upload className="w-8 h-8 glass-text-tertiary mx-auto mb-2" />
              <p className="glass-text-secondary mb-2">
                Drag and drop images here, or{' '}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-primary-600 hover:text-primary-700 underline"
                >
                  browse files
                </button>
              </p>
              <p className="text-xs glass-text-tertiary">
                Supports PNG, JPG, GIF up to 10MB each
              </p>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e.target.files)}
                className="hidden"
              />
            </div>

            {/* Image Preview */}
            {form.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                {form.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700"
                    />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Status */}
          {submitStatus === 'success' && createdIssue && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-medium text-green-800 dark:text-green-200">
                  Issue Created Successfully!
                </h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                Your issue has been created successfully! You can view it on GitHub or track it in your Issues tab.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(createdIssue.url, '_blank')}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Issue
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(createdIssue.url)}
                  className="flex items-center gap-2 px-3 py-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-medium text-red-800 dark:text-red-200">
                  Failed to Create Issue
                </h3>
              </div>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                There was an error submitting your feedback. Please try again.
              </p>
            </div>
          )}

          {submitStatus === 'token-error' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                  GitHub Integration Required
                </h3>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                To create issues directly, please set up GitHub integration in Settings → Integrations.
              </p>
              <button
                onClick={() => window.location.href = '/settings?tab=integrations'}
                className="mt-2 px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Go to Settings
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={createGitHubIssue}
            disabled={!form.title.trim() || !form.description.trim() || isSubmitting}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Issue...
              </>
            ) : (
              'Submit Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default FeedbackModal
