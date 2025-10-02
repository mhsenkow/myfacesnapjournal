/**
 * Database Settings Page
 * 
 * Allows users to:
 * - View current database location
 * - Change database location
 * - Export/import data
 * - View storage statistics
 */

import React, { useState, useEffect } from 'react';
import { FolderOpen, Download, Upload, Database, AlertCircle, CheckCircle } from 'lucide-react';
import { invoke } from '@tauri-apps/api/core';
import { open } from '@tauri-apps/plugin-dialog';

interface DatabaseInfo {
  path: string;
  size: number;
  entryCount: number;
  lastBackup?: string;
}

const DatabaseSettingsPage: React.FC = () => {
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    loadDatabaseInfo();
  }, []);

  const loadDatabaseInfo = async () => {
    try {
      const path = await invoke<string | null>('get_database_path');
      if (path) {
        // TODO: Get actual file size and entry count
        setDatabaseInfo({
          path,
          size: 0, // Will be calculated
          entryCount: 0, // Will be fetched from database
        });
      }
    } catch (error) {
      console.error('Failed to load database info:', error);
      setMessage({ type: 'error', text: 'Failed to load database information' });
    }
  };

  const handleSelectNewLocation = async () => {
    setIsLoading(true);
    setMessage(null); // Clear any previous messages
    
    try {
      console.log('Testing dialog plugin...');
      
      // First test if the dialog plugin is available
      if (typeof open !== 'function') {
        throw new Error('Dialog plugin not available');
      }
      
      console.log('Opening file dialog...');
      const selectedPath = await open({
        directory: false,
        multiple: false,
        title: 'Select Database Location',
        filters: [
          {
            name: 'SQLite Database',
            extensions: ['db', 'sqlite', 'sqlite3']
          }
        ],
        defaultPath: 'journal.db'
      });

      console.log('Selected path:', selectedPath);

      if (selectedPath) {
        console.log('Setting database path to:', selectedPath);
        await invoke('set_database_path', { dbPath: selectedPath });
        setMessage({ type: 'success', text: 'Database location updated successfully' });
        await loadDatabaseInfo();
      } else {
        console.log('No path selected');
        setMessage({ type: 'info', text: 'No location selected' });
      }
    } catch (error) {
      console.error('Failed to change database location:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to change database location: ${error instanceof Error ? error.message : String(error)}` 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement data export
      setMessage({ type: 'info', text: 'Export functionality coming soon' });
    } catch (error) {
      console.error('Failed to export data:', error);
      setMessage({ type: 'error', text: 'Failed to export data' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportData = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement data import
      setMessage({ type: 'info', text: 'Import functionality coming soon' });
    } catch (error) {
      console.error('Failed to import data:', error);
      setMessage({ type: 'error', text: 'Failed to import data' });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Database Settings</h1>
        <p className="text-gray-600">Manage your local data storage and location.</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-blue-50 text-blue-800 border border-blue-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> :
           message.type === 'error' ? <AlertCircle className="w-5 h-5" /> :
           <Database className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Current Database Info */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Current Database</h2>
        
        {databaseInfo ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Database className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 font-mono">{databaseInfo.path}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Storage Used</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{formatFileSize(databaseInfo.size)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Entries</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{databaseInfo.entryCount}</span>
                </div>
              </div>
            </div>

            {databaseInfo.lastBackup && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Backup</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">{databaseInfo.lastBackup}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No database information available</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleSelectNewLocation}
            disabled={isLoading}
            className="btn btn-outline flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FolderOpen className="w-4 h-4" />
            Change Location
          </button>

          <button
            onClick={handleExportData}
            disabled={isLoading}
            className="btn btn-outline flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Export All Data
          </button>

          <button
            onClick={handleImportData}
            disabled={isLoading}
            className="btn btn-outline flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Import Data
          </button>

          <button
            disabled={isLoading}
            className="btn btn-danger flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <AlertCircle className="w-4 h-4" />
            Clear All Data
          </button>
        </div>
      </div>

      {/* Local-First Benefits */}
      <div className="card p-6 bg-primary-50 border-primary-200">
        <h2 className="text-xl font-semibold text-primary-900 mb-4">Local-First Benefits</h2>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-primary-900">Complete Privacy</h3>
              <p className="text-sm text-primary-700">Your data never leaves your device unless you choose to export it.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-primary-900">Full Control</h3>
              <p className="text-sm text-primary-700">Choose exactly where your data is stored and how it's managed.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-primary-900">Offline Access</h3>
              <p className="text-sm text-primary-700">Access your journal anytime, anywhere, without an internet connection.</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-primary-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-primary-900">Data Ownership</h3>
              <p className="text-sm text-primary-700">You own your data completely. Export, backup, or move it as you wish.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseSettingsPage;
