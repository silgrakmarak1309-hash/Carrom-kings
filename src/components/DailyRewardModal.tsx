import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Coins, Check, Sparkles, X, Trophy, Calendar, Zap, AlertCircle } from 'lucide-react';
import { CrownLogo } from './CrownLogo';

export const DAILY_REWARDS = [
  { day: 1, coins: 20, label: 'Day 1' },
  { day: 2, coins: 40, label: 'Day 2' },
  { day: 3, coins: 60, label: 'Day 3' },
  { day: 4, coins: 80, label: 'Day 4' },
  { day: 5, coins: 100, label: 'Day 5' },
  { day: 6, coins: 120, label: 'Day 6' },
  { day: 7, coins: 200, label: 'Day 7', isJackpot: true },
];

export const getDailyRewardState = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  let streakDay = 1;
  let lastClaimDate = '';

  try {
    const savedDay = localStorage.getItem('carrom_daily_streak_day');
    const savedDate = localStorage.getItem('carrom_last_claim_date');
    if (savedDay) streakDay = Math.max(1, parseInt(savedDay, 10) || 1);
    if (savedDate) lastClaimDate = savedDate;
  } catch (e) {
    console.error(e);
  }

  // Cap streak day between 1 and 7
  if (streakDay > 7) streakDay = 1;

  const isClaimedToday = lastClaimDate === todayStr;

  return {
    todayStr,
    streakDay,
    lastClaimDate,
    isClaimedToday,
  };
};

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (amount: number) => void;
  playerCoins: number;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
  playerCoins,
}) => {
  const [rewardState, setRewardState] = useState(getDailyRewardState);
  const [claimedJustNow, setClaimedJustNow] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRewardState(getDailyRewardState());
      setClaimedJustNow(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const { streakDay, isClaimedToday, todayStr } = rewardState;
  const currentReward = DAILY_REWARDS.find((r) => r.day === streakDay) || DAILY_REWARDS[0];

  const handleClaim = () => {
    if (isClaimedToday || claimedJustNow !== null) return;

    const rewardAmount = currentReward.coins;
    onClaimReward(rewardAmount);
    setClaimedJustNow(rewardAmount);

    const nextStreakDay = streakDay >= 7 ? 1 : streakDay + 1;

    try {
      localStorage.setItem('carrom_last_claim_date', todayStr);
      localStorage.setItem('carrom_daily_streak_day', nextStreakDay.toString());
    } catch (e) {
      console.error(e);
    }

    setRewardState({
      todayStr,
      streakDay: nextStreakDay,
      lastClaimDate: todayStr,
      isClaimedToday: true,
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-slate-900 border border-amber-500/50 rounded-2xl p-5 shadow-2xl text-slate-100 relative flex flex-col overflow-hidden"
        >
          {/* Subtle Golden Glow Header */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent pointer-events-none" />

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors z-20 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header & Title */}
          <div className="flex flex-col items-center text-center mb-4 z-10">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl mb-2 flex items-center justify-center shadow-lg shadow-amber-500/10 animate-bounce">
              <Gift className="w-8 h-8 text-amber-400" />
            </div>
            <h2 className="text-xl font-black text-amber-300 tracking-tight flex items-center gap-2">
              <span>DAILY LOGIN REWARDS</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Claim free coins every day to enter Online Multiplayer matches!
            </p>
          </div>

          {/* Current Wallet Balance */}
          <div className="mb-4 p-2.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs px-4">
            <span className="text-slate-400 font-bold">Your Balance:</span>
            <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-sm">
              <Coins className="w-4 h-4 text-amber-400" />
              <span>{playerCoins} Coins</span>
            </div>
          </div>

          {/* 7-Day Calendar Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-5 z-10">
            {DAILY_REWARDS.map((item) => {
              const isPast = item.day < streakDay || (isClaimedToday && item.day === (rewardState.lastClaimDate === todayStr ? (streakDay === 1 ? 7 : streakDay - 1) : streakDay));
              const isToday = item.day === (isClaimedToday ? -1 : streakDay);

              return (
                <div
                  key={item.day}
                  className={`relative flex flex-col items-center justify-between p-2 rounded-xl border transition-all ${
                    item.isJackpot ? 'col-span-2 sm:col-span-1 border-amber-400/80 bg-gradient-to-b from-amber-950/80 to-slate-900' : ''
                  } ${
                    isToday
                      ? 'bg-amber-500/25 border-amber-400 text-amber-200 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20'
                      : isPast
                      ? 'bg-slate-950/60 border-slate-800 text-slate-500 opacity-80'
                      : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase text-slate-400 mb-1">
                    {item.label}
                  </span>

                  <div className="my-1 flex items-center justify-center">
                    {item.isJackpot ? (
                      <Trophy className="w-6 h-6 text-amber-400 animate-pulse" />
                    ) : (
                      <Coins className={`w-5 h-5 ${isToday ? 'text-amber-300' : 'text-amber-500/70'}`} />
                    )}
                  </div>

                  <span className={`text-xs font-black ${item.isJackpot ? 'text-amber-300' : 'text-slate-200'}`}>
                    +{item.coins}
                  </span>

                  {isPast && (
                    <div className="absolute inset-0 bg-slate-950/70 rounded-xl flex items-center justify-center">
                      <div className="p-1 bg-emerald-500 text-slate-950 rounded-full">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Claim Button / Status */}
          <div className="z-10 flex flex-col items-center">
            {claimedJustNow !== null ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-3.5 px-4 bg-emerald-950/90 border border-emerald-500/80 rounded-xl text-center text-emerald-300 text-sm font-black flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span>SUCCESS! +{claimedJustNow} FREE COINS CLAIMED! 🎁</span>
              </motion.div>
            ) : isClaimedToday ? (
              <div className="w-full py-3 px-4 bg-slate-800/80 border border-slate-700/80 rounded-xl text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Reward Claimed Today! Come back tomorrow for Day {streakDay} (+{currentReward.coins} Coins).</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleClaim}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-sm font-black rounded-xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 transition-transform active:scale-98 cursor-pointer uppercase tracking-wider"
              >
                <Gift className="w-5 h-5" />
                <span>CLAIM DAY {streakDay} REWARD (+{currentReward.coins} COINS)</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
