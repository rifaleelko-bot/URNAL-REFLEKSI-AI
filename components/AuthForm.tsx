import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Input from './Input';
import { BookOpen, ArrowRight } from 'lucide-react';

const AuthForm: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email) {
      setError('Email wajib diisi');
      return;
    }
    
    if (!isLogin && !name) {
      setError('Nama wajib diisi');
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login(email, "Pengguna"); // Name is optional for login in this mock
      } else {
        await register(email, name);
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-brand-100">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mb-4">
            <BookOpen size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900">
            {isLogin ? 'Selamat Datang Kembali' : 'Buat Jurnal Baru'}
          </h2>
          <p className="mt-2 text-slate-600">
            {isLogin 
              ? 'Masuk untuk melanjutkan refleksi harian Anda.' 
              : 'Mulai perjalanan mindfulness Anda hari ini.'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <Input
                id="name"
                type="text"
                label="Nama Lengkap"
                placeholder="Misal: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <Input
              id="email"
              type="email"
              label="Alamat Email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full flex justify-center gap-2" size="lg" isLoading={loading}>
            {isLogin ? 'Masuk' : 'Daftar'} 
            {!loading && <ArrowRight size={18} />}
          </Button>

          <div className="text-center text-sm">
            <span className="text-slate-600">
              {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            </span>
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="ml-1 font-medium text-brand-600 hover:text-brand-500 focus:outline-none underline decoration-transparent hover:decoration-brand-500 transition-all"
            >
              {isLogin ? 'Daftar sekarang' : 'Masuk di sini'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;