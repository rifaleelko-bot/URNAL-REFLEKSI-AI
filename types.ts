export interface User {
  id: string;
  email: string;
  name: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  aiAnalysis?: string;
  mood?: 'happy' | 'neutral' | 'sad' | 'excited' | 'anxious';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type ViewState = 'list' | 'editor' | 'settings';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}