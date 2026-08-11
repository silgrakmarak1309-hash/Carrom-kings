import React, { useState } from 'react';
import { GameMode } from '../types';
import { PUZZLE_LEVELS } from '../utils/carromBoardSetup';
import { Trophy, Bot, Puzzle, Target, X, Lock, CheckCircle2, ChevronLeft, Globe, Zap, Coins } from 'lucide-react';
import { CrownLogo } from './CrownLogo';

interface ModeSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: GameMode, puzzleLevelId?: number) => void;
  activeMode: GameMode;
  unlockedPuzzleLevel?: number;
  currentPuzzleLevelId?: number;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  onClose,
  onSelectMode,
  activeMode,
  unlockedPuzzleLevel = 1,
  currentPuzzleLevelId = 1
}) => {
  const [view, setView] = useState<'modes' | 'puzzles'>('modes');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl p-5 shadow-2xl text-slate-100 relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {view === 'puzzles' ? (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <button
                onClick={() => setView('modes')}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-xs font-bold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <h2 className="text-lg font-black text-purple-400 tracking-tight flex-1 text-center pr-6">
                PUZZLE LEVELS
              </h2>
            </div>
            <p className="text-xs text-slate-400 text-center mb-3">
              Unlocked: Level {unlockedPuzzleLevel} of 20
            </p>

            <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-4 sm:grid-cols-5 gap-2 my-1">
              {PUZZLE_LEVELS.map((lvl) => {
                const isUnlocked = lvl.id <= unlockedPuzzleLevel;
                const isCurrent = activeMode === 'puzzle' && currentPuzzleLevelId === lvl.id;
                const isCompleted = lvl.id < unlockedPuzzleLevel;

                return (
                  <button
                    key={lvl.id}
                    disabled={!isUnlocked}
                    onClick={() => {
                      onSelectMode('puzzle', lvl.id);
                      onClose();
                    }}
                    className={`relative flex flex-col items-center justify-between py-1.5 px-2 rounded-xl border text-xs font-bold transition-all h-16 ${
                      isCurrent
                        ? 'bg-purple-500/30 border-purple-400 text-purple-200 ring-2 ring-purple-500/50'
                        : isUnlocked
                        ? isCompleted
                          ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-purple-950/40 border-purple-600/60 text-purple-300 hover:bg-purple-900/60'
                        : 'bg-slate-800/40 border-slate-800 text-slate-600 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-black">LVL {lvl.id}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : !isUnlocked ? (
                        <Lock className="w-3 h-3 text-slate-600" />
                      ) : null}
                    </div>

                    <div className="flex items-center gap-0.5 text-[10px] font-extrabold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded-md border border-amber-500/40 w-full justify-center">
                      <Coins className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>+{lvl.id * 10}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <CrownLogo size="sm" />
              <h2 className="text-xl font-black text-amber-400 tracking-tight text-center">SELECT GAME MODE</h2>
            </div>
            <p className="text-xs text-slate-400 text-center mb-4">Choose your preferred Carrom King match mode</p>

            {/* 2x2 Grid for first 4 modes */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Mode 1 */}
              <button
                onClick={() => {
                  onSelectMode('vs_cpu');
                  onClose();
                }}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  activeMode === 'vs_cpu'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                    : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="font-black text-xs text-emerald-300">Mode 1</div>
                  </div>
                  <span className="text-[9px] font-black bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/60">
                    +20-50 Coins
                  </span>
                </div>
                <div className="font-bold text-sm">VS Computer</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Win coins based on difficulty</div>
              </button>

              {/* Mode 2 */}
              <button
                onClick={() => {
                  onSelectMode('classic');
                  onClose();
                }}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  activeMode === 'classic'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-500/20 rounded-lg text-amber-400">
                      <Trophy className="w-4 h-4" />
                    </div>
                    <div className="font-black text-xs text-amber-300">Mode 2</div>
                  </div>
                  <span className="text-[9px] font-black bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/60">
                    +30 Coins
                  </span>
                </div>
                <div className="font-bold text-sm">2 Players</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Winner earns +30 local coins</div>
              </button>

              {/* Mode 3 */}
              <button
                onClick={() => {
                  setView('puzzles');
                }}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  activeMode === 'puzzle'
                    ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                    : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-purple-500/20 rounded-lg text-purple-400">
                      <Puzzle className="w-4 h-4" />
                    </div>
                    <div className="font-black text-xs text-purple-300">Mode 3</div>
                  </div>
                  <span className="text-[9px] font-black bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/60">
                    +30/Level
                  </span>
                </div>
                <div className="font-bold text-sm">Puzzle Mode</div>
                <div className="text-[10px] text-slate-400 mt-0.5">+30 Coins per cleared level</div>
              </button>

              {/* Mode 4 */}
              <button
                onClick={() => {
                  onSelectMode('practice');
                  onClose();
                }}
                className={`flex flex-col p-3 rounded-xl border text-left transition-all ${
                  activeMode === 'practice'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                    : 'bg-slate-800/80 border-slate-700/60 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                    <Target className="w-4 h-4" />
                  </div>
                  <div className="font-black text-xs text-blue-300">Mode 4</div>
                </div>
                <div className="font-bold text-sm">Free Practice</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Warm up & test shots</div>
              </button>
            </div>

            {/* Mode 5: Full Width Online Multiplayer Card */}
            <button
              onClick={() => {
                onSelectMode('online');
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${
                activeMode === 'online'
                  ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200'
                  : 'bg-slate-800/90 border-indigo-500/50 hover:border-indigo-400 text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400 shrink-0">
                  <Globe className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-indigo-300">Mode 5</span>
                    <span className="text-[9px] font-black bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/60">
                      Entry: 20 Coins
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-indigo-200">Online Multiplayer</div>
                  <div className="text-[10px] text-slate-400">Play live online matches (40 Coins Prize Pool)</div>
                </div>
              </div>
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <Zap className="w-4 h-4 fill-current" />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

