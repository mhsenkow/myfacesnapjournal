/**
 * GitHub Integration Component
 * 
 * Allows users to configure GitHub integration for direct issue creation
 */

import React, { useState, useEffect } from 'react'
import { Github, Key, CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

interface GitHubIntegrationProps {}

const GitHubIntegration: React.FC<GitHubIntegrationProps> = () => {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [isValid, setIsValid] = useState<boolean | null>(null)
  const [validationMessage, setValidationMessage] = useState('')
  const [isConnected, setIsConnected] = useState(false)

  // Load saved token on component mount
  useEffect(() => {
    const savedToken = localStorage.getItem('github_token')
    if (savedToken) {
      setToken(savedToken)
      setIsConnected(true)
      validateToken(savedToken)
    }
  }, [])

  const validateToken = async (tokenToValidate: string) => {
    if (!tokenToValidate.trim()) {
      setIsValid(null)
      setValidationMessage('')
      return
    }

    setIsValidating(true)
    try {
      // Test the token by making a simple API call to GitHub
      const response = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `token ${tokenToValidate}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })

      if (response.ok) {
        const userData = await response.json()
        setIsValid(true)
        setValidationMessage(`Connected as ${userData.login}`)
        setIsConnected(true)
        localStorage.setItem('github_token', tokenToValidate)
      } else {
        setIsValid(false)
        setValidationMessage('Invalid token. Please check your Personal Access Token.')
        setIsConnected(false)
        localStorage.removeItem('github_token')
      }
    } catch (error) {
      setIsValid(false)
      setValidationMessage('Failed to validate token. Please check your connection.')
      setIsConnected(false)
      localStorage.removeItem('github_token')
    } finally {
      setIsValidating(false)
    }
  }

  const handleTokenChange = (newToken: string) => {
    setToken(newToken)
    if (newToken.trim()) {
      // Debounce validation
      const timeoutId = setTimeout(() => {
        validateToken(newToken)
      }, 500)
      return () => clearTimeout(timeoutId)
    } else {
      setIsValid(null)
      setValidationMessage('')
      setIsConnected(false)
      localStorage.removeItem('github_token')
    }
  }

  const handleSaveToken = () => {
    if (token.trim()) {
      localStorage.setItem('github_token', token)
      validateToken(token)
    }
  }

  const handleRemoveToken = () => {
    setToken('')
    setIsValid(null)
    setValidationMessage('')
    setIsConnected(false)
    localStorage.removeItem('github_token')
  }

  const getTokenInstructions = () => (
    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-2">How to create a GitHub Personal Access Token:</h4>
      <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
        <li>Go to GitHub.com and sign in to your account</li>
        <li>Click your profile picture → Settings</li>
        <li>In the left sidebar, click "Developer settings"</li>
        <li>Click "Personal access tokens" → "Tokens (classic)"</li>
        <li>Click "Generate new token" → "Generate new token (classic)"</li>
        <li>Give it a descriptive name like "MyFace SnapJournal"</li>
        <li>Select the <strong>"repo"</strong> scope (this allows creating issues)</li>
        <li>Click "Generate token" and copy the token</li>
        <li>Paste the token below (you won't be able to see it again)</li>
      </ol>
      <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
        <p className="text-sm text-yellow-800">
          <strong>Security Note:</strong> This token is stored locally on your device and only used to create issues in the mhsenkow/myfacesnapjournal repository.
        </p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Github size={20} className="text-gray-700" />
        </div>
        <div>
          <h3 className="font-medium text-gray-900">GitHub Integration</h3>
          <p className="text-sm text-gray-600">Connect GitHub to create issues directly from the app</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="flex items-center space-x-2">
        {isConnected && isValid ? (
          <>
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-green-700">{validationMessage}</span>
          </>
        ) : isValid === false ? (
          <>
            <XCircle size={16} className="text-red-500" />
            <span className="text-sm text-red-700">{validationMessage}</span>
          </>
        ) : isValidating ? (
          <>
            <AlertCircle size={16} className="text-yellow-500" />
            <span className="text-sm text-yellow-700">Validating token...</span>
          </>
        ) : (
          <>
            <XCircle size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Not connected</span>
          </>
        )}
      </div>

      {/* Token Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Personal Access Token
          </label>
          <a
            href="https://github.com/settings/tokens/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 underline"
          >
            Create Token →
          </a>
        </div>
        <div className="relative">
          <input
            type={showToken ? 'text' : 'password'}
            value={token}
            onChange={(e) => handleTokenChange(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700"
          >
            {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Your token is stored locally and only used to create issues in this repository.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {isConnected && isValid ? (
          <button
            onClick={handleRemoveToken}
            className="px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={handleSaveToken}
            disabled={!token.trim() || isValidating}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? 'Validating...' : 'Connect'}
          </button>
        )}
      </div>

      {/* Instructions */}
      {getTokenInstructions()}
    </div>
  )
}

export default GitHubIntegration
