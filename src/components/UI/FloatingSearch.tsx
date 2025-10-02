/**
 * Floating Search Component for MyFace SnapJournal
 * 
 * A beautiful glass search component that floats in the bottom right corner
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, Tag, User, Hash, Heart, Lock, Eye, EyeOff } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';
import { useJournalStore } from '../../stores/journalStore';
import { useLocation } from 'react-router-dom';

const FloatingSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, feedType, auth } = useMastodonStore();
  const {
    searchQuery: journalSearchQuery,
    setSearchQuery: setJournalSearchQuery,
    selectedTags,
    setSelectedTags,
    selectedMood,
    setSelectedMood,
    selectedPrivacy,
    setSelectedPrivacy,
    selectedSource,
    setSelectedSource,
    allTags,
    allMoods,
    clearFilters
  } = useJournalStore();
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const location = useLocation();
  
  const isJournalPage = location.pathname === '/journal';
  const isFeedPage = location.pathname === '/feed';

  // Auto-expand when there's already a search query
  useEffect(() => {
    const currentQuery = isJournalPage ? journalSearchQuery : searchQuery;
    if (currentQuery && currentQuery.length > 0) {
      setIsExpanded(true);
    }
  }, [isJournalPage, journalSearchQuery, searchQuery]);
  
  // Get current search query and setter based on page
  const currentSearchQuery = isJournalPage ? journalSearchQuery : searchQuery;
  const setCurrentSearchQuery = isJournalPage ? setJournalSearchQuery : setSearchQuery;

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Searching for:', currentSearchQuery);
    // Search functionality is handled by the stores automatically
  };

  // Clear search
  const clearSearch = () => {
    setCurrentSearchQuery('');
    if (isJournalPage) {
      clearFilters();
    }
    setIsExpanded(false);
    setSearchFocused(false);
    setShowFilters(false);
  };

  // Toggle expanded state
  const toggleExpanded = () => {
    if (isExpanded) {
      clearSearch();
    } else {
      setIsExpanded(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-20 z-50">
      {/* Search Container */}
      <div 
        className={`
          glass-panel glass-subtle border border-neutral-300 dark:border-neutral-600 
          transition-all duration-300 ease-in-out shadow-lg hover:shadow-xl
          ${isExpanded ? 'w-80 p-4 shadow-xl rounded-2xl' : 'w-12 h-12 p-3 cursor-pointer rounded-full'}
          ${searchFocused ? 'scale-105 shadow-2xl' : ''}
        `}
        onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
      >
        {isExpanded ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold glass-text-primary">
                {isJournalPage ? (
                  'Search Journal'
                ) : isFeedPage && auth.isAuthenticated && feedType ? (
                  <>Search {feedType === 'public' ? 'Public' : 'Local'} Posts</>
                ) : (
                  'Search'
                )}
              </h3>
              <button 
                onClick={toggleExpanded}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 glass-text-muted" />
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 glass-text-muted" />
              <input
                type="text"
                value={currentSearchQuery}
                onChange={(e) => setCurrentSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={
                  isJournalPage
                    ? "Search entries, tags, content..."
                    : isFeedPage && auth.isAuthenticated && feedType
                    ? "Search posts, users, hashtags..."
                    : "Search..."
                }
                className="w-full pl-10 pr-3 py-2.5 glass-subtle border border-neutral-300 dark:border-neutral-600 glass-text-primary rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                autoFocus
              />
            </form>

            {/* Search Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs glass-text-muted">
                <Filter className="w-3 h-3" />
                <span>Filters:</span>
              </div>
              
              {isJournalPage ? (
                <>
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs">
                    <Tag className="w-3 h-3" />
                    <span>Tags</span>
                  </div>
                  
                  <div className="flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg text-xs">
                    <Heart className="w-3 h-3" />
                    <span>Mood</span>
                  </div>
                  
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs">
                    <Lock className="w-3 h-3" />
                    <span>Privacy</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs">
                    <Tag className="w-3 h-3" />
                    <span>Tags</span>
                  </div>
                  
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-xs">
                    <User className="w-3 h-3" />
                    <span>Users</span>
                  </div>
                  
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs">
                    <Hash className="w-3 h-3" />
                    <span>Hashtags</span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs">
                <Search className="w-3 h-3" />
                Search
              </button>
              
              {isJournalPage && (
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-xs ${
                    showFilters 
                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' 
                      : 'bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-500'
                  }`}
                >
                  <Filter className="w-3 h-3" />
                  Filters
                </button>
              )}
              
              <button className="flex items-center gap-1 px-3 py-1.5 glass-subtle glass-text-primary rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors text-xs">
                <Calendar className="w-3 h-3" />
                Recent
              </button>
            </div>
            
            {/* Journal Filters Panel */}
            {isJournalPage && showFilters && (
              <div className="glass-subtle p-3 rounded-lg space-y-3 border-t border-neutral-200 dark:border-neutral-700">
                <div className="grid grid-cols-1 gap-3">
                  {/* Tags Filter */}
                  <div>
                    <label className="block text-xs font-medium glass-text-secondary mb-1">Tags</label>
                    <select
                      multiple
                      value={selectedTags}
                      onChange={(e) => setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))}
                      className="w-full px-2 py-1.5 glass-subtle glass-text-primary border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs"
                      size={3}
                    >
                      {allTags().map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>

                  {/* Mood Filter */}
                  <div>
                    <label className="block text-xs font-medium glass-text-secondary mb-1">Mood</label>
                    <select
                      value={selectedMood}
                      onChange={(e) => setSelectedMood(e.target.value)}
                      className="w-full px-2 py-1.5 glass-subtle glass-text-primary border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs"
                    >
                      <option value="">All moods</option>
                      {allMoods().map(mood => (
                        <option key={mood} value={mood}>{mood}</option>
                      ))}
                    </select>
                  </div>

                  {/* Privacy Filter */}
                  <div>
                    <label className="block text-xs font-medium glass-text-secondary mb-1">Privacy</label>
                    <select
                      value={selectedPrivacy}
                      onChange={(e) => setSelectedPrivacy(e.target.value)}
                      className="w-full px-2 py-1.5 glass-subtle glass-text-primary border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs"
                    >
                      <option value="">All privacy levels</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="secret">Secret</option>
                    </select>
                  </div>

                  {/* Source Filter */}
                  <div>
                    <label className="block text-xs font-medium glass-text-secondary mb-1">Source</label>
                    <select
                      value={selectedSource}
                      onChange={(e) => setSelectedSource(e.target.value)}
                      className="w-full px-2 py-1.5 glass-subtle glass-text-primary border border-neutral-300 dark:border-neutral-600 rounded-lg text-xs"
                    >
                      <option value="">All sources</option>
                      <option value="local">Local</option>
                      <option value="mastodon">Mastodon</option>
                    </select>
                  </div>
                </div>
                
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-1.5 bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors text-xs"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Collapsed Search Button */
          <div 
            className="w-full h-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
            title="Search"
          >
            <Search className="w-5 h-5 glass-text-primary" />
          </div>
        )}
      </div>

      {/* Search Status Indicator */}
      {currentSearchQuery && currentSearchQuery.length > 0 && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 glass-subtle rounded-lg mx-auto max-w-fit">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {currentSearchQuery.length} characters
          </span>
        </div>
      )}
    </div>
  );
};

export default FloatingSearch;
