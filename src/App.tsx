import React, { useState, useCallback } from 'react';
import {
  INITIAL_USER,
  INITIAL_CONTACTS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  DEFAULT_SETTINGS,
  AUTO_REPLY_TEMPLATES,
} from './data/dummyData';
import type {
  User,
  Contact,
  Conversation,
  Message,
  ActiveView,
  AppSettings,
  FileAttachment,
  CodeSnippet,
  ReplyMessagePreview,
  UserStatus,
} from './types';
import {
  loadStoredUser,
  saveStoredUser,
  loadStoredContacts,
  saveStoredContacts,
  loadStoredConversations,
  saveStoredConversations,
  loadStoredMessages,
  saveStoredMessages,
  loadStoredSettings,
  saveStoredSettings,
} from './utils/storage';
import { WelcomeScreen } from './components/welcome/WelcomeScreen';
import { AppHeader } from './components/layout/AppHeader';
import { LeftSidebar } from './components/sidebar/LeftSidebar';
import { ChatWindow } from './components/chat/ChatWindow';
import { RightInfoPanel } from './components/info/RightInfoPanel';
import { NewPeerModal } from './components/sidebar/NewPeerModal';
import { NewChatModal } from './components/sidebar/NewChatModal';
import { AddContactModal } from './components/contacts/AddContactModal';
import { ContactDetailModal } from './components/contacts/ContactDetailModal';
import { ContactsView } from './components/contacts/ContactsView';
import { UserProfileModal } from './components/profile/UserProfileModal';
import { MediaViewerModal } from './components/chat/MediaViewerModal';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/Toast';
import { useToast } from './hooks/useToast';
import { playHotspotChime } from './hooks/useHotspotSound';

export const App: React.FC = () => {
  // Navigation & View State
  const [activeView, setActiveView] = useState<ActiveView>('welcome');

  // Persisted Core State (initialized from localStorage with dummyData fallbacks)
  const [currentUser, setCurrentUser] = useState<User>(() => loadStoredUser(INITIAL_USER));
  const [contacts, setContacts] = useState<Contact[]>(() => loadStoredContacts(INITIAL_CONTACTS));
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadStoredConversations(INITIAL_CONVERSATIONS)
  );
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>(() =>
    loadStoredMessages(INITIAL_MESSAGES)
  );
  const [settings, setSettings] = useState<AppSettings>(() => loadStoredSettings(DEFAULT_SETTINGS));

  // Active conversation pointer
  const [activeConversationId, setActiveConversationId] = useState<string>('conv-elena');

  // UI Panels & Modals State
  const [isInfoPanelOpen, setIsInfoPanelOpen] = useState(true);
  const [isNewPeerModalOpen, setIsNewPeerModalOpen] = useState(false);
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isUserProfileModalOpen, setIsUserProfileModalOpen] = useState(false);
  const [detailModalContact, setDetailModalContact] = useState<Contact | null>(null);

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
  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];
  const activeMessages = messagesMap[activeConversationId] || [];

  // Theme class applied to root
  const themeClass = settings.accentColor !== 'orange' ? `theme-${settings.accentColor}` : '';

  // 1. Sync User updates to localStorage & message history
  const handleUpdateUser = useCallback(
    (updatedUser: User) => {
      setCurrentUser(updatedUser);
      saveStoredUser(updatedUser);

      // Synchronize sender information in message history for current user
      setMessagesMap((prev) => {
        const next: Record<string, Message[]> = {};
        Object.entries(prev).forEach(([cId, msgList]) => {
          next[cId] = msgList.map((m) =>
            m.senderId === updatedUser.id
              ? { ...m, senderName: updatedUser.displayName, senderAvatar: updatedUser.avatar }
              : m
          );
        });
        saveStoredMessages(next);
        return next;
      });
    },
    []
  );

  // 2. Add Contact Handler
  const handleAddContact = useCallback(
    (newContact: Contact) => {
      setContacts((prev) => {
        const updated = [newContact, ...prev];
        saveStoredContacts(updated);
        return updated;
      });
    },
    []
  );

  // 3. Remove Contact Handler
  const handleRemoveContact = useCallback(
    (contactId: string) => {
      setContacts((prev) => {
        const updated = prev.filter((c) => c.id !== contactId);
        saveStoredContacts(updated);
        return updated;
      });
    },
    []
  );

  // 4. Start New Conversation / Open Existing (Prevents Duplicates)
  const handleSelectOrCreateConversation = useCallback(
    (contact: Contact) => {
      // Check if conversation already exists for this peer
      const existing = conversations.find(
        (c) => c.peer.id === contact.id || c.peer.ip === contact.ip
      );

      if (existing) {
        setActiveConversationId(existing.id);
        setActiveView('chat');
        showToast('Conversation Opened', `Chatting with ${contact.displayName}`, 'info');
        return;
      }

      // Create new conversation
      const newConvId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: newConvId,
        peer: contact,
        unreadCount: 0,
        isPinned: false,
      };

      const initMsg: Message = {
        id: `init-${Date.now()}`,
        conversationId: newConvId,
        senderId: 'system',
        senderName: 'Hotspot Mesh Daemon',
        senderAvatar: currentUser.avatar,
        content: `Connected to peer socket on ${contact.ip}:${contact.port}. Link speed: 2ms.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: 'Today',
        status: 'read',
        type: 'system',
      };

      setConversations((prev) => {
        const updated = [newConv, ...prev];
        saveStoredConversations(updated);
        return updated;
      });

      setMessagesMap((prev) => {
        const updated = {
          ...prev,
          [newConvId]: [initMsg],
        };
        saveStoredMessages(updated);
        return updated;
      });

      setActiveConversationId(newConvId);
      setActiveView('chat');
      playHotspotChime('sent');
      showToast('New Chat Started', `Direct channel established with ${contact.displayName}`, 'success');
    },
    [conversations, currentUser.avatar, showToast]
  );

  // 5. Send Message Handler with realistic local mesh feedback
  const handleSendMessage = useCallback(
    (
      content: string,
      attachment?: FileAttachment,
      codeSnippet?: CodeSnippet,
      replyTo?: ReplyMessagePreview
    ) => {
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
        date: 'Today',
        status: 'sending',
        type: attachment
          ? attachment.type.startsWith('image')
            ? 'image'
            : 'file'
          : codeSnippet
          ? 'code'
          : 'text',
        attachment,
        codeSnippet,
        replyTo,
      };

      // Add message immediately
      setMessagesMap((prev) => {
        const updated = {
          ...prev,
          [activeConversationId]: [...(prev[activeConversationId] || []), newMsg],
        };
        saveStoredMessages(updated);
        return updated;
      });

      // Update conversation's lastMessage
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === activeConversationId ? { ...c, lastMessage: newMsg } : c
        );
        saveStoredConversations(updated);
        return updated;
      });

      // Update contact's lastContactedAt
      setContacts((prev) => {
        const updated = prev.map((c) =>
          c.id === activeConversation.peer.id ? { ...c, lastContactedAt: Date.now() } : c
        );
        saveStoredContacts(updated);
        return updated;
      });

      // Transition to 'sent' after 200ms
      setTimeout(() => {
        setMessagesMap((prev) => {
          const updated: Record<string, Message[]> = {
            ...prev,
            [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
              m.id === newMsgId ? { ...m, status: 'sent' as const } : m
            ),
          };
          saveStoredMessages(updated);
          return updated;
        });
      }, 200);

      // Transition to 'delivered' after 600ms
      setTimeout(() => {
        setMessagesMap((prev) => {
          const updated: Record<string, Message[]> = {
            ...prev,
            [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
              m.id === newMsgId ? { ...m, status: 'delivered' as const } : m
            ),
          };
          saveStoredMessages(updated);
          return updated;
        });
      }, 600);

      // Transition to 'read' after 1200ms
      setTimeout(() => {
        setMessagesMap((prev) => {
          const updated: Record<string, Message[]> = {
            ...prev,
            [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
              m.id === newMsgId ? { ...m, status: 'read' as const } : m
            ),
          };
          saveStoredMessages(updated);
          return updated;
        });
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
            date: 'Today',
            status: 'read',
            type: 'text',
          };

          setMessagesMap((prev) => {
            const updated = {
              ...prev,
              [activeConversationId]: [...(prev[activeConversationId] || []), peerReply],
            };
            saveStoredMessages(updated);
            return updated;
          });

          setConversations((prev) => {
            const updated = prev.map((c) =>
              c.id === activeConversationId ? { ...c, lastMessage: peerReply } : c
            );
            saveStoredConversations(updated);
            return updated;
          });

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

  // 6. Delete Message Handler (WhatsApp style local deletion)
  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      setMessagesMap((prev) => {
        const updated = {
          ...prev,
          [activeConversationId]: (prev[activeConversationId] || []).map((m) =>
            m.id === messageId ? { ...m, isDeleted: true } : m
          ),
        };
        saveStoredMessages(updated);
        return updated;
      });

      showToast('Message Deleted', 'The message was marked as deleted for this device', 'info');
    },
    [activeConversationId, showToast]
  );

  // 7. Toggle Emoji Reaction on a message
  const handleReactMessage = useCallback(
    (messageId: string, emoji: string) => {
      setMessagesMap((prev) => {
        const updated = {
          ...prev,
          [activeConversationId]: (prev[activeConversationId] || []).map((m) => {
            if (m.id !== messageId) return m;

            const currentReactions: Record<string, string[]> = { ...(m.reactions || {}) };
            const userList = currentReactions[emoji] || [];
            const hasReacted = userList.includes(currentUser.displayName);

            if (hasReacted) {
              currentReactions[emoji] = userList.filter((u) => u !== currentUser.displayName);
              if (currentReactions[emoji].length === 0) {
                delete currentReactions[emoji];
              }
            } else {
              currentReactions[emoji] = [...userList, currentUser.displayName];
            }

            return { ...m, reactions: currentReactions };
          }),
        };
        saveStoredMessages(updated);
        return updated;
      });

      playHotspotChime('click');
    },
    [activeConversationId, currentUser.displayName]
  );

  // 8. Clear conversation history
  const handleClearChat = useCallback(() => {
    setMessagesMap((prev) => {
      const updated = {
        ...prev,
        [activeConversationId]: [],
      };
      saveStoredMessages(updated);
      return updated;
    });

    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeConversationId ? { ...c, lastMessage: undefined } : c
      );
      saveStoredConversations(updated);
      return updated;
    });

    showToast('Conversation Cleared', 'Local message cache removed for this peer', 'info');
  }, [activeConversationId, showToast]);

  // 9. Download file simulation
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

  // 10. Open image viewer
  const handleOpenImage = useCallback((url: string, title?: string, sender?: string) => {
    setMediaViewer({
      isOpen: true,
      url,
      title,
      sender,
    });
  }, []);

  // 11. Update user status
  const handleUpdateUserStatus = useCallback(
    (status: UserStatus) => {
      const updated = { ...currentUser, status };
      setCurrentUser(updated);
      saveStoredUser(updated);
      showToast('Status Broadcast Updated', `You are now marked as ${status}`, 'info');
    },
    [currentUser, showToast]
  );

  // 12. Save Settings
  const handleUpdateSettings = useCallback(
    (newSettings: AppSettings) => {
      setSettings(newSettings);
      saveStoredSettings(newSettings);
    },
    []
  );

  return (
    <div className={`h-screen w-screen overflow-hidden flex flex-col bg-[#0B0E14] text-slate-100 ${themeClass}`}>
      {/* View 1: Welcome / Login Screen */}
      {activeView === 'welcome' && (
        <WelcomeScreen
          currentUser={currentUser}
          onContinue={(updatedUser) => {
            handleUpdateUser(updatedUser);
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
            contactsCount={contacts.length}
            onNavigate={setActiveView}
            onOpenNewPeerModal={() => setIsNewPeerModalOpen(true)}
            onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
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
                setConversations((prev) => {
                  const updated = prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c));
                  saveStoredConversations(updated);
                  return updated;
                });
              }}
              onOpenNewPeerModal={() => setIsNewPeerModalOpen(true)}
              onOpenNewChatModal={() => setIsNewChatModalOpen(true)}
              onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
              onUpdateUserStatus={handleUpdateUserStatus}
            />

            {/* Section 2: Centre Chat Window */}
            <ChatWindow
              conversation={activeConversation}
              messages={activeMessages}
              isPeerTyping={!!peerTypingMap[activeConversationId]}
              isInfoPanelOpen={isInfoPanelOpen}
              onToggleInfoPanel={() => setIsInfoPanelOpen(!isInfoPanelOpen)}
              onOpenContactDetail={(c) => setDetailModalContact(c)}
              onSendMessage={handleSendMessage}
              onDeleteMessage={handleDeleteMessage}
              onReactMessage={handleReactMessage}
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

      {/* View 3: Dedicated Contacts Management View */}
      {activeView === 'contacts' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AppHeader
            currentUser={currentUser}
            activeView={activeView}
            contactsCount={contacts.length}
            onNavigate={setActiveView}
            onOpenNewPeerModal={() => setIsNewPeerModalOpen(true)}
            onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
            onLogout={() => setActiveView('welcome')}
            peerCount={conversations.length}
          />
          <ContactsView
            contacts={contacts}
            onOpenConversation={handleSelectOrCreateConversation}
            onOpenAddContactModal={() => setIsAddContactModalOpen(true)}
            onRemoveContact={handleRemoveContact}
            onOpenImage={handleOpenImage}
            onDownloadFile={handleDownloadFile}
            onNotify={showToast}
          />
        </div>
      )}

      {/* View 4: Settings Page */}
      {activeView === 'settings' && (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AppHeader
            currentUser={currentUser}
            activeView={activeView}
            contactsCount={contacts.length}
            onNavigate={setActiveView}
            onOpenNewPeerModal={() => setIsNewPeerModalOpen(true)}
            onOpenUserProfile={() => setIsUserProfileModalOpen(true)}
            onLogout={() => setActiveView('welcome')}
            peerCount={conversations.length}
          />
          <SettingsView
            currentUser={currentUser}
            settings={settings}
            onUpdateUser={handleUpdateUser}
            onUpdateSettings={handleUpdateSettings}
            onBackToChat={() => setActiveView('chat')}
            onNotify={showToast}
          />
        </div>
      )}

      {/* Modal 1: User Profile Management Modal */}
      <UserProfileModal
        isOpen={isUserProfileModalOpen}
        currentUser={currentUser}
        onClose={() => setIsUserProfileModalOpen(false)}
        onSaveProfile={handleUpdateUser}
        onNotify={showToast}
      />

      {/* Modal 2: Add New Contact Modal */}
      <AddContactModal
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        existingContacts={contacts}
        onAddContact={handleAddContact}
        onNotify={showToast}
      />

      {/* Modal 3: Start New Conversation Modal */}
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onClose={() => setIsNewChatModalOpen(false)}
        contacts={contacts}
        conversations={conversations}
        onSelectOrCreateConversation={handleSelectOrCreateConversation}
        onOpenAddContactModal={() => setIsAddContactModalOpen(true)}
      />

      {/* Modal 4: Hotspot Radar Discovery Modal */}
      <NewPeerModal
        isOpen={isNewPeerModalOpen}
        onClose={() => setIsNewPeerModalOpen(false)}
        onAddConversation={(newConv) => {
          handleSelectOrCreateConversation(newConv.peer);
        }}
        onNotify={showToast}
        existingPeerIps={contacts.map((c) => c.ip)}
      />

      {/* Modal 5: Fullscreen Media Lightbox */}
      <MediaViewerModal
        isOpen={mediaViewer.isOpen}
        imageUrl={mediaViewer.url}
        imageTitle={mediaViewer.title}
        senderName={mediaViewer.sender}
        onClose={() => setMediaViewer({ isOpen: false })}
        onDownload={() => handleDownloadFile(mediaViewer.title || 'image.png')}
      />

      {/* Modal 6: Contact Information & Node Details Modal */}
      <ContactDetailModal
        isOpen={Boolean(detailModalContact)}
        contact={detailModalContact}
        onClose={() => setDetailModalContact(null)}
        onOpenConversation={(c) => {
          handleSelectOrCreateConversation(c);
          setDetailModalContact(null);
        }}
        onRequestRemoveContact={(c) => {
          handleRemoveContact(c.id);
          setDetailModalContact(null);
        }}
        onOpenImage={handleOpenImage}
        onDownloadFile={handleDownloadFile}
        onNotify={showToast}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
