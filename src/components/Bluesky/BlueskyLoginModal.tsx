/**
 * Bluesky Login Modal Component
 * 
 * A modal for authenticating with Bluesky using handle and app password
 */

import React, { useState } from 'react';
import { X, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useBlueskyStore } from '../../stores/blueskyStore';

interface BlueskyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BlueskyLoginModal: React.FC<BlueskyLoginModalProps> = ({ isOpen, onClose }) => {
  const { login, isLoading, error, clearError } = useBlueskyStore();
  
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearError();

    if (!identifier.trim() || !password.trim()) {
      setLocalError('Please enter both handle and app password');
      return;
    }

    try {
      await login(identifier.trim(), password);
      onClose();
      // Reset form
      setIdentifier('');
      setPassword('');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleClose = () => {
    setIdentifier('');
    setPassword('');
    setLocalError('');
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 glass-panel glass-strong border border-neutral-300 dark:border-neutral-600 rounded-2xl shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">BS</span>
            </div>
            <h2 className="text-xl font-semibold glass-text-primary">Connect to Bluesky</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 glass-text-secondary" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="glass-subtle border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 text-blue-500 mt-0.5">
                <ExternalLink className="w-full h-full" />
              </div>
              <div className="space-y-2">
                <p className="text-sm glass-text-primary font-medium">
                  Bluesky Integration
                </p>
                <p className="text-xs glass-text-tertiary leading-relaxed">
                  Connect your Bluesky account to view your timeline and interact with posts. 
                  You'll need your handle and an app password (not your regular password).
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Handle Input */}
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium glass-text-primary mb-2">
                Bluesky Handle
              </label>
              <input
                type="text"
                id="identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username.bsky.social"
                className="w-full px-4 py-3 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-xl glass-text-primary placeholder-glass-text-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={isLoading}
              />
              <p className="text-xs glass-text-muted mt-1">
                Your full Bluesky handle (e.g., username.bsky.social)
              </p>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium glass-text-primary mb-2">
                App Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your app password"
                  className="w-full px-4 py-3 pr-12 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-xl glass-text-primary placeholder-glass-text-muted focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 dark:hover:bg-black/20 rounded transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 glass-text-muted" />
                  ) : (
                    <Eye className="w-4 h-4 glass-text-muted" />
                  )}
                </button>
              </div>
              <p className="text-xs glass-text-muted mt-1">
                Generate an app password in your Bluesky settings
              </p>
            </div>

            {/* Error Messages */}
            {(error || localError) && (
              <div className="glass-subtle border border-red-200 dark:border-red-800 rounded-xl p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error || localError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !identifier.trim() || !password.trim()}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </div>
              ) : (
                'Connect to Bluesky'
              )}
            </button>
          </form>

          {/* Help Link */}
          <div className="text-center">
            <a
              href="https://bsky.app/settings/app-passwords"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors flex items-center justify-center gap-1"
            >
              How to create an app password
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlueskyLoginModal;
