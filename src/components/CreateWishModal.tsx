import React, { useState } from 'react';
import { X, Sparkles, Flame, Send } from 'lucide-react';
import { LanternColor, LANTERN_PALETTES, QUICK_BLESSINGS, Wish } from '../types.ts';
import { playChimeSound, playLaunchSound } from '../utils/audio.ts';

interface CreateWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (wish: { name: string; text: string; color: LanternColor }) => Promise<Wish | null>;
}

export const CreateWishModal: React.FC<CreateWishModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [color, setColor] = useState<LanternColor>('gold');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectChip = (blessing: string) => {
    setText(blessing);
    setError(null);
    playChimeSound(680, 0.4);
  };

  const handleColorChange = (c: LanternColor) => {
    setColor(c);
    playChimeSound(620, 0.3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('ကျေးဇူးပြု၍ ဆုတောင်းစာ ရေးသားပေးပါ');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const res = await onSubmit({
        name: name.trim() || 'အမည်မဖော်လိုသူ',
        text: trimmed,
        color,
      });

      if (res) {
        playLaunchSound();
        setName('');
        setText('');
        setColor('gold');
        onClose();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ဆုတောင်းမီးပုံး လွှတ်တင်ရာတွင် အမှားအယွင်းရှိပါသည်';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const colorsList: LanternColor[] = ['gold', 'ruby', 'emerald', 'violet', 'pink'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏮</span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300">ဆုတောင်းမီးပုံးပျံ လွှတ်တင်ခြင်း</h2>
              <p className="text-[11px] text-amber-200/60">သင့်ဆုတောင်းစာကို လူတိုင်း မြင်တွေ့နိုင်ပါသည်</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-amber-200 hover:bg-slate-800 transition"
            title="ပိတ်မည်"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 space-y-4 flex-1">
          {/* Name input */}
          <div>
            <label className="block text-xs font-medium text-amber-200/80 mb-1">
              သင့်အမည် သို့မဟုတ် ချစ်စနိုးနာမည် (မထည့်လည်းရပါသည်)
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="ဥပမာ - မောင်မောင်၊ သုတ၊ အမည်မဖော်လိုသူ"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-amber-500/30 text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm"
            />
          </div>

          {/* Textarea */}
          <div>
            <label className="block text-xs font-medium text-amber-200/80 mb-1">
              ဆုတောင်းစကား / မေတ္တာပို့သလွှာ <span className="text-amber-400">*</span>
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                if (error) setError(null);
              }}
              maxLength={280}
              placeholder="သီတင်းကျွတ်မှာ မိမိတောင့်တသော ဆန္ဒ သို့မဟုတ် ချစ်ရသူများအတွက် မေတ္တာဆုမွန် ရေးသားပါ..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-amber-500/30 text-amber-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm resize-none"
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-amber-200/50">
              <span>မေတ္တာစေတနာဖြင့် ရေးသားပါ</span>
              <span>{text.length} / 280</span>
            </div>
          </div>

          {/* Quick blessing chips */}
          <div>
            <label className="block text-xs font-medium text-amber-200/80 mb-1.5 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>အမြန်ရွေးချယ်ရန် မေတ္တာပို့ဆုတောင်းများ</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_BLESSINGS.map((blessing, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectChip(blessing)}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/60 border border-amber-500/20 text-amber-200/90 transition text-left active:scale-95"
                >
                  {blessing}
                </button>
              ))}
            </div>
          </div>

          {/* Color choices */}
          <div>
            <label className="block text-xs font-medium text-amber-200/80 mb-2">
              မီးပုံးအရောင် ရွေးချယ်ပါ
            </label>
            <div className="grid grid-cols-5 gap-2">
              {colorsList.map((c) => {
                const palette = LANTERN_PALETTES[c];
                const isSelected = color === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => handleColorChange(c)}
                    className={`p-2 rounded-xl flex flex-col items-center gap-1 border-2 transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/15 shadow-md shadow-amber-500/20'
                        : 'border-transparent bg-slate-800/80 hover:bg-slate-700/60'
                    }`}
                  >
                    <span
                      className="w-6 h-6 rounded-full shadow"
                      style={{
                        background: `linear-gradient(to top, ${palette.edge}, ${palette.mid}, ${palette.core})`,
                        boxShadow: `0 0 10px ${palette.mid}`,
                      }}
                    />
                    <span className="text-[10px] text-amber-200">{palette.name.replace('ရောင်', '')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="mt-5 pt-3 border-t border-amber-500/20">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-slate-950 font-bold text-base shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Flame className="w-5 h-5 text-amber-950 animate-spin" />
                  <span>ကောင်းကင်သို့ လွှတ်တင်နေပါသည်...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-slate-950" />
                  <span>ကောင်းကင်သို့ လွှတ်တင်မည်</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
