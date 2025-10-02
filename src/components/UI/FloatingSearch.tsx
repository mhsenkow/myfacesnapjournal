/**
 * Floating Search Component for MyFace SnapJournal
 * 
 * A beautiful glass search component that floats in the bottom right corner
 */

import React, { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, Tag, User, Hash } from 'lucide-react';
import { useMastodonStore } from '../../stores/mastodonStore';

const FloatingSearch: React.FC = () => {
  const { searchQuery, setSearchQuery, feedType, auth } = useMastodonStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Auto-expand when there's already a search query
  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      setIsExpanded(true);
    }
  }, []);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual search functionality
    console.log('Searching for:', searchQuery);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setIsExpanded(false);
    setSearchFocused(false);
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
    <div className="fixed bottom-6 right-6 z-50">
      {/* Search Container */}
      <div 
        className={`
          glass border border-neutral-200 dark:border-neutral-700 
          rounded-2xl transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-80 p-4 shadow-xl' : 'w-14 h-14 p-0 cursor-pointer'}
          ${searchFocused ? 'scale-105 shadow-2xl' : ''}
        `}
        onClick={!isExpanded ? () => setIsExpanded(true) : undefined}
      >
        {isExpanded ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {auth.isAuthenticated && feedType ? (
                  <>Search {feedType === 'public' ? 'Public' : 'Local'} Posts</>
                ) : (
                  'Search Journal'
                )}
              </h3>
              <button 
                onClick={toggleExpanded}
                className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            {/* Search Input */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder={
                  auth.isAuthenticated && feedType
                    ? "Search posts, users, hashtags..."
                    : "Search entries, tags, content..."
                }
                className="w-full pl-10 pr-3 py-2.5 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-neutral-100 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                autoFocus
              />
            </form>

            {/* Search Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-xs text-neutral-500">
                <Filter className="w-3 h-3" />
                <span>Filters:</span>
              </div>
              
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
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-700">
              <button className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs">
                <Search className="w-3 h-3" />
                Search
              </button>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-600 text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-500 transition-colors text-xs">
                <Calendar className="w-3 h-3" />
                Recent
                </button>
            </div>
          </div>
        ) : (
          /* Collapsed Search Button */
          <div 
            className="w-full h-full flex items-center justify-center hover:scale-110 transition-transform duration-200"
            title="Search"
          >
            <Search className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
          </div>
        )}
      </div>

      {/* Search Status Indicator */}
      {searchQuery && searchQuery.length > 0 && (
        <div className="mt-2 flex items-center gap-2 px-3 py-1.5 glass-subtle rounded-lg mx-auto max-w-fit">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-neutral-600 dark:text-neutral-400">
            {searchQuery.length} characters
          </span>
        </div>
      )}
    </div>
  );
};

export default FloatingSearch;
