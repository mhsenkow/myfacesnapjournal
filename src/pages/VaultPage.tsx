/**
 * Vault Page for MyFace SnapJournal
 * 
 * This page provides secure storage and data management:
 * - Encrypted data storage
 * - Export/import encrypted capsules
 * - Backup and restore functionality
 * - Security settings and key management
 */

import React, { useState } from 'react'
import { Shield, Download, Upload, Key, Lock, Unlock, Database, Trash2 } from 'lucide-react'

const VaultPage: React.FC = () => {
  const [isLocked] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<string | null>(null)

  // Mock backup data
  const mockBackups = [
    {
      id: '1',
      name: 'Full Backup - January 15, 2024',
      size: '2.4 MB',
      entries: 156,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      encrypted: true,
      type: 'full'
    },
    {
      id: '2',
      name: 'Incremental Backup - January 14, 2024',
      size: '0.8 MB',
      entries: 23,
      createdAt: new Date('2024-01-14T10:00:00Z'),
      encrypted: true,
      type: 'incremental'
    },
    {
      id: '3',
      name: 'Export Package - January 10, 2024',
      size: '1.2 MB',
      entries: 89,
      createdAt: new Date('2024-01-10T10:00:00Z'),
      encrypted: false,
      type: 'export'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Vault</h1>
          <p className="text-neutral-600 mt-1">Secure storage and data management</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-outline">
            <Download size={20} className="mr-2" />
            Create Backup
          </button>
          <button className="btn-primary">
            <Upload size={20} className="mr-2" />
            Restore Backup
          </button>
        </div>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${isLocked ? 'bg-success-100' : 'bg-warning-100'}`}>
              {isLocked ? <Lock size={20} className="text-success-600" /> : <Unlock size={20} className="text-warning-600" />}
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-600">Vault Status</p>
              <p className={`text-lg font-semibold ${isLocked ? 'text-success-600' : 'text-warning-600'}`}>
                {isLocked ? 'Locked' : 'Unlocked'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Key size={20} className="text-primary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-600">Encryption</p>
              <p className="text-lg font-semibold text-neutral-900">AES-256</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-neutral-200">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Database size={20} className="text-secondary-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-neutral-600">Storage Used</p>
              <p className="text-lg font-semibold text-neutral-900">2.4 MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Management */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Backup Management</h2>
          
          <div className="space-y-3">
            {mockBackups.map((backup) => (
              <div
                key={backup.id}
                className={`p-4 bg-white border rounded-lg cursor-pointer transition-all duration-fast hover:shadow-md ${
                  selectedBackup === backup.id ? 'border-primary-500 bg-primary-50' : 'border-neutral-200'
                }`}
                onClick={() => setSelectedBackup(backup.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-medium text-neutral-900">{backup.name}</h3>
                      {backup.encrypted && (
                        <span className="px-2 py-1 text-xs bg-success-100 text-success-700 rounded-full">
                          Encrypted
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        backup.type === 'full' ? 'bg-primary-100 text-primary-700' :
                        backup.type === 'incremental' ? 'bg-secondary-100 text-secondary-700' :
                        'bg-neutral-100 text-neutral-700'
                      }`}>
                        {backup.type}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-600 mb-2">
                      <span>{backup.size}</span>
                      <span>{backup.entries} entries</span>
                      <span>{backup.createdAt.toLocaleDateString()}</span>
                    </div>
                    
                    <p className="text-xs text-neutral-500">
                      Created {backup.createdAt.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
                      <Download size={16} />
                    </button>
                    <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Settings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-neutral-900">Security & Settings</h2>
          
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Encryption Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Auto-lock after inactivity</span>
                <select className="px-3 py-1 border border-neutral-300 rounded text-sm">
                  <option>5 minutes</option>
                  <option>15 minutes</option>
                  <option>1 hour</option>
                  <option>Never</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Require password for export</span>
                <input type="checkbox" className="rounded border-neutral-300 text-primary-600" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Backup encryption</span>
                <input type="checkbox" className="rounded border-neutral-300 text-primary-600" defaultChecked />
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Key Management</h3>
            <div className="space-y-3">
              <button className="w-full btn-outline text-left">
                <Key size={16} className="mr-2" />
                Change Master Password
              </button>
              <button className="w-full btn-outline text-left">
                <Download size={16} className="mr-2" />
                Export Recovery Key
              </button>
              <button className="w-full btn-outline text-left">
                <Upload size={16} className="mr-2" />
                Import Recovery Key
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-neutral-200 rounded-lg p-4">
            <h3 className="font-medium text-neutral-900 mb-3">Data Integrity</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-700">Last integrity check</span>
                <span className="text-sm text-neutral-500">2 hours ago</span>
              </div>
              <button className="w-full btn-outline">
                <Shield size={16} className="mr-2" />
                Run Integrity Check
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Backup Details */}
      {selectedBackup && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Backup Details</h3>
          <p className="text-neutral-600">
            Detailed information about the selected backup, including contents, metadata, and restoration options.
          </p>
          {/* TODO: Add detailed backup information */}
        </div>
      )}
    </div>
  )
}

export default VaultPage
