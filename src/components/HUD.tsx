import React from 'react';
import { GameMode, PuzzleLevel, TurnPlayer } from '../types';
import { Volume2, VolumeX, HelpCircle, Gamepad2, User, ArrowLeft, Coins } from 'lucide-react';

interface HUDProps {
  p1Score: number;
  p2Score: number;
  p1PendingPenalties?: number;
  p2PendingPenalties?: number;
  p1Name?: string;
  p2Name: string;
  turn: TurnPlayer;
  mode: GameMode;
  queenOwner: 'none' | 'player1' | 'player2';
  queenCoverNeeded: boolean;
  isMuted: boolean;
  playerCoins?: number;
  profileImage?: string | null;
  puzzleLevel?: PuzzleLevel;
  puzzleShotsLeft?: number;
  onToggleMute: () => void;
  onOpenModeSelect: () => void;
  onOpenRules: () => void;
  onOpenProfile: () => void;
  onBackToDashboard: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  p1Score,
  p2Score,
  p1PendingPenalties = 0,
  p2PendingPenalties = 0,
  p1Name = 'Player 1',
  p2Name,
  turn,
  mode,
  queenOwner,
  queenCoverNeeded,
  isMuted,
  profileImage = null,
  puzzleLevel,
  puzzleShotsLeft = 0,
  onToggleMute,
  onOpenModeSelect,
  onOpenRules,
  onOpenProfile,
  onBackToDashboard
}) => {
  const getTurnText = () => {
    if (mode === 'practice') return 'Free Practice Mode';
    if (mode === 'puzzle') return puzzleLevel ? puzzleLevel.title : 'Puzzle Challenge';
    if (turn === 'player1') return `${p1Name}'s Turn`;
    return `${p2Name}'s Turn`;
  };

  const getQueenText = () => {
    if (mode === 'puzzle') {
      return puzzleLevel ? `Shots Left: ${puzzleShotsLeft} | Target: ${puzzleLevel.targetScore} Pts` : '';
    }
    if (queenOwner !== 'none') {
      return `Queen: ${queenOwner === 'player1' ? p1Name : p2Name}`;
    }
    if (queenCoverNeeded) {
      return 'Queen: COVER NEEDED!';
    }
    return 'Queen: ON BOARD';
  };

  const handleAction = (action: () => void) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.type === 'touchend') {
      e.preventDefault();
    }
    action();
  };

  return (
    <div
      className="w-full max-w-xl mx-auto mb-2 px-3 py-2 bg-slate-900/90 backdrop-blur-md border border-slate-700/60 rounded-xl shadow-xl flex items-center justify-between text-slate-100 gap-2 relative z-[10000] pointer-events-auto select-none"
      style={{ position: 'relative', zIndex: 10000, pointerEvents: 'auto' }}
    >
      {/* Back to Dashboard Button */}
      <button
        type="button"
        onClick={handleAction(onBackToDashboard)}
        onTouchEnd={handleAction(onBackToDashboard)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 border border-slate-700/80 font-black text-xs rounded-lg transition-transform active:scale-95 cursor-pointer shadow-sm shrink-0 pointer-events-auto relative z-[10001] touch-manipulation"
        style={{ pointerEvents: 'auto' }}
        title="Return to Dashboard"
      >
        <ArrowLeft className="w-4 h-4 text-amber-400" />
        <span className="font-extrabold tracking-wide">BACK</span>
      </button>

      {/* Player 1 Profile & Stats */}
      <div className="flex items-center gap-2 pr-2 border-r border-slate-800 relative z-[10001] pointer-events-auto">
        <button
          type="button"
          onClick={handleAction(onOpenProfile)}
          onTouchEnd={handleAction(onOpenProfile)}
          className="relative w-8 h-8 rounded-full border-2 border-amber-400 overflow-hidden bg-slate-800 flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-md cursor-pointer hover:border-amber-300 pointer-events-auto z-[10001] touch-manipulation"
          style={{ pointerEvents: 'auto' }}
          title="Open Player Profile"
        >
          {profileImage ? (
            <img src={profileImage} alt="Profile Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="w-4 h-4 text-amber-400" />
          )}
        </button>

        <div className="flex flex-col items-start hidden sm:flex">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider max-w-[65px] truncate">
            {mode === 'puzzle' ? 'Score' : p1Name}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-amber-400 leading-none">{p1Score}</span>
            {p1PendingPenalties > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-500/60 rounded text-[9px] font-black text-rose-300 animate-pulse">
                -1 Pen
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Middle Game Status */}
      <div className="flex flex-col items-center text-center">
        <div
          className={`px-3 py-0.5 rounded-full text-xs font-bold transition-all shadow-sm ${
            mode === 'puzzle'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : turn === 'player1'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {getTurnText()}
        </div>
        <span className="text-[10px] font-semibold text-slate-400 mt-1">{getQueenText()}</span>
      </div>

      {/* Player 2 / Mode Stats */}
      {mode !== 'puzzle' && (
        <div className="flex flex-col items-center px-2">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider max-w-[65px] truncate">
            {p2Name}
          </span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-extrabold text-emerald-400 leading-none">{p2Score}</span>
            {p2PendingPenalties > 0 && (
              <span className="px-1.5 py-0.5 bg-rose-950/80 border border-rose-500/60 rounded text-[9px] font-black text-rose-300 animate-pulse">
                -1 Pen
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800 relative z-[10001] pointer-events-auto">
        <button
          type="button"
          onClick={handleAction(onToggleMute)}
          onTouchEnd={handleAction(onToggleMute)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-300 transition-transform active:scale-95 cursor-pointer pointer-events-auto z-[10001] touch-manipulation"
          style={{ pointerEvents: 'auto' }}
          title="Toggle Audio"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={handleAction(onOpenRules)}
          onTouchEnd={handleAction(onOpenRules)}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-300 transition-transform active:scale-95 cursor-pointer pointer-events-auto z-[10001] touch-manipulation"
          style={{ pointerEvents: 'auto' }}
          title="Rules & How to Play"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleAction(onOpenModeSelect)}
          onTouchEnd={handleAction(onOpenModeSelect)}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-300 text-slate-950 font-black text-xs rounded-lg transition-transform active:scale-95 shadow-md cursor-pointer pointer-events-auto z-[10001] touch-manipulation"
          style={{ pointerEvents: 'auto' }}
          title="Game Modes"
        >
          <Gamepad2 className="w-4 h-4" />
          <span>GAME</span>
        </button>
      </div>
    </div>
  );
};

