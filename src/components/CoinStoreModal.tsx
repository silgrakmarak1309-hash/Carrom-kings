import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, Tv, Gift, Sparkles, X, ShoppingBag, Zap, Check } from 'lucide-react';
import { audio } from '../utils/audio';
import { showInterstitialAd } from '../utils/admob';

interface CoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerCoins: number;
  onAddCoins: (amount: number) => void;
  onOpenDailyReward?: () => void;
}

export const CoinStoreModal: React.FC<CoinStoreModalProps> = ({
  isOpen,
  onClose,
  playerCoins,
  onAddCoins,
  onOpenDailyReward
}) => {
  const [purchasedPack, setPurchasedPack] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = (action: () => void) => (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (e.type === 'touchend') {
      e.preventDefault();
    }
    action();
  };

  const handleWatchAdReward = () => {
    showInterstitialAd(() => {
      audio.playVictorySound();
      onAddCoins(100);
      setPurchasedPack('Watch Ad (+100 Coins)');
      setTimeout(() => setPurchasedPack(null), 3000);
    });
  };

  const handleBuyPack = (packName: string, amount: number) => {
    audio.playVictorySound();
    onAddCoins(amount);
    setPurchasedPack(`${packName} (+${amount.toLocaleString()} Coins)`);
    setTimeout(() => setPurchasedPack(null), 3000);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[20000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 pointer-events-auto select-none"
        style={{ pointerEvents: 'auto' }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 350, damping: 22 }}
          className="relative w-full max-w-md bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 shadow-[0_0_60px_rgba(251,191,36,0.25)] text-slate-100 flex flex-col overflow-hidden pointer-events-auto z-[20000]"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Top Background Glow */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/20 via-amber-500/5 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={handleAction(onClose)}
            onTouchEnd={handleAction(onClose)}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-400 hover:text-white rounded-full z-30 transition-transform active:scale-90 cursor-pointer pointer-events-auto touch-manipulation"
            style={{ pointerEvents: 'auto' }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="relative z-10 text-center mb-5">
            <div className="inline-flex p-3 bg-amber-500/20 border border-amber-400/50 rounded-2xl mb-2 text-amber-400 shadow-lg">
              <Coins className="w-8 h-8 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-amber-400">
              COIN STORE
            </h2>
            <p className="text-xs text-slate-300 font-semibold mt-0.5">
              Get Free Coins or Claim Coin Packs to customize board & pieces!
            </p>

            {/* Current Balance Display */}
            <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 bg-amber-950/90 border border-amber-500/60 rounded-full text-amber-300 font-black text-sm shadow-inner">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Wallet Balance:</span>
              <span className="text-amber-200 text-base">{playerCoins.toLocaleString()}</span>
            </div>
          </div>

          {/* Purchased Toast Success Notification */}
          {purchasedPack && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2.5 bg-emerald-950/90 border border-emerald-500/80 rounded-xl text-center text-xs font-black text-emerald-300 flex items-center justify-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Claimed {purchasedPack}! Added to wallet.</span>
            </motion.div>
          )}

          {/* Coin Offers List */}
          <div className="relative z-10 space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {/* OFFER 1: WATCH AD (+100 COINS) */}
            <div className="p-3 bg-slate-950/80 border border-amber-500/40 hover:border-amber-400 rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-amber-300">WATCH SHORT AD</span>
                    <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-[10px] font-black rounded-full uppercase border border-amber-500/30">
                      FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Watch a video ad to receive +100 bonus coins
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAction(handleWatchAdReward)}
                onTouchEnd={handleAction(handleWatchAdReward)}
                className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 pointer-events-auto touch-manipulation flex items-center gap-1"
                style={{ pointerEvents: 'auto' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>+100 Coins</span>
              </button>
            </div>

            {/* OFFER 2: DAILY REWARD (+150 - +1000 COINS) */}
            {onOpenDailyReward && (
              <div className="p-3 bg-slate-950/80 border border-purple-500/40 hover:border-purple-400 rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-400">
                    <Gift className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-purple-300">DAILY BONUS REWARD</span>
                      <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-black rounded-full uppercase border border-purple-500/30">
                        DAILY
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Claim daily login streaks up to +1,000 Coins
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAction(() => {
                    onClose();
                    onOpenDailyReward();
                  })}
                  onTouchEnd={handleAction(() => {
                    onClose();
                    onOpenDailyReward();
                  })}
                  className="px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 pointer-events-auto touch-manipulation flex items-center gap-1"
                  style={{ pointerEvents: 'auto' }}
                >
                  <Gift className="w-3.5 h-3.5" />
                  <span>Claim</span>
                </button>
              </div>
            )}

            <div className="py-1 flex items-center justify-center gap-2">
              <div className="h-px bg-slate-800 flex-1" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                COIN PACKS
              </span>
              <div className="h-px bg-slate-800 flex-1" />
            </div>

            {/* PACK 1: STARTER PACK (1,000 COINS) */}
            <div className="p-3 bg-slate-950/80 border border-amber-500/30 hover:border-amber-400 rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-amber-200">1,000 COINS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Starter coin bundle
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAction(() => handleBuyPack('Starter Pack', 1000))}
                onTouchEnd={handleAction(() => handleBuyPack('Starter Pack', 1000))}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 pointer-events-auto touch-manipulation flex items-center gap-1"
                style={{ pointerEvents: 'auto' }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Claim Pack</span>
              </button>
            </div>

            {/* PACK 2: PRO PACK (5,000 COINS) */}
            <div className="p-3 bg-slate-950/80 border border-indigo-500/40 hover:border-indigo-400 rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black rounded-bl-lg uppercase">
                POPULAR
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-500/20 border border-indigo-500/40 rounded-xl text-indigo-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-indigo-200">5,000 COINS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Pro carrom player pack
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAction(() => handleBuyPack('Pro Pack', 5000))}
                onTouchEnd={handleAction(() => handleBuyPack('Pro Pack', 5000))}
                className="px-3.5 py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 pointer-events-auto touch-manipulation flex items-center gap-1"
                style={{ pointerEvents: 'auto' }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Claim Pack</span>
              </button>
            </div>

            {/* PACK 3: KING PACK (10,000 COINS) */}
            <div className="p-3 bg-slate-950/80 border border-emerald-500/50 hover:border-emerald-400 rounded-2xl flex items-center justify-between gap-3 shadow-md transition-all relative overflow-hidden">
              <div className="absolute top-0 right-0 px-2 py-0.5 bg-emerald-500 text-slate-950 text-[9px] font-black rounded-bl-lg uppercase">
                BEST VALUE
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                  <Coins className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-emerald-300">10,000 COINS</span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-medium">
                    King size ultimate wallet pack
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAction(() => handleBuyPack('King Pack', 10000))}
                onTouchEnd={handleAction(() => handleBuyPack('King Pack', 10000))}
                className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer shrink-0 pointer-events-auto touch-manipulation flex items-center gap-1"
                style={{ pointerEvents: 'auto' }}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Claim Pack</span>
              </button>
            </div>
          </div>

          {/* Close Action */}
          <div className="relative z-10 pt-4 mt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={handleAction(onClose)}
              onTouchEnd={handleAction(onClose)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center transition-transform active:scale-95 cursor-pointer border border-slate-700/80 pointer-events-auto touch-manipulation"
              style={{ pointerEvents: 'auto' }}
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
