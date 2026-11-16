import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Message, Contact } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  activePeer: Contact;
  isPeerTyping: boolean;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  activePeer,
  isPeerTyping,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on message change or typing
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPeerTyping]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-1 relative"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Encryption & Hotspot Security Notice at top of conversation */}
      <div className="flex flex-col items-center justify-center pt-2 pb-6 text-center select-none">
        <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-2 shadow-inner">
          <Lock className="w-5 h-5" />
        </div>
        <p className="text-xs font-semibold text-slate-300">
          Direct Peer-to-Peer Channel with {activePeer.displayName}
        </p>
        <p className="text-[11px] text-slate-500 max-w-sm mt-0.5 font-mono">
          Socket: {activePeer.ip}:{activePeer.port} • Local Wi-Fi Mesh • Zero Internet Traffic
        </p>
        <div className="mt-3 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-[10px] text-slate-400 font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Fingerprint: {activePeer.fingerprint || 'Verified'}</span>
        </div>
      </div>

      {/* Date Separator Pill */}
      <div className="flex items-center justify-center my-4 select-none">
        <span className="px-3 py-1 rounded-full bg-[#141824] border border-white/[0.06] text-[11px] font-mono text-slate-400 shadow-sm">
          Today
        </span>
      </div>

      {/* Message Stream */}
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <MessageBubble
              message={msg}
              isCurrentUser={msg.senderId === 'local-node-01'}
              onOpenImage={onOpenImage}
              onDownloadFile={onDownloadFile}
              onNotify={onNotify}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Realistic Animated Typing Indicator */}
      {isPeerTyping && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="flex items-center gap-2 mt-2"
        >
          <div className="w-7 h-7 rounded-xl overflow-hidden border border-white/10 shrink-0">
            <img
              src={activePeer.avatar}
              alt={activePeer.displayName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-[#161B28] border border-white/10 rounded-bl-xs flex items-center gap-1.5 shadow-sm">
            <span className="text-[11px] text-slate-400 mr-1">{activePeer.displayName} is typing</span>
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />
          </div>
        </motion.div>
      )}
    </div>
  );
};
