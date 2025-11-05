/**
 * Documents Page - Full-featured document editor
 * 
 * This page provides:
 * - Rich text editing with TipTap
 * - Document list and management
 * - Full document writing capabilities
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Save,
  FileText,
  Plus,
  Trash2,
  Search,
  Tag,
  XCircle,
  Calendar,
  Printer
} from 'lucide-react';
import { useDocumentsStore, Document } from '../stores/documentsStore';

const DocumentsPage: React.FC = () => {
  const {
    documents,
    selectedDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    selectDocument,
    loadDocuments,
    searchQuery,
    setSearchQuery,
    filteredDocuments,
  } = useDocumentsStore();

  const [isCreating, setIsCreating] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your document...',
      }),
      CodeBlock,
      Highlight,
      TaskList,
      TaskItem,
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg dark:prose-invert max-w-none focus:outline-none p-6 min-h-[600px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Auto-save could be implemented here
    },
  });

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Update editor content when document is selected
  useEffect(() => {
    if (selectedDocument && editor) {
      // Ensure editor is ready before setting content
      const content = selectedDocument.content || '<p></p>';
      console.log('Loading document:', {
        id: selectedDocument.id,
        title: selectedDocument.title,
        contentLength: content.length,
        contentPreview: content.substring(0, 100)
      });
      
      // Use setTimeout to ensure editor is fully ready
      setTimeout(() => {
        editor.commands.setContent(content, false);
        setDocumentTitle(selectedDocument.title || '');
      }, 100);
    } else if (!selectedDocument && editor) {
      editor.commands.clearContent();
      setDocumentTitle('');
    }
  }, [selectedDocument?.id, selectedDocument?.content, selectedDocument?.title, editor]);

  // Handle document selection
  const handleDocumentSelect = useCallback((doc: Document) => {
    selectDocument(doc);
    if (editor) {
      // Set content immediately when document is selected
      const content = doc.content || '<p></p>';
      console.log('Selecting document:', {
        id: doc.id,
        title: doc.title,
        contentLength: content.length,
        hasContent: !!content && content !== '<p></p>'
      });
      
      // Clear first, then set content to ensure clean state
      editor.commands.clearContent();
      setTimeout(() => {
        editor.commands.setContent(content, false);
        setDocumentTitle(doc.title || '');
      }, 50);
    }
  }, [editor, selectDocument]);

  // Handle creating new document
  const handleNewDocument = () => {
    setIsCreating(true);
    selectDocument(null);
    if (editor) {
      editor.commands.clearContent();
      setDocumentTitle('');
    }
  };

  // Handle saving document
  const handleSave = useCallback(async () => {
    if (!editor || !documentTitle.trim()) return;

    setIsSaving(true);
    try {
      const content = editor.getHTML();
      console.log('Saving document:', {
        title: documentTitle,
        contentLength: content.length,
        contentPreview: content.substring(0, 200),
        isUpdate: !!selectedDocument
      });

      if (selectedDocument) {
        // Update existing document
        await updateDocument(selectedDocument.id, {
          title: documentTitle,
          content,
        });
        // Reload documents to ensure we have the latest content
        await loadDocuments();
        // Reselect the updated document
        const updatedDocs = filteredDocuments();
        const updatedDoc = updatedDocs.find(d => d.id === selectedDocument.id);
        if (updatedDoc) {
          selectDocument(updatedDoc);
        }
      } else {
        // Create new document
        await createDocument({
          title: documentTitle,
          content,
          tags: [],
        });
      }
      setIsCreating(false);
    } catch (error) {
      console.error('Failed to save document:', error);
    } finally {
      setIsSaving(false);
    }
  }, [editor, documentTitle, selectedDocument, createDocument, updateDocument]);

  // Handle deleting document
  const handleDelete = async (doc: Document) => {
    if (confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      try {
        await deleteDocument(doc.id);
        if (selectedDocument?.id === doc.id) {
          selectDocument(null);
          if (editor) {
            editor.commands.clearContent();
            setDocumentTitle('');
          }
        }
      } catch (error) {
        console.error('Failed to delete document:', error);
      }
    }
  };

  // Format date helper
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Handle print to PDF
  const handlePrint = useCallback((doc?: Document) => {
    // If printing a saved document, use its content
    let content: string;
    let title: string;

    if (doc) {
      content = doc.content || '';
      title = doc.title || 'Untitled Document';
    } else {
      // Print current editor content
      if (!editor || !documentTitle.trim()) {
        alert('Please save your document before printing.');
        return;
      }
      content = editor.getHTML();
      title = documentTitle.trim() || 'Untitled Document';
    }

    // Validate title - content can be empty HTML tags initially, that's okay
    if (!title) {
      alert('Please add a title to your document before printing.');
      return;
    }

    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to print documents.');
      return;
    }

    const printDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Escape HTML for title to prevent XSS
    const escapedTitle = (title || 'Untitled Document').replace(/[&<>"']/g, (m) => {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      };
      return map[m];
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${escapedTitle}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: white;
              padding: 2cm;
              max-width: 21cm;
              margin: 0 auto;
            }
            h1 {
              font-size: 2.25em;
              margin-top: 0;
              margin-bottom: 0.5em;
              font-weight: 800;
              line-height: 1.2;
              color: #111827;
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 0.5em;
            }
            h2 {
              font-size: 1.5em;
              margin-top: 1.5em;
              margin-bottom: 0.75em;
              font-weight: 700;
              line-height: 1.3;
              color: #1f2937;
            }
            h3 {
              font-size: 1.25em;
              margin-top: 1.25em;
              margin-bottom: 0.5em;
              font-weight: 600;
              line-height: 1.4;
              color: #374151;
            }
            p {
              margin-top: 1em;
              margin-bottom: 1em;
              text-align: justify;
            }
            ul, ol {
              margin-top: 1em;
              margin-bottom: 1em;
              padding-left: 2em;
            }
            li {
              margin-top: 0.5em;
              margin-bottom: 0.5em;
            }
            blockquote {
              font-style: italic;
              color: #4b5563;
              border-left: 4px solid #d1d5db;
              padding-left: 1em;
              margin: 1.5em 0;
            }
            code {
              background-color: #f3f4f6;
              padding: 0.125em 0.25em;
              border-radius: 0.25rem;
              font-family: 'Courier New', monospace;
              font-size: 0.9em;
            }
            pre {
              background-color: #1f2937;
              color: #f9fafb;
              padding: 1em;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 1.5em 0;
            }
            pre code {
              background-color: transparent;
              padding: 0;
              color: inherit;
            }
            strong {
              font-weight: 700;
              color: #111827;
            }
            em {
              font-style: italic;
            }
            mark {
              background-color: #fef08a;
              padding: 0.125em 0.25em;
            }
            img {
              max-width: 100%;
              height: auto;
              margin: 1em 0;
            }
            .document-meta {
              margin-bottom: 2em;
              padding-bottom: 1em;
              border-bottom: 1px solid #e5e7eb;
              font-size: 0.875em;
              color: #6b7280;
            }
            @media print {
              body {
                padding: 1.5cm;
              }
              @page {
                margin: 1.5cm;
              }
            }
          </style>
        </head>
        <body>
          <div class="document-meta">
            <div><strong>Document:</strong> ${escapedTitle}</div>
            <div><strong>Date:</strong> ${printDate}</div>
          </div>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      // Optionally close the window after printing
      // printWindow.close();
    }, 250);
  }, [editor, documentTitle]);

  if (!editor) {
    return <div className="p-6">Loading editor...</div>;
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] overflow-hidden -m-6">
      {/* Sidebar - Document List */}
      <div className="w-80 border-r border-neutral-200 dark:border-neutral-700 flex flex-col glass-subtle overflow-hidden flex-shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold glass-text-primary">Documents</h1>
            <button
              onClick={handleNewDocument}
              className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              title="New Document"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 rounded-lg text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredDocuments().length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No documents yet</p>
              <p className="text-sm">Click + to create a new document</p>
            </div>
          ) : (
            filteredDocuments().map((doc) => (
              <div
                key={doc.id}
                onClick={() => handleDocumentSelect(doc)}
                className={`p-4 rounded-lg cursor-pointer transition-all ${
                  selectedDocument?.id === doc.id
                    ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                    : 'bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 truncate flex-1">
                    {doc.title}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrint(doc);
                      }}
                      className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
                      title="Print document"
                    >
                      <Printer className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(doc);
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(doc.updatedAt)}</span>
                </div>
                {doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {doc.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-neutral-200 dark:border-neutral-700 p-4 glass-subtle">
          <div className="flex items-center justify-between mb-4">
            <input
              type="text"
              placeholder="Document Title..."
              value={documentTitle}
              onChange={(e) => setDocumentTitle(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none outline-none flex-1 glass-text-primary placeholder:text-neutral-400"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                disabled={!documentTitle.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Print to PDF"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                onClick={handleSave}
                disabled={!documentTitle.trim() || isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('bold') ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('italic') ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('strike') ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('heading', { level: 1 }) ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Heading 1"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('heading', { level: 2 }) ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Heading 2"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('heading', { level: 3 }) ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Heading 3"
            >
              <Heading3 className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('bulletList') ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('orderedList') ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('blockquote') ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                editor.isActive('codeBlock') ? 'bg-purple-100 dark:bg-purple-900/30' : ''
              }`}
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-600" />
            <button
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Editor Content */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-neutral-800">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;

