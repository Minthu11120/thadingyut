import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-yellow-200/50 animate-in fade-in slide-in-from-top-4 duration-200">
      <Sparkles className="w-4 h-4 text-slate-950" />
      <span>{message}</span>
    </div>
  );
};
