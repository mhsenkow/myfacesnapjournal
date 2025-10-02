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
import { Plus, Edit3, Trash2, Lock, Eye, EyeOff, Heart, CheckSquare, Square } from 'lucide-react';
import { useJournalStore, JournalEntry } from '../stores/journalStore';
import EntryModal from '../components/UI/EntryModal';

const JournalPage: React.FC = () => {
  const {
    selectedEntry,
    searchQuery,
    selectedTags,
    selectedMood,
    selectedPrivacy,
    selectedSource,
    createEntry,
    updateEntry,
    deleteEntry,
    deleteEntries,
    selectEntry,
    setSearchQuery,
    setSelectedTags,
    setSelectedMood,
    setSelectedPrivacy,
    setSelectedSource,
    filteredEntries,
    allTags,
    allMoods,
    clearFilters,
    loadEntries,
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
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
      <div className="glass p-6 rounded-2xl border border-neutral-200 dark:border-neutral-700 mb-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-light text-neutral-900 dark:text-neutral-100 tracking-wide">Journal</h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg font-light">Capture your thoughts, ideas, and experiences.</p>
        </div>
        <div className="flex gap-2">
          {isSelectMode ? (
            <>
              <button 
                onClick={handleMassDelete}
                disabled={selectedEntries.size === 0}
                className="btn btn-danger disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedEntries.size})
              </button>
              <button 
                onClick={exitSelectMode}
                className="btn btn-outline"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsSelectMode(true)}
                className="btn btn-outline"
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                Select
              </button>
              <button 
                onClick={openNewEntryModal}
                className="btn btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </button>
            </>
          )}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Recent Entries</h2>
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
          <div className="space-y-3">
            {filteredEntries().map((entry) => (
              <div
                key={entry.id}
                className={`card-hover p-4 ${
                  selectedEntry?.id === entry.id ? 'ring-2 ring-primary-500' : ''
                } ${
                  isSelectMode ? 'cursor-pointer' : 'cursor-pointer'
                } ${
                  selectedEntries.has(entry.id) ? 'bg-primary-50 border-primary-200' : ''
                }`}
                onClick={() => {
                  if (isSelectMode) {
                    handleSelectEntry(entry.id);
                  } else {
                    selectEntry(entry);
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  {isSelectMode && (
                    <div className="mr-3 mt-1">
                      {selectedEntries.has(entry.id) ? (
                        <CheckSquare className="w-5 h-5 text-primary-600" />
                      ) : (
                        <Square className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{entry.title}</h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2">{entry.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs bg-primary-100 text-primary-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-neutral-500 dark:text-neutral-400">{formatDate(entry.createdAt)}</span>
                      <div className="flex items-center gap-2">
                        {entry.mood && (
                          <span className="flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400">
                            <Heart className="w-3 h-3" />
                            {entry.mood}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          {entry.privacy === 'private' && <Lock className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />}
                          {entry.privacy === 'secret' && <EyeOff className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />}
                          {entry.privacy === 'public' && <Eye className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />}
                          <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{entry.privacy}</span>
                        </div>
                        {entry.source && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{entry.source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isSelectMode && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(entry); }}
                        className="p-1 hover:bg-neutral-100 dark:bg-neutral-600 rounded"
                      >
                        <Edit3 className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(entry); }}
                        className="p-1 hover:bg-neutral-100 dark:bg-neutral-600 rounded"
                      >
                        <Trash2 className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
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
                className="glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              
              <textarea
                placeholder="Write your thoughts..."
                value={editingEntry.content}
                onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
                rows={8}
                className="glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
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
                        onClick={() => removeTag(tag)}
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
                    className="glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.target as HTMLInputElement;
                        addTag(input.value.trim());
                        input.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        addTag(input.value.trim());
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
                    className="glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="glass dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
    </div>
  );
};

export default JournalPage;
