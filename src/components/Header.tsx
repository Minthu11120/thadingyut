import React from 'react';
import { Volume2, VolumeX, BookHeart, Radio } from 'lucide-react';
import { playChimeSound } from '../utils/audio.ts';
import { OilLampIcon } from './OilLampIcon.tsx';

interface HeaderProps {
  wishCount: number;
  isMuted: boolean;
  onToggleAudio: () => void;
  onOpenWishesWall: () => void;
  isLiveConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  wishCount,
  isMuted,
  onToggleAudio,
  onOpenWishesWall,
  isLiveConnected,
}) => {
  const handleAudioClick = () => {
    onToggleAudio();
    if (isMuted) {
      playChimeSound(660, 1.8);
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 sm:px-6 py-3.5 bg-gradient-to-b from-slate-950/85 via-slate-900/40 to-transparent backdrop-blur-[2px]">
      {/* Brand & Festival Info */}
      <div className="flex items-center gap-3">
        {/* Myanmar Traditional Oil Lamp (ဆီမီးခွက်) Logo */}
        <div
          title="သီတင်းကျွတ် ပူဇော်ဆီမီးခွက်"
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-amber-950/80 to-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0 border border-amber-400/50 relative group overflow-hidden"
        >
          {/* Subtle warm backlight glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-amber-300/10 pointer-events-none" />
          <OilLampIcon className="w-7 h-7 sm:w-8 sm:h-8 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg md:text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-400">
              သီတင်းကျွတ် မီးပုံးပျံ ဆုတောင်းလွှာ
            </h1>
            {isLiveConnected && (
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-medium">
                <Radio className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
                တိုက်ရိုက်ချိတ်ဆက်
              </span>
            )}
          </div>
          <p className="text-xs text-amber-200/70 hidden sm:block">
            မီးပုံးလေးများကို နှိပ်၍ အခြားသူများ၏ မေတ္တာဆုတောင်းစာများကို ဖတ်ရှုနိုင်ပါသည်
          </p>
        </div>
      </div>

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Chime Bell Audio Mute/Unmute */}
        <button
          onClick={handleAudioClick}
          title={isMuted ? 'ခေါင်းလောင်းသံ ဖွင့်မည်' : 'ခေါင်းလောင်းသံ ပိတ်မည်'}
          className="p-2 sm:px-3 sm:py-2 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:bg-slate-800 transition active:scale-95 shadow-md flex items-center gap-1.5 text-xs cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-slate-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Wishes Wall Modal Trigger */}
        <button
          onClick={onOpenWishesWall}
          className="px-3.5 py-2 rounded-full bg-slate-900/80 border border-amber-500/30 text-amber-300 hover:text-amber-100 hover:bg-slate-800 transition active:scale-95 shadow-md flex items-center gap-2 text-xs sm:text-sm font-medium cursor-pointer"
        >
          <BookHeart className="w-4 h-4 text-amber-400" />
          <span>ဆုတောင်းစာများ ({wishCount})</span>
        </button>
      </div>
    </header>
  );
};
