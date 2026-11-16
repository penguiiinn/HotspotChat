import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  AlertTriangle,
  HeartPulse,
  ShieldAlert,
  Flame,
  Radio,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  History,
  Send,
  Sparkles,
  Zap
} from 'lucide-react';
import type { Contact, EmergencyType, EmergencyAlert } from '../../types';
import { EMERGENCY_TEMPLATES } from '../../data/dummyData';
import { playHotspotChime } from '../../hooks/useHotspotSound';
import { SosConfirmModal } from './SosConfirmModal';
import { ResolveConfirmModal } from './ResolveConfirmModal';
import { EmergencyDetailModal } from './EmergencyDetailModal';

interface EmergencyCenterViewProps {
  contacts: Contact[];
  emergencies: EmergencyAlert[];
  onTriggerSos: (type: EmergencyType, message: string) => void;
  onSimulateAck: (alertId: string, contactId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const EmergencyCenterView: React.FC<EmergencyCenterViewProps> = ({
  contacts,
  emergencies,
  onTriggerSos,
  onSimulateAck,
  onResolveAlert,
  onNotify,
}) => {
  // Form State
  const [selectedType, setSelectedType] = useState<EmergencyType>('medical');
  const [message, setMessage] = useState('');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'active' | 'resolved'>('all');

  // Modals
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [resolvingAlert, setResolvingAlert] = useState<EmergencyAlert | null>(null);
  const [detailModalAlert, setDetailModalAlert] = useState<EmergencyAlert | null>(null);

  // Active emergency (if any is active)
  const activeAlert = useMemo(() => {
    return emergencies.find((e) => e.status === 'active') || null;
  }, [emergencies]);

  // Filtered History
  const filteredEmergencies = useMemo(() => {
    return emergencies.filter((e) => {
      if (historyFilter === 'active') return e.status === 'active';
      if (historyFilter === 'resolved') return e.status === 'resolved';
      return true;
    });
  }, [emergencies, historyFilter]);

  // Handle Preset Template Click
  const handleSelectTemplate = (tpl: typeof EMERGENCY_TEMPLATES[0]) => {
    playHotspotChime('click');
    setSelectedType(tpl.type);
    setMessage(tpl.text);
    onNotify('Template Applied', `Populated ${tpl.label} text`, 'info');
  };

  // Open SOS Confirmation Modal
  const handleInitiateSos = () => {
    playHotspotChime('click');
    if (!message.trim()) {
      onNotify('Message Required', 'Please enter a description or pick a template for the SOS alert', 'info');
      return;
    }
    setIsConfirmModalOpen(true);
  };

  // Confirm and Transmit SOS
  const handleConfirmSos = () => {
    setIsConfirmModalOpen(false);
    onTriggerSos(selectedType, message.trim());
    setMessage('');
  };

  // Handle Resolve Flow
  const handleConfirmResolve = () => {
    if (!resolvingAlert) return;
    onResolveAlert(resolvingAlert.id);
    setResolvingAlert(null);
  };

  const typeConfig: Record<
    EmergencyType,
    { title: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string; border: string; bg: string; activeBg: string }
  > = {
    medical: {
      title: 'Medical Emergency',
      desc: 'Injury, health crisis, medic kit required',
      icon: HeartPulse,
      color: 'text-red-400',
      border: 'border-red-500/30',
      bg: 'hover:bg-red-500/10',
      activeBg: 'bg-red-500/20 border-red-500/50 shadow-md shadow-red-500/20',
    },
    security: {
      title: 'Security Alert',
      desc: 'Perimeter threat, trespass, physical safety',
      icon: ShieldAlert,
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      bg: 'hover:bg-amber-500/10',
      activeBg: 'bg-amber-500/20 border-amber-500/50 shadow-md shadow-amber-500/20',
    },
    accident: {
      title: 'Accident / Hazard',
      desc: 'Vehicle collision, fire, equipment failure',
      icon: Flame,
      color: 'text-orange-400',
      border: 'border-orange-500/30',
      bg: 'hover:bg-orange-500/10',
      activeBg: 'bg-orange-500/20 border-orange-500/50 shadow-md shadow-orange-500/20',
    },
    general: {
      title: 'General Evac / SOS',
      desc: 'Unclassified crisis, disaster, evacuation',
      icon: Siren,
      color: 'text-rose-400',
      border: 'border-rose-500/30',
      bg: 'hover:bg-rose-500/10',
      activeBg: 'bg-rose-500/20 border-rose-500/50 shadow-md shadow-rose-500/20',
    },
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0B0E17] text-white overflow-hidden select-none">
      {/* Top Header / Status Strip */}
      <div className="h-14 px-6 border-b border-white/[0.08] bg-[#101420] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 shadow-md shadow-red-500/10">
            <Siren className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white tracking-wide">
                Emergency SOS Broadcast Center
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 font-bold uppercase">
                UDP 8800
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Offline Mesh Emergency Alert & Acknowledgement Protocol
            </p>
          </div>
        </div>

        {/* Reachable Recipients Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">Mesh Reachable:</span>
            <span className="text-emerald-400 font-bold">{contacts.length} Connected Nodes</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs font-mono text-slate-400">
            <Radio className="w-3.5 h-3.5 text-orange-400" />
            <span>Subnet: 192.168.43.255</span>
          </div>
        </div>
      </div>

      {/* Main Scrollable Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* SECTION A: ACTIVE EMERGENCY LIVE MONITOR (if active) */}
        <AnimatePresence>
          {activeAlert && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-red-950/70 via-red-900/40 to-[#160E18] border-2 border-red-500/50 shadow-2xl shadow-red-950/80 space-y-5"
            >
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-red-500/20">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center shadow-lg shadow-red-600/60 shrink-0">
                    <span className="absolute -inset-1 rounded-2xl bg-red-500 opacity-75 animate-ping" />
                    <Siren className="w-6 h-6 text-white relative z-10 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500 text-white">
                        BROADCAST IN PROGRESS
                      </span>
                      <span className="text-xs font-mono text-red-300 font-semibold uppercase">
                        {activeAlert.type} ALERT
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {activeAlert.title || 'Emergency Assistance Broadcast'}
                    </h3>
                    <p className="text-xs font-mono text-slate-400">
                      Initiated at {activeAlert.timestamp} by {activeAlert.senderName} ({activeAlert.senderIp})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setDetailModalAlert(activeAlert)}
                    className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    View Node Details
                  </button>

                  <button
                    onClick={() => setResolvingAlert(activeAlert)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Resolve Emergency</span>
                  </button>
                </div>
              </div>

              {/* Message Payload */}
              <div className="p-4 rounded-xl bg-black/40 border border-red-500/30 text-sm font-medium text-red-100 leading-relaxed">
                "{activeAlert.message}"
              </div>

              {/* Acknowledgement Status Bar */}
              {(() => {
                const acks = activeAlert.recipients.filter((r) => r.status === 'acknowledged').length;
                const total = activeAlert.recipients.length;
                const pct = total > 0 ? Math.round((acks / total) * 100) : 0;

                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="flex items-center gap-1.5 text-slate-300 font-bold uppercase">
                        <Users className="w-4 h-4 text-orange-400" />
                        <span>Mesh Recipient Acknowledgements</span>
                      </span>
                      <span className="text-emerald-400 font-bold">
                        {acks} of {total} Nodes Confirmed ({pct}%)
                      </span>
                    </div>

                    <div className="w-full h-2.5 rounded-full bg-black/50 overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-300 shadow-sm shadow-emerald-400/50"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {/* Live Recipient Chips */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                      {activeAlert.recipients.map((rec) => (
                        <div
                          key={rec.contactId}
                          className="p-2.5 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
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

                          <div className="shrink-0">
                            {rec.status === 'acknowledged' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>ACK ({rec.acknowledgedAt})</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onSimulateAck(activeAlert.id, rec.contactId)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 transition-colors cursor-pointer"
                                title="Click to simulate recipient receiving and acknowledging alert"
                              >
                                <Clock className="w-3 h-3 animate-spin" />
                                <span>Simulate ACK</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* SECTION B: TRIGGER EMERGENCY SOS COMPOSER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form & SOS Action Button (8 Cols) */}
          <div className="lg:col-span-8 p-5 md:p-6 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>Transmit New Emergency SOS</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Broadcast instant high-priority distress signal to all reachable mesh peers.
                </p>
              </div>

              <span className="text-[10px] font-mono text-slate-400 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/5">
                Target: {contacts.length} Reachable Nodes
              </span>
            </div>

            {/* 1. Emergency Classification Selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                1. Select Emergency Type
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(Object.keys(typeConfig) as EmergencyType[]).map((typeKey) => {
                  const cfg = typeConfig[typeKey];
                  const Icon = cfg.icon;
                  const isSelected = selectedType === typeKey;

                  return (
                    <button
                      key={typeKey}
                      type="button"
                      onClick={() => {
                        playHotspotChime('click');
                        setSelectedType(typeKey);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? cfg.activeBg
                          : `bg-white/[0.02] border-white/10 ${cfg.bg} text-slate-300`
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-black/40 shrink-0 ${cfg.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {cfg.title}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {cfg.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Quick Presets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Quick Templates</span>
                </label>
                <span className="text-[10px] text-slate-500 font-mono">Click to populate</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {EMERGENCY_TEMPLATES.map((tpl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/10 border border-white/10 text-[11px] text-slate-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Message Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                  2. Emergency Description / Incident Details
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {message.length}/300 chars
                </span>
              </div>

              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 300))}
                rows={3}
                placeholder="State your exact situation, node location/landmarks, and required aid..."
                className="w-full p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500/60 focus:ring-1 focus:ring-red-500/50 transition-all font-sans resize-none"
              />
            </div>

            {/* 4. Action Button with Radar Pulse */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleInitiateSos}
                className="relative w-full py-4 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.99] text-white text-sm font-extrabold uppercase tracking-wider shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 transition-all cursor-pointer group"
              >
                <div className="p-1 rounded-lg bg-black/30">
                  <Siren className="w-5 h-5 text-white animate-pulse" />
                </div>
                <span>BROADCAST EMERGENCY SOS ({contacts.length} NODES)</span>
                <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-[11px] font-mono text-slate-500 text-center mt-2 flex items-center justify-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-red-400" />
                <span>Requires safety confirmation modal before transmission.</span>
              </p>
            </div>
          </div>

          {/* Right Column: Mesh Health & Reachable Nodes Card (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* System Status Card */}
            <div className="p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mesh Readiness</span>
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/30">
                  READY
                </span>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Emergency Protocol:</span>
                  <span className="text-slate-200 font-bold">P2P-SOS v1.4</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Broadcast Port:</span>
                  <span className="text-orange-400 font-bold">UDP 8800</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Active Alerts:</span>
                  <span className={activeAlert ? 'text-red-400 font-bold animate-pulse' : 'text-slate-400'}>
                    {activeAlert ? '1 BROADCAST ACTIVE' : '0 (Nominal)'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Reachable Peers:</span>
                  <span className="text-emerald-400 font-bold">{contacts.length} / {contacts.length}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1.5 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300">How SOS Works Offline:</p>
                <p className="leading-relaxed text-slate-400">
                  Emergency packets bypass chat routing and flood the local Wi-Fi beacon so every peer within 150m is alerted instantly without internet.
                </p>
              </div>
            </div>

            {/* Available Nodes Preview */}
            <div className="p-5 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-orange-400" />
                  <span>Target Mesh Peers</span>
                </span>
                <span className="text-emerald-400 font-bold">{contacts.length}</span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {contacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={c.avatar} alt={c.displayName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-200 text-xs truncate">{c.displayName}</p>
                        <p className="font-mono text-[10px] text-slate-500">{c.ip}</p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 shrink-0">
                      <Zap className="w-2.5 h-2.5" />
                      <span>{c.pingMs}ms</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION C: EMERGENCY HISTORY */}
        <div className="p-5 md:p-6 rounded-2xl bg-[#11151F] border border-white/[0.08] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/5 text-slate-300">
                <History className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Emergency Broadcast Log History</h3>
                <p className="text-xs text-slate-400">
                  Permanent record of local distress transmissions and peer responses.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-xl border border-white/10 text-xs font-medium">
              <button
                type="button"
                onClick={() => setHistoryFilter('all')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'all'
                    ? 'bg-orange-500/20 text-orange-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({emergencies.length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('active')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'active'
                    ? 'bg-red-500/20 text-red-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Active ({emergencies.filter((e) => e.status === 'active').length})
              </button>
              <button
                type="button"
                onClick={() => setHistoryFilter('resolved')}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  historyFilter === 'resolved'
                    ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Resolved ({emergencies.filter((e) => e.status === 'resolved').length})
              </button>
            </div>
          </div>

          {/* History List */}
          {filteredEmergencies.length === 0 ? (
            <div className="p-8 text-center text-slate-500 space-y-2">
              <ShieldCheck className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-mono">No emergency records match the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredEmergencies.map((alert) => {
                const ackCount = alert.recipients.filter((r) => r.status === 'acknowledged').length;
                const totalCount = alert.recipients.length;
                const isItemActive = alert.status === 'active';

                return (
                  <div
                    key={alert.id}
                    onClick={() => setDetailModalAlert(alert)}
                    className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/15 transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`p-2.5 rounded-xl shrink-0 ${
                        isItemActive
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : 'bg-white/5 text-slate-400 border border-white/10'
                      }`}>
                        <Siren className="w-5 h-5" />
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isItemActive
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {isItemActive ? '● ACTIVE' : '✓ RESOLVED'}
                          </span>

                          <span className="text-xs font-bold text-white uppercase font-mono">
                            {alert.type} EMERGENCY
                          </span>

                          <span className="text-xs text-slate-500 font-mono">
                            • {alert.timestamp} ({alert.date})
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 font-medium line-clamp-1 group-hover:text-white transition-colors">
                          {alert.message}
                        </p>

                        <p className="text-[11px] font-mono text-slate-500">
                          Sender: {alert.senderName} ({alert.senderIp})
                        </p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <div className="text-right font-mono text-xs">
                        <p className="text-emerald-400 font-bold">{ackCount}/{totalCount} ACKs</p>
                        <p className="text-[10px] text-slate-500">
                          {isItemActive ? 'In Progress' : `Resolved at ${alert.resolvedTimestamp || 'N/A'}`}
                        </p>
                      </div>

                      {isItemActive && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setResolvingAlert(alert);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}

                      <div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-orange-500/20 group-hover:text-orange-400 text-slate-400 transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modals */}
      <SosConfirmModal
        isOpen={isConfirmModalOpen}
        emergencyType={selectedType}
        message={message}
        recipients={contacts}
        onConfirm={handleConfirmSos}
        onCancel={() => setIsConfirmModalOpen(false)}
      />

      <ResolveConfirmModal
        isOpen={Boolean(resolvingAlert)}
        alert={resolvingAlert}
        onConfirm={handleConfirmResolve}
        onCancel={() => setResolvingAlert(null)}
      />

      <EmergencyDetailModal
        isOpen={Boolean(detailModalAlert)}
        alert={detailModalAlert}
        onClose={() => setDetailModalAlert(null)}
        onSimulateAck={onSimulateAck}
        onRequestResolve={(a) => {
          setDetailModalAlert(null);
          setResolvingAlert(a);
        }}
      />
    </div>
  );
};
