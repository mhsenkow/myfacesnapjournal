/**
 * Ollama Settings Component
 * 
 * Allows users to configure Ollama connection settings when running in web mode
 */

import React, { useState, useEffect } from 'react';
import { Settings, Check, X, AlertCircle } from 'lucide-react';
import { webAIService } from '../../services/webAIService';

interface OllamaSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const OllamaSettings: React.FC<OllamaSettingsProps> = ({ isOpen, onClose }) => {
  const [ollamaUrl, setOllamaUrl] = useState('http://localhost:11434');
  const [ollamaModel, setOllamaModel] = useState('llama3.2');
  const [isConnected, setIsConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load saved settings
      const savedUrl = localStorage.getItem('ollama-url') || 'http://localhost:11434';
      const savedModel = localStorage.getItem('ollama-model') || 'llama3.2';
      
      setOllamaUrl(savedUrl);
      setOllamaModel(savedModel);
      
      // Check connection and load models
      checkConnection();
    }
  }, [isOpen]);

  const checkConnection = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      // Update the service with current settings
      webAIService.updateConfig(ollamaUrl, ollamaModel);
      
      // Check if Ollama is available
      const isAvailable = await webAIService.checkAvailability();
      setIsConnected(isAvailable);
      
      if (isAvailable) {
        // Load available models
        const models = await webAIService.getAvailableModels();
        setAvailableModels(models);
        
        if (models.length > 0 && !models.includes(ollamaModel)) {
          setOllamaModel(models[0]); // Use first available model
        }
      } else {
        setError('Cannot connect to Ollama. Make sure it\'s running and accessible.');
      }
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsChecking(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('ollama-url', ollamaUrl);
    localStorage.setItem('ollama-model', ollamaModel);
    webAIService.updateConfig(ollamaUrl, ollamaModel);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="glass-subtle p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-light glass-text-primary flex items-center gap-2">
            <Settings size={20} />
            Ollama Settings
          </h2>
          <button
            onClick={onClose}
            className="glass-subtle p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Ollama URL */}
          <div>
            <label className="block text-sm font-medium glass-text-secondary mb-2">
              Ollama URL
            </label>
            <input
              type="text"
              value={ollamaUrl}
              onChange={(e) => setOllamaUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full px-3 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent glass-text-primary"
            />
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium glass-text-secondary mb-2">
              Model
            </label>
            <select
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              className="w-full px-3 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent glass-text-primary"
            >
              {availableModels.length > 0 ? (
                availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))
              ) : (
                <option value="llama3.2">llama3.2 (default)</option>
              )}
            </select>
          </div>

          {/* Connection Status */}
          <div className="flex items-center justify-between p-3 glass-subtle rounded-lg">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Check size={16} className="text-green-500" />
              ) : (
                <X size={16} className="text-red-500" />
              )}
              <span className="text-sm glass-text-secondary">
                {isConnected ? 'Connected' : 'Not Connected'}
              </span>
            </div>
            <button
              onClick={checkConnection}
              disabled={isChecking}
              className="px-3 py-1 text-xs glass-subtle border border-neutral-300 dark:border-neutral-600 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Checking...' : 'Test Connection'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle size={16} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-sm text-red-700 dark:text-red-300 font-medium">Connection Error</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Help Text */}
          <div className="text-xs glass-text-muted space-y-1">
            <p>• Make sure Ollama is running: <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">ollama serve</code></p>
            <p>• Install a model: <code className="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">ollama pull llama3.2</code></p>
            <p>• For remote access, ensure CORS is enabled</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg hover:from-purple-600 hover:to-blue-700 transition-all text-sm font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default OllamaSettings;
