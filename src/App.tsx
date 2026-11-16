import React, { useState, useCallback } from 'react';
import {
  INITIAL_USER,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  DEFAULT_SETTINGS,
  AUTO_REPLY_TEMPLATES,
} from './data/dummyData';
import type {
  User,
  Conversation,
  Message,
  ActiveView,
  AppSettings,
  FileAttachment,
  CodeSnippet,
  UserStatus,
} from './types';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { AppHeader } from './components/layout/AppHeader';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { RightInfoPanel } from './components/info/RightInfoPanel';
import { NewPeerModal } from './components/sidebar/NewPeerModal';
import { MediaViewerModal } from './components/chat/MediaViewerModal';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/Toast';
import { useToast } from './hooks/useToast';
import { playHotspotChime } from './hooks/useHotspotSound';

export const App: React.FC = () => {
  // Navigation & View State
  const [activeView, setActiveView] = useState<ActiveView>('welcome');
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  // Conversations & Messages State
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-elena');

  // UI Panels & Modals State
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);
  const [isNewPeerModalOpen, setIsNewPeerModalOpen] = useState(false);
  const [mediaViewer, setMediaViewer] = useState<{
    isOpen: boolean;
    url?: string;
    title?: string;
    sender?: string;
  }>({ isOpen: false });

  // Simulated peer typing per conversation
  const [peerTypingMap, setPeerTypingMap] = useState<Record<string, boolean>>({});

  // Toast System
  const { toasts, showToast, removeToast } = useToast();

  // Find active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = messagesMap[activeConversationId] || [];

  // Theme class applied to root
  const themeClass = settings.accentColor !== 'orange' ? `theme-${settings.accentColor}` : '';

  // 1. Send Message Handler with realistic local mesh feedback
  const handleSendMessage = useCallback(
    (content: string, attachment?: FileAttachment, codeSnippet?: CodeSnippet) => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const newMsgId = `msg-${Date.now()}`;
      const newMsg: Message = {
        id: newMsgId,
        conversationId: activeConversationId,
        senderId: currentUser.id,
        senderName: currentUser.displayName,
        senderAvatar: currentUser.avatar,
        content,
        timestamp: timeStr,
        status: 'sending',
        type: attachment ? (attachment.type.startsWith('image') ? 'image' : 'file') : codeSnippet ? 'code' : 'text',
        attachment,
        codeSnippet,
      };

      // Add message immediately
      setMessagesMap((prev) => ({
        ...prev,
        [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
      }));

      // Update conversation's lastMessage
      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, lastMessage: newMsg } : c))
      );

      // Transition to 'sent' after 200ms
      setTimeout(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [activeConversationId]: prev[activeConversationId].map((m) =>
            m.id === newMsgId ? { ...m, status: 'sent' } : m
          ),
        }));
      }, 200);

      // Transition to 'delivered' after 600ms
      setTimeout(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [activeConversationId]: prev[activeConversationId].map((m) =>
            m.id === newMsgId ? { ...m, status: 'delivered' } : m
          ),
        }));
      }, 600);

      // Transition to 'read' after 1200ms
      setTimeout(() => {
        setMessagesMap((prev) => ({
          ...prev,
          [activeConversationId]: prev[activeConversationId].map((m) =>
            m.id === newMsgId ? { ...m, status: 'read' } : m
          ),
        }));
      }, 1200);

      // Simulate Peer Auto-Reply if conversation is with a direct peer
      const currentPeer = activeConversation.peer;
      if (currentPeer.ip !== '192.168.43.255') {
        // Start typing after 1.2s
        setTimeout(() => {
          setPeerTypingMap((prev) => ({ ...prev, [activeConversationId]: true }));
        }, 1200);

        // Reply after 2.6s
        setTimeout(() => {
          setPeerTypingMap((prev) => ({ ...prev, [activeConversationId]: false }));

          const replyIndex = Math.floor(Math.random() * AUTO_REPLY_TEMPLATES.length);
          const replyText = AUTO_REPLY_TEMPLATES[replyIndex];
          const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const peerReply: Message = {
            id: `reply-${Date.now()}`,
            conversationId: activeConversationId,
            senderId: currentPeer.id,
            senderName: currentPeer.displayName,
            senderAvatar: currentPeer.avatar,
            content: replyText,
            timestamp: replyTime,
            status: 'read',
            type: 'text',
          };

          setMessagesMap((prev) => ({
            ...prev,
            [activeConversationId]: [...(prev[activeConversationId] || []), peerReply],
          }));

          setConversations((prev) =>
            prev.map((c) => (c.id === activeConversationId ? { ...c, lastMessage: peerReply } : c))
          );

          if (settings.soundEnabled) {
            playHotspotChime('received');
          }

          showToast(
            `Packet from ${currentPeer.displayName}`,
            replyText.substring(0, 48) + '...',
            'network'
          );
        }, 2800);
      }
    },
    [activeConversationId, currentUser, activeConversation, settings.soundEnabled, showToast]
  );

  // 2. Clear conversation history
  const handleClearChat = useCallback(() => {
    setMessagesMap((prev) => ({
      ...prev,
      [activeConversationId]: [],
    }));
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversationId ? { ...c, lastMessage: undefined } : c))
    );
    showToast('Conversation Cleared', 'Local message cache removed for this peer', 'info');
  }, [activeConversationId, showToast]);

  // 3. Add new conversation
  const handleAddConversation = useCallback(
    (newConv: Conversation) => {
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessagesMap((prev) => ({
        ...prev,
        [newConv.id]: [
          {
            id: `init-${Date.now()}`,
            conversationId: newConv.id,
            senderId: 'system',
            senderName: 'Hotspot Mesh Daemon',
            senderAvatar: currentUser.avatar,
            content: `Connected to peer socket on ${newConv.peer.ip}:${newConv.peer.port}. Link speed: 2ms.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'read',
            type: 'system',
          },
        ],
      }));
    },
    [currentUser.avatar]
  );

  // 4. Download file simulation
  const handleDownloadFile = useCallback(
    (fileName: string) => {
      playHotspotChime('sent');
      showToast(
        'Downloading Over Hotspot',
        `Retrieved ${fileName} at 48 MB/s. Saved to Downloads/HotspotChat`,
        'success'
      );
    },
    [showToast]
  );

  // 5. Open image viewer
  const handleOpenImage = useCallback((url: string, title?: string, sender?: string) => {
    setMediaViewer({
      isOpen: true,
      url,
      title,
      sender,
    });
  }, []);

  // 6. Update user status
  const handleUpdateUserStatus = useCallback(
    (status: UserStatus) => {
      setCurrentUser((prev) => ({ ...prev, status }));
      showToast('Status Broadcast Updated', `You are now marked as ${status}`, 'info');
    },
    [showToast]
  );

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col bg-[#0B0E14] text-slate-100 ${themeClass}`}>
      {/* View 1: Welcome / Login Screen */}
      {activeView === 'welcome' && (
        <WelcomeScreen
          currentUser={currentUser}
          onContinue={(updatedUser) => {
            setCurrentUser(updatedUser);
            setActiveView('chat');
          }}
          onNotify={showToast}
        />
      )}

      {/* View 2: Main Dashboard (Desktop 3-column layout) */}
      {activeView === 'chat' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Top Window Header */}
          <AppHeader
            currentUser={currentUser}
            activeView={activeView}
            onNavigate={setActiveView}
            onOpenNewPeerModal={() => setIsNewPeerModalOpen(true)}
            onLogout={() => setActiveView('welcome')}
            peerCount={conversations.length}
          />

          {/* 3-Section Main Desktop Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* Section 1: Left Sidebar */}
            <LeftSidebar
              currentUser={currentUser}
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => {
                setActiveConversationId(id);
                // Mark conversation read
                setConversations((prev) =>
                  prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
                );
              }}
              onOpenNewPeerModal={() => setIsNewPeerModalOpen(true)}
              onUpdateUserStatus={handleUpdateUserStatus}
            />

            {/* Section 2: Centre Chat Window */}
            <ChatWindow
              conversation={activeConversation}
              messages={activeMessages}
              isPeerTyping={!!peerTypingMap[activeConversationId]}
              isInfoPanelOpen={isInfoPanelOpen}
              onToggleInfoPanel={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              onOpenImage={handleOpenImage}
              onDownloadFile={handleDownloadFile}
              onNotify={showToast}
            />

            {/* Section 3: Right Information Panel */}
            {isInfoPanelOpen && (
              <RightInfoPanel
                contact={activeConversation.peer}
                onClose={() => setIsInfoPanelOpen(false)}
                onOpenImage={handleOpenImage}
                onDownloadFile={handleDownloadFile}
                onNotify={showToast}
              />
            )}
          </div>
        </div>
      )}

      {/* View 3: Settings Page */}
      {activeView === 'settings' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AppHeader
            currentUser={currentUser}
            activeView={activeView}
            onNavigate={setActiveView}
            onOpenNewPeerModal={() => setIsNewPeerModalOpen(true)}
            onLogout={() => setActiveView('welcome')}
            peerCount={conversations.length}
          />
          <SettingsView
            currentUser={currentUser}
            settings={settings}
            onUpdateUser={setCurrentUser}
            onUpdateSettings={setSettings}
            onBackToChat={() => setActiveView('chat')}
            onNotify={showToast}
          />
        </div>
      )}

      {/* Global Modals & Notifications */}
      <NewPeerModal
        isOpen={isNewPeerModalOpen}
        onClose={() => setIsNewPeerModalOpen(false)}
        onAddConversation={handleAddConversation}
        onNotify={showToast}
        existingPeerIps={conversations.map((c) => c.peer.ip)}
      />

      <MediaViewerModal
        isOpen={mediaViewer.isOpen}
        imageUrl={mediaViewer.url}
        imageTitle={mediaViewer.title}
        senderName={mediaViewer.sender}
        onClose={() => setMediaViewer({ isOpen: false })}
        onDownload={() => handleDownloadFile(mediaViewer.title || 'image.png')}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
