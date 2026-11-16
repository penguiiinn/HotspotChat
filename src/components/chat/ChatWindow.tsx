import React from 'react';
import { Conversation, Message, FileAttachment, CodeSnippet } from '../../types';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  conversation: Conversation;
  messages: Message[];
  isPeerTyping: boolean;
  isInfoPanelOpen: boolean;
  onToggleInfoPanel: () => void;
  onSendMessage: (
    content: string,
    attachment?: FileAttachment,
    codeSnippet?: CodeSnippet
  ) => void;
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
  onSendMessage,
  onClearChat,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  return (
    <div className="flex-1 h-full flex flex-col bg-[#0B0E14] relative min-w-0 overflow-hidden">
      {/* 1. Header */}
      <ChatHeader
        contact={conversation.peer}
        isInfoPanelOpen={isInfoPanelOpen}
        onToggleInfoPanel={onToggleInfoPanel}
        onClearChat={onClearChat}
        onNotify={onNotify}
      />

      {/* 2. Message Stream */}
      <MessageList
        messages={messages}
        activePeer={conversation.peer}
        isPeerTyping={isPeerTyping}
        onOpenImage={onOpenImage}
        onDownloadFile={onDownloadFile}
        onNotify={onNotify}
      />

      {/* 3. Input Bar */}
      <MessageInput
        onSendMessage={onSendMessage}
        activePeerName={conversation.peer.displayName}
        isPeerTyping={isPeerTyping}
        onNotify={onNotify}
      />
    </div>
  );
};
