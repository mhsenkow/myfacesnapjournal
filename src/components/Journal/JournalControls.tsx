/**
 * Journal Controls Component
 * 
 * A floating control panel for journal entry filtering, sorting, and management.
 * Similar to the feed controls but tailored for journal-specific operations.
 */

import React from 'react';
import { useJournalStore } from '../../stores/journalStore';
import { useApp } from '../../contexts/AppContext';
import { 
  SortAsc, 
  Calendar,
  Heart,
  FileText,
  RefreshCw,
  X,
  Trash2,
  Download,
  Upload,
  Grid,
  List,
  Layout
} from 'lucide-react';

interface JournalControlsProps {
  isVisible: boolean;
  onToggle: () => void;
  onBulkDelete?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  selectedCount?: number;
}

const JournalControls: React.FC<JournalControlsProps> = ({ 
  isVisible, 
  onToggle, 
  onBulkDelete,
  onExport,
  onImport,
  selectedCount = 0
}) => {
  const { state: appState } = useApp();
  const {
    selectedTags,
    setSelectedTags,
    selectedMood,
    setSelectedMood,
    selectedPrivacy,
    setSelectedPrivacy,
    selectedSource,
    setSelectedSource,
    layoutMode,
    setLayoutMode,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    allTags,
    allMoods,
    allSources,
    clearFilters,
    entries,
    filteredEntries
  } = useJournalStore();

  const totalEntries = entries.length;
  const filteredCount = filteredEntries().length;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('Journal controls button clicked!', { isVisible });
          onToggle();
        }}
        className={`fixed bottom-6 right-32 z-[100] p-3 w-12 h-12 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer`}
        title={isVisible ? "Hide Journal Controls" : "Show Journal Controls"}
      >
        <FileText className={`w-5 h-5 glass-text-primary transition-transform duration-200 ${isVisible ? 'rotate-180' : ''}`} />
      </button>

      {/* Control Panel */}
      <div className={`fixed bottom-6 z-[90] transition-all duration-300 ease-in-out
          left-4 right-24 sm:left-6 sm:right-28 md:left-20 md:right-32 
          ${appState.sidebarCollapsed ? 'lg:left-6' : 'lg:left-64'} 
          max-w-4xl mx-auto`}>
        <div className={`glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-2xl shadow-2xl backdrop-blur-xl p-3 sm:p-4 space-y-2 sm:space-y-3 transition-all duration-300 ease-in-out relative
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'}`}>
          
          {/* Action Buttons - Half On/Half Off */}
          <div className={`absolute -top-6 right-4 z-50 transition-all duration-300 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}>
            <div className="flex items-center gap-1 glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg p-1 shadow-lg backdrop-blur-xl">
              {selectedCount > 0 && onBulkDelete && (
                <button
                  onClick={onBulkDelete}
                  className="p-2 rounded-md transition-all duration-200 hover:bg-red-500/20 hover:scale-105"
                  title="Delete Selected"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              )}
              {onExport && (
                <button
                  onClick={onExport}
                  className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                  title="Export Entries"
                >
                  <Download className="w-4 h-4 glass-text-primary" />
                </button>
              )}
              {onImport && (
                <button
                  onClick={onImport}
                  className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                  title="Import Entries"
                >
                  <Upload className="w-4 h-4 glass-text-primary" />
                </button>
              )}
              <button
                onClick={clearFilters}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Clear Filters"
              >
                <RefreshCw className="w-4 h-4 glass-text-primary" />
              </button>
              <button
                onClick={onToggle}
                className="p-2 rounded-md transition-all duration-200 hover:bg-white/20 dark:hover:bg-black/20 hover:scale-105"
                title="Close Journal Controls"
              >
                <X className="w-4 h-4 glass-text-primary" />
              </button>
            </div>
          </div>
          
          {/* Title Bubble */}
          <div className={`absolute -top-8 left-4 z-50 transition-all duration-300 ease-in-out ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
          }`}>
            <div className="glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 rounded-lg px-3 py-1.5 shadow-lg backdrop-blur-xl">
              <h3 className="text-sm font-medium glass-text-primary">Journal Controls</h3>
            </div>
          </div>

          {/* Basic Filters Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-2">

            {/* Privacy Filter */}
            <div className="flex flex-col">
              <select
                value={selectedPrivacy}
                onChange={(e) => setSelectedPrivacy(e.target.value)}
                className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Privacy</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="secret">Secret</option>
              </select>
              <span className="text-xs glass-text-muted mt-1">Privacy</span>
            </div>

            {/* Source Filter */}
            <div className="flex flex-col">
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Sources</option>
                {allSources().map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
              <span className="text-xs glass-text-muted mt-1">Source</span>
            </div>
          </div>

          {/* Tags and Mood Filters Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Tag Filter */}
            <div className="flex flex-col">
              <select
                value={selectedTags.length > 0 ? selectedTags[0] : ''}
                onChange={(e) => {
                  const tag = e.target.value;
                  if (tag) {
                    setSelectedTags([tag]);
                  } else {
                    setSelectedTags([]);
                  }
                }}
                className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Tags</option>
                {allTags().map((tag) => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <span className="text-xs glass-text-muted mt-1">Tags</span>
            </div>

            {/* Mood Filter */}
            <div className="flex flex-col">
              <select
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value)}
                className="px-2 py-1.5 text-xs sm:text-sm glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">All Moods</option>
                {allMoods().map((mood) => (
                  <option key={mood} value={mood}>{mood}</option>
                ))}
              </select>
              <span className="text-xs glass-text-muted mt-1">Mood</span>
            </div>

            {/* Sort Options */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 glass-subtle rounded-lg p-1">
                <button
                  onClick={() => {
                    if (sortBy === 'date') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('date');
                      setSortOrder('desc');
                    }
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    sortBy === 'date' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title={`Sort by Date (${sortBy === 'date' ? (sortOrder === 'asc' ? 'Oldest First' : 'Newest First') : 'Newest First'})`}
                >
                  <Calendar className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (sortBy === 'title') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('title');
                      setSortOrder('asc');
                    }
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    sortBy === 'title' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title={`Sort by Title (${sortBy === 'title' ? (sortOrder === 'asc' ? 'A-Z' : 'Z-A') : 'A-Z'})`}
                >
                  <SortAsc className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (sortBy === 'mood') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    } else {
                      setSortBy('mood');
                      setSortOrder('asc');
                    }
                  }}
                  className={`p-2 rounded-md transition-colors ${
                    sortBy === 'mood' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title={`Sort by Mood (${sortBy === 'mood' ? (sortOrder === 'asc' ? 'A-Z' : 'Z-A') : 'A-Z'})`}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs glass-text-muted mt-1">Sort</span>
            </div>
          </div>

          {/* Status and Stats Row */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Entry Count */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm glass-text-secondary">
                  {filteredCount === totalEntries ? (
                    `✅ ${totalEntries} entries`
                  ) : (
                    `🔍 ${filteredCount} of ${totalEntries} entries`
                  )}
                </span>
              </div>
              <span className="text-xs glass-text-muted mt-1">
                {selectedCount > 0 && `${selectedCount} selected`}
              </span>
            </div>

            {/* Layout Mode */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1 glass-subtle rounded-lg p-1">
                <button
                  onClick={() => setLayoutMode('card')}
                  className={`p-2 rounded-md transition-colors ${
                    layoutMode === 'card' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Card View (Facebook/Twitter style)"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    layoutMode === 'grid' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Grid View (Instagram style)"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    layoutMode === 'list' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="List View (Compact)"
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setLayoutMode('mortar')}
                  className={`p-2 rounded-md transition-colors ${
                    layoutMode === 'mortar' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'glass-text-secondary hover:bg-white/20 dark:hover:bg-black/20'
                  }`}
                  title="Mortar View (Pinterest style)"
                >
                  <Layout className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs glass-text-muted mt-1">Layout</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JournalControls;
