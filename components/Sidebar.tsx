import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useJournal } from '../contexts/JournalContext';
import { JournalEntry } from '../types';
import { Plus, LogOut, BookOpen, Trash2, Search } from 'lucide-react';

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

  const filteredEntries = entries.filter(entry => 
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    entry.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus entri ini?')) {
      deleteEntry(id);
      if (currentEntryId === id) onSelectEntry(null);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <div className={`fixed md:relative z-30 flex flex-col w-72 h-full bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-brand-600">
            <BookOpen className="w-6 h-6" />
            <span className="font-bold text-lg text-slate-800">Jurnal Refleksi</span>
          </div>
          <button
            onClick={() => {
              onSelectEntry(null); // Create new
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white py-2 px-4 rounded-lg transition-colors shadow-sm"
          >
            <Plus size={18} />
            Entri Baru
          </button>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari..." 
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-brand-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredEntries.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              {searchTerm ? 'Tidak ada hasil ditemukan.' : 'Belum ada entri. Mulai menulis hari ini!'}
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {filteredEntries.map((entry) => (
                <li key={entry.id}>
                  <button
                    onClick={() => {
                      onSelectEntry(entry.id);
                      if (window.innerWidth < 768) setIsOpen(false);
                    }}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition-colors group relative ${currentEntryId === entry.id ? 'bg-brand-50 border-l-4 border-brand-500' : 'border-l-4 border-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-slate-800 truncate pr-6">{entry.title}</span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(entry.createdAt)}</span>
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 h-10">
                      {entry.content || "Tidak ada konten..."}
                    </p>
                    
                    <button
                      onClick={(e) => handleDelete(e, entry.id)}
                      className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* User Info / Logout */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-900 truncate max-w-[140px]">{user?.name}</span>
              <span className="text-xs text-slate-500 truncate max-w-[140px]">{user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-full transition-colors"
              title="Keluar"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;