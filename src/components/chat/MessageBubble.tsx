import React, { useState } from 'react';
import { Check, CheckCheck, Clock, FileText, Download, Copy, Check as CheckIcon, Terminal } from 'lucide-react';
import { Message } from '../../types';
import { Avatar } from '../common/Avatar';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    onNotify('Copied to Clipboard', text.substring(0, 30) + '...', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  // Render checkmark receipts
  const renderDeliveryReceipt = () => {
    if (!isCurrentUser) return null;

    if (message.status === 'sending') {
      return <Clock className="w-3 h-3 text-slate-500 animate-spin" />;
    }
    if (message.status === 'read') {
      return (
        <span title="Read by peer">
          <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />
        </span>
      );
    }
    if (message.status === 'delivered') {
      return (
        <span title="Delivered over local socket">
          <CheckCheck className="w-3.5 h-3.5 text-slate-400" />
        </span>
      );
    }
    return (
      <span title="Sent">
        <Check className="w-3.5 h-3.5 text-slate-500" />
      </span>
    );
  };

  // System message render
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3 select-none">
        <div className="px-3.5 py-1.5 rounded-full bg-[#161B28]/80 border border-white/[0.08] text-[11px] font-mono text-slate-400 flex items-center gap-2 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
          <span>{message.content}</span>
          <span className="text-slate-600">|</span>
          <span className="text-[10px] text-slate-500">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-end gap-2.5 my-2.5 ${
        isCurrentUser ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      {/* Sender Avatar for incoming message */}
      {!isCurrentUser && (
        <Avatar
          src={message.senderAvatar}
          name={message.senderName}
          size="sm"
          className="mb-1"
        />
      )}

      {/* Bubble Container */}
      <div
        className={`relative max-w-[82%] sm:max-w-[70%] rounded-2xl p-3.5 text-xs sm:text-[13px] leading-relaxed transition-all shadow-md ${
          isCurrentUser
            ? 'bg-gradient-to-br from-orange-600 to-amber-600 text-white rounded-br-xs shadow-orange-600/15'
            : 'bg-[#181E2C] text-slate-100 border border-white/[0.07] rounded-bl-xs'
        }`}
      >
        {/* Contact Name in group chats / broadcasts if incoming */}
        {!isCurrentUser && (
          <div className="text-[11px] font-semibold text-orange-400 mb-1 flex items-center gap-1.5">
            <span>{message.senderName}</span>
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
              className="max-h-64 w-full object-cover rounded-lg hover:scale-[1.02] transition-transform duration-200"
            />
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
              {message.attachment.size}
            </div>
          </div>
        )}

        {/* 2. File Attachment Card */}
        {message.attachment && !message.attachment.type.startsWith('image') && (
          <div
            className={`mb-2 p-3 rounded-xl border flex items-center justify-between gap-3 ${
              isCurrentUser
                ? 'bg-black/20 border-white/15 text-white'
                : 'bg-[#11151F] border-white/10 text-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center shrink-0 text-orange-400">
                <FileText className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-xs truncate">{message.attachment.name}</p>
                <p className="text-[10px] font-mono opacity-70">
                  {message.attachment.size} • {message.attachment.extension}
                </p>
              </div>
            </div>

            <button
              onClick={() => onDownloadFile(message.attachment?.name || 'file')}
              title="Download file over hotspot mesh"
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shrink-0"
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
                className="hover:text-white transition-colors"
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
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        )}

        {/* Timestamp & Status Metadata */}
        <div
          className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] font-mono ${
            isCurrentUser ? 'text-white/80' : 'text-slate-400'
          }`}
        >
          <span>{message.timestamp}</span>
          {renderDeliveryReceipt()}
        </div>

        {/* Hover Quick Actions (Copy text) */}
        <div
          className={`absolute top-1 ${
            isCurrentUser ? '-left-8' : '-right-8'
          } opacity-0 group-hover:opacity-100 transition-opacity flex items-center`}
        >
          <button
            onClick={() => handleCopyText(message.content)}
            title="Copy message"
            className="p-1 rounded bg-[#161B28] border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors shadow-sm"
          >
            {copied ? <CheckIcon className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </div>
  );
};
