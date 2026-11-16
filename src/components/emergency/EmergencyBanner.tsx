import React from 'react';
import { Siren, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { EmergencyAlert } from '../../types';

interface EmergencyBannerProps {
  alert: EmergencyAlert;
  onOpenCenter: () => void;
  onRequestResolve: (alert: EmergencyAlert) => void;
}

export const EmergencyBanner: React.FC<EmergencyBannerProps> = ({
  alert,
  onOpenCenter,
  onRequestResolve,
}) => {
  const ackCount = alert.recipients.filter((r) => r.status === 'acknowledged').length;
  const totalCount = alert.recipients.length;
  const percent = totalCount > 0 ? Math.round((ackCount / totalCount) * 100) : 0;

  const typeColorMap = {
    medical: 'bg-red-500/20 border-red-500/40 text-red-400',
    security: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
    accident: 'bg-orange-500/20 border-orange-500/40 text-orange-400',
    general: 'bg-rose-500/20 border-rose-500/40 text-rose-400',
  };

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-rose-950/90 border-b border-red-500/40 text-white px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg shadow-red-950/50 select-none shrink-0 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3 min-w-0">
        {/* Pulsing Siren Icon */}
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 shadow-md shadow-red-600/50 shrink-0">
          <span className="absolute -inset-1 rounded-lg bg-red-500 opacity-60 animate-ping" />
          <Siren className="w-4 h-4 text-white relative z-10 animate-pulse" />
        </div>

        <div className="min-w-0 flex items-center gap-2.5 flex-wrap">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider bg-red-500 text-white shadow-sm">
            ACTIVE SOS BROADCAST
          </span>

          <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${typeColorMap[alert.type]}`}>
            {alert.type.toUpperCase()}
          </span>

          <p className="text-xs font-medium text-slate-100 truncate max-w-xs md:max-w-md lg:max-w-lg">
            {alert.message}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* ACK Tracker */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono">
          <span className="text-slate-400">ACK:</span>
          <span className="text-emerald-400 font-bold">{ackCount}/{totalCount}</span>
          <span className="text-slate-500">({percent}%)</span>
        </div>

        {/* Quick Resolve Button */}
        <button
          onClick={() => onRequestResolve(alert)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
          title="Resolve active emergency"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Resolve</span>
        </button>

        {/* View in Emergency Center Button */}
        <button
          onClick={onOpenCenter}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-semibold transition-all cursor-pointer shadow-sm"
        >
          <span>Emergency Center</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
