export type LanternColor = 'gold' | 'ruby' | 'emerald' | 'violet' | 'pink';

export interface Wish {
  id: string;
  name: string;
  text: string;
  color: LanternColor;
  likes: number;
  createdAt: number;
}

export interface LanternPalette {
  name: string;
  core: string;
  mid: string;
  edge: string;
  glow: string;
  border: string;
}

export const LANTERN_PALETTES: Record<LanternColor, LanternPalette> = {
  gold: {
    name: 'ရွှေဝါရောင်',
    core: '#fef08a',
    mid: '#f59e0b',
    edge: '#b45309',
    glow: 'rgba(245, 158, 11, 0.45)',
    border: '#fde047',
  },
  ruby: {
    name: 'ပတ္တမြားရောင်',
    core: '#fecdd3',
    mid: '#f43f5e',
    edge: '#9f1239',
    glow: 'rgba(244, 63, 94, 0.45)',
    border: '#fda4af',
  },
  emerald: {
    name: 'မြစိမ်းရောင်',
    core: '#ccfbf1',
    mid: '#10b981',
    edge: '#065f46',
    glow: 'rgba(16, 185, 129, 0.45)',
    border: '#6ee7b7',
  },
  violet: {
    name: 'နီလာရောင်',
    core: '#f3e8ff',
    mid: '#a855f7',
    edge: '#6b21a8',
    glow: 'rgba(168, 85, 247, 0.45)',
    border: '#d8b4fe',
  },
  pink: {
    name: 'ကြာပန်းရောင်',
    core: '#fce7f3',
    mid: '#ec4899',
    edge: '#9d174d',
    glow: 'rgba(236, 72, 153, 0.45)',
    border: '#f9a8d4',
  },
};

export const QUICK_BLESSINGS = [
  'မိဘဘိုးဘွားများနှင့် ဆရာသမားများ သက်ရှည်ကျန်းမာပါစေ',
  'မိသားစုအားလုံး ကိုယ်စိတ်နှစ်ဖြာ ကျန်းမာချမ်းသာကြပါစေ',
  'မြန်မာပြည်ကြီး အမြန်ဆုံး အေးချမ်းသာယာပါစေ',
  'ကြံစည်သမျှ ကောင်းမြတ်သော လိုအင်ဆန္ဒများ အားလုံးပြည့်ဝပါစေ',
  'ဝေးကွာနေသော ချစ်ရသူများ ဘေးရန်ကင်းပြီး အမြန်ဆုံး ဆုံစည်းနိုင်ပါစေ',
  'ပညာရေး၊ စီးပွားရေး အလုပ်အကိုင်တိုင်း တိုးတက်အောင်မြင်ပါစေ',
  'လောကသူ ကမ္ဘာသားအားလုံး ဘေးအန္တရာယ်ကင်းဝေးကြပါစေ',
];
