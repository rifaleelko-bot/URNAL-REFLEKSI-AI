import React from 'react';
import { Database, Copy, CheckCircle } from 'lucide-react';
import Button from './Button';

const SetupGuide: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const sqlCode = `-- 1. Buat tabel 'entries'
create table public.entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null default 'Entri Tanpa Judul',
  content text,
  ai_analysis text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Aktifkan Row Level Security (RLS)
alter table public.entries enable row level security;

-- 3. Buat kebijakan keamanan (Policies)
create policy "Users can view their own entries" on public.entries for select using ( auth.uid() = user_id );
create policy "Users can insert their own entries" on public.entries for insert with check ( auth.uid() = user_id );
create policy "Users can update their own entries" on public.entries for update using ( auth.uid() = user_id );
create policy "Users can delete their own entries" on public.entries for delete using ( auth.uid() = user_id );

-- 4. Trigger update waktu (Opsional)
create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on public.entries for each row execute procedure moddatetime (updated_at);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-brand-600 p-6 text-white text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Database size={32} />
          </div>
          <h2 className="text-2xl font-bold">Setup Database Diperlukan</h2>
          <p className="text-brand-100 mt-2">Aplikasi tidak dapat menemukan tabel database yang diperlukan.</p>
        </div>
        
        <div className="p-8 space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
            <strong>Perhatian:</strong> Karena alasan keamanan, aplikasi frontend tidak dapat membuat tabel secara otomatis. Anda perlu menjalankan perintah SQL berikut satu kali saja.
          </div>

          <ol className="list-decimal list-inside space-y-2 text-slate-700">
            <li>Buka <strong>Supabase Dashboard</strong> proyek Anda.</li>
            <li>Klik menu <strong>SQL Editor</strong> di sidebar kiri.</li>
            <li>Klik <strong>New Query</strong>.</li>
            <li>Salin kode di bawah dan tempelkan ke editor.</li>
            <li>Klik tombol <strong>Run</strong>.</li>
          </ol>

          <div className="relative">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto h-64 font-mono leading-relaxed">
              {sqlCode}
            </pre>
            <button 
              onClick={handleCopy}
              className="absolute top-2 right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-md transition-colors backdrop-blur-sm"
              title="Salin SQL"
            >
              {copied ? <CheckCircle size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>

          <div className="flex justify-center pt-2">
            <Button onClick={() => window.location.reload()}>
              Saya Sudah Menjalankan SQL &rarr; Refresh Halaman
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide;