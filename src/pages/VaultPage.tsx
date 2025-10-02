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
      <div className="glass p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <span className="font-extralight">Vault</span>
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-lg font-light">Secure storage and data management</p>
          </div>
          <div className="flex gap-3">
            <button className="glass-subtle px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-light">
              <Download size={18} className="mr-2 text-blue-600" />
              Create Backup
            </button>
            <button className="glass-subtle px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors font-light">
              <Upload size={18} className="mr-2 text-green-600" />
              Restore Backup
            </button>
          </div>
        </div>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl shadow-lg ${isLocked ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
              {isLocked ? <Lock size={20} className="text-green-600 dark:text-green-400" /> : <Unlock size={20} className="text-yellow-600 dark:text-yellow-400" />}
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">Vault Status</p>
              <p className={`text-2xl font-light ${isLocked ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                {isLocked ? 'Locked' : 'Unlocked'}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <Key size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">Encryption</p>
              <p className="text-2xl font-light text-purple-600 dark:text-purple-400 tracking-wide">AES-256</p>
            </div>
          </div>
        </div>

        <div className="glass-subtle p-6 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:glass transition-all duration-300">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-teal-600 rounded-xl shadow-lg">
              <Database size={20} className="text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-neutral-500 dark:text-neutral-400 font-light">Storage Used</p>
              <p className="text-2xl font-light text-blue-600 dark:text-blue-400 tracking-wide">2.4 MB</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Management */}
        <div className="space-y-6">
          <h2 className="text-2xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide">Backup Management</h2>

          <div className="space-y-4">
            {mockBackups.map((backup) => (
              <div
                key={backup.id}
                className={`p-6 glass-subtle border rounded-xl cursor-pointer transition-all duration-300 hover:glass group ${
                  selectedBackup === backup.id ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20' : 'border-neutral-200 dark:border-neutral-700'
                }`}
                onClick={() => setSelectedBackup(backup.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 text-lg tracking-wide group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{backup.name}</h3>
                      {backup.encrypted && (
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-light">
                          Encrypted
                        </span>
                      )}
                      <span className={`px-2 py-1 text-xs rounded-lg font-light ${
                        backup.type === 'full' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                        backup.type === 'incremental' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        'bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300'
                      }`}>
                        {backup.type}
                      </span>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-neutral-400 dark:text-neutral-500 font-light mb-3">
                      <span className="flex items-center gap-1">
                        <Database size={14} className="text-blue-500" />
                        {backup.size}
                      </span>
                      <span className="flex items-center gap-1">
                        <Shield size={14} className="text-green-500" />
                        {backup.entries} entries
                      </span>
                      <span>{backup.createdAt.toLocaleDateString()}</span>
                    </div>

                    <p className="text-xs text-neutral-400 dark:text-neutral-500 font-light">
                      Created {backup.createdAt.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="p-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <Download size={16} className="text-blue-600" />
                    </button>
                    <button className="p-2 glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <Trash2 size={16} className="text-red-600" />
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
