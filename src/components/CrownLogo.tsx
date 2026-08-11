import React, { useState } from 'react';
import { Crown } from 'lucide-react';

const goldenCrownImg = '/src/assets/images/golden_esports_crown_1786409733578.jpg';

interface CrownLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const CrownLogo: React.FC<CrownLogoProps> = ({ className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  const containerClasses = {
    sm: 'w-7 h-7 p-0.5',
    md: 'w-10 h-10 p-1',
    lg: 'w-14 h-14 p-1',
    xl: 'w-20 h-20 p-1.5',
    '2xl': 'w-28 h-28 p-2',
  };

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-2xl bg-gradient-to-br from-amber-200 via-amber-400 to-amber-700 shadow-xl shadow-amber-500/30 border border-amber-300/90 overflow-hidden group ${containerClasses[size]} ${className}`}
    >
      <div className="w-full h-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center relative shadow-inner">
        {!imgError ? (
          <img
            src={goldenCrownImg}
            alt="Golden Esports Crown"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center relative">
            <Crown className={`text-amber-100 fill-amber-300 stroke-[2] drop-shadow-md ${iconClasses[size]}`} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-amber-300/20 pointer-events-none" />
      </div>
    </div>
  );
};

