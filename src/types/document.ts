/**
 * Document Types
 * 
 * Type definitions for documents and related data structures
 */

export interface Document {
  id: string;
  title: string;
  content: string; // HTML content from rich text editor
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: any;
}

