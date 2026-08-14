import React, { useState } from 'react';
import { Shield } from 'lucide-react';

const strikerWarIconImg = '/src/assets/images/striker_war_icon_1786702307517.jpg';

interface CrownLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const CrownLogo: React.FC<CrownLogoProps> = ({ className = '', size = 'md' }) => {
  const [imgError, setImgError] = useState(false);

  const containerClasses = {
    sm: 'w-8 h-8 p-0.5',
    md: 'w-11 h-11 p-0.5',
    lg: 'w-16 h-16 p-1',
    xl: 'w-24 h-24 p-1.5',
    '2xl': 'w-32 h-32 p-2',
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
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-500 to-amber-800 shadow-xl shadow-amber-600/40 border-2 border-amber-400/90 overflow-hidden group ${containerClasses[size]} ${className}`}
    >
      <div className="w-full h-full rounded-full overflow-hidden bg-slate-950 flex items-center justify-center relative shadow-inner">
        {!imgError ? (
          <img
            src={strikerWarIconImg}
            alt="Striker War Logo"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 rounded-full"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-600 via-red-800 to-slate-950 flex items-center justify-center relative">
            <Shield className={`text-amber-100 fill-amber-400 stroke-[2] drop-shadow-md ${iconClasses[size]}`} />
          </div>
        )}
        <div className="absolute inset-0 rounded-full bg-gradient-to-t from-slate-950/30 via-transparent to-amber-300/20 pointer-events-none" />
      </div>
    </div>
  );
};

