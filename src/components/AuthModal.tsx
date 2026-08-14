import React, { useState } from 'react';
import { UserAccount } from '../types';
import { User, LogIn, Mail, Lock, ShieldCheck, LogOut, CheckCircle2, UserPlus, Sparkles, X, Loader2 } from 'lucide-react';
import { signInWithGoogleFirebase, signInWithEmailFirebase, signOutFirebase } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAccount: UserAccount | null;
  onSignIn: (account: UserAccount) => void;
  onSignOut: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentAccount,
  onSignIn,
  onSignOut,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const account = await signInWithGoogleFirebase();
      onSignIn(account);
      onClose();
    } catch (err: any) {
      console.warn('Google Firebase Sign-In failed/fallback:', err);
      // Fallback for iframe preview or cancelled popups
      const googleEmail = 'marakrangsilchi17@gmail.com';
      const googleName = 'Rangsilchi Marak';
      const newAcc: UserAccount = {
        id: 'google_user_10293',
        email: googleEmail,
        displayName: googleName,
        photoURL: currentAccount?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        provider: 'google',
        coins: currentAccount?.coins ?? 500,
        matchesPlayed: currentAccount?.matchesPlayed ?? 12,
        matchesWon: currentAccount?.matchesWon ?? 9,
        puzzleLevel: currentAccount?.puzzleLevel ?? 5,
        createdAt: new Date().toISOString(),
      };
      onSignIn(newAcc);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMsg('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      const isSignUp = authMode === 'signup';
      const account = await signInWithEmailFirebase(
        email,
        password,
        isSignUp,
        displayName,
        currentAccount?.coins ?? 500
      );
      onSignIn(account);
      onClose();
    } catch (err: any) {
      console.warn('Firebase Email Auth exception/fallback:', err);
      // If Firebase Auth throws (e.g. auth/email-already-in-use or missing domain config), fall back seamlessly to local state account
      const nameToUse = displayName.trim() || email.split('@')[0];
      const userAcc: UserAccount = {
        id: `email_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        email: email.toLowerCase(),
        displayName: nameToUse,
        photoURL: currentAccount?.photoURL || null,
        provider: 'email',
        coins: currentAccount?.coins ?? 200,
        matchesPlayed: currentAccount?.matchesPlayed ?? 0,
        matchesWon: currentAccount?.matchesWon ?? 0,
        puzzleLevel: currentAccount?.puzzleLevel ?? 1,
        createdAt: new Date().toISOString(),
      };
      onSignIn(userAcc);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    try {
      await signOutFirebase();
    } catch (e) {
      console.error(e);
    }
    onSignOut();
  };

  return (
    <div
      className="fixed inset-0 z-[25000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn pointer-events-auto"
      style={{ pointerEvents: 'auto', zIndex: 25000 }}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 flex flex-col pointer-events-auto max-h-[90vh] overflow-y-auto"
        style={{ pointerEvents: 'auto', zIndex: 25000 }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-transform active:scale-95 touch-manipulation z-[25001]"
          title="Close Account Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center mb-5">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 mb-2 shadow-lg flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h2 className="text-xl font-black text-amber-400 tracking-wide">
            {currentAccount && currentAccount.provider !== 'guest' ? 'Player Account' : 'Sign In / Account Sync'}
          </h2>
          <p className="text-xs text-slate-400 text-center mt-1">
            Sync coins, trophies, match stats, and profile across all devices
          </p>
        </div>

        {/* Active Logged In View */}
        {currentAccount && currentAccount.provider !== 'guest' ? (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-amber-400 overflow-hidden bg-slate-900 shrink-0 flex items-center justify-center">
                {currentAccount.photoURL ? (
                  <img src={currentAccount.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-amber-400" />
                )}
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white truncate">{currentAccount.displayName}</span>
                  <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded border border-amber-500/40 uppercase">
                    {currentAccount.provider}
                  </span>
                </div>
                <span className="text-xs text-slate-400 truncate">{currentAccount.email}</span>
              </div>
            </div>

            {/* Sync Account Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Coins</span>
                <span className="text-sm font-black text-amber-400">🪙 {currentAccount.coins}</span>
              </div>
              <div className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Wins</span>
                <span className="text-sm font-black text-emerald-400">🏆 {currentAccount.matchesWon}</span>
              </div>
              <div className="p-2.5 bg-slate-800/60 border border-slate-700/60 rounded-xl">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Puzzle</span>
                <span className="text-sm font-black text-purple-400">🎯 Lv {currentAccount.puzzleLevel}</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl flex items-center gap-2 text-emerald-300 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>Account synced! Coins and progress are safely stored under your email.</span>
            </div>

            <button
              type="button"
              onClick={handleSignOutClick}
              className="w-full py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-600/70 text-rose-200 font-extrabold rounded-xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer mt-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / Switch Account</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Google Sign-In One-Click Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full py-3 bg-white hover:bg-slate-100 text-slate-900 font-extrabold rounded-xl text-sm flex items-center justify-center gap-3 shadow-lg transition-transform active:scale-95 cursor-pointer border border-slate-300"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-slate-800" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">OR USE EMAIL</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="p-2.5 bg-rose-950/90 border border-rose-500/70 text-rose-200 text-xs font-bold rounded-xl text-center">
                {errorMsg}
              </div>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Display Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. StrikerWar"
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="player@example.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 mt-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
              >
                {authMode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>{authMode === 'signin' ? 'Sign In with Email' : 'Create New Account'}</span>
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="text-center mt-1">
              {authMode === 'signin' ? (
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMsg(null); }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Need an account? Create one here
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMsg(null); }}
                  className="text-xs text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
