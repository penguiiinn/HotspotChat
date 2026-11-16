import React from 'react';
import { Pin, Check, CheckCheck, Radio } from 'lucide-react';
import { Conversation } from '../../types';
import { Avatar } from '../common/Avatar';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
}) => {
  const { peer, lastMessage, unreadCount, isPinned } = conversation;

  // Format message status icon
  const renderStatusIcon = () => {
    if (!lastMessage || lastMessage.senderId !== 'local-node-01') return null;

    if (lastMessage.status === 'read') {
      return <CheckCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    }
    if (lastMessage.status === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
    }
    return <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />;
  };

  return (
    <div
      onClick={() => onSelect(conversation.id)}
      className={`group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 select-none ${
        isActive
          ? 'bg-[#182030] border border-white/10 shadow-md shadow-black/20'
          : 'hover:bg-white/[0.04] border border-transparent'
      }`}
    >
      {/* Active accent pill on the left */}
      {isActive && (
        <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-orange-500 shadow-sm shadow-orange-500/50" />
      )}

      {/* Avatar with status indicator and Host icon */}
      <Avatar
        src={peer.avatar}
        name={peer.displayName}
        size="md"
        status={peer.status}
        isHost={peer.isHotspotHost}
      />

      {/* Contact Details & Last Message */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className={`text-xs font-semibold truncate ${
                isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'
              }`}
            >
              {peer.displayName}
            </span>
            {peer.isHotspotHost && (
              <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500/10 text-orange-400 font-mono border border-orange-500/20 shrink-0">
                AP
              </span>
            )}
          </div>

          {/* Timestamp */}
          {lastMessage && (
            <span
              className={`text-[10px] font-mono shrink-0 ml-1 ${
                unreadCount > 0 ? 'text-orange-400 font-semibold' : 'text-slate-500'
              }`}
            >
              {lastMessage.timestamp}
            </span>
          )}
        </div>

        {/* IP and Last Message Line */}
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0 text-[11px] text-slate-400">
            {renderStatusIcon()}
            <p className="truncate">
              {lastMessage ? (
                lastMessage.type === 'image' ? (
                  <span className="italic text-slate-300">📷 Shared photo</span>
                ) : lastMessage.type === 'file' ? (
                  <span className="italic text-slate-300">📁 {lastMessage.attachment?.name || 'File'}</span>
                ) : lastMessage.type === 'code' ? (
                  <span className="font-mono text-cyan-300">{'</>'} Code snippet</span>
                ) : (
                  lastMessage.content
                )
              ) : (
                <span className="text-slate-500 font-mono text-[10px]">{peer.ip}:{peer.port}</span>
              )}
            </p>
          </div>

          {/* Badges / Pin */}
          <div className="flex items-center gap-1 shrink-0">
            {isPinned && <Pin className="w-3 h-3 text-slate-500 rotate-45" />}
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-sm shadow-orange-500/40">
                {unreadCount}
              </span>
            )}
          </div>
        </div>

        {/* Local Peer IP & Ping mini info */}
        <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-slate-500">
          <span className="flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-slate-400" />
            <span>{peer.ip}</span>
          </span>
          <span>•</span>
          <span className={peer.pingMs <= 3 ? 'text-emerald-400' : 'text-amber-400'}>
            {peer.pingMs}ms
          </span>
        </div>
      </div>
    </div>
  );
};
