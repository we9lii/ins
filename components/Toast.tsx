import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`
        pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border transform transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in
        ${toast.type === 'success'
          ? 'bg-white dark:bg-slate-800 border-emerald-100 dark:border-emerald-800 text-slate-700 dark:text-slate-200'
          : 'bg-white dark:bg-slate-800 border-rose-100 dark:border-rose-800 text-slate-700 dark:text-slate-200'
        }
      `}
    >
      <div className={`
        p-1.5 rounded-full 
        ${toast.type === 'success'
          ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
          : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
        }
      `}>
        {toast.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
      </div>

      <p className="text-sm font-medium">{toast.message}</p>

      <button
        onClick={() => onDismiss(toast.id)}
        className="mr-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};