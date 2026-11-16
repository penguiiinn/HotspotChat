import React, { useState, useMemo } from 'react';
import { Search, Plus, Radio, ChevronDown } from 'lucide-react';
import { User, Conversation, UserStatus } from '../../types';
import { Avatar } from '../common/Avatar';
import { ConversationItem } from './ConversationItem';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface LeftSidebarProps {
  currentUser: User;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectConversation: (id: string) => void;
  onOpenNewPeerModal: () => void;
  onUpdateUserStatus: (status: UserStatus) => void;
  className?: string;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  currentUser,
  conversations,
  activeConversationId,
  onSelectConversation,
  onOpenNewPeerModal,
  onUpdateUserStatus,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'broadcast' | 'unread'>('all');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Status definitions
  const statusOptions: { value: UserStatus; label: string; color: string }[] = [
    { value: 'online', label: 'Online & Broadcasting', color: 'bg-emerald-500' },
    { value: 'away', label: 'Away from Device', color: 'bg-amber-500' },
    { value: 'busy', label: 'Do Not Disturb', color: 'bg-rose-500' },
    { value: 'offline', label: 'Stealth Mode (Listen Only)', color: 'bg-slate-500' },
  ];

  // Filter conversations
  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      // Search matching
      const matchesSearch =
        conv.peer.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.peer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.peer.ip.includes(searchQuery) ||
        (conv.lastMessage?.content.toLowerCase() || '').includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Filter tabs
      if (filterType === 'unread') return conv.unreadCount > 0;
      if (filterType === 'broadcast') return conv.peer.ip === '192.168.43.255';
      if (filterType === 'direct') return conv.peer.ip !== '192.168.43.255';
      return true;
    });
  }, [conversations, searchQuery, filterType]);

  const totalUnread = useMemo(
    () => conversations.reduce((acc, curr) => acc + curr.unreadCount, 0),
    [conversations]
  );

  return (
    <aside
      className={`w-80 md:w-88 lg:w-96 h-full bg-[#0E121A] border-r border-white/[0.07] flex flex-col shrink-0 select-none ${className}`}
    >
      {/* 1. Current User Identity Card with Status Switcher */}
      <div className="p-4 border-b border-white/[0.07] bg-[#111622]/80">
        <div className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                src={currentUser.avatar}
                name={currentUser.displayName}
                size="md"
                status={currentUser.status}
                isHost={currentUser.isHost}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white truncate">
                    {currentUser.displayName}
                  </span>
                  <span className="text-[10px] font-mono px-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    YOU
                  </span>
                </div>
                <div
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">{currentUser.status}</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </div>
            </div>

            {/* Quick Action: New Peer Modal */}
            <button
              onClick={() => {
                playHotspotChime('click');
                onOpenNewPeerModal();
              }}
              title="Discover Nearby Hotspot Peers"
              className="p-2 rounded-xl bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white border border-orange-500/20 transition-all cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Status Dropdown Menu */}
          {isStatusDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 p-1.5 rounded-xl bg-[#161B28] border border-white/10 shadow-xl shadow-black/60 z-30">
              <div className="text-[10px] font-mono text-slate-500 px-2 py-1 uppercase tracking-wider">
                Set Broadcast Status
              </div>
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onUpdateUserStatus(opt.value);
                    setIsStatusDropdownOpen(false);
                    playHotspotChime('click');
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-left transition-colors ${
                    currentUser.status === opt.value
                      ? 'bg-orange-500/15 text-orange-400 font-medium'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Local Network Info Chip */}
        <div className="mt-3 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/[0.05] text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-orange-400" />
            <span>SSID: {currentUser.hotspotSsid}</span>
          </span>
          <span className="text-slate-300">{currentUser.localIp}</span>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="p-3 border-b border-white/[0.06] space-y-2.5">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search peer, message, or IP..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-[11px] text-slate-500 hover:text-slate-300"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            All ({conversations.length})
          </button>
          <button
            onClick={() => setFilterType('direct')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterType === 'direct'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Direct Peers
          </button>
          <button
            onClick={() => setFilterType('broadcast')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
              filterType === 'broadcast'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            Broadcast
          </button>
          {totalUnread > 0 && (
            <button
              onClick={() => setFilterType('unread')}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-medium flex items-center gap-1 transition-all cursor-pointer ${
                filterType === 'unread'
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-500/10 text-orange-400'
              }`}
            >
              <span>Unread</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Conversation List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={conv.id === activeConversationId}
              onSelect={onSelectConversation}
            />
          ))
        ) : (
          <div className="py-12 px-4 text-center">
            <Radio className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-60" />
            <p className="text-xs font-semibold text-slate-400">No matching peers found</p>
            <p className="text-[11px] text-slate-500 mt-1">Try a different search term or scan the subnet</p>
            <button
              onClick={onOpenNewPeerModal}
              className="mt-3 px-3 py-1.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-medium border border-orange-500/30 inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Discover Nearby Peers</span>
            </button>
          </div>
        )}
      </div>

      {/* 4. Subnet Status Footer */}
      <div className="p-3 border-t border-white/[0.07] bg-[#0B0E14] text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>PORT {currentUser.port} LISTENING</span>
        </div>
        <span className="text-slate-400">192.168.43.0/24</span>
      </div>
    </aside>
  );
};
