/**
 * Mastodon Login Modal Component
 * 
 * Provides OAuth login flow for Mastodon instances
 */

import React, { useState, useEffect } from 'react';
import { Globe, X, AlertCircle, Loader2, ExternalLink, CheckCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { mastodonService } from '../../services/mastodonService';
import { MastodonInstance } from '../../types/mastodon';
import Portal from '../../utils/portal';

// Detect if we're running in Tauri (desktop) or browser environment
const isTauri = () => {
  return typeof window !== 'undefined' && (window as any).__TAURI__;
};

// Get the appropriate redirect URI based on environment
const getRedirectUri = () => {
  if (isTauri()) {
    // Desktop app - use localhost:8080/callback
    return 'http://localhost:8080/callback';
  } else {
    // Browser - use current origin + oauth-callback.html
    return `${window.location.origin}/oauth-callback.html`;
  }
};

interface MastodonLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authData: { instance: string; accessToken: string; user: any }) => void;
  onError?: (error: string) => void;
}

const MastodonLoginModal: React.FC<MastodonLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [selectedInstance, setSelectedInstance] = useState('');
  const [customInstance, setCustomInstance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [instanceInfo, setInstanceInfo] = useState<MastodonInstance | null>(null);
  const [step, setStep] = useState<'select' | 'auth'>('select');
  const [manualCode, setManualCode] = useState('');

  const popularInstances = mastodonService.getPopularInstances();

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setError(null);
      setInstanceInfo(null);
    }
  }, [isOpen]);

  // OAuth callback is handled manually via code entry

  const handleInstanceSelect = async (instanceUrl: string) => {
    setSelectedInstance(instanceUrl);
    setIsLoading(true);
    setError(null);

    try {
      const info = await mastodonService.getInstanceInfo(instanceUrl);
      setInstanceInfo(info);
      setStep('auth');
    } catch (error) {
      const errorMsg = 'Failed to connect to this Mastodon instance. Please check the URL and try again.';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomInstance = async () => {
    if (!customInstance.trim()) {
      setError('Please enter a Mastodon instance URL');
      return;
    }

    // Add protocol if missing
    let instanceUrl = customInstance.trim();
    if (!instanceUrl.startsWith('http://') && !instanceUrl.startsWith('https://')) {
      instanceUrl = 'https://' + instanceUrl;
    }

    await handleInstanceSelect(instanceUrl);
  };

  const handleAuth = async () => {
    if (!selectedInstance || !instanceInfo) return;

    setIsLoading(true);
    setError(null);

    try {
      const redirectUri = getRedirectUri();
      console.log('Using redirect URI:', redirectUri);
      const clientData = await mastodonService.registerClient(selectedInstance, redirectUri);
      const authUrl = mastodonService.getAuthUrl(selectedInstance, redirectUri, clientData.client_id);
      
      // Check if we're in Tauri (desktop) or browser environment
      if (isTauri()) {
        // Use Tauri's webview window for desktop app
        try {
          await invoke('open_oauth_window', { url: authUrl });
          setError('Please complete the authorization in the OAuth window, then copy the authorization code and paste it below.');
          setIsLoading(false);
        } catch (error) {
          setError(`Failed to open OAuth window: ${error}`);
          setIsLoading(false);
          return;
        }
      } else {
        // Use browser popup for web app
        const popup = window.open(authUrl, 'mastodon-auth', 'width=600,height=700,scrollbars=yes,resizable=yes');
        
        if (!popup) {
          setError('Failed to open popup window. Please check your browser\'s popup blocker settings.');
          setIsLoading(false);
          return;
        }

        // Listen for the popup to close or receive messages
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            setIsLoading(false);
            setError('Authorization cancelled. Please try again or enter the code manually below.');
          }
        }, 1000);

        // Listen for messages from the popup
        const messageListener = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'MASTODON_OAUTH_CALLBACK') {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageListener);
            
            if (event.data.code) {
              handleOAuthCallback(selectedInstance, event.data.code, redirectUri);
            } else if (event.data.error) {
              setError(`OAuth error: ${event.data.error}`);
              setIsLoading(false);
            }
          }
        };

        window.addEventListener('message', messageListener);
        setError('Please complete the authorization in the popup window.');
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      const errorMsg = error instanceof Error ? error.message : 'Failed to register with Mastodon instance';
      setError(errorMsg);
    }
  };

  const handleOAuthCallback = async (instanceUrl: string, code: string, redirectUri: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const authResponse = await mastodonService.exchangeCodeForToken(instanceUrl, code, redirectUri);
      
      if (!authResponse.access_token) {
        throw new Error('No access token received from Mastodon');
      }
      
      const user = await mastodonService.getCurrentUser(instanceUrl, authResponse.access_token);
      
      if (!user.id) {
        throw new Error('Failed to get user information');
      }
      
      onSuccess({
        instance: instanceUrl,
        accessToken: authResponse.access_token,
        user: user
      });
      
      onClose();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Authentication failed';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };


  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    setStep('select');
    setManualCode('');
    onClose();
  };

  const handleManualCodeSubmit = async () => {
    if (!manualCode.trim()) {
      setError('Please enter the authorization code');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const redirectUri = getRedirectUri();
      await handleOAuthCallback(selectedInstance, manualCode.trim(), redirectUri);
      setManualCode('');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to authenticate with the provided code';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="glass rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Connect to Mastodon</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>


        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Choose a Mastodon Instance
                </h3>
                <p className="text-gray-600">
                  Select your Mastodon instance or enter a custom one. You'll be redirected to authorize the app.
                </p>
              </div>

              {/* Popular Instances */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Popular Instances</h4>
                <div className="grid gap-3">
                  {popularInstances.map((instance) => (
                    <button
                      key={instance.url}
                      onClick={() => handleInstanceSelect(instance.url)}
                      disabled={isLoading}
                      className="p-4 text-left border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{instance.name}</h5>
                          <p className="text-sm text-gray-600">{instance.description}</p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Instance */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Custom Instance</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="mastodon.example.com"
                    value={customInstance}
                    onChange={(e) => setCustomInstance(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCustomInstance()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCustomInstance}
                    disabled={isLoading || !customInstance.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Connect
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Loading */}
              {isLoading && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                  <span className="ml-2 text-gray-600">Connecting to instance...</span>
                </div>
              )}
            </div>
          )}

          {step === 'auth' && instanceInfo && (
            <div className="space-y-6">
              {/* Instance Info */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <div>
                    <h4 className="font-medium text-purple-800">Connected to {instanceInfo.title}</h4>
                    <p className="text-sm text-purple-600">{instanceInfo.short_description}</p>
                  </div>
                </div>
              </div>

              {/* Authorization */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Authorize Access
                </h3>
                <p className="text-gray-600 mb-4">
                  Click the button below to authorize this app to access your Mastodon account. 
                  You'll be redirected to {selectedInstance} to complete the authorization.
                </p>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h5 className="font-medium text-gray-900 mb-2">This app will request:</h5>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Read your account information</li>
                    <li>• Read your posts and statuses</li>
                    <li>• Read your timeline</li>
                  </ul>
                </div>

                <button
                  onClick={handleAuth}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ExternalLink className="w-5 h-5" />
                  )}
                  {isLoading ? 'Authorizing...' : 'Authorize on Mastodon'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Manual Code Entry */}
              {error && error.includes('copy the authorization code') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Enter Authorization Code</h4>
                  <p className="text-sm text-blue-600 mb-3">
                    Copy the authorization code from the OAuth window and paste it below:
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Paste authorization code here..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleManualCodeSubmit}
                      disabled={isLoading || !manualCode.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Submit'
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Back Button */}
              <button
                onClick={() => setStep('select')}
                className="w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Back to instance selection
              </button>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your data stays secure and private. We only access the information you authorize.
            </p>
          </div>
        </div>
        </div>
      </div>
    </Portal>
  );
};

export default MastodonLoginModal;
