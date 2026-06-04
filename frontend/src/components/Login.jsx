import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Activity, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please provide both username and password.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      login(data.user, data.accessToken, data.refreshToken);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShortcutLogin = (userType) => {
    setUsername(userType);
    setPassword('password'); 
    setError('');
  };

  return (
    <div id="login-container" className="flex items-center justify-center min-h-[85vh] px-4 select-none">
      <motion.div
        id="login-card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-md"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="p-3 bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 rounded-2xl mb-4 border border-teal-100/30 dark:border-teal-900/30">
            <Activity className="h-8 w-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight font-sans">
            CareTrack Clinic
          </h2>
          <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-wider">
            {t('clinicalRecordSys')}
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/45 text-red-750 dark:text-red-400 rounded-xl text-xs flex items-start gap-2.5 leading-relaxed"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0 transition-all mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-600">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-sans">
              Staff Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-505">
                <User className="h-4.5 w-4.5" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. admin"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl placeholder-slate-400 focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 font-sans">
              Security Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-slate-505">
                <Lock className="h-4.5 w-4.5" />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-850 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl placeholder-slate-400 focus:outline-hidden focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 transition font-sans text-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-800 hover:bg-slate-900 dark:bg-teal-650 dark:hover:bg-teal-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 select-none shadow-xs mt-3.5"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100 dark:border-slate-800"></span>
          </div>
          <div className="relative flex justify-center text-[10px] text-slate-400 uppercase tracking-widest font-mono">
            <span className="bg-white dark:bg-slate-900 px-3 font-semibold">
              Quick login options
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleShortcutLogin('admin')}
            className={`flex flex-col items-center justify-center p-2.5 border rounded-xl text-center transition hover:bg-slate-50/80 dark:hover:bg-slate-850 cursor-pointer ${
              username === 'admin' 
                ? 'border-teal-500 dark:border-teal-400 bg-teal-50/30 dark:bg-teal-950/20' 
                : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-105">Admin</span>
            {/* <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{t('fullAccessOption') || 'Full Access'}</span> */}
          </button>

          <button
            onClick={() => handleShortcutLogin('clinician')}
            className={`flex flex-col items-center justify-center p-2.5 border rounded-xl text-center transition hover:bg-slate-50/80 dark:hover:bg-slate-850 cursor-pointer ${
              username === 'clinician' 
                ? 'border-teal-500 dark:border-teal-400 bg-teal-50/30 dark:bg-teal-950/20' 
                : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-105">Clinician</span>
            {/* <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{t('recordsUpdate') || 'Clinical'}</span> */}
          </button>

          <button
            onClick={() => handleShortcutLogin('receptionist')}
            className={`flex flex-col items-center justify-center p-2.5 border rounded-xl text-center transition hover:bg-slate-50/80 dark:hover:bg-slate-850 cursor-pointer ${
              username === 'receptionist' 
                ? 'border-teal-500 dark:border-teal-400 bg-teal-50/30 dark:bg-teal-950/20' 
                : 'border-slate-100 dark:border-slate-800'
            }`}
          >
            <span className="text-[10px] font-bold text-slate-800 dark:text-slate-105">Reception</span>
            {/* <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{t('registrations') || 'Bording'}</span> */}
          </button>
        </div>

        <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[10px] text-teal-605 dark:text-teal-400 bg-teal-50/40 dark:bg-teal-950/10 py-2 px-3 rounded-lg border border-teal-50 dark:border-teal-900/35 font-sans leading-relaxed">
          <Sparkles className="h-3 w-3 shrink-0" />
          <span>Click any role above to automatically preset fields.</span>
        </div>
      </motion.div>
    </div>
  );
}
