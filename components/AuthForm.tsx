'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setMessage(''); setLoading(true);
    try {
      if (isLogin) { await signInWithEmail(email, password); }
      else { await signUpWithEmail(email, password); setMessage('Bitte bestätige deine E-Mail-Adresse.'); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #fdf2f8 50%, #ecfeff 100%)' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full" style={{ backgroundColor: '#C4B5FD', opacity: 0.25, filter: 'blur(80px)' }} />
        <div className="absolute top-1/4 -left-24 w-[400px] h-[400px] rounded-full" style={{ backgroundColor: '#FF6B9D', opacity: 0.25, filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[450px] h-[450px] rounded-full" style={{ backgroundColor: '#67E8F9', opacity: 0.25, filter: 'blur(80px)' }} />
      </div>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/80 rounded-3xl shadow-xl p-8 border border-white/50">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-500 mx-auto mb-4 flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">MindFlow</h1>
            <p className="text-gray-500 mt-1">Intelligente Aufgabenverwaltung</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${isLogin ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Anmelden</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-xl font-medium transition-all ${!isLogin ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Registrieren</button>
          </div>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none" placeholder="deine@email.de" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Passwort</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50" style={{ background: 'linear-gradient(135deg, #FF6B9D, #C4B5FD)' }}>
              {loading ? 'Laden...' : isLogin ? 'Anmelden' : 'Registrieren'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-200" /><span className="text-gray-400 text-sm">oder</span><div className="flex-1 h-px bg-gray-200" />
          </div>

          <button onClick={() => signInWithGoogle()} className="w-full py-3 rounded-xl font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Mit Google fortfahren
          </button>
        </div>
        <p className="text-center mt-6 text-gray-500 text-sm">© 2026 MindFlow</p>
      </div>
    </div>
  );
}
