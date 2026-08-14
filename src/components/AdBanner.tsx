import React, { useEffect, useState } from 'react';
import { ADMOB_CONFIG, hideBanner } from '../utils/admob';

interface AdBannerProps {
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '' }) => {
  const [hasNativeAd, setHasNativeAd] = useState<boolean>(false);

  useEffect(() => {
    try {
      if (window.WebIntoApp?.AdMob?.showBanner) {
        window.WebIntoApp.AdMob.showBanner(ADMOB_CONFIG.bannerId);
        setHasNativeAd(true);
      } else if (window.admob?.showBanner) {
        window.admob.showBanner({ adId: ADMOB_CONFIG.bannerId, position: 'BOTTOM_CENTER' });
        setHasNativeAd(true);
      } else if (window.Capacitor?.Plugins?.AdMob?.showBanner) {
        window.Capacitor.Plugins.AdMob.showBanner({
          adId: ADMOB_CONFIG.bannerId,
          position: 'BOTTOM_CENTER',
        }).catch(() => {});
        setHasNativeAd(true);
      } else if (typeof window !== 'undefined' && 'adsbygoogle' in window && Array.isArray(window.adsbygoogle)) {
        try {
          window.adsbygoogle.push({});
        } catch (err) {
          console.warn('adsbygoogle push notice:', err);
        }
      }
    } catch (e) {
      console.warn('AdBanner initialization notice:', e);
    }

    return () => {
      hideBanner();
    };
  }, []);

  if (hasNativeAd) return null;

  return (
    <div
      className={`w-full max-w-md mx-auto flex items-center justify-between px-3 min-h-[44px] bg-slate-900/80 border border-amber-500/30 rounded-xl text-center text-xs text-slate-400 z-10 pointer-events-auto shadow-md ${className}`}
    >
      <div className="flex items-center gap-2">
        <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded text-[9px] font-black uppercase">
          SPONSORED
        </span>
        <span className="text-[11px] font-bold text-slate-300">STRIKER WAR PRO CHAMPIONSHIP</span>
      </div>
      <span className="text-[10px] text-amber-400 font-extrabold flex items-center gap-1">
        <span>🏆 WIN REWARDS</span>
      </span>
    </div>
  );
};

