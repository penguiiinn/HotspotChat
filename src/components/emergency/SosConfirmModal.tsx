import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Siren,
  X,
  Radio,
  Users,
  ShieldAlert,
  Flame,
  HeartPulse
} from 'lucide-react';
import type { EmergencyType, Contact } from '../../types';

interface SosConfirmModalProps {
  isOpen: boolean;
  emergencyType: EmergencyType;
  message: string;
  recipients: Contact[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const SosConfirmModal: React.FC<SosConfirmModalProps> = ({
  isOpen,
  emergencyType,
  message,
  recipients,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const typeConfig: Record<EmergencyType, { title: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string; border: string }> = {
    medical: {
      title: 'Medical Emergency',
      icon: HeartPulse,
      color: 'text-red-400',
      bg: 'bg-red-500/15',
      border: 'border-red-500/30',
    },
    security: {
      title: 'Security Alert',
      icon: ShieldAlert,
      color: 'text-amber-400',
      bg: 'bg-amber-500/15',
      border: 'border-amber-500/30',
    },
    accident: {
      title: 'Accident / Hazard',
      icon: Flame,
      color: 'text-orange-400',
      bg: 'bg-orange-500/15',
      border: 'border-orange-500/30',
    },
    general: {
      title: 'General Emergency',
      icon: Siren,
      color: 'text-rose-400',
      bg: 'bg-rose-500/15',
      border: 'border-rose-500/30',
    },
  };

  const selectedConfig = typeConfig[emergencyType];
  const IconComponent = selectedConfig.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-lg bg-[#120F16] border border-red-500/40 rounded-2xl shadow-2xl shadow-red-950/60 overflow-hidden flex flex-col z-10 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-red-500/20 bg-gradient-to-r from-red-950/80 to-[#1A121A]">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-wide">
                  Confirm Emergency SOS Broadcast
                </h3>
                <p className="text-[11px] font-mono text-red-300">
                  CRITICAL BROADCAST TRANSMISSION
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

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* Warning Callout */}
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-xs text-red-200 leading-relaxed">
              <Radio className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <span className="font-bold text-red-100">Hotspot Mesh Broadcast Alert:</span> This will transmit UDP broadcast packets across subnet <code className="px-1 py-0.5 rounded bg-black/40 font-mono text-[11px] text-red-300">192.168.43.255:8800</code>. All connected peer nodes will immediately sound high-priority audio alerts.
              </div>
            </div>

            {/* Selected Emergency Type */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Emergency Classification
              </label>
              <div className={`flex items-center gap-2.5 p-3 rounded-xl border ${selectedConfig.bg} ${selectedConfig.border}`}>
                <IconComponent className={`w-5 h-5 ${selectedConfig.color}`} />
                <div>
                  <span className={`text-sm font-bold ${selectedConfig.color}`}>
                    {selectedConfig.title}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 ml-2">
                    PRIORITY: HIGHEST (LEVEL-1)
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency Message Payload */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Broadcast Payload Message
              </label>
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 font-medium leading-relaxed max-h-32 overflow-y-auto">
                {message || 'Emergency assistance required immediately at this node.'}
              </div>
            </div>

            {/* Intended Recipients Preview */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  <span>Target Mesh Recipients ({recipients.length} Nodes)</span>
                </span>
                <span className="text-emerald-400 font-semibold">ALL DIRECT PEERS REACHABLE</span>
              </div>

              <div className="grid grid-cols-2 gap-2 max-h-28 overflow-y-auto p-1 bg-black/20 rounded-xl border border-white/5">
                {recipients.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-white/[0.03] border border-white/5 text-xs"
                  >
                    <img src={c.avatar} alt={c.displayName} className="w-5 h-5 rounded-full object-cover shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-200 text-[11px] truncate">{c.displayName}</p>
                      <p className="font-mono text-[9px] text-slate-500">{c.ip}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08] bg-[#141219]">
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
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all cursor-pointer"
            >
              <Siren className="w-4 h-4 animate-pulse" />
              <span>Confirm & Transmit SOS</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
