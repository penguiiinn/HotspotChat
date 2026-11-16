import React, { useState } from 'react';
import { X, Zap, BellOff, Bell, FileUp } from 'lucide-react';
import { Contact } from '../../types';
import { Avatar } from '../common/Avatar';
import { ConnectionDetails } from './ConnectionDetails';
import { SharedMediaList } from './SharedMediaList';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface RightInfoPanelProps {
  contact: Contact;
  onClose: () => void;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
  className?: string;
}

export const RightInfoPanel: React.FC<RightInfoPanelProps> = ({
  contact,
  onClose,
  onOpenImage,
  onDownloadFile,
  onNotify,
  className = '',
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  const handlePing = () => {
    setIsPinging(true);
    playHotspotChime('click');
    setTimeout(() => {
      setIsPinging(false);
      playHotspotChime('peer');
      onNotify('Ping Response Received', `Pong from ${contact.ip}: 1.84ms latency, 0% packet loss`, 'success');
    }, 600);
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    onNotify(
      isMuted ? 'Notifications Enabled' : 'Notifications Muted',
      `Alerts from ${contact.displayName} are now ${isMuted ? 'active' : 'silenced'}`,
      'info'
    );
  };

  return (
    <aside
      className={`w-80 lg:w-88 h-full bg-[#0E121A] border-l border-white/[0.07] flex flex-col shrink-0 select-none overflow-y-auto ${className}`}
    >
      {/* Header */}
      <div className="h-16 px-5 border-b border-white/[0.07] flex items-center justify-between shrink-0 bg-[#111622]/80">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Peer Node Details</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Contact Hero Card */}
        <div className="flex flex-col items-center text-center">
          <Avatar
            src={contact.avatar}
            name={contact.displayName}
            size="2xl"
            status={contact.status}
            isHost={contact.isHotspotHost}
            className="mb-3"
          />

          <h4 className="text-base font-bold text-white flex items-center gap-1.5">
            <span>{contact.displayName}</span>
            {contact.isHotspotHost && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                HOST
              </span>
            )}
          </h4>
          <p className="text-xs font-mono text-slate-400 mt-0.5">@{contact.username}</p>
          <p className="text-xs text-orange-400/90 font-medium mt-1">{contact.role || 'Hotspot Peer Node'}</p>

          {contact.bio && (
            <p className="text-xs text-slate-400 leading-relaxed mt-2.5 max-w-xs px-2">
              {contact.bio}
            </p>
          )}

          {/* Quick Action Buttons Bar */}
          <div className="grid grid-cols-3 gap-2 w-full mt-4">
            <button
              onClick={handlePing}
              disabled={isPinging}
              className="py-2 px-2 rounded-xl bg-[#161B28] hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isPinging ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
              <span className="text-[10px] font-mono">{isPinging ? 'Pinging...' : 'Ping Node'}</span>
            </button>

            <button
              onClick={handleToggleMute}
              className="py-2 px-2 rounded-xl bg-[#161B28] hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              {isMuted ? (
                <BellOff className="w-4 h-4 text-amber-400" />
              ) : (
                <Bell className="w-4 h-4 text-slate-300" />
              )}
              <span className="text-[10px] font-mono">{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={() => onNotify('Transfer Initialized', `Streaming data chunks to ${contact.ip}`, 'info')}
              className="py-2 px-2 rounded-xl bg-[#161B28] hover:bg-white/10 border border-white/10 text-xs text-slate-200 font-medium flex flex-col items-center gap-1 transition-colors cursor-pointer"
            >
              <FileUp className="w-4 h-4 text-orange-400" />
              <span className="text-[10px] font-mono">Send File</span>
            </button>
          </div>
        </div>

        {/* Section 1: Connection & Socket Details */}
        <div>
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Direct Socket Link</span>
            <span className="text-[10px] font-mono text-emerald-400">ACTIVE</span>
          </h5>
          <ConnectionDetails contact={contact} />
        </div>

        {/* Section 2: Shared Media & Documents */}
        <div>
          <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            Local Assets & Media
          </h5>
          <SharedMediaList onOpenImage={onOpenImage} onDownloadFile={onDownloadFile} />
        </div>
      </div>
    </aside>
  );
};
