import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { JournalEntry, JournalEntryDB } from '../types';
import { useAuth } from './AuthContext';
import { supabase } from '../services/supabaseClient';

interface JournalContextType {
  entries: JournalEntry[];
  addEntry: (title: string, content: string, aiAnalysis?: string) => Promise<JournalEntry | null>;
  updateEntry: (id: string, title: string, content: string, aiAnalysis?: string) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntry: (id: string) => JournalEntry | undefined;
  isSetupRequired: boolean;
}

const JournalContext = createContext<JournalContextType | undefined>(undefined);

export const JournalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isSetupRequired, setIsSetupRequired] = useState(false);

  // Helper to map DB row to JournalEntry
  const mapEntry = (dbEntry: JournalEntryDB): JournalEntry => ({
    id: dbEntry.id,
    userId: dbEntry.user_id,
    title: dbEntry.title,
    content: dbEntry.content,
    createdAt: dbEntry.created_at,
    updatedAt: dbEntry.updated_at,
    aiAnalysis: dbEntry.ai_analysis,
  });

  // Load entries when user changes
  useEffect(() => {
    if (user) {
      fetchEntries();
    } else {
      setEntries([]);
    }
  }, [user]);

  const fetchEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        // Code 42P01 indicates undefined table in Postgres
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          setIsSetupRequired(true);
        }
        throw error;
      }

      if (data) {
        setEntries(data.map((item: any) => mapEntry(item)));
        setIsSetupRequired(false);
      }
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const addEntry = useCallback(async (title: string, content: string, aiAnalysis?: string) => {
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('entries')
        .insert([
          {
            user_id: user.id,
            title: title || 'Entri Tanpa Judul',
            content,
            ai_analysis: aiAnalysis,
            updated_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        const newEntry = mapEntry(data);
        setEntries((prev) => [newEntry, ...prev]);
        return newEntry;
      }
    } catch (error) {
      console.error("Error adding entry:", error);
      alert("Gagal menyimpan entri.");
    }
    return null;
  }, [user]);

  const updateEntry = useCallback(async (id: string, title: string, content: string, aiAnalysis?: string) => {
    try {
      const { error } = await supabase
        .from('entries')
        .update({
          title,
          content,
          ai_analysis: aiAnalysis,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

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
    } catch (error) {
      console.error("Error updating entry:", error);
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Additional safety check matching user ID

      if (error) throw error;

      setEntries((prev) => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error("Error deleting entry:", error);
      alert("Gagal menghapus entri. Silakan coba lagi.");
    }
  }, [user]);

  const getEntry = useCallback((id: string) => {
    return entries.find(e => e.id === id);
  }, [entries]);

  return (
    <JournalContext.Provider value={{ entries, addEntry, deleteEntry, updateEntry, getEntry, isSetupRequired }}>
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