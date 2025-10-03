/**
 * Journal Page - Main journaling interface
 * 
 * This page provides:
 * - List of journal entries with search and filtering
 * - Entry editor for creating/editing entries
 * - Tags and mood management
 * - Privacy controls
 */

import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Lock, Eye, EyeOff, Heart, CheckSquare, Square, Tag, Calendar, User } from 'lucide-react';
import { useJournalStore, JournalEntry } from '../stores/journalStore';
import EntryModal from '../components/UI/EntryModal';
import JournalControls from '../components/Journal/JournalControls';

const JournalPage: React.FC = () => {
  const {
    selectedEntry,
    createEntry,
    updateEntry,
    deleteEntry,
    deleteEntries,
    selectEntry,
    filteredEntries,
    loadEntries,
    layoutMode,
  } = useJournalStore();

  const [editingEntry, setEditingEntry] = useState<Partial<JournalEntry>>({
    title: '',
    content: '',
    tags: [],
    mood: 'neutral',
    privacy: 'private',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [isNewEntryModalOpen, setIsNewEntryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(false);

  // Load entries from database on mount
  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Note: Sample data creation removed to prevent duplicate entries
  // Users can create their own entries using the "New Entry" button

  const handleSave = async () => {
    console.log('handleSave called, isEditing:', isEditing, 'selectedEntry:', selectedEntry);
    console.log('editingEntry:', editingEntry);
    
    try {
      if (isEditing && selectedEntry) {
        console.log('Updating existing entry');
        await updateEntry(selectedEntry.id, editingEntry);
        setIsEditModalOpen(false);
        setIsEditing(false);
        setEditingEntry({ title: '', content: '', tags: [], mood: 'neutral', privacy: 'private' });
        selectEntry(null);
      } else {
        console.log('Creating new entry');
        await createEntry(editingEntry as Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>);
        setIsNewEntryModalOpen(false);
        setEditingEntry({ title: '', content: '', tags: [], mood: 'neutral', privacy: 'private' });
      }
    } catch (error) {
      console.error('Failed to save entry:', error);
      // TODO: Show error toast
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingEntry({
      title: entry.title,
      content: entry.content,
      tags: entry.tags,
      mood: entry.mood,
      privacy: entry.privacy,
    });
    setIsEditing(true);
    selectEntry(entry);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (entry: JournalEntry) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      try {
        await deleteEntry(entry.id);
        if (selectedEntry?.id === entry.id) {
          selectEntry(null);
        }
      } catch (error) {
        console.error('Failed to delete entry:', error);
        // TODO: Show error toast
      }
    }
  };


  const openNewEntryModal = () => {
    setIsEditing(false);
    setEditingEntry({ title: '', content: '', tags: [], mood: 'neutral', privacy: 'private' });
    selectEntry(null);
    setIsNewEntryModalOpen(true);
  };

  const closeNewEntryModal = () => {
    setIsNewEntryModalOpen(false);
    setEditingEntry({ title: '', content: '', tags: [], mood: 'neutral', privacy: 'private' });
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
      setIsEditing(false);
      setEditingEntry({ title: '', content: '', tags: [], mood: 'neutral', privacy: 'private' });
      selectEntry(null);
  };

  const formatDate = (date: Date | string) => {
    try {
      let dateObj: Date;
      
      if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        console.warn('Unexpected date type:', typeof date, date);
        return 'Invalid Date Type';
      }
      
      // Check if the date is valid
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
        return 'Invalid Date';
      }
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return 'Date Error';
    }
  };

  const renderJournalEntry = (entry: JournalEntry) => {
    const baseClasses = `glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-xl p-6 hover:glass transition-all duration-500 hover:scale-[1.02] hover:shadow-xl group ${
      selectedEntry?.id === entry.id ? 'ring-2 ring-purple-500 glass-strong' : ''
    } ${
      selectedEntries.has(entry.id) ? 'bg-purple-50/30 border-purple-200 dark:bg-purple-900/20' : ''
    }`;

    const handleClick = () => {
      if (isSelectMode) {
        handleSelectEntry(entry.id);
      } else {
        selectEntry(entry);
      }
    };

    // Check if this is a social media post
    const isSocialMediaPost = entry.source && ['mastodon', 'bluesky'].includes(entry.source.toLowerCase());
    const isMastodonPost = entry.source === 'mastodon';
    const isBlueskyPost = entry.source === 'bluesky';

    // Get the original post date from metadata if available
    // For existing entries without metadata, we'll use createdAt
    let originalDate = entry.createdAt;
    
    if (entry.metadata?.originalDate) {
      originalDate = entry.metadata.originalDate;
    } else if (isSocialMediaPost) {
      // For social media posts without metadata, this means they were imported before we added metadata
      console.warn(`⚠️ ${entry.source} post missing metadata.originalDate - may need re-import:`, entry.id);
    }
    
    // Debug logging for dates
    if (entry.source && ['mastodon', 'bluesky'].includes(entry.source.toLowerCase())) {
      console.log(`📅 ${entry.source} post date debug:`, {
        originalDate,
        createdAt: entry.createdAt,
        metadata: entry.metadata,
        hasMetadata: !!entry.metadata,
        hasOriginalDate: !!entry.metadata?.originalDate
      });
    }

    const commonContent = (
      <>
        {isSelectMode && (
          <div className="mt-1">
            {selectedEntries.has(entry.id) ? (
              <CheckSquare className="w-5 h-5 text-purple-600" />
            ) : (
              <Square className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
            )}
          </div>
        )}
        
        {/* Avatar/Icon - smaller for social media posts */}
        <div className={`${isSocialMediaPost ? 'w-8 h-8' : 'w-12 h-12'} bg-gradient-to-br ${isMastodonPost ? 'from-purple-400 to-pink-400' : isBlueskyPost ? 'from-blue-400 to-cyan-400' : 'from-purple-400 to-pink-400'} rounded-full flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <User className={`${isSocialMediaPost ? 'w-4 h-4' : 'w-6 h-6'} text-white`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-bold text-primary text-lg">{entry.title}</h3>
            <span className="text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(originalDate)}
            </span>
          </div>
          
          {/* Content */}
          <p className="text-secondary mb-4 leading-relaxed line-clamp-3">
            {entry.content}
          </p>
          
          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-full shadow-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* Footer with metadata */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
              {/* Mood */}
              {entry.mood && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span className="capitalize">{entry.mood}</span>
                </div>
              )}
              
              {/* Privacy */}
              <div className="flex items-center gap-1">
                {entry.privacy === 'private' && <Lock className="w-4 h-4" />}
                {entry.privacy === 'secret' && <EyeOff className="w-4 h-4" />}
                {entry.privacy === 'public' && <Eye className="w-4 h-4" />}
                <span className="capitalize">{entry.privacy}</span>
              </div>
              
              {/* Source */}
              {entry.source && (
                <div className="flex items-center gap-1">
                  <span className="capitalize">{entry.source}</span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            {!isSelectMode && (
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}
                  className="p-2 hover:bg-white/20 dark:hover:bg-black/20 rounded-lg transition-colors"
                  title="Edit entry"
                >
                  <Edit3 className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(entry); }}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                  title="Delete entry"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );

    switch (layoutMode) {
      case 'grid':
        return (
          <div key={entry.id} className={`${baseClasses} max-w-sm mx-auto`} onClick={handleClick}>
            <div className="flex flex-col gap-4">
              {commonContent}
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div key={entry.id} className={`${baseClasses} flex items-start gap-4`} onClick={handleClick}>
            {commonContent}
          </div>
        );
      
      case 'mortar':
        return (
          <div key={entry.id} className={`${baseClasses} break-inside-avoid`} onClick={handleClick}>
            <div className="flex flex-col gap-4">
              {commonContent}
            </div>
          </div>
        );
      
      case 'card':
      default:
        return (
          <div key={entry.id} className={`${baseClasses} flex items-start gap-4`} onClick={handleClick}>
            {commonContent}
          </div>
        );
    }
  };

  const handleSelectEntry = (entryId: string) => {
    setSelectedEntries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    const filtered = filteredEntries();
    const allSelected = filtered.every(entry => selectedEntries.has(entry.id));
    
    if (allSelected) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filtered.map(entry => entry.id)));
    }
  };

  const handleMassDelete = async () => {
    if (selectedEntries.size === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedEntries.size} entry(ies)? This action cannot be undone.`;
    if (confirm(confirmMessage)) {
      try {
        await deleteEntries(Array.from(selectedEntries));
        setSelectedEntries(new Set());
        setIsSelectMode(false);
      } catch (error) {
        console.error('Failed to delete entries:', error);
        // TODO: Show error toast
      }
    }
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedEntries(new Set());
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="glass-subtle border border-neutral-200 dark:border-neutral-700 rounded-2xl p-6 mb-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-light glass-text-primary tracking-wide">Journal</h1>
            <p className="glass-text-tertiary mt-2 text-lg font-light">Capture your thoughts, ideas, and experiences.</p>
          </div>
          <div className="flex gap-3">
            {isSelectMode ? (
              <>
                <button 
                  onClick={handleMassDelete}
                  disabled={selectedEntries.size === 0}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete ({selectedEntries.size})
                </button>
                <button 
                  onClick={exitSelectMode}
                  className="px-4 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setIsSelectMode(true)}
                  className="px-4 py-2 glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-white/20 dark:hover:bg-black/20 transition-colors flex items-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Select
                </button>
                <button 
                  onClick={openNewEntryModal}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New Entry
                </button>
              </>
            )}
          </div>
        </div>
      </div>



      {/* Entry Modals */}
      <EntryModal
        isOpen={isNewEntryModalOpen}
        onClose={closeNewEntryModal}
        onSave={handleSave}
        title="New Entry"
        editingEntry={editingEntry}
        setEditingEntry={setEditingEntry}
        isEditing={false}
      />

      <EntryModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleSave}
        title="Edit Entry"
        editingEntry={editingEntry}
        setEditingEntry={setEditingEntry}
        isEditing={true}
      />


      {/* Main Content */}
      <div className="w-full">
        {/* Recent Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold glass-text-primary">Recent Entries</h2>
            {isSelectMode && (
              <button
                onClick={handleSelectAll}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                {filteredEntries().every(entry => selectedEntries.has(entry.id)) ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All
              </button>
            )}
          </div>
          <div className={`${
            layoutMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : layoutMode === 'mortar'
              ? 'columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6'
              : layoutMode === 'list'
              ? 'space-y-4'
              : 'grid grid-cols-1 lg:grid-cols-2 gap-6'
          }`}>
            {filteredEntries().map((entry) => renderJournalEntry(entry))}
          </div>
        </div>

        {/* Edit Entry - Now handled by modal */}
        {false && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Edit Entry</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Entry title"
                value={editingEntry.title}
                onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              />
              
              <textarea
                placeholder="Write your thoughts..."
                value={editingEntry.content}
                onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
              />

              {/* Tags Input */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {editingEntry.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded-full flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => {
                          if (editingEntry.tags) {
                            setEditingEntry({ ...editingEntry, tags: editingEntry.tags.filter(t => t !== tag) });
                          }
                        }}
                        className="hover:text-primary-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a tag..."
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        const tag = input.value.trim();
                        if (tag && editingEntry.tags && !editingEntry.tags.includes(tag)) {
                          setEditingEntry({ ...editingEntry, tags: [...editingEntry.tags, tag] });
                        }
                        input.value = '';
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        const tag = input.value.trim();
                        if (tag && editingEntry.tags && !editingEntry.tags.includes(tag)) {
                          setEditingEntry({ ...editingEntry, tags: [...editingEntry.tags, tag] });
                        }
                        input.value = '';
                      }
                    }}
                    className="btn btn-outline"
                  >
                    <Tag className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Mood and Privacy */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Mood</label>
                  <select
                    value={editingEntry.mood}
                    onChange={(e) => setEditingEntry({ ...editingEntry, mood: e.target.value as any })}
                    className="glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="happy">Happy</option>
                    <option value="grateful">Grateful</option>
                    <option value="excited">Excited</option>
                    <option value="neutral">Neutral</option>
                    <option value="sad">Sad</option>
                    <option value="anxious">Anxious</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Privacy</label>
                  <select
                    value={editingEntry.privacy}
                    onChange={(e) => setEditingEntry({ ...editingEntry, privacy: e.target.value as any })}
                    className="glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="secret">Secret</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={!editingEntry.title?.trim() || !editingEntry.content?.trim()}
                  className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Entry
                </button>
                <button 
                  onClick={() => {
                    setIsEditing(false);
                    setEditingEntry({ title: '', content: '', tags: [], mood: 'neutral', privacy: 'private' });
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Journal Controls */}
      <JournalControls
        isVisible={isControlsVisible}
        onToggle={() => setIsControlsVisible(!isControlsVisible)}
        onBulkDelete={selectedEntries.size > 0 ? handleMassDelete : undefined}
        selectedCount={selectedEntries.size}
      />
    </div>
  );
};

export default JournalPage;
