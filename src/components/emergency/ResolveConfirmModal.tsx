import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X, ShieldCheck } from 'lucide-react';
import type { EmergencyAlert } from '../../types';

interface ResolveConfirmModalProps {
  isOpen: boolean;
  alert: EmergencyAlert | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ResolveConfirmModal: React.FC<ResolveConfirmModalProps> = ({
  isOpen,
  alert,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !alert) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#11151F] border border-emerald-500/30 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col z-10 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-gradient-to-r from-emerald-950/60 to-[#141824]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Resolve Emergency Alert
                </h3>
                <p className="text-[11px] font-mono text-emerald-400">
                  STAND DOWN & ARCHIVE
                </p>
              </div>
            </div>

            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to resolve this emergency broadcast? This will signal all connected hotspot nodes that the incident has been safely addressed.
            </p>

            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Alert ID:</span>
                <span className="text-orange-400 font-bold">{alert.id}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Classification:</span>
                <span className="text-white font-semibold uppercase">{alert.type}</span>
              </div>
              <p className="text-xs text-slate-300 font-medium pt-1 line-clamp-2 border-t border-white/5">
                "{alert.message}"
              </p>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>
                This alert and its recipient acknowledgment logs will be preserved in your Emergency History.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08] bg-[#141824]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Resolved</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
