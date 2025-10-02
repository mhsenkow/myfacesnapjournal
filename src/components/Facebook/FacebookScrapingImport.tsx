/**
 * Facebook Scraping Import Component
 * 
 * Provides UI for importing Facebook posts via web scraping methods
 * Bypasses the need for Facebook app review
 */

import React, { useState, useRef } from 'react';
import { Facebook, Download, Upload, Bookmark, AlertCircle, CheckCircle, Loader2, FileText, ExternalLink } from 'lucide-react';
import { facebookScrapingService, ScrapingInstructions } from '../../services/facebookScrapingService';
import { useJournalStore } from '../../stores/journalStore';
import { EntrySource } from '../../types/journal';

const FacebookScrapingImport: React.FC = () => {
  const { createEntry } = useJournalStore();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookmarkletUrl, setBookmarkletUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const instructions = facebookScrapingService.getScrapingInstructions();

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(method);
    setError(null);
    setSuccess(null);
    
    if (method === 'bookmarklet') {
      const bookmarklet = facebookScrapingService.generateBookmarklet();
      setBookmarkletUrl(bookmarklet);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);
      
      const scrapedPosts = facebookScrapingService.parseFacebookExport(jsonData);
      
      if (scrapedPosts.length === 0) {
        throw new Error('No posts found in the uploaded file. Please check the file format.');
      }

      // Convert posts to journal entries and add them
      let importedCount = 0;
      for (const post of scrapedPosts) {
        try {
          const journalEntry = facebookScrapingService.convertToJournalEntry(post);
          await createEntry({
            title: journalEntry.title,
            content: journalEntry.content,
            tags: journalEntry.tags,
            mood: journalEntry.mood as any,
            privacy: journalEntry.privacy,
            source: EntrySource.FACEBOOK,
            sourceId: journalEntry.sourceId,
            sourceUrl: journalEntry.sourceUrl,
            metadata: journalEntry.metadata
          });
          importedCount++;
        } catch (entryError) {
          console.error('Error creating journal entry:', entryError);
        }
      }

      setSuccess(`Successfully imported ${importedCount} Facebook posts!`);
      
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Failed to process the uploaded file');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyBookmarklet = () => {
    navigator.clipboard.writeText(bookmarkletUrl);
    setSuccess('Bookmarklet copied to clipboard! Drag it to your bookmarks bar.');
  };

  const renderMethodInstructions = (method: ScrapingInstructions) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900 capitalize">
            {method.method.replace('_', ' ')} Method
          </h4>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              method.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
              method.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {method.difficulty}
            </span>
            <span className="text-xs text-gray-500">{method.estimatedTime}</span>
          </div>
        </div>

        <div className="space-y-2">
          {method.steps.map((step, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </span>
              <p className="text-sm text-gray-700">{step}</p>
            </div>
          ))}
        </div>

        {method.method === 'manual_export' && (
          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {isProcessing ? 'Processing...' : 'Upload Facebook Export File'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}

        {method.method === 'bookmarklet' && (
          <div className="mt-4 space-y-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">
                Drag this link to your bookmarks bar, then click it while on Facebook:
              </p>
              <a
                href={bookmarkletUrl}
                className="inline-flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                <Bookmark className="w-4 h-4" />
                Facebook Post Scraper
              </a>
            </div>
            <button
              onClick={copyBookmarklet}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Copy Bookmarklet URL
            </button>
          </div>
        )}

        {method.method === 'browser_extension' && (
          <div className="mt-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> You'll need to find and install a Facebook data export browser extension. 
                  Make sure it's from a trusted source and respects your privacy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Facebook className="w-6 h-6 text-blue-600" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Facebook Import (Web Scraping)</h3>
          <p className="text-sm text-gray-600">
            Bypass Facebook API limitations by using web scraping methods
          </p>
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Important Notes</h4>
            <ul className="mt-2 text-sm text-yellow-700 space-y-1">
              <li>• This method bypasses Facebook's API and doesn't require app review</li>
              <li>• You'll need to manually export or scrape your Facebook data</li>
              <li>• Make sure you have permission to access the data you're importing</li>
              <li>• Some methods may violate Facebook's Terms of Service</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Method Selection */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Choose Import Method</h4>
        
        <div className="grid gap-4">
          {instructions.map((method) => (
            <div key={method.method} className="space-y-3">
              <button
                onClick={() => handleMethodSelect(method.method)}
                className={`w-full p-4 text-left border rounded-lg transition-colors ${
                  selectedMethod === method.method
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {method.method === 'manual_export' && <FileText className="w-5 h-5 text-gray-600" />}
                    {method.method === 'browser_extension' && <ExternalLink className="w-5 h-5 text-gray-600" />}
                    {method.method === 'bookmarklet' && <Bookmark className="w-5 h-5 text-gray-600" />}
                    <div>
                      <h5 className="font-medium text-gray-900 capitalize">
                        {method.method.replace('_', ' ')}
                      </h5>
                      <p className="text-sm text-gray-600">{method.estimatedTime}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    method.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                    method.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {method.difficulty}
                  </span>
                </div>
              </button>

              {selectedMethod === method.method && renderMethodInstructions(method)}
            </div>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        </div>
      )}

      {/* Help */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Need Help?</h4>
        <p className="text-sm text-gray-600">
          The <strong>Manual Export</strong> method is the most reliable and doesn't violate Facebook's terms. 
          It may take a few hours for Facebook to prepare your data, but it's the safest option.
        </p>
      </div>
    </div>
  );
};

export default FacebookScrapingImport;
