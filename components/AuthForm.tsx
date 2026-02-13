import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Input from './Input';
import { BookOpen, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const AuthForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerificationSent(false);
    
    if (!email) {
      setError('Email wajib diisi');
      return;
    }

    if (!password) {
      setError('Password wajib diisi');
      return;
    }
    
    if (!isLogin && !name) {
      setError('Nama wajib diisi');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password minimal 6 karakter');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        const hasSession = await register(email, password, name);
        if (!hasSession) {
          setVerificationSent(true);
          setLoading(false);
          return;
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan. Silakan periksa kredensial Anda.');
    } finally {
      if (error || verificationSent) {
          setLoading(false);
      } else {
        setTimeout(() => setLoading(false), 2000); 
      }
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-brand-50 z-0"></div>
        <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-white/50 text-center relative z-10 animate-fade-in">
          <div className="mx-auto h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Cek Email Anda</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            Kami telah mengirimkan tautan konfirmasi ke <strong className="text-slate-900">{email}</strong>. 
            Silakan klik tautan tersebut untuk mengaktifkan akun Anda.
          </p>
          <Button 
            onClick={() => {
              setVerificationSent(false);
              setIsLogin(true);
            }} 
            className="w-full"
            variant="secondary"
          >
            Kembali ke Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4">
      {/* Abstract Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-200/40 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '1s'}}></div>
      </div>

      <div className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50 relative z-10 animate-fade-in transition-all">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-brand-500 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <BookOpen size={20} />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight font-serif italic">Jurnal Refleksi</span>
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isLogin ? 'Selamat Datang' : 'Mulai Menulis'}
          </h2>
          <p className="mt-3 text-slate-500">
            {isLogin 
              ? 'Ruang aman untuk pikiran dan perasaan Anda.' 
              : 'Daftarkan diri untuk perjalanan mindfulness.'}
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="animate-slide-up">
              <Input
                id="name"
                type="text"
                label="Nama Lengkap"
                placeholder="Misal: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full flex justify-center gap-2 group" 
              size="lg" 
              isLoading={loading}
              variant="gradient"
            >
              {isLogin ? 'Masuk' : 'Buat Akun'} 
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </Button>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setEmail('');
                setPassword('');
                setName('');
              }}
              className="text-sm text-slate-500 hover:text-brand-600 transition-colors font-medium"
            >
              {isLogin ? (
                <>Belum punya akun? <span className="underline decoration-slate-300 underline-offset-4 hover:decoration-brand-500">Daftar sekarang</span></>
              ) : (
                <>Sudah punya akun? <span className="underline decoration-slate-300 underline-offset-4 hover:decoration-brand-500">Masuk di sini</span></>
              )}
            </button>
          </div>
        </form>
      </div>
      
      {/* Footer / Credits */}
      <div className="absolute bottom-6 text-slate-400 text-xs flex items-center gap-1 z-20">
        <Sparkles size={12} />
        <span>
          Powered by <a href="https://t.me/produkdigitalgratisann" target="_blank" rel="noopener noreferrer" className="hover:text-brand-600 transition-colors font-medium">t.me/produkdigitalgratisann</a>
        </span>
      </div>
    </div>
  );
};

export default AuthForm;