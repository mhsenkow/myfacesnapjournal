/**
 * Facebook Login Modal Component
 * 
 * Provides a real Facebook OAuth login modal using the Facebook JavaScript SDK
 */

import React, { useEffect, useState } from 'react';
import { Facebook, X, AlertCircle, Loader2 } from 'lucide-react';

interface FacebookLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (authResponse: any) => void;
  onError?: (error: string) => void;
}

declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

const FacebookLoginModal: React.FC<FacebookLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Facebook App ID - Your actual App ID
  const FACEBOOK_APP_ID = '4064462613869279';

  useEffect(() => {
    if (isOpen && !sdkLoaded) {
      loadFacebookSDK();
    }
  }, [isOpen, sdkLoaded]);

  const loadFacebookSDK = () => {
    // Check if SDK is already loaded
    if (window.FB) {
      initializeFacebook();
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';

    // Set up the async init function
    window.fbAsyncInit = () => {
      initializeFacebook();
    };

    // Add script to document
    document.body.appendChild(script);
  };

  const initializeFacebook = () => {
    window.FB.init({
      appId: FACEBOOK_APP_ID,
      cookie: true,
      xfbml: true,
      version: 'v21.0'
    });

    setSdkLoaded(true);
    console.log('Facebook SDK initialized');
  };

  const handleFacebookLogin = () => {
    if (!window.FB) {
      const errorMsg = 'Facebook SDK not loaded. Please try again.';
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Add a timeout to handle cases where the popup doesn't respond
    const timeout = setTimeout(() => {
      setIsLoading(false);
      setError('Login timed out. Please try again.');
    }, 30000); // 30 second timeout

    window.FB.login((response: any) => {
      clearTimeout(timeout);
      setIsLoading(false);
      
      if (response.authResponse) {
        console.log('Facebook login successful:', response);
        
        // Get user info
        window.FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo: any) => {
          if (userInfo && !userInfo.error) {
            const authData = {
              accessToken: response.authResponse.accessToken,
              userID: response.authResponse.userID,
              expiresIn: response.authResponse.expiresIn,
              user: userInfo
            };
            onSuccess(authData);
            onClose();
          } else {
            setError('Failed to get user information');
          }
        });
        } else {
          if (response.status === 'not_authorized') {
            const errorMsg = 'You cancelled the login or did not fully authorize the app.';
            setError(errorMsg);
            onError?.(errorMsg);
          } else {
            const errorMsg = 'Login failed. Please try again.';
            setError(errorMsg);
            onError?.(errorMsg);
          }
        }
    }, {
      scope: 'public_profile,email',
      return_scopes: true
    });
  };

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

  // Handle popup close detection
  useEffect(() => {
    if (isLoading) {
      const checkClosed = setInterval(() => {
        if (window.FB && window.FB.getLoginStatus) {
          window.FB.getLoginStatus((response: any) => {
            if (response.status === 'unknown') {
              // Popup was closed without completing login
              setIsLoading(false);
              setError('Login was cancelled');
              clearInterval(checkClosed);
            }
          });
        }
      }, 1000);

      return () => clearInterval(checkClosed);
    }
  }, [isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Facebook className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Connect to Facebook</h2>
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
        <div className="space-y-4">
          <p className="text-gray-600">
            Connect your Facebook account to import your posts into your journal. 
            We'll only access your posts, photos, and basic profile information.
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Login Button */}
          <button
            onClick={handleFacebookLogin}
            disabled={isLoading || !sdkLoaded}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Facebook className="w-5 h-5" />
            )}
            {isLoading ? 'Connecting...' : 'Continue with Facebook'}
          </button>

          {/* Manual Close Button (shown when loading) */}
          {isLoading && (
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel Login
            </button>
          )}

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 text-center">
            By connecting, you agree to our privacy policy. Your data stays secure and private.
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Don't have a Facebook account? You can still use the journal without connecting.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FacebookLoginModal;
