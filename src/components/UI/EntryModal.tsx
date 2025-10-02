/**
 * Entry Modal Component for MyFace SnapJournal
 * 
 * A beautiful glass modal for creating and editing journal entries
 */

import React, { useEffect, useRef } from 'react';
import { X, Tag, Save, XCircle } from 'lucide-react';
import { JournalEntry } from '../../types/journal';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  editingEntry: Partial<JournalEntry>;
  setEditingEntry: React.Dispatch<React.SetStateAction<Partial<JournalEntry>>>;
  isEditing?: boolean;
}

const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  title,
  editingEntry,
  setEditingEntry,
  isEditing = false
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Add tag helper
  const addTag = (tag: string) => {
    if (tag && editingEntry.tags && !editingEntry.tags.includes(tag)) {
      setEditingEntry({ ...editingEntry, tags: [...editingEntry.tags, tag] });
    }
  };

  // Remove tag helper
  const removeTag = (tagToRemove: string) => {
    if (editingEntry.tags) {
      setEditingEntry({ ...editingEntry, tags: editingEntry.tags.filter(tag => tag !== tagToRemove) });
    }
  };

  // Handle tag input key press
  const handleTagKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      const tag = input.value.trim();
      if (tag) {
        addTag(tag);
        input.value = '';
      }
    }
  };

  // Handle save button click
  const handleSaveClick = () => {
    if (editingEntry.title?.trim() && editingEntry.content?.trim()) {
      onSave();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Darkened Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />
      
      {/* Modal Content */}
      <div 
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-700 transform transition-all duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500 dark:text-neutral-400" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Entry Title
            </label>
            <input
              ref={titleInputRef}
              type="text"
              placeholder="Give your entry a title..."
              value={editingEntry.title || ''}
              onChange={(e) => setEditingEntry({ ...editingEntry, title: e.target.value })}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Content
            </label>
            <textarea
              placeholder="Write your thoughts, ideas, and experiences..."
              value={editingEntry.content || ''}
              onChange={(e) => setEditingEntry({ ...editingEntry, content: e.target.value })}
              rows={8}
              className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Tags Section */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Tags
            </label>
            
            {/* Display existing tags */}
            {editingEntry.tags && editingEntry.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {editingEntry.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-purple-900 dark:hover:text-purple-100 transition-colors"
                    >
                      <XCircle className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a tag..."
                onKeyPress={handleTagKeyPress}
                className="flex-1 px-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Add a tag..."]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    addTag(input.value.trim());
                    input.value = '';
                  }
                }}
                className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-2"
              >
                <Tag className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>

          {/* Mood and Privacy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Mood
              </label>
              <select
                value={editingEntry.mood || 'neutral'}
                onChange={(e) => setEditingEntry({ ...editingEntry, mood: e.target.value as any })}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="happy">😊 Happy</option>
                <option value="grateful">🙏 Grateful</option>
                <option value="excited">🎉 Excited</option>
                <option value="neutral">😐 Neutral</option>
                <option value="sad">😢 Sad</option>
                <option value="anxious">😰 Anxious</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Privacy
              </label>
              <select
                value={editingEntry.privacy || 'private'}
                onChange={(e) => setEditingEntry({ ...editingEntry, privacy: e.target.value as any })}
                className="w-full px-4 py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="public">🌍 Public</option>
                <option value="private">🔒 Private</option>
                <option value="secret">🤫 Secret</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveClick}
            disabled={!editingEntry.title?.trim() || !editingEntry.content?.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isEditing ? 'Update Entry' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EntryModal;
