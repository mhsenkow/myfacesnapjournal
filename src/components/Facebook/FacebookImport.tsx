/**
 * Facebook Import Component
 * 
 * Provides UI for Facebook authentication and post import functionality
 */

import React, { useState, useEffect } from 'react';
import { Facebook, Download, Settings, LogOut, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useFacebookStore } from '../../stores/facebookStore';
import { useJournalStore } from '../../stores/journalStore';
import FacebookLoginModal from './FacebookLoginModal';
import { EntrySource } from '../../types/journal';

const FacebookImport: React.FC = () => {
  const {
    auth,
    importSettings,
    isImporting,
    importProgress,
    lastImportError,
    login,
    logout,
    checkAuthStatus,
    updateImportSettings,
    importPosts,
    clearImportedPosts,
    setLastImportError
  } = useFacebookStore();

  const { createEntry } = useJournalStore();
  const [showSettings, setShowSettings] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginSuccess = async (authResponse: any) => {
    try {
      await login(authResponse);
      setShowLoginModal(false);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLoginError = (error: string) => {
    setLastImportError(error);
  };

  const handleImport = async () => {
    try {
      setLastImportError(undefined);
      const importedPosts = await importPosts(importSettings.importLimit);
      
      // Convert Facebook posts to journal entries and add them
      for (const post of importedPosts) {
        await createEntry({
          title: post.title,
          content: post.content,
          tags: post.tags,
          mood: post.mood as any,
          privacy: post.privacy,
          source: EntrySource.FACEBOOK,
          sourceId: post.sourceId,
          sourceUrl: post.sourceUrl,
          metadata: post.metadata
        });
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleLogout = () => {
    logout();
    clearImportedPosts();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Facebook className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Facebook Integration</h3>
        </div>
        {auth.isAuthenticated && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Settings className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>

      {/* Authentication Status */}
      {auth.isAuthenticated ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Connected as {auth.user?.name}
                </p>
                <p className="text-xs text-green-600">
                  Last connected: {auth.lastAuthDate instanceof Date ? auth.lastAuthDate.toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-gray-600" />
            <div>
              <p className="text-sm font-medium text-gray-800">
                Not connected to Facebook
              </p>
              <p className="text-xs text-gray-600">
                Connect to import your Facebook posts as journal entries
              </p>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Facebook className="w-4 h-4" />
            Connect to Facebook
          </button>
        </div>
      )}

      {/* Import Settings */}
      {showSettings && auth.isAuthenticated && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">Import Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Limit
              </label>
              <input
                type="number"
                value={importSettings.importLimit}
                onChange={(e) => updateImportSettings({ importLimit: parseInt(e.target.value) })}
                style={{backgroundColor: 'var(--color-background-primary)', color: 'var(--color-neutral-900)'}}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="100"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto Import (hours)
              </label>
              <input
                type="number"
                value={importSettings.importInterval}
                onChange={(e) => updateImportSettings({ importInterval: parseInt(e.target.value) })}
                style={{backgroundColor: 'var(--color-background-primary)', color: 'var(--color-neutral-900)'}}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="168"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.includeStatusUpdates}
                onChange={(e) => updateImportSettings({ includeStatusUpdates: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include status updates</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.includePhotos}
                onChange={(e) => updateImportSettings({ includePhotos: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include photos</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.includeVideos}
                onChange={(e) => updateImportSettings({ includeVideos: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include videos</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.includeLinks}
                onChange={(e) => updateImportSettings({ includeLinks: e.target.checked })}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Include shared links</span>
            </label>
          </div>
        </div>
      )}

      {/* Import Actions */}
      {auth.isAuthenticated && (
        <div className="space-y-3">
          {isImporting && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Importing posts...</p>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${importProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {lastImportError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-sm text-red-800">{lastImportError}</p>
                  {lastImportError.includes('user_posts permission not available') && (
                    <div className="mt-2 text-xs text-red-600">
                      <p><strong>Note:</strong> The user_posts permission requires Facebook app review for production use.</p>
                      <p>In development mode, we'll create sample posts based on your profile instead of importing actual posts.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleImport}
            disabled={isImporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            {isImporting ? 'Importing...' : 'Import Facebook Posts'}
          </button>
        </div>
      )}

      {/* Last Import Info */}
      {importSettings.lastImportDate && (
        <div className="text-xs text-gray-500 text-center">
          Last import: {importSettings.lastImportDate instanceof Date ? importSettings.lastImportDate.toLocaleString() : 'Unknown'}
        </div>
      )}

      {/* Login Modal */}
      <FacebookLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onError={handleLoginError}
      />
    </div>
  );
};

export default FacebookImport;
