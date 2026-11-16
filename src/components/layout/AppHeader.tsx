import React from 'react';
import { Settings, Radio, MessageSquare, LogOut, ShieldCheck, Zap } from 'lucide-react';
import { User, ActiveView } from '../../types';
import { Avatar } from '../common/Avatar';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface AppHeaderProps {
  currentUser: User;
  activeView: ActiveView;
  onNavigate: (view: ActiveView) => void;
  onOpenNewPeerModal: () => void;
  onLogout: () => void;
  peerCount: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  currentUser,
  activeView,
  onNavigate,
  onOpenNewPeerModal,
  onLogout,
  peerCount,
}) => {
  return (
    <header className="h-12 w-full bg-[#0D1017] border-b border-white/[0.07] px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Left: Desktop Window Controls + Logo */}
      <div className="flex items-center gap-4">
        {/* Window controls (decorative desktop styling) */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer transition-colors shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 cursor-pointer transition-colors shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition-colors shadow-sm" />
        </div>

        <div className="h-4 w-px bg-white/10" />

        {/* HotspotChat Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md shadow-orange-500/20">
            <Radio className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-wider text-white">HOTSPOTCHAT</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 ml-3 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
          <button
            onClick={() => {
              playHotspotChime('click');
              onNavigate('chat');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeView === 'chat'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Messages</span>
          </button>
          <button
            onClick={() => {
              playHotspotChime('click');
              onNavigate('settings');
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeView === 'settings'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </nav>
      </div>

      {/* Center: Live Hotspot Network Status Badge */}
      <div className="hidden lg:flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#141923] border border-white/[0.08] text-xs font-mono shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-medium">Hotspot Mesh:</span>
          <span className="text-orange-400 font-semibold">{currentUser.localIp}:{currentUser.port}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>{peerCount} Peers Connected</span>
          </span>
        </div>

        <button
          onClick={onOpenNewPeerModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-medium transition-all cursor-pointer"
        >
          <Radio className="w-3 h-3 animate-pulse" />
          <span>Radar Scan</span>
        </button>
      </div>

      {/* Right: Security & Current User Profile Mini-Bar */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono text-emerald-400/90 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/15">
          <ShieldCheck className="w-3 h-3" />
          <span>E2EE Local</span>
        </div>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        {/* Current User Quick View */}
        <div
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2 pl-1 pr-2 py-0.5 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
          title="Click to open Settings"
        >
          <Avatar
            src={currentUser.avatar}
            name={currentUser.displayName}
            size="xs"
            status={currentUser.status}
          />
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-slate-200 leading-none">{currentUser.displayName}</p>
            <p className="text-[10px] font-mono text-slate-500 leading-tight">@{currentUser.username}</p>
          </div>
        </div>

        {/* Logout / Switch Identity */}
        <button
          onClick={onLogout}
          title="Switch Node Identity / Re-initialize"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
