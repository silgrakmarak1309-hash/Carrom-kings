import React, { useState } from 'react';
import { BoardStyle, PieceStyle } from '../types';
import { X, Palette, Check, Sparkles, Shield, CircleDot, Crown } from 'lucide-react';

interface CustomizeModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBoardStyle: BoardStyle;
  activePieceStyle: PieceStyle;
  onSelectBoardStyle: (style: BoardStyle) => void;
  onSelectPieceStyle: (style: PieceStyle) => void;
}

export const CustomizeModal: React.FC<CustomizeModalProps> = ({
  isOpen,
  onClose,
  activeBoardStyle,
  activePieceStyle,
  onSelectBoardStyle,
  onSelectPieceStyle,
}) => {
  const [activeTab, setActiveTab] = useState<'boards' | 'pieces'>('boards');

  if (!isOpen) return null;

  const boardOptions: {
    id: BoardStyle;
    title: string;
    subtitle: string;
    description: string;
    frameColor: string;
    feltColor: string;
    lineColor: string;
    accentGlow: string;
  }[] = [
    {
      id: 'classic_wood',
      title: 'Classic Natural Wood',
      subtitle: 'Traditional Teak Finish',
      description: 'Handcrafted teak frame with smooth natural beige felt and traditional crimson markings.',
      frameColor: 'bg-[#3b1f0d] border-[#633314]',
      feltColor: 'bg-[#f4e4cd]',
      lineColor: 'border-red-700',
      accentGlow: 'from-amber-700/20 to-amber-900/40',
    },
    {
      id: 'blue_pro',
      title: 'Deep Blue Professional',
      subtitle: 'Tournament Special Edition',
      description: 'Sleek navy steel frame with high-contrast tournament blue felt and electric cyan trim.',
      frameColor: 'bg-[#0f172a] border-[#1e3a8a]',
      feltColor: 'bg-[#1e40af]',
      lineColor: 'border-cyan-400',
      accentGlow: 'from-blue-600/20 to-indigo-900/40',
    },
    {
      id: 'dark_ebony',
      title: 'Dark Ebony Modern',
      subtitle: 'Luxury Onyx & Gold',
      description: 'Matte black ebony frame with dark charcoal felt and glowing metallic gold baselines.',
      frameColor: 'bg-[#09090b] border-[#27272a]',
      feltColor: 'bg-[#18181b]',
      lineColor: 'border-amber-400',
      accentGlow: 'from-amber-500/20 to-zinc-900/50',
    },
  ];

  const pieceOptions: {
    id: PieceStyle;
    title: string;
    subtitle: string;
    description: string;
    p1Color: string;
    p2Color: string;
    queenColor: string;
    strikerColor: string;
  }[] = [
    {
      id: 'classic_ivory',
      title: 'Aged Ivory & Mahogany',
      subtitle: 'Classic Standard Set',
      description: 'Polished cream ivory for Player 1, dark mahogany wood for Player 2, and crimson red queen.',
      p1Color: 'bg-gradient-to-br from-slate-100 to-slate-300 border-slate-400 text-slate-800',
      p2Color: 'bg-gradient-to-br from-amber-900 to-slate-950 border-amber-800 text-amber-200',
      queenColor: 'bg-gradient-to-br from-rose-500 to-red-700 border-red-400 text-white',
      strikerColor: 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 border-amber-200 text-slate-950',
    },
    {
      id: 'neon_tech',
      title: 'Neon Glow Tech',
      subtitle: 'Cyberpunk Luminous Set',
      description: 'Luminous cyan for Player 1, neon purple for Player 2, and electric magenta queen with halo rings.',
      p1Color: 'bg-gradient-to-br from-cyan-300 to-cyan-600 border-cyan-200 shadow-lg shadow-cyan-500/50 text-cyan-950',
      p2Color: 'bg-gradient-to-br from-purple-400 to-purple-800 border-purple-300 shadow-lg shadow-purple-500/50 text-purple-100',
      queenColor: 'bg-gradient-to-br from-fuchsia-400 to-pink-600 border-pink-300 shadow-lg shadow-pink-500/50 text-white',
      strikerColor: 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 border-white shadow-lg shadow-amber-400/60 text-slate-950',
    },
    {
      id: 'gemstones',
      title: 'Polished Ruby & Onyx',
      subtitle: 'Royal Gemstone Edition',
      description: 'Pearl diamond white for Player 1, obsidian onyx for Player 2, and crimson ruby gem queen.',
      p1Color: 'bg-gradient-to-br from-white via-slate-100 to-slate-300 border-amber-300 text-amber-900',
      p2Color: 'bg-gradient-to-br from-slate-800 via-slate-900 to-black border-amber-500/60 text-amber-300',
      queenColor: 'bg-gradient-to-br from-rose-400 via-red-600 to-rose-950 border-rose-300 text-amber-200',
      strikerColor: 'bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-700 border-amber-200 text-slate-950',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn pointer-events-auto"
      style={{ pointerEvents: 'auto' }}
    >
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto z-[9999]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-2xl shadow-md">
              <Palette className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-wide text-amber-400 flex items-center gap-2">
                <span>BOARD & GOTI CUSTOMIZE</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h2>
              <p className="text-xs text-slate-400">Choose your favorite Carrom board & coin set theme</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-slate-800 bg-slate-950/60 px-6 pt-3 gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('boards')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl font-black text-xs transition-all cursor-pointer border-t border-x ${
              activeTab === 'boards'
                ? 'bg-slate-900 border-amber-500/50 text-amber-300 shadow-lg'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>1. BOARD STYLES ({boardOptions.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pieces')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl font-black text-xs transition-all cursor-pointer border-t border-x ${
              activeTab === 'pieces'
                ? 'bg-slate-900 border-amber-500/50 text-amber-300 shadow-lg'
                : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CircleDot className="w-4 h-4" />
            <span>2. GOTI & STRIKER ({pieceOptions.length})</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'boards' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {boardOptions.map((b) => {
                const isActive = activeBoardStyle === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => onSelectBoardStyle(b.id)}
                    className={`relative rounded-2xl border-2 p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      isActive
                        ? 'border-amber-400 bg-slate-800/90 shadow-xl shadow-amber-500/20'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Visual Preview Box */}
                    <div className="w-full aspect-square rounded-xl p-2 mb-3 relative overflow-hidden flex items-center justify-center border border-slate-700/60 shadow-inner">
                      <div className={`absolute inset-0 ${b.frameColor}`} />
                      <div className={`relative w-[82%] h-[82%] rounded-lg ${b.feltColor} flex items-center justify-center border-2 ${b.lineColor} shadow-md`}>
                        {/* Center Circle & Lines */}
                        <div className={`w-8 h-8 rounded-full border-2 ${b.lineColor} flex items-center justify-center`}>
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-black text-slate-100">{b.title}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-400 font-bold mb-1.5">{b.subtitle}</p>
                      <p className="text-[11px] text-slate-400 leading-snug">{b.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBoardStyle(b.id);
                      }}
                      className={`w-full mt-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isActive ? 'SELECTED BOARD' : 'SELECT THIS BOARD'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {pieceOptions.map((p) => {
                const isActive = activePieceStyle === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPieceStyle(p.id)}
                    className={`relative rounded-2xl border-2 p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                      isActive
                        ? 'border-amber-400 bg-slate-800/90 shadow-xl shadow-amber-500/20'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Visual Preview Box for Coins */}
                    <div className="w-full h-28 rounded-xl p-3 mb-3 bg-slate-950 border border-slate-800 flex items-center justify-around shadow-inner relative overflow-hidden">
                      {/* P1 Coin */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full border ${p.p1Color} flex items-center justify-center font-black text-[10px]`}>
                          P1
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">White</span>
                      </div>

                      {/* P2 Coin */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full border ${p.p2Color} flex items-center justify-center font-black text-[10px]`}>
                          P2
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold">Black</span>
                      </div>

                      {/* Queen Coin */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full border ${p.queenColor} flex items-center justify-center font-black text-[10px]`}>
                          <Crown className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] text-rose-400 font-bold">Queen</span>
                      </div>

                      {/* Striker */}
                      <div className="flex flex-col items-center gap-1">
                        <div className={`w-9 h-9 rounded-full border-2 ${p.strikerColor} flex items-center justify-center font-black text-[10px]`}>
                          S
                        </div>
                        <span className="text-[9px] text-amber-300 font-bold">Striker</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-sm font-black text-slate-100">{p.title}</h3>
                        {isActive && (
                          <span className="px-2 py-0.5 bg-amber-400 text-slate-950 font-black text-[9px] rounded-full flex items-center gap-0.5">
                            <Check className="w-3 h-3 stroke-[3]" /> ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-amber-400 font-bold mb-1.5">{p.subtitle}</p>
                      <p className="text-[11px] text-slate-400 leading-snug">{p.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPieceStyle(p.id);
                      }}
                      className={`w-full mt-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      {isActive ? 'SELECTED GOTI SET' : 'SELECT THIS GOTI SET'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Selected styles apply live across Single Player, Online & Puzzle modes.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
