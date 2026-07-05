import { useEffect } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyleClass = () => {
    switch (type) {
      case 'success':
        return 'border-l-4 border-emerald-500 bg-slate-900/90 text-slate-100';
      case 'error':
        return 'border-l-4 border-rose-500 bg-slate-900/90 text-slate-100';
      case 'info':
      default:
        return 'border-l-4 border-sky-500 bg-slate-900/90 text-slate-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 rounded-lg shadow-2xl border border-white/10 backdrop-blur-xl min-w-[280px] max-w-[400px] transition-all duration-300 animate-slide-in-right ${getStyleClass()}`}
      role="alert"
    >
      {getIcon()}
      <div className="flex-1 text-sm font-medium pr-2 leading-snug">{message}</div>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-full hover:bg-white/5"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
