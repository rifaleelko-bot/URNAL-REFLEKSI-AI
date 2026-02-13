import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { JournalEntry } from '../types';
import { useAuth } from './AuthContext';

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (title: string, content: string, aiAnalysis?: string) => void;
  updateEntry: (id: string, title: string, content: string, aiAnalysis?: string) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => JournalEntry | undefined;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Load entries when user changes
  useEffect(() => {
    if (user) {
      const storedEntries = localStorage.getItem(`journal_entries_${user.id}`);
      if (storedEntries) {
        setEntries(JSON.parse(storedEntries));
      } else {
        setEntries([]);
      }
    } else {
      setEntries([]);
    }
  }, [user]);

  // Save entries whenever they change
  useEffect(() => {
    if (user && entries.length > 0) {
      localStorage.setItem(`journal_entries_${user.id}`, JSON.stringify(entries));
    } else if (user && entries.length === 0) {
        // Clear storage if array is empty to keep it clean, or keep empty array
        localStorage.setItem(`journal_entries_${user.id}`, JSON.stringify([]));
    }
  }, [entries, user]);

  const addEntry = useCallback((title: string, content: string, aiAnalysis?: string) => {
    if (!user) return;
    
    const newEntry: JournalEntry = {
      id: crypto.randomUUID(),
      userId: user.id,
      title: title || 'Entri Tanpa Judul',
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      aiAnalysis,
    };

    setEntries((prev) => [newEntry, ...prev]);
  }, [user]);

  const updateEntry = useCallback((id: string, title: string, content: string, aiAnalysis?: string) => {
    setEntries((prev) => prev.map(entry => {
      if (entry.id === id) {
        return {
          ...entry,
          title,
          content,
          aiAnalysis: aiAnalysis || entry.aiAnalysis,
          updatedAt: new Date().toISOString()
        };
      }
      return entry;
    }));
  }, []);

  const deleteEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter(entry => entry.id !== id));
  }, []);

  const getEntry = useCallback((id: string) => {
    return entries.find(e => e.id === id);
  }, [entries]);

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry, updateEntry, getEntry }}>
      {children}
    </JournalContext.Provider>
  );
};

export const useJournal = () => {
  const context = useContext(JournalContext);
  if (context === undefined) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
};