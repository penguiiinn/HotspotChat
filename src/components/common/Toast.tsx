import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { ToastItem } from '../../hooks/useToast';

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => {
          const icons = {
            network: <Wifi className="w-4 h-4 text-orange-400 shrink-0" />,
            success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
            warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
            info: <Info className="w-4 h-4 text-cyan-400 shrink-0" />,
          };

          const borders = {
            network: 'border-orange-500/30 bg-[#161B28]/95',
            success: 'border-emerald-500/30 bg-[#161B28]/95',
            warning: 'border-amber-500/30 bg-[#161B28]/95',
            info: 'border-cyan-500/30 bg-[#161B28]/95',
          };

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl shadow-black/40 backdrop-blur-md ${borders[toast.type]}`}
            >
              <div className="mt-0.5">{icons[toast.type]}</div>
              <div className="flex-1 pr-2">
                <p className="text-xs font-semibold text-slate-100">{toast.title}</p>
                {toast.message && (
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{toast.message}</p>
                )}
              </div>
              <button
                onClick={() => onDismiss(toast.id)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
