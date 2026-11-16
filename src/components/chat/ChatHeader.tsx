import React from 'react';
import {
  Phone,
  Video,
  PanelRightOpen,
  PanelRightClose,
  Trash2,
  Zap,
  Search,
  X,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Contact } from '../../types';
import { Avatar } from '../common/Avatar';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface ChatHeaderProps {
  contact: Contact;
  isInfoPanelOpen: boolean;
  searchQuery: string;
  isSearchOpen: boolean;
  matchCount: number;
  currentMatchIndex: number;
  onToggleSearch: () => void;
  onSearchChange: (query: string) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onToggleInfoPanel: () => void;
  onOpenContactDetail?: () => void;
  onClearChat: () => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  contact,
  isInfoPanelOpen,
  searchQuery,
  isSearchOpen,
  matchCount,
  currentMatchIndex,
  onToggleSearch,
  onSearchChange,
  onNextMatch,
  onPrevMatch,
  onToggleInfoPanel,
  onOpenContactDetail,
  onClearChat,
  onNotify,
}) => {
  const handleSimulateCall = (type: 'audio' | 'video') => {
    playHotspotChime('peer');
    onNotify(
      `P2P ${type === 'audio' ? 'Voice' : 'Video'} Stream`,
      `Streaming direct UDP RTP packets to ${contact.ip}:${contact.port + 1} (Simulated)`,
      'info'
    );
  };

  return (
    <div className="shrink-0 z-20 select-none">
      {/* Primary Header Row */}
      <div className="h-16 px-4 sm:px-6 bg-[#0E121A] border-b border-white/[0.07] flex items-center justify-between">
        {/* Contact Profile Thumbnail & Network Metadata */}
        <div
          onClick={onOpenContactDetail || onToggleInfoPanel}
          className="flex items-center gap-3.5 min-w-0 cursor-pointer group"
          title="Click to view contact profile & node info"
        >
          <Avatar
            src={contact.avatar}
            name={contact.displayName}
            size="md"
            status={contact.status}
            isHost={contact.isHotspotHost}
            className="group-hover:ring-2 group-hover:ring-orange-500/50 transition-all"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                {contact.displayName}
              </h2>
              {contact.isHotspotHost && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30 shrink-0">
                  GATEWAY HOST
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{contact.ip}:{contact.port}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                <span>{contact.pingMs}ms</span>
              </span>
              <span className="hidden sm:inline text-slate-600">|</span>
              <span className="hidden sm:inline text-slate-400 truncate max-w-[200px]">
                {contact.statusMessage}
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* In-Chat Search Button */}
          <button
            onClick={onToggleSearch}
            title="Search in conversation"
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isSearchOpen
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Audio Call */}
          <button
            onClick={() => handleSimulateCall('audio')}
            title="Direct P2P Audio Call"
            className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Video Call */}
          <button
            onClick={() => handleSimulateCall('video')}
            title="Direct P2P Video Call"
            className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-white/5 transition-colors cursor-pointer"
          >
            <Video className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

          {/* Clear Chat */}
          <button
            onClick={onClearChat}
            title="Clear Conversation History"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Toggle Right Info Panel */}
          <button
            onClick={() => {
              playHotspotChime('click');
              onToggleInfoPanel();
            }}
            title={isInfoPanelOpen ? 'Collapse Details' : 'View Peer Node Details'}
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isInfoPanelOpen
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {isInfoPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* In-Chat Search Bar Overlay (WhatsApp Desktop style) */}
      {isSearchOpen && (
        <div className="h-12 px-4 bg-[#121622] border-b border-white/[0.08] flex items-center justify-between gap-3 animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="w-4 h-4 text-orange-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search in this chat..."
              className="w-full bg-transparent border-0 text-xs text-white placeholder-slate-500 focus:outline-none"
              autoFocus
            />
          </div>

          <div className="flex items-center gap-2">
            {searchQuery && (
              <span className="text-xs font-mono text-slate-400">
                {matchCount > 0 ? `${currentMatchIndex + 1} of ${matchCount}` : 'No matches'}
              </span>
            )}

            {matchCount > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={onPrevMatch}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  title="Previous match"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onNextMatch}
                  className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
                  title="Next match"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onToggleSearch}
              className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white cursor-pointer"
              title="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
