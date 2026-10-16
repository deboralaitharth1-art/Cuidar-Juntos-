import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-md w-[90%] pointer-events-auto transition-all animate-bounce-subtle">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border text-sm font-medium ${
        type === 'success'
          ? 'bg-emerald-900 text-white border-emerald-700 shadow-emerald-950/20'
          : type === 'error'
          ? 'bg-rose-900 text-white border-rose-700 shadow-rose-950/20'
          : 'bg-slate-900 text-white border-slate-700 shadow-slate-950/20'
      }`}>
        {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />}
        {type === 'error' && <AlertCircle className="w-5 h-5 text-rose-300 shrink-0" />}
        {type === 'info' && <Info className="w-5 h-5 text-sky-300 shrink-0" />}
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-xs uppercase tracking-wider opacity-80 hover:opacity-100 ml-2 py-1 px-1.5"
        >
          OK
        </button>
      </div>
    </div>
  );
};
