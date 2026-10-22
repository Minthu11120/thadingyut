import React, { useState } from 'react';
import { X, Heart, User, Clock, Copy, Check } from 'lucide-react';
import { Wish, LANTERN_PALETTES } from '../types.ts';
import { formatBurmeseRelativeTime } from '../utils/time.ts';
import { playSadhuSound } from '../utils/audio.ts';

interface WishDetailModalProps {
  wish: Wish | null;
  onClose: () => void;
  onLike: (id: string) => void;
  onShowToast: (msg: string) => void;
}

export const WishDetailModal: React.FC<WishDetailModalProps> = ({
  wish,
  onClose,
  onLike,
  onShowToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!wish) return null;

  const palette = LANTERN_PALETTES[wish.color] || LANTERN_PALETTES.gold;

  const handleLike = () => {
    playSadhuSound();
    onLike(wish.id);
    onShowToast('သာဓု... သာဓု... သာဓု ခေါ်ဆိုပါသည် ✨');
  };

  const handleCopy = () => {
    const textToCopy = `"${wish.text}"\n- ${wish.name} (သီတင်းကျွတ် မေတ္တာမီးပုံး)`;
    navigator.clipboard?.writeText(textToCopy);
    setCopied(true);
    onShowToast('ဆုတောင်းစာကို ကူးယူပြီးပါပြီ');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-400/40 rounded-3xl p-6 shadow-2xl text-center overflow-hidden">
        {/* Lantern Glow Aura Background */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ backgroundColor: palette.mid }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-amber-200 hover:bg-slate-800 transition"
          title="ပိတ်မည်"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lantern Icon Graphic */}
        <div className="mx-auto w-16 h-20 mb-3 flex flex-col items-center justify-center relative">
          <div
            className="w-12 h-14 rounded-2xl border-2 flex items-center justify-center shadow-lg relative"
            style={{
              borderColor: palette.border,
              backgroundColor: `${palette.mid}25`,
              boxShadow: `0 0 20px ${palette.glow}`,
            }}
          >
            <span
              className="w-3.5 h-4.5 rounded-full blur-[1px] flame-glow"
              style={{ backgroundColor: palette.core }}
            />
          </div>
          <div className="w-5 h-2 bg-amber-700/60 rounded-b mt-0.5" />
        </div>

        {/* Tag */}
        <span
          className="inline-block text-[11px] px-3 py-0.5 rounded-full border mb-2 font-medium"
          style={{
            backgroundColor: `${palette.mid}15`,
            borderColor: `${palette.border}50`,
            color: palette.core,
          }}
        >
          {palette.name} မီးပုံးပျံ
        </span>

        {/* Wish Content */}
        <p className="text-base sm:text-lg text-amber-50 font-medium leading-relaxed my-3 px-2 italic">
          "{wish.text}"
        </p>

        {/* Metadata */}
        <div className="pt-3 border-t border-amber-500/20 text-xs text-amber-200/80 flex items-center justify-between mt-4">
          <span className="flex items-center gap-1 font-semibold text-amber-300">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>{wish.name || 'အမည်မဖော်လိုသူ'}</span>
          </span>
          <span className="flex items-center gap-1 text-amber-200/50">
            <Clock className="w-3 h-3" />
            <span>{formatBurmeseRelativeTime(wish.createdAt)}</span>
          </span>
        </div>

        {/* Actions: Like & Copy */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <button
            onClick={handleLike}
            className="flex-1 py-2.5 px-4 rounded-full bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 text-xs sm:text-sm text-amber-100 font-medium flex items-center justify-center gap-2 transition active:scale-95 shadow cursor-pointer group"
          >
            <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-amber-300">{wish.likes || 0}</span>
            <span>သာဓုခေါ်ပါသည်</span>
          </button>

          <button
            onClick={handleCopy}
            className="p-2.5 rounded-full bg-slate-800/90 border border-amber-500/30 hover:border-amber-400 text-amber-200 hover:text-white transition active:scale-95 cursor-pointer"
            title="ဆုတောင်းစာ ကူးယူရန်"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
