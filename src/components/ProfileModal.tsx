import React, { useRef } from 'react';
import { User, Upload, X, Trash2, Camera, ShieldCheck, LogIn } from 'lucide-react';
import { UserAccount } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileImage: string | null;
  onUpdateProfileImage: (image: string | null) => void;
  profileName: string;
  onUpdateProfileName: (name: string) => void;
  currentAccount?: UserAccount | null;
  onOpenAuthModal?: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profileImage,
  onUpdateProfileImage,
  profileName,
  onUpdateProfileName,
  currentAccount,
  onOpenAuthModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          onUpdateProfileImage(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[25000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn pointer-events-auto"
      style={{ pointerEvents: 'auto', zIndex: 25000 }}
    >
      <div
        className="relative w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6 flex flex-col items-center pointer-events-auto max-h-[90vh] overflow-y-auto z-[25000]"
        style={{ pointerEvents: 'auto', zIndex: 25000 }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          onTouchEnd={(e) => { e.preventDefault(); onClose(); }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg cursor-pointer transition-transform active:scale-95 touch-manipulation z-[25001]"
          title="Close Profile"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-black text-amber-400 mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Player Profile
        </h2>

        {/* Account Sync Status Banner */}
        <div className="w-full mb-4 p-2.5 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className={`w-4 h-4 shrink-0 ${currentAccount && currentAccount.provider !== 'guest' ? 'text-emerald-400' : 'text-amber-400'}`} />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-black text-slate-200 truncate">
                {currentAccount && currentAccount.provider !== 'guest'
                  ? currentAccount.email
                  : 'Guest Profile (Not Synced)'}
              </span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">
                {currentAccount && currentAccount.provider !== 'guest'
                  ? `Signed in via ${currentAccount.provider}`
                  : 'Local Storage'}
              </span>
            </div>
          </div>
          {onOpenAuthModal && (
            <button
              type="button"
              onClick={() => { onClose(); onOpenAuthModal(); }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-[10px] font-black rounded-lg shrink-0 flex items-center gap-1 cursor-pointer transition-transform active:scale-95"
            >
              <LogIn className="w-3 h-3" />
              <span>{currentAccount && currentAccount.provider !== 'guest' ? 'Account' : 'Sign In'}</span>
            </button>
          )}
        </div>

        {/* Circular Avatar Container */}
        <div className="relative mb-4 group">
          <div className="w-24 h-24 rounded-full border-4 border-amber-400/80 shadow-xl overflow-hidden bg-slate-800 flex items-center justify-center">
            {profileImage ? (
              <img src={profileImage} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-12 h-12 text-slate-500" />
            )}
          </div>

          {/* Quick Camera Overlay Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-full shadow-lg transition-transform active:scale-90 cursor-pointer"
            title="Upload Profile Image"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Player Name Field */}
        <div className="w-full mb-4">
          <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 text-left">
            Player Name
          </label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => onUpdateProfileName(e.target.value)}
            placeholder="Enter your name"
            maxLength={18}
            className="w-full px-3.5 py-2 bg-slate-800/90 border border-slate-700 rounded-xl text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Upload / Remove Actions */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Profile Image</span>
          </button>

          {profileImage && (
            <button
              type="button"
              onClick={() => onUpdateProfileImage(null)}
              className="w-full py-1.5 bg-slate-800 hover:bg-rose-950/60 text-rose-400 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700/60 hover:border-rose-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Photo</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs mt-1 transition-transform active:scale-95 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
