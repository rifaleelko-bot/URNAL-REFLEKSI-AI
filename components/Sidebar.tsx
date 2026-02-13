import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import { Plus, LogOut, BookOpen, Trash2, Search, Calendar, Loader2 } from 'lucide-react';

interface SidebarProps {
  currentEntryId: string | null;
  onSelectEntry: (id: string | null) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentEntryId, onSelectEntry, isOpen, setIsOpen }) => {
  const { user, logout } = useAuth();
  const { entries, deleteEntry } = useJournal();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('id-ID', { month: 'short' }),
      time: date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation(); // Critical: prevents opening the entry when clicking delete
    
    // Konfirmasi sebelum menghapus
    if (window.confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      setDeletingId(id);
      try {
        await deleteEntry(id);
        // Jika jurnal yang dihapus sedang dibuka, tutup editor
        if (currentEntryId === id) onSelectEntry(null);
      } catch (error) {
        console.error("Failed to delete", error);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-20 md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`fixed md:relative z-30 flex flex-col w-80 h-full bg-slate-50/50 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* Header */}
        <div className="p-5">
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100">
              <BookOpen className="w-5 h-5 text-brand-600" />
            </div>
            <span className="font-serif font-bold text-xl text-slate-800 tracking-tight italic">Jurnal Refleksi</span>
          </div>

          <button
            onClick={() => {
              onSelectEntry(null); 
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98] group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
            <span className="font-medium">Tulis Baru</span>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pb-2">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari kenangan..." 
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center px-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3 text-slate-300">
                <Calendar size={20} />
              </div>
              <p className="text-slate-500 text-sm font-medium">
                {searchTerm ? 'Tidak ada hasil.' : 'Belum ada catatan.'}
              </p>
              <p className="text-slate-400 text-xs mt-1">
                {searchTerm ? 'Coba kata kunci lain.' : 'Mulailah menulis hari ini.'}
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const date = formatDate(entry.createdAt);
              const isActive = currentEntryId === entry.id;
              const isDeleting = deletingId === entry.id;
              
              return (
                <div
                  key={entry.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    onSelectEntry(entry.id);
                    if (window.innerWidth < 768) setIsOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectEntry(entry.id);
                    }
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all group relative border cursor-pointer ${isActive ? 'bg-white border-brand-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-100'} ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex gap-3">
                    {/* Date Box */}
                    <div className={`flex flex-col items-center justify-center min-w-[3rem] h-12 rounded-lg border ${isActive ? 'bg-brand-50 border-brand-100 text-brand-700' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                      <span className="text-xs font-bold uppercase tracking-wider">{date.month}</span>
                      <span className="text-lg font-bold leading-none">{date.day}</span>
                    </div>

                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex justify-between items-start">
                        <span className={`font-semibold text-sm truncate pr-2 ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                          {entry.title || 'Tanpa Judul'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 font-serif">
                        {entry.content || "Belum ada konten..."}
                      </p>
                    </div>

                    {/* Actions - Delete Button */}
                    <div className="flex flex-col justify-center items-end pl-2">
                      <button 
                        onClick={(e) => handleDelete(e, entry.id)}
                        disabled={isDeleting}
                        className={`p-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/50 z-10 ${isDeleting ? 'bg-red-50 text-red-400 cursor-wait' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                        title="Hapus Jurnal"
                        type="button"
                      >
                        {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-500 rounded-r-full" />}
                </div>
              );
            })
          )}
        </div>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-100 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-400 to-indigo-500 text-white flex items-center justify-center text-sm font-bold shadow-sm">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;