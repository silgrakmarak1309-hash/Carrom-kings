import React, { useState } from 'react';
import { GameMode, OnlineRoomSession } from '../types';
import { Bot, Puzzle, Trophy, Target, User, Volume2, VolumeX, HelpCircle, Play, Globe, Zap, Coins, Plus, Gift, Sparkles, Palette } from 'lucide-react';
import { AdBanner } from './AdBanner';
import { OnlineMatchmakingModal } from './OnlineMatchmakingModal';
import { CrownLogo } from './CrownLogo';

interface DashboardProps {
  profileImage: string | null;
  profileName: string;
  playerCoins: number;
  onDeductCoins: (amount: number) => void;
  onAddCoins: (amount: number) => void;
  isMuted: boolean;
  unlockedPuzzleLevel: number;
  aiDifficulty?: 'easy' | 'medium' | 'hard';
  onSelectDifficulty?: (diff: 'easy' | 'medium' | 'hard') => void;
  onOpenProfile: () => void;
  onOpenRules: () => void;
  onOpenCustomize: () => void;
  onToggleMute: () => void;
  onSelectMode: (mode: GameMode, puzzleLevelId?: number, onlineSession?: OnlineRoomSession) => void;
  onOpenPuzzleSelector: () => void;
  onOpenDailyReward?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  profileImage,
  profileName,
  playerCoins,
  onDeductCoins,
  onAddCoins,
  isMuted,
  unlockedPuzzleLevel,
  aiDifficulty = 'medium',
  onSelectDifficulty,
  onOpenProfile,
  onOpenRules,
  onOpenCustomize,
  onToggleMute,
  onSelectMode,
  onOpenPuzzleSelector,
  onOpenDailyReward,
}) => {
  const [isOnlineModalOpen, setIsOnlineModalOpen] = useState<boolean>(false);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-between min-h-screen pt-4 pb-24 px-4 text-slate-100">
      {/* Top Navigation / Header Bar */}
      <header className="w-full flex items-center justify-between bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-2xl px-3 sm:px-4 py-2.5 shadow-xl mb-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3">
          <CrownLogo size="md" />
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wider text-amber-400 leading-none flex items-center gap-1.5">
              <span>CARROM KING</span>
            </h1>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Pro Carrom Board
            </p>
          </div>
        </div>

        {/* Action Controls & Profile / Coins */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Customize / Shop Button */}
          <button
            type="button"
            onClick={onOpenCustomize}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-900/30 transition-transform active:scale-95 cursor-pointer hover:brightness-110 border border-purple-400/40"
            title="Customize Board & Piece Styles"
          >
            <Palette className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">CUSTOMIZE</span>
            <span className="sm:hidden">SHOP</span>
          </button>

          {/* Daily Reward Bonus Button */}
          <button
            type="button"
            onClick={onOpenDailyReward}
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer hover:brightness-110"
            title="Claim Free Daily Login Reward"
          >
            <Gift className="w-4 h-4 text-slate-950 animate-bounce" />
            <span className="hidden sm:inline">DAILY BONUS</span>
            <span className="sm:hidden">BONUS</span>
          </button>

          {/* Player Coins Wallet Display */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-950/80 border border-amber-500/50 rounded-xl text-amber-300 font-black text-xs shadow-md">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>{playerCoins}</span>
            <button
              onClick={() => onAddCoins(50)}
              className="ml-1 p-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-md transition-transform active:scale-90 cursor-pointer"
              title="Add Free +50 Coins"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
            </button>
          </div>

          {/* Mute Button */}
          <button
            type="button"
            onClick={onToggleMute}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-transform active:scale-95 cursor-pointer border border-slate-700/50"
            title="Toggle Mute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />}
          </button>

          {/* Rules Button */}
          <button
            type="button"
            onClick={onOpenRules}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 transition-transform active:scale-95 cursor-pointer border border-slate-700/50"
            title="Rules & How to Play"
          >
            <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Profile Avatar Button */}
          <button
            type="button"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 sm:gap-2 pl-1.5 pr-2.5 py-1.5 bg-slate-800 hover:bg-slate-700/90 border border-amber-500/40 rounded-xl transition-transform active:scale-95 cursor-pointer shadow-md"
            title="Player Profile"
          >
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-amber-400 overflow-hidden bg-slate-900 flex items-center justify-center shrink-0">
              {profileImage ? (
                <img src={profileImage} alt="Profile Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-3.5 h-3.5 text-amber-400" />
              )}
            </div>
            <span className="text-xs font-bold text-slate-200 max-w-[70px] sm:max-w-[90px] truncate">
              {profileName || 'Player 1'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Hero Banner / Intro */}
      <div className="w-full text-center my-2 flex flex-col items-center">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Ultimate Carrom Experience
          </div>
          <button
            type="button"
            onClick={onOpenDailyReward}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 hover:text-amber-200 text-xs font-black uppercase tracking-wider transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          >
            <Gift className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span>Daily Bonus 🎁 (Free Coins)</span>
          </button>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-100 mb-1">
          SELECT <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">GAME MODE</span>
        </h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Choose a mode below to start playing immediately. Compete against AI, local friends, trick shot puzzles, or online opponents!
        </p>
      </div>

      {/* 1. 2x2 GRID LAYOUT FOR FIRST 4 MODES */}
      <div className="w-full grid grid-cols-2 gap-2.5 sm:gap-4 my-3">
        {/* MODE 1: VS COMPUTER */}
        <div className="relative group bg-slate-900/90 border border-emerald-500/40 hover:border-emerald-400 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-950/40">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 sm:p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <Bot className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-950/90 text-amber-300 border border-amber-600/60 rounded-full flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                {aiDifficulty === 'easy' ? '+20 Coins' : aiDifficulty === 'hard' ? '+50 Coins' : '+35 Coins'}
              </span>
            </div>

            <div className="mb-2">
              <h3 className="text-sm sm:text-lg font-black text-emerald-300 mb-0.5 tracking-tight">
                1. VS COMPUTER
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-tight">
                Win matches to earn coins based on difficulty.
              </p>
            </div>

            {/* AI Difficulty Selector Buttons */}
            <div className="mb-3 flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => onSelectDifficulty?.('easy')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-colors ${
                  aiDifficulty === 'easy'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                EASY (+20)
              </button>
              <button
                type="button"
                onClick={() => onSelectDifficulty?.('medium')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-colors ${
                  aiDifficulty === 'medium'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                MED (+35)
              </button>
              <button
                type="button"
                onClick={() => onSelectDifficulty?.('hard')}
                className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-colors ${
                  aiDifficulty === 'hard'
                    ? 'bg-amber-400 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                HARD (+50)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectMode('vs_cpu')}
            className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY VS COMPUTER</span>
          </button>
        </div>

        {/* MODE 2: 2 PLAYERS (PASS & PLAY) */}
        <div className="relative group bg-slate-900/90 border border-amber-500/40 hover:border-amber-400 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-amber-950/40">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 sm:p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Trophy className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-950/90 text-amber-300 border border-amber-600/60 rounded-full flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                Prize: +30 Coins
              </span>
            </div>

            <div className="mb-3">
              <h3 className="text-sm sm:text-lg font-black text-amber-300 mb-0.5 tracking-tight">
                2. 2 PLAYERS
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-tight line-clamp-2">
                Classic offline match. Winner earns +30 Coins!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectMode('classic')}
            className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>PLAY 2 PLAYERS</span>
          </button>
        </div>

        {/* MODE 3: PUZZLE MODE */}
        <div className="relative group bg-slate-900/90 border border-purple-500/40 hover:border-purple-400 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-purple-950/40">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 sm:p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Puzzle className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 bg-amber-950/90 text-amber-300 border border-amber-600/60 rounded-full flex items-center gap-1">
                <Coins className="w-3 h-3 text-amber-400" />
                +30 Coins / Level
              </span>
            </div>

            <div className="mb-3">
              <h3 className="text-sm sm:text-lg font-black text-purple-300 mb-0.5 tracking-tight">
                3. PUZZLE MODE
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-tight line-clamp-2">
                20 trick shot levels. Earn +30 Coins per cleared level!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onSelectMode('puzzle', unlockedPuzzleLevel)}
              className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1 shadow-lg transition-transform active:scale-95 cursor-pointer truncate"
            >
              <Play className="w-3.5 h-3.5 fill-current shrink-0" />
              <span>PLAY PUZZLE</span>
            </button>
            <button
              type="button"
              onClick={onOpenPuzzleSelector}
              className="p-2 sm:p-2.5 bg-purple-950/80 hover:bg-purple-900/80 border border-purple-600/60 text-purple-300 rounded-xl transition-transform active:scale-95 cursor-pointer shrink-0"
              title="Select Level"
            >
              <Trophy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MODE 4: FREE PRACTICE MODE */}
        <div className="relative group bg-slate-900/90 border border-blue-500/40 hover:border-blue-400 rounded-2xl p-3 sm:p-4 flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-blue-950/40">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="p-2 sm:p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
                <Target className="w-5 h-5 sm:w-7 sm:h-7" />
              </div>
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-2 py-0.5 sm:px-2.5 sm:py-1 bg-blue-950 text-blue-300 border border-blue-800 rounded-full">
                Warm Up
              </span>
            </div>

            <div className="mb-3">
              <h3 className="text-sm sm:text-lg font-black text-blue-300 mb-0.5 tracking-tight">
                4. FREE PRACTICE
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-400 leading-tight line-clamp-2">
                Unlimited shots, angles & warm-ups.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectMode('practice')}
            className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START PRACTICE</span>
          </button>
        </div>
      </div>

      {/* 2. 5TH MODE: ONLINE MULTIPLAYER (LARGE, FULL-WIDTH CARD BELOW GRID) */}
      <div className="w-full my-2 bg-gradient-to-r from-indigo-950/90 via-slate-900 to-purple-950/90 border-2 border-indigo-500/60 hover:border-indigo-400 rounded-2xl p-5 shadow-2xl transition-all duration-300 relative overflow-hidden group">
        {/* Subtle Background Glow Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3.5 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/40 shrink-0 shadow-lg relative">
              <CrownLogo size="xl" />
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-indigo-900/80 text-indigo-200 border border-indigo-600/60 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  MODE 5 • ONLINE MULTIPLAYER
                </span>
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-950/90 px-2.5 py-0.5 rounded border border-amber-600/60 flex items-center gap-1">
                  <Coins className="w-3 h-3 text-amber-400" />
                  Entry Fee: 20 Coins | Prize: 40 Coins 🏆
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-indigo-200 tracking-tight flex items-center justify-center md:justify-start gap-2">
                <span>ONLINE MULTIPLAYER</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Compete live with players worldwide! 20 Coins entry fee, winner takes the 40 Coins prize pool!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={() => setIsOnlineModalOpen(true)}
              className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-amber-500 via-indigo-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-black rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-950/60 transition-transform active:scale-95 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-current text-amber-300" />
              <span>PLAY ONLINE / MATCHMAKING</span>
            </button>
          </div>
        </div>
      </div>

      {/* ONLINE MATCHMAKING MODAL */}
      <OnlineMatchmakingModal
        isOpen={isOnlineModalOpen}
        onClose={() => setIsOnlineModalOpen(false)}
        onStartOnlineMatch={(session) => {
          onSelectMode('online', undefined, session);
        }}
        playerName={profileName}
        playerImage={profileImage}
        playerCoins={playerCoins}
        onDeductCoins={onDeductCoins}
        onAddCoins={onAddCoins}
      />

      {/* 3. FIXED HORIZONTAL AD BANNER AT VERY BOTTOM OF SCREEN */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800/80 py-1.5 px-4 flex justify-center items-center shadow-2xl backdrop-blur-md">
        <AdBanner />
      </div>
    </div>
  );
};

