import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronDown, MessageSquare } from 'lucide-react';
import { Message, Contact } from '../../types';
import { MessageBubble } from './MessageBubble';
import { groupMessagesByDate, getMessageClusterInfo } from '../../utils/chatUtils';

interface MessageListProps {
  messages: Message[];
  activePeer: Contact;
  isPeerTyping: boolean;
  highlightedMessageId?: string;
  searchHighlight?: string;
  onReply: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onNavigateToMessage: (targetId: string) => void;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  activePeer,
  isPeerTyping,
  highlightedMessageId,
  searchHighlight,
  onReply,
  onDelete,
  onReact,
  onNavigateToMessage,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);
  const [unreadWhileScrolled, setUnreadWhileScrolled] = useState(0);
  const prevMessagesLength = useRef(messages.length);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((smooth = true) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
      setUnreadWhileScrolled(0);
    }
  }, []);

  // Monitor user scroll position to toggle the floating button
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottomButton(isFarFromBottom);
    if (!isFarFromBottom) {
      setUnreadWhileScrolled(0);
    }
  };

  // Auto-scroll on new message if user is already near bottom
  useEffect(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight <= 250;

    if (isNearBottom) {
      scrollToBottom(true);
    } else if (messages.length > prevMessagesLength.current) {
      setUnreadWhileScrolled((prev) => prev + (messages.length - prevMessagesLength.current));
    }
    prevMessagesLength.current = messages.length;
  }, [messages, isPeerTyping, scrollToBottom]);

  // Initial scroll to bottom on peer switch
  useEffect(() => {
    scrollToBottom(false);
  }, [activePeer.id, scrollToBottom]);

  // Handle navigate to specific message
  useEffect(() => {
    if (highlightedMessageId) {
      const el = document.getElementById(`msg-${highlightedMessageId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedMessageId]);

  // Group messages by date
  const dateGroups = groupMessagesByDate(messages);

  return (
    <div className="relative flex-1 overflow-hidden bg-[#0B0E14] flex flex-col">
      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-1"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Encryption & Hotspot Security Notice at top of conversation */}
        <div className="flex flex-col items-center justify-center pt-2 pb-5 text-center select-none">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-2 shadow-inner">
            <Lock className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-300">
            End-to-End Encrypted Local P2P Channel
          </p>
          <p className="text-[11px] text-slate-500 max-w-sm mt-0.5 font-mono">
            Direct socket to {activePeer.ip}:{activePeer.port} • Packets never leave your local hotspot
          </p>
        </div>

        {/* Empty state if all messages are cleared */}
        {messages.length === 0 && (
          <div className="py-20 flex flex-col items-center justify-center text-center select-none">
            <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-500 mb-3">
              <MessageSquare className="w-6 h-6 opacity-60" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No messages in this channel yet</p>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Send a text message, photo, or document to establish a direct socket link with {activePeer.displayName}.
            </p>
          </div>
        )}

        {/* Message Stream Grouped By Date */}
        {dateGroups.map((group, groupIdx) => (
          <div key={`${group.date}-${groupIdx}`} className="space-y-1">
            {/* WhatsApp Desktop Centered Sticky Date Separator Pill */}
            <div className="sticky top-2 z-10 flex items-center justify-center my-3 select-none">
              <span className="px-3 py-1 rounded-lg bg-[#141824]/90 backdrop-blur-md border border-white/[0.08] text-[11px] font-medium text-slate-300 shadow-md">
                {group.date}
              </span>
            </div>

            {/* Messages in this date */}
            <AnimatePresence initial={false}>
              {group.messages.map((msg, indexInGroup) => {
                const clusterInfo = getMessageClusterInfo(group.messages, indexInGroup);
                const isHighlighted = highlightedMessageId === msg.id;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  >
                    <MessageBubble
                      message={msg}
                      isCurrentUser={msg.senderId === 'local-node-01'}
                      isFirstInCluster={clusterInfo.isFirstInCluster}
                      isLastInCluster={clusterInfo.isLastInCluster}
                      showAvatar={clusterInfo.showAvatar}
                      showSenderName={clusterInfo.showSenderName}
                      isHighlighted={isHighlighted}
                      searchHighlight={searchHighlight}
                      onReply={onReply}
                      onDelete={onDelete}
                      onReact={onReact}
                      onNavigateToMessage={onNavigateToMessage}
                      onOpenImage={onOpenImage}
                      onDownloadFile={onDownloadFile}
                      onNotify={onNotify}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ))}

        {/* Realistic Animated Typing Indicator */}
        {isPeerTyping && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex items-center gap-2 mt-2 mb-2"
          >
            <div className="w-7 h-7 rounded-xl overflow-hidden border border-white/10 shrink-0">
              <img
                src={activePeer.avatar}
                alt={activePeer.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-[#161B28] border border-white/10 rounded-bl-xs flex items-center gap-2 shadow-sm">
              <span className="text-[11px] text-slate-400 font-medium">
                {activePeer.displayName} is typing
              </span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating "Scroll to Bottom" Button (WhatsApp Desktop style) */}
      <AnimatePresence>
        {showScrollBottomButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 right-6 z-20 w-10 h-10 rounded-full bg-[#182030] hover:bg-[#1E283C] text-slate-200 hover:text-white border border-white/15 shadow-xl shadow-black/60 flex items-center justify-center transition-all cursor-pointer"
            title="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
            {unreadWhileScrolled > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-orange-500 text-[10px] font-bold text-white shadow-md">
                {unreadWhileScrolled}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};
