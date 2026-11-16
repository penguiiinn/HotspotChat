import React, { useState, useMemo } from 'react';
import { Conversation, Message, FileAttachment, CodeSnippet, ReplyMessagePreview, Contact } from '../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isPeerTyping: boolean;
  isInfoPanelOpen: boolean;
  onToggleInfoPanel: () => void;
  onOpenContactDetail?: (contact: Contact) => void;
  onSendMessage: (
    content: string,
    attachment?: FileAttachment,
    codeSnippet?: CodeSnippet,
    replyTo?: ReplyMessagePreview
  ) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactMessage: (messageId: string, emoji: string) => void;
  onClearChat: () => void;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  isPeerTyping,
  isInfoPanelOpen,
  onToggleInfoPanel,
  onOpenContactDetail,
  onSendMessage,
  onDeleteMessage,
  onReactMessage,
  onClearChat,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  // 1. Reply State
  const [replyingToMessage, setReplyingToMessage] = useState<ReplyMessagePreview | null>(null);

  // 2. In-Chat Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // 3. Highlighted Message ID (for reply click jump)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | undefined>(undefined);

  // Filter messages for search
  const matchingMessageIds = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return messages
      .filter((m) =>
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.attachment?.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .map((m) => m.id);
  }, [messages, searchQuery]);

  const handleNextMatch = () => {
    if (matchingMessageIds.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchingMessageIds.length;
    setCurrentMatchIndex(nextIdx);
    setHighlightedMessageId(matchingMessageIds[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (matchingMessageIds.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchingMessageIds.length) % matchingMessageIds.length;
    setCurrentMatchIndex(prevIdx);
    setHighlightedMessageId(matchingMessageIds[prevIdx]);
  };

  // Reply handler
  const handleReply = (message: Message) => {
    setReplyingToMessage({
      id: message.id,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      type: message.type,
      attachmentName: message.attachment?.name,
    });
  };

  // Navigate to original message on reply click
  const handleNavigateToMessage = (targetId: string) => {
    setHighlightedMessageId(targetId);
    setTimeout(() => {
      setHighlightedMessageId(undefined);
    }, 2000);
  };

  return (
    <div className="flex-1 h-full flex flex-col bg-[#0B0E14] relative min-w-0 overflow-hidden">
      {/* 1. Header with In-Chat Search */}
      <ChatHeader
        contact={conversation.peer}
        isInfoPanelOpen={isInfoPanelOpen}
        searchQuery={searchQuery}
        isSearchOpen={isSearchOpen}
        matchCount={matchingMessageIds.length}
        currentMatchIndex={currentMatchIndex}
        onToggleSearch={() => {
          setIsSearchOpen(!isSearchOpen);
          if (isSearchOpen) setSearchQuery('');
        }}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentMatchIndex(0);
          if (q.trim()) {
            const matches = messages.filter((m) =>
              m.content.toLowerCase().includes(q.toLowerCase())
            );
            if (matches.length > 0) {
              setHighlightedMessageId(matches[0].id);
            }
          }
        }}
        onNextMatch={handleNextMatch}
        onPrevMatch={handlePrevMatch}
        onToggleInfoPanel={onToggleInfoPanel}
        onOpenContactDetail={onOpenContactDetail ? () => onOpenContactDetail(conversation.peer) : undefined}
        onClearChat={onClearChat}
        onNotify={onNotify}
      />

      {/* 2. Message Stream */}
      <MessageList
        messages={messages}
        activePeer={conversation.peer}
        isPeerTyping={isPeerTyping}
        highlightedMessageId={highlightedMessageId}
        searchHighlight={isSearchOpen ? searchQuery : undefined}
        onReply={handleReply}
        onDelete={onDeleteMessage}
        onReact={onReactMessage}
        onNavigateToMessage={handleNavigateToMessage}
        onOpenImage={onOpenImage}
        onDownloadFile={onDownloadFile}
        onNotify={onNotify}
      />

      {/* 3. Input Bar */}
      <MessageInput
        onSendMessage={onSendMessage}
        activePeerName={conversation.peer.displayName}
        replyingToMessage={replyingToMessage}
        onCancelReply={() => setReplyingToMessage(null)}
        onNotify={onNotify}
      />
    </div>
  );
};
