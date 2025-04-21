export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  lastModified: Date;
  owner: string;
  collaborators: string[];
  isPublic: boolean;
  tags: string[];
}

export interface Folder {
  id: string;
  name: string;
  documents: string[];
  subfolders: string[];
  owner: string;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  imageUrl?: string;
}

export type CompilationStatus = 'idle' | 'compiling' | 'success' | 'error';

export interface CompilationResult {
  status: CompilationStatus;
  pdfUrl?: string;
  errors?: CompilationError[];
  logs?: string;
}

export interface CompilationError {
  line: number;
  message: string;
  type: 'error' | 'warning';
}

export interface ConversionResult {
  status: 'success' | 'error';
  content?: string;
  error?: string;
}