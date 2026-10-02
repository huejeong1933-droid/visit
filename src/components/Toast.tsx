import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ id, type, title, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />,
  };

  const borders = {
    success: 'border-emerald-200 bg-emerald-50/95 text-emerald-950',
    error: 'border-rose-200 bg-rose-50/95 text-rose-950',
    info: 'border-indigo-200 bg-indigo-50/95 text-indigo-950',
  };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-top-2 max-w-md w-full ${borders[type]}`}
    >
      {icons[type]}
      <div className="flex-1 min-w-0">
        {title && <p className="font-semibold text-sm leading-tight mb-0.5">{title}</p>}
        <p className="text-sm leading-relaxed opacity-90">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors -mr-1 -mt-1"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
