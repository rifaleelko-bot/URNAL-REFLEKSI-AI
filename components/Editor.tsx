import React, { useState, useEffect, useRef } from 'react';
import { useJournal } from '../contexts/JournalContext';
import { analyzeJournalEntry } from '../services/geminiService';
import Button from './Button';
import { Sparkles, Save, Clock, Menu, Trash2 } from 'lucide-react';

interface EditorProps {
  entryId: string | null;
  onSelectEntry: (id: string | null) => void;
  onMenuClick: () => void;
}

const Editor: React.FC<EditorProps> = ({ entryId, onSelectEntry, onMenuClick }) => {
  const { entries, addEntry, updateEntry, deleteEntry, getEntry } = useJournal();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | undefined>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Load entry data when entryId changes
  useEffect(() => {
    if (entryId) {
      const entry = getEntry(entryId);
      if (entry) {
        setTitle(entry.title);
        setContent(entry.content);
        setAiAnalysis(entry.aiAnalysis);
        setLastSaved(new Date(entry.updatedAt));
      }
    } else {
      // New entry mode
      setTitle('');
      setContent('');
      setAiAnalysis('');
      setLastSaved(null);
    }
  }, [entryId, getEntry]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (entryId) {
        await updateEntry(entryId, title, content, aiAnalysis);
      } else {
        const newEntry = await addEntry(title, content, aiAnalysis);
        if (newEntry) {
          // Immediately switch to the new entry so future saves are updates, not creates
          onSelectEntry(newEntry.id);
        }
      }
      setLastSaved(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!entryId) return;
    
    if (window.confirm('Hapus jurnal ini secara permanen?')) {
      await deleteEntry(entryId);
      onSelectEntry(null);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    // Auto-save before analysis
    let currentId = entryId;
    if (!currentId) {
      setIsSaving(true);
      const newEntry = await addEntry(title, content, aiAnalysis);
      setIsSaving(false);
      if (newEntry) {
        currentId = newEntry.id;
        onSelectEntry(newEntry.id);
      } else {
        return; // Failed to save
      }
    } else {
       await updateEntry(currentId, title, content, aiAnalysis);
    }

    setIsAnalyzing(true);
    const analysis = await analyzeJournalEntry(content);
    setAiAnalysis(analysis);
    
    // Save analysis result
    if (currentId) {
      updateEntry(currentId, title, content, analysis);
      setLastSaved(new Date());
    }
    
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white relative">
      {/* Top Bar - Sticky & Blurred */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
          <button 
            onClick={onMenuClick} 
            className="md:hidden p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
          <div className="flex flex-col">
            <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Clock size={12} />
              {lastSaved ? (
                <span>Disimpan {lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</span>
              ) : (
                <span>Belum disimpan</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
           {entryId && (
             <Button
               variant="ghost"
               onClick={handleDelete}
               className="text-slate-400 hover:text-red-600 hover:bg-red-50 px-3"
               title="Hapus Jurnal Ini"
             >
               <Trash2 size={18} />
             </Button>
           )}

           <Button 
             variant="ghost" 
             onClick={handleSave} 
             disabled={isSaving || (!title && !content)}
             className="hidden sm:inline-flex"
           >
             <Save size={18} className="mr-2" />
             Simpan
           </Button>
           
           <Button 
            variant="gradient" 
            onClick={handleAnalyze} 
            isLoading={isAnalyzing}
            disabled={!content || content.length < 10}
            className="rounded-full shadow-indigo-200"
           >
             <Sparkles size={16} className={`mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
             {isAnalyzing ? 'Menganalisis...' : 'Analisis AI'}
           </Button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-3xl mx-auto px-6 md:px-12 py-10 md:py-12">
          
          {/* Title Input */}
          <input
            type="text"
            placeholder="Judul Hari Ini..."
            className="w-full text-3xl md:text-4xl font-bold text-slate-900 placeholder:text-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 mb-8 tracking-tight"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          {/* Content Textarea */}
          <div className="relative min-h-[50vh]">
            {!content && (
              <div className="absolute top-0 left-0 text-slate-300 text-lg md:text-xl font-serif italic pointer-events-none select-none">
                Apa yang ada di pikiran Anda? Mulailah menulis...
              </div>
            )}
            <textarea
              ref={textareaRef}
              className="w-full min-h-[50vh] resize-none text-lg md:text-xl text-slate-700 font-serif leading-loose border-none bg-transparent focus:outline-none focus:ring-0 overflow-hidden"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              spellCheck={false}
            />
          </div>

          {/* AI Analysis Card */}
          {aiAnalysis && (
            <div className="mt-16 animate-slide-up">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-brand-50 p-1 rounded-2xl shadow-xl shadow-indigo-100/50">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-indigo-500 to-purple-500 opacity-70"></div>
                <div className="relative bg-white/60 backdrop-blur-sm p-6 md:p-8 rounded-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                      <Sparkles size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Wawasan Reflektif</h3>
                  </div>
                  
                  <div className="prose prose-slate prose-p:font-serif prose-p:text-slate-600 prose-li:text-slate-600 max-w-none">
                    <div className="whitespace-pre-line leading-relaxed">
                      {aiAnalysis}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Bottom spacing */}
          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
};

export default Editor;