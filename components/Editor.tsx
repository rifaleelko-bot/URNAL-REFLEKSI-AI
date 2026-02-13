import React, { useState, useEffect } from 'react';
import { useJournal } from '../contexts/JournalContext';
import { analyzeJournalEntry } from '../services/geminiService';
import Button from './Button';
import { Sparkles, Save, Calendar, Menu } from 'lucide-react';

interface EditorProps {
  entryId: string | null;
  onMenuClick: () => void;
}

const Editor: React.FC<EditorProps> = ({ entryId, onMenuClick }) => {
  const { entries, addEntry, updateEntry, getEntry } = useJournal();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [aiAnalysis, setAiAnalysis] = useState<string | undefined>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

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

  const handleSave = () => {
    setIsSaving(true);
    // Simulate tiny delay for better UX feel
    setTimeout(() => {
      if (entryId) {
        updateEntry(entryId, title, content, aiAnalysis);
      } else {
        addEntry(title, content, aiAnalysis);
        // Note: In a real app we'd redirect to the new ID, 
        // but for simplicity here we rely on the list update
      }
      setLastSaved(new Date());
      setIsSaving(false);
    }, 400);
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    
    // Save first
    handleSave();
    
    setIsAnalyzing(true);
    const analysis = await analyzeJournalEntry(content);
    setAiAnalysis(analysis);
    
    // Update with analysis
    if (entryId) {
      updateEntry(entryId, title, content, analysis);
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 overflow-hidden relative">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onMenuClick} className="md:hidden text-slate-500 hover:text-slate-700">
            <Menu size={24} />
          </button>
          <div className="text-sm text-slate-400 flex items-center gap-1">
            <Calendar size={14} />
            {lastSaved ? `Tersimpan ${lastSaved.toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}` : 'Belum disimpan'}
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" onClick={handleSave} disabled={isSaving || (!title && !content)}>
             <Save size={18} className="mr-2" />
             Simpan
           </Button>
           <Button 
            variant="primary" 
            onClick={handleAnalyze} 
            isLoading={isAnalyzing}
            disabled={!content || content.length < 10}
            className="bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
           >
             <Sparkles size={18} className="mr-2" />
             Analisis AI
           </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <input
            type="text"
            placeholder="Judul Entri..."
            className="w-full text-4xl font-bold text-slate-900 placeholder:text-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 mb-6"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <textarea
            placeholder="Tulis pikiran Anda di sini..."
            className="w-full h-[calc(100vh-400px)] min-h-[300px] resize-none text-lg text-slate-700 placeholder:text-slate-300 border-none bg-transparent focus:outline-none focus:ring-0 leading-relaxed"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* AI Analysis Section */}
          {aiAnalysis && (
            <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-2 mb-3 text-indigo-700 font-semibold">
                <Sparkles size={20} />
                <h3>Wawasan AI</h3>
              </div>
              <div className="prose prose-indigo prose-sm max-w-none text-slate-700 whitespace-pre-line">
                {aiAnalysis}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Editor;