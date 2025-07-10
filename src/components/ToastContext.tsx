"use client";
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';
export type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const toastTypeStyles = {
  success: {
    bg: 'from-green-500 to-green-600',
    icon: <CheckCircle className="w-6 h-6 text-white" />,
  },
  error: {
    bg: 'from-red-500 to-red-600',
    icon: <XCircle className="w-6 h-6 text-white" />,
  },
  info: {
    bg: 'from-[#8B7A1A] to-[#E6C866]',
    icon: <Info className="w-6 h-6 text-white" />,
  },
};

export const ToastContainer: React.FC<{ toasts: Toast[]; onClose: (id: number) => void }> = ({ toasts, onClose }) => (
  <div className="fixed right-6 z-[9999] flex flex-col gap-3" style={{ top: '5rem' }}>
    {toasts.map((toast) => {
      const style = toastTypeStyles[toast.type];
      return (
        <div
          key={toast.id}
          className={`relative flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-semibold text-base animate-fade-in-up transition-all min-w-[240px] max-w-xs bg-gradient-to-br ${style.bg}`}
          style={{ boxShadow: '0 8px 32px 0 rgba(34,34,34,0.18)' }}
        >
          <span>{style.icon}</span>
          <span className="flex-1 pr-4">{toast.message}</span>
          <button
            onClick={() => onClose(toast.id)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-white/20 transition"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      );
    })}
  </div>
); 