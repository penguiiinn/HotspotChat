import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Siren,
  HeartPulse,
  ShieldAlert,
  Flame,
  CheckCircle2,
  Clock,
  Radio,
  Users,
  Check
} from 'lucide-react';
import type { EmergencyAlert } from '../../types';

interface EmergencyDetailModalProps {
  isOpen: boolean;
  alert: EmergencyAlert | null;
  onClose: () => void;
  onSimulateAck?: (alertId: string, contactId: string) => void;
  onRequestResolve?: (alert: EmergencyAlert) => void;
}

export const EmergencyDetailModal: React.FC<EmergencyDetailModalProps> = ({
  isOpen,
  alert,
  onClose,
  onSimulateAck,
  onRequestResolve,
}) => {
  if (!isOpen || !alert) return null;

  const typeConfig = {
    medical: { title: 'Medical Emergency', icon: HeartPulse, color: 'text-red-400', badge: 'bg-red-500/20 text-red-400 border-red-500/30' },
    security: { title: 'Security Alert', icon: ShieldAlert, color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    accident: { title: 'Accident / Hazard', icon: Flame, color: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    general: { title: 'General Emergency', icon: Siren, color: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  };

  const currentType = typeConfig[alert.type];
  const IconComponent = currentType.icon;

  const ackCount = alert.recipients.filter((r) => r.status === 'acknowledged').length;
  const totalCount = alert.recipients.length;
  const percent = totalCount > 0 ? Math.round((ackCount / totalCount) * 100) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-2xl bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl shadow-black/90 overflow-hidden flex flex-col max-h-[90vh] z-10 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#141824]">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${currentType.badge}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white tracking-wide">
                    Emergency Incident Record
                  </h3>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    alert.status === 'active'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {alert.status === 'active' ? '● ACTIVE BROADCAST' : '✓ RESOLVED'}
                  </span>
                </div>
                <p className="text-xs font-mono text-slate-400">
                  ID: {alert.id} • {alert.timestamp} ({alert.date})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Sender and Classification Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Sender Card */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex items-center gap-3">
                <img
                  src={alert.senderAvatar}
                  alt={alert.senderName}
                  className="w-10 h-10 rounded-full object-cover border border-white/10"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                    Transmitting Node
                  </span>
                  <p className="text-sm font-bold text-white truncate">{alert.senderName}</p>
                  <p className="text-xs font-mono text-orange-400">{alert.senderIp}</p>
                </div>
              </div>

              {/* Status & Timestamps Card */}
              <div className="p-3.5 rounded-xl bg-black/30 border border-white/[0.06] flex flex-col justify-between text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Incident Type:</span>
                  <span className={`font-bold uppercase ${currentType.color}`}>{alert.type}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Broadcast Time:</span>
                  <span className="text-slate-300">{alert.timestamp} ({alert.date})</span>
                </div>
                {alert.resolvedTimestamp && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Resolved Time:</span>
                    <span>{alert.resolvedTimestamp}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Message Payload */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span>Broadcast Transmission Message</span>
              </div>
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-slate-200 text-sm leading-relaxed font-medium">
                {alert.message}
              </div>
            </div>

            {/* Recipient Acknowledgement Progress */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-slate-300 font-bold uppercase tracking-wider">
                  <Users className="w-4 h-4 text-orange-400" />
                  <span>Mesh Acknowledgement Status</span>
                </span>
                <span className="text-emerald-400 font-bold">
                  {ackCount} of {totalCount} Acknowledged ({percent}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${percent}%` }}
                />
              </div>

              {/* Recipients List */}
              <div className="border border-white/[0.08] rounded-xl overflow-hidden divide-y divide-white/[0.05]">
                {alert.recipients.map((rec) => (
                  <div
                    key={rec.contactId}
                    className="p-3 bg-white/[0.01] hover:bg-white/[0.03] flex items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={rec.contactAvatar}
                        alt={rec.contactName}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{rec.contactName}</p>
                        <p className="text-[10px] font-mono text-slate-400">{rec.contactIp}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {rec.status === 'acknowledged' ? (
                        <div className="flex items-center gap-2 text-right">
                          <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                            {rec.acknowledgedAt} ({rec.latencyMs ?? 3}ms)
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            <span>ACKNOWLEDGED</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>PENDING ACK</span>
                          </span>

                          {alert.status === 'active' && onSimulateAck && (
                            <button
                              type="button"
                              onClick={() => onSimulateAck(alert.id, rec.contactId)}
                              className="px-2 py-0.5 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 hover:text-orange-300 border border-orange-500/30 text-[10px] font-mono font-medium transition-colors cursor-pointer"
                              title="Simulate this peer confirming receipt of the SOS alert"
                            >
                              Simulate ACK
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/[0.08] bg-[#141824]">
            <span className="text-xs font-mono text-slate-500">
              Direct UDP Broadcast • Protocol Port 8800
            </span>

            <div className="flex items-center gap-2.5">
              {alert.status === 'active' && onRequestResolve && (
                <button
                  type="button"
                  onClick={() => {
                    onRequestResolve(alert);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Resolve Incident</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
