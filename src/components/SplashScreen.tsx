import React, { useState, useEffect } from 'react';
import { CrownLogo } from './CrownLogo';
import { Sparkles, Shield, Trophy } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2400; // 2.4 seconds loading duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(Math.floor((elapsed / duration) * 100), 100);
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onFinish();
          }, 500); // 500ms fade transition
        }, 200);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[50000] flex flex-col items-center justify-between p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 transition-opacity duration-500 ease-out select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top Subtle Decoration */}
      <div className="w-full max-w-sm flex items-center justify-between opacity-60 text-amber-400/80 text-[11px] font-extrabold tracking-widest pt-2">
        <span className="flex items-center gap-1">
          <Shield className="w-3.5 h-3.5" /> OFFICIAL ESPORTS
        </span>
        <span className="flex items-center gap-1">
          <Trophy className="w-3.5 h-3.5" /> PRO CARROM
        </span>
      </div>

      {/* Main Center Content */}
      <div className="flex flex-col items-center justify-center text-center my-auto w-full max-w-md px-4">
        {/* Animated Golden Crown Graphic Container */}
        <div className="relative mb-6 group">
          <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 rounded-full blur-2xl animate-pulse" />
          <CrownLogo size="2xl" className="shadow-2xl shadow-amber-500/40 animate-bounce duration-1000" />
        </div>

        {/* Game Title with Golden Glow */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)] mb-1 uppercase">
          STRIKER WAR PRO
        </h1>

        <p className="text-xs sm:text-sm font-extrabold text-amber-300/80 tracking-widest uppercase mb-8 flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>PREMIUM CARROM BOARD ARENA</span>
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
        </p>

        {/* Animated Spinning Striker Graphic */}
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          {/* Rotating Outer Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: '3s' }} />
          {/* Striker Disk */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-600 border-2 border-amber-100 shadow-lg shadow-amber-500/50 flex items-center justify-center animate-pulse">
            <div className="w-6 h-6 rounded-full border border-amber-900/60 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-red-600" />
            </div>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="w-full max-w-xs space-y-2">
          <div className="flex items-center justify-between text-xs font-black text-amber-300/90 tracking-wider">
            <span>
              {progress < 30
                ? 'INITIALIZING ARENA...'
                : progress < 70
                ? 'PREPARING GOTIS & STRIKER...'
                : progress < 95
                ? 'CONNECTING TO SERVER...'
                : 'ARENA READY!'}
            </span>
            <span className="text-amber-400 font-mono text-sm">{progress}%</span>
          </div>

          <div className="w-full h-3 bg-slate-950 border border-amber-500/40 rounded-full p-0.5 shadow-inner overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-75 ease-out shadow-md shadow-amber-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="pb-2 text-[10px] font-bold text-slate-500 tracking-widest uppercase">
        © 2026 STRIKER WAR PRO MULTIPLAYER • ALL RIGHTS RESERVED
      </div>
    </div>
  );
};
