import React, { useState, useMemo } from 'react';
import { X, Search, ScrollText, Heart, Plus, Filter, Sparkles } from 'lucide-react';
import { Wish, LanternColor, LANTERN_PALETTES } from '../types.ts';
import { formatBurmeseRelativeTime } from '../utils/time.ts';
import { playSadhuSound } from '../utils/audio.ts';

interface WishesWallModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishes: Wish[];
  onOpenCreateModal: () => void;
  onLike: (id: string) => void;
  onSelectWish: (wish: Wish) => void;
}

export const WishesWallModal: React.FC<WishesWallModalProps> = ({
  isOpen,
  onClose,
  wishes,
  onOpenCreateModal,
  onLike,
  onSelectWish,
}) => {
  const [search, setSearch] = useState('');
  const [selectedColor, setSelectedColor] = useState<LanternColor | 'all'>('all');
  const [sortBy, setSortBy] = useState<'latest' | 'likes'>('latest');

  const filteredWishes = useMemo(() => {
    return wishes
      .filter((w) => {
        if (selectedColor !== 'all' && w.color !== selectedColor) return false;
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          w.name.toLowerCase().includes(q) ||
          w.text.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'likes') {
          return (b.likes || 0) - (a.likes || 0);
        }
        return b.createdAt - a.createdAt;
      });
  }, [wishes, search, selectedColor, sortBy]);

  if (!isOpen) return null;

  const handleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playSadhuSound();
    onLike(id);
  };

  const colorsList: { key: LanternColor | 'all'; label: string }[] = [
    { key: 'all', label: 'အားလုံး' },
    { key: 'gold', label: 'ရွှေဝါ' },
    { key: 'ruby', label: 'ပတ္တမြား' },
    { key: 'emerald', label: 'မြစိမ်း' },
    { key: 'violet', label: 'နီလာ' },
    { key: 'pink', label: 'ကြာပန်း' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-400 border border-amber-500/30">
              <ScrollText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-amber-300">
                ဆုတောင်းမေတ္တာလွှာများ အားလုံး ({wishes.length})
              </h2>
              <p className="text-xs text-amber-200/60">
                လူတိုင်း၏ ရည်စူးဆုတောင်းစာများကို အတူတကွ သာဓုခေါ်ဆိုနိုင်ပါသည်
              </p>
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

        {/* Search, Filter & CTA Row */}
        <div className="my-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ဆုတောင်းစာ သို့မဟုတ် အမည်ဖြင့် ရှာရန်..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800/80 border border-amber-500/20 text-xs sm:text-sm text-amber-100 placeholder-slate-400 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Sort Toggle */}
            <button
              onClick={() => setSortBy(sortBy === 'latest' ? 'likes' : 'latest')}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-amber-500/20 text-amber-200 text-xs font-medium hover:border-amber-400 transition flex items-center gap-1 shrink-0"
              title="စီစစ်ရန်"
            >
              <Filter className="w-3.5 h-3.5 text-amber-400" />
              <span>{sortBy === 'latest' ? 'နောက်ဆုံးရ' : 'လူကြိုက်အများဆုံး'}</span>
            </button>

            {/* Quick Launch CTA */}
            <button
              onClick={() => {
                onClose();
                onOpenCreateModal();
              }}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs hover:from-amber-400 hover:to-yellow-400 transition flex items-center gap-1.5 shrink-0 shadow active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">ဆုတောင်းရေးမည်</span>
              <span className="sm:hidden">ရေးမည်</span>
            </button>
          </div>

          {/* Color filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {colorsList.map(({ key, label }) => {
              const isSelected = selectedColor === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedColor(key)}
                  className={`px-2.5 py-1 rounded-lg transition shrink-0 border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-semibold shadow-sm'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-amber-200'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Wishes Cards Grid */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 py-1">
          {wishes.length === 0 ? (
            <div className="text-center py-12 text-amber-200/70 flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-amber-500/10">
                🏮
              </div>
              <h4 className="text-sm font-bold text-amber-200">ဆုတောင်းစာများ မရှိသေးပါ</h4>
              <p className="text-xs text-amber-200/60 mt-1 max-w-xs leading-relaxed">
                သီတင်းကျွတ် မင်္ဂလာအခါသမယအတွက် ပထမဆုံး ဆုတောင်းမီးပုံးကို စတင်လွှတ်တင်လိုက်ပါ
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateModal();
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs shadow-lg active:scale-95 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ပထမဆုံး မီးပုံး လွှတ်တင်မည်</span>
              </button>
            </div>
          ) : filteredWishes.length === 0 ? (
            <div className="text-center py-14 text-amber-200/50">
              <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
              <p className="text-sm font-medium">ရှာဖွေမှုနှင့် ကိုက်ညီသော ဆုတောင်းစာ မတွေ့ရှိပါ</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedColor('all');
                }}
                className="mt-2 text-xs text-amber-400 underline underline-offset-4"
              >
                မူလအနေအထားသို့ ပြန်ထားမည်
              </button>
            </div>
          ) : (
            filteredWishes.map((item) => {
              const palette = LANTERN_PALETTES[item.color] || LANTERN_PALETTES.gold;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onClose();
                    onSelectWish(item);
                  }}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-800/70 border border-slate-700/60 hover:border-amber-400/50 transition flex flex-col justify-between gap-2.5 shadow-md hover:bg-slate-800 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    {/* Small Colored Lantern Icon */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow"
                      style={{
                        backgroundColor: `${palette.mid}20`,
                        border: `1px solid ${palette.border}`,
                      }}
                    >
                      <span
                        className="w-2.5 h-3.5 rounded-full"
                        style={{ backgroundColor: palette.mid }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-xs sm:text-sm font-bold text-amber-200 truncate">
                          {item.name || 'အမည်မဖော်လိုသူ'}
                        </h4>
                        <span className="text-[10px] text-amber-200/40 shrink-0 ml-2">
                          {formatBurmeseRelativeTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed break-words">
                        {item.text}
                      </p>
                    </div>
                  </div>

                  {/* Footer with tag & Sadhu button */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                    <span className="text-[11px] text-amber-300/70 font-medium">
                      {palette.name} မီးပုံး
                    </span>

                    <button
                      onClick={(e) => handleLike(e, item.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-amber-500/20 text-rose-300 hover:text-rose-100 hover:border-rose-400 transition active:scale-95 text-xs cursor-pointer shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/20" />
                      <span className="font-bold">{item.likes || 0}</span>
                      <span>သာဓု</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
