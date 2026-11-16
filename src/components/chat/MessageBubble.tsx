import React, { useState } from 'react';
import {
  Check,
  CheckCheck,
  Clock,
  FileText,
  Download,
  Copy,
  Check as CheckIcon,
  Reply,
  Trash2,
  ChevronDown,
  Terminal,
  CornerDownRight,
  Ban
} from 'lucide-react';
import { Message } from '../../types';
import { Avatar } from '../common/Avatar';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isFirstInCluster: boolean;
  isLastInCluster: boolean;
  showAvatar: boolean;
  showSenderName: boolean;
  isHighlighted?: boolean;
  searchHighlight?: string;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onNavigateToMessage: (targetId: string) => void;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '⚡'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  isFirstInCluster,
  isLastInCluster,
  showAvatar,
  showSenderName,
  isHighlighted,
  searchHighlight,
  onReply,
  onDelete,
  onReact,
  onNavigateToMessage,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onNotify('Copied to Clipboard', text.substring(0, 35) + '...', 'info');
    setTimeout(() => setCopied(false), 2000);
    setShowActionMenu(false);
  };

  // Render delivery receipts
  const renderDeliveryReceipt = () => {
    if (!isCurrentUser) return null;

    if (message.status === 'sending') {
      return <Clock className="w-3 h-3 text-slate-400 animate-spin shrink-0" />;
    }
    if (message.status === 'read') {
      return (
        <span title="Read by peer">
          <CheckCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        </span>
      );
    }
    if (message.status === 'delivered') {
      return (
        <span title="Delivered over local mesh socket">
          <CheckCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        </span>
      );
    }
    return (
      <span title="Sent">
        <Check className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      </span>
    );
  };

  // System message render
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3 select-none" id={`msg-${message.id}`}>
        <div className="px-3.5 py-1.5 rounded-full bg-[#141923]/90 border border-white/[0.08] text-[11px] font-mono text-slate-400 flex items-center gap-2 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
          <span>{message.content}</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  // Highlight search text helper
  const renderHighlightedContent = (text: string) => {
    if (!searchHighlight || !searchHighlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${searchHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-amber-400/40 text-white rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Deleted message render
  if (message.isDeleted) {
    return (
      <div
        id={`msg-${message.id}`}
        className={`group flex items-end gap-2 ${
          isFirstInCluster ? 'mt-2.5' : 'mt-0.5'
        } ${isLastInCluster ? 'mb-2' : 'mb-0.5'} ${
          isCurrentUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        <div
          className={`relative max-w-[82%] sm:max-w-[70%] rounded-xl px-3 py-2 text-xs italic text-slate-400 flex items-center gap-2 border select-none ${
            isCurrentUser
              ? 'bg-[#182030]/60 border-white/5'
              : 'bg-[#141824]/60 border-white/5'
          }`}
        >
          <Ban className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span>{isCurrentUser ? 'You deleted this message' : 'This message was deleted'}</span>
          <span className="text-[10px] font-mono opacity-60 ml-2 not-italic">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  // Bubble border radius classes based on cluster position
  const getBubbleRadius = () => {
    if (isCurrentUser) {
      if (isFirstInCluster && isLastInCluster) return 'rounded-2xl rounded-tr-xs';
      if (isFirstInCluster) return 'rounded-2xl rounded-tr-xs rounded-br-md';
      if (isLastInCluster) return 'rounded-2xl rounded-tr-md rounded-br-xs';
      return 'rounded-2xl rounded-r-md';
    } else {
      if (isFirstInCluster && isLastInCluster) return 'rounded-2xl rounded-tl-xs';
      if (isFirstInCluster) return 'rounded-2xl rounded-tl-xs rounded-bl-md';
      if (isLastInCluster) return 'rounded-2xl rounded-tl-md rounded-bl-xs';
      return 'rounded-2xl rounded-l-md';
    }
  };

  return (
    <div
      id={`msg-${message.id}`}
      className={`group relative flex items-end gap-2 transition-all duration-200 ${
        isFirstInCluster ? 'mt-2.5' : 'mt-0.5'
      } ${isLastInCluster ? 'mb-2' : 'mb-0.5'} ${
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Left Avatar for incoming message (only on last message of cluster) */}
      {!isCurrentUser && (
        <div className="w-7 shrink-0 mb-1">
          {showAvatar ? (
            <Avatar
              src={message.senderAvatar}
              name={message.senderName}
              size="xs"
            />
          ) : (
            <div className="w-7 h-7" />
          )}
        </div>
      )}

      {/* Main Message Bubble */}
      <div
        className={`relative max-w-[85%] sm:max-w-[70%] p-3 text-xs sm:text-[13px] leading-relaxed transition-all shadow-md group/bubble ${getBubbleRadius()} ${
          isCurrentUser
            ? 'bg-gradient-to-br from-orange-600 via-orange-600 to-amber-600 text-white shadow-orange-950/20'
            : 'bg-[#182030] text-slate-100 border border-white/[0.08] shadow-black/30'
        } ${isHighlighted ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#0B0E14] scale-[1.01]' : ''}`}
      >
        {/* SVG Bubble Tail */}
        {isFirstInCluster && (
          <div
            className={`absolute top-0 w-2.5 h-3 overflow-hidden pointer-events-none ${
              isCurrentUser ? '-right-2' : '-left-2'
            }`}
          >
            {isCurrentUser ? (
              <svg viewBox="0 0 8 12" className="w-full h-full fill-orange-600">
                <path d="M0,0 C3,0 8,2 8,6 C8,4 5,1 0,0 Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 8 12" className="w-full h-full fill-[#182030]">
                <path d="M8,0 C5,0 0,2 0,6 C0,4 3,1 8,0 Z" />
              </svg>
            )}
          </div>
        )}

        {/* Sender Name (only on first message in cluster for incoming) */}
        {!isCurrentUser && showSenderName && (
          <div className="text-[11px] font-bold text-orange-400 mb-1 flex items-center justify-between gap-2">
            <span>{message.senderName}</span>
          </div>
        )}

        {/* Replying-to Quote Box (WhatsApp Desktop style) */}
        {message.replyTo && (
          <div
            onClick={() => onNavigateToMessage(message.replyTo!.id)}
            className={`mb-2 p-2 rounded-lg border-l-4 text-xs transition-colors cursor-pointer select-none ${
              isCurrentUser
                ? 'bg-black/25 border-amber-300 hover:bg-black/35 text-white'
                : 'bg-black/35 border-orange-500 hover:bg-black/45 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1 font-bold text-[11px] text-amber-300">
              <CornerDownRight className="w-3 h-3" />
              <span>{message.replyTo.senderName}</span>
            </div>
            <p className="text-[11px] opacity-80 truncate mt-0.5">
              {message.replyTo.content || message.replyTo.attachmentName || 'Media'}
            </p>
          </div>
        )}

        {/* 1. Image Attachment */}
        {message.attachment && message.attachment.type.startsWith('image') && (
          <div className="mb-2 rounded-xl overflow-hidden border border-white/10 group/img relative cursor-pointer">
            <img
              src={message.attachment.url}
              alt={message.attachment.name}
              onClick={() =>
                onOpenImage(
                  message.attachment?.url || '',
                  message.attachment?.name,
                  message.senderName
                )
              }
              className="max-h-72 w-full object-cover rounded-lg hover:scale-[1.02] transition-transform duration-200"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono text-white">
              {message.attachment.size}
            </div>
          </div>
        )}

        {/* 2. File / Document Attachment Card */}
        {message.attachment && !message.attachment.type.startsWith('image') && (
          <div
            className={`mb-2 p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isCurrentUser
                ? 'bg-black/25 border-white/15 text-white'
                : 'bg-[#121622] border-white/10 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs truncate">{message.attachment.name}</p>
                <p className="text-[10px] font-mono opacity-70">
                  {message.attachment.size} • {message.attachment.extension || 'FILE'}
                </p>
              </div>
            </div>

            <button
              onClick={() => onDownloadFile(message.attachment?.name || 'file')}
              title="Download file over hotspot mesh"
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 3. Code Snippet Block */}
        {message.codeSnippet && (
          <div className="mb-2 rounded-xl bg-[#0B0E14] border border-white/10 overflow-hidden font-mono text-[11px]">
            <div className="px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.06] flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-orange-400">
                <Terminal className="w-3 h-3" />
                {message.codeSnippet.language}
              </span>
              <button
                onClick={() => handleCopyText(message.codeSnippet?.code || '')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {copied ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
            <pre className="p-3 text-slate-200 overflow-x-auto leading-relaxed">
              <code>{message.codeSnippet.code}</code>
            </pre>
          </div>
        )}

        {/* Text Message Content */}
        {message.content && (
          <p className="whitespace-pre-wrap break-words">
            {renderHighlightedContent(message.content)}
          </p>
        )}

        {/* Timestamp & Status Metadata */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[10px] font-mono select-none ${
            isCurrentUser ? 'text-white/80' : 'text-slate-400'
          }`}
        >
          <span>{message.timestamp}</span>
          {renderDeliveryReceipt()}
        </div>

        {/* Hover Action Trigger (WhatsApp Desktop style chevron/toolbar) */}
        <div
          className={`absolute top-1.5 ${
            isCurrentUser ? 'left-1.5' : 'right-1.5'
          } opacity-0 group-hover/bubble:opacity-100 transition-opacity`}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActionMenu(!showActionMenu);
            }}
            className="p-1 rounded-md bg-black/40 hover:bg-black/60 text-white/80 hover:text-white backdrop-blur-sm transition-colors cursor-pointer shadow-sm"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Action Dropdown Menu */}
        {showActionMenu && (
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-8 ${
              isCurrentUser ? 'right-0' : 'left-0'
            } z-30 w-40 bg-[#161B28] border border-white/10 rounded-xl shadow-2xl p-1 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100`}
          >
            {/* Quick Reactions Row */}
            <div className="flex items-center justify-between px-1.5 py-1 border-b border-white/[0.08] mb-1">
              {QUICK_REACTIONS.map((em) => (
                <button
                  key={em}
                  onClick={() => {
                    onReact(message.id, em);
                    setShowActionMenu(false);
                  }}
                  className="hover:scale-125 transition-transform text-sm p-0.5 cursor-pointer"
                >
                  {em}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                onReply(message);
                setShowActionMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Reply className="w-3.5 h-3.5 text-orange-400" />
              <span>Reply</span>
            </button>

            <button
              onClick={() => handleCopyText(message.content)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy</span>
            </button>

            <button
              onClick={() => {
                onDelete(message.id);
                setShowActionMenu(false);
              }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Message</span>
            </button>
          </div>
        )}

        {/* Reaction Badges Pill */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div
            className={`absolute -bottom-2.5 ${
              isCurrentUser ? 'left-2' : 'right-2'
            } flex items-center gap-1 z-10 select-none`}
          >
            {Object.entries(message.reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => onReact(message.id, emoji)}
                className="px-1.5 py-0.5 rounded-full bg-[#161B28] border border-white/15 text-[11px] text-white flex items-center gap-1 shadow-md hover:scale-110 transition-transform cursor-pointer"
              >
                <span>{emoji}</span>
                {users.length > 1 && <span className="text-[10px] font-mono text-slate-400">{users.length}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
