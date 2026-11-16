import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { Contact } from '../../types';

interface ConnectionDetailsProps {
  contact: Contact;
}

export const ConnectionDetails: React.FC<ConnectionDetailsProps> = ({ contact }) => {
  return (
    <div className="space-y-3">
      {/* Network Matrix Card */}
      <div className="p-3.5 rounded-xl bg-[#141824] border border-white/[0.08] text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-white/5">
          <span className="flex items-center gap-1.5 font-bold text-slate-300">
            <Activity className="w-3.5 h-3.5 text-orange-400" />
            <span>P2P SOCKET STATS</span>
          </span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            DIRECT LINK
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Peer Address:</span>
          <span className="text-orange-400 font-semibold">{contact.ip}:{contact.port}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Signal Quality:</span>
          <div className="flex items-center gap-1 text-slate-200">
            <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${contact.signalStrength}%` }}
              />
            </div>
            <span>{contact.signalStrength}%</span>
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Round-Trip Latency:</span>
          <span className="text-emerald-400 font-bold">{contact.pingMs} ms</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Transport:</span>
          <span className="text-slate-300">Raw TCP Stream / UDP Beacon</span>
        </div>

        <div className="flex justify-between">
          <span className="text-slate-500">Data Transferred:</span>
          <span className="text-slate-300">{contact.dataExchanged || '14.2 MB'}</span>
        </div>
      </div>

      {/* Security & Cryptographic Fingerprint */}
      <div className="p-3.5 rounded-xl bg-[#141824] border border-white/[0.08] text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Local End-to-End Encryption</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal">
          Messages and file chunks are encrypted locally using AES-256-GCM before socket transmission.
        </p>
        <div className="pt-1.5">
          <p className="text-[10px] font-mono text-slate-500 uppercase">Device Fingerprint</p>
          <p className="text-[10px] font-mono text-slate-300 truncate bg-black/40 p-1.5 rounded border border-white/5 mt-0.5">
            {contact.fingerprint || 'SHA256: 8f:e3:10:4a:c1:b8:92:44:de:01'}
          </p>
        </div>
      </div>
    </div>
  );
};
