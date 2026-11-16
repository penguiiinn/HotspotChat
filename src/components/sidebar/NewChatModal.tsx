import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  MessageSquarePlus,
  UserPlus
} from 'lucide-react';
import { Contact, Conversation } from '../../types';
import { Avatar } from '../common/Avatar';

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  contacts: Contact[];
  conversations: Conversation[];
  onSelectOrCreateConversation: (contact: Contact) => void;
  onOpenAddContactModal: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  isOpen,
  onClose,
  contacts,
  conversations,
  onSelectOrCreateConversation,
  onOpenAddContactModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Filter contacts by search query
  const filteredContacts = contacts.filter((c) =>
    c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.ip.includes(searchQuery)
  );

  // Check if conversation already exists with contact
  const hasExistingConversation = (contact: Contact) => {
    return conversations.some((conv) => conv.peer.id === contact.id || conv.peer.ip === contact.ip);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[85vh] z-10 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08] bg-[#141824]/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <MessageSquarePlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">New Conversation</h3>
                <p className="text-xs text-slate-400">Select a peer to start messaging</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar & Add Contact Action */}
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, handle, or IP..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
                autoFocus
              />
            </div>

            {/* Quick action: Add new contact shortcut */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddContactModal();
              }}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/5 hover:border-orange-500/20 text-slate-200 transition-colors cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-100">Add New Contact</p>
                <p className="text-[11px] text-slate-400">Enter custom peer IP or hotspot node ID</p>
              </div>
            </button>
          </div>

          {/* Contacts List */}
          <div className="p-2 overflow-y-auto max-h-80 space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Address Book ({filteredContacts.length})
            </div>

            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => {
                const isExisting = hasExistingConversation(contact);

                return (
                  <div
                    key={contact.id}
                    onClick={() => {
                      onSelectOrCreateConversation(contact);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar
                        src={contact.avatar}
                        name={contact.displayName}
                        size="md"
                        status={contact.status}
                        isHost={contact.isHotspotHost}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-semibold text-white truncate group-hover:text-orange-400 transition-colors">
                            {contact.displayName}
                          </p>
                          {contact.isHotspotHost && (
                            <span className="text-[9px] font-mono px-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              HOST
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-slate-400 truncate">
                          @{contact.username} • {contact.ip}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {isExisting ? (
                        <span className="text-[10px] font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          Active Chat
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 group-hover:text-white px-2 py-0.5 rounded bg-white/5">
                          Start Chat
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-slate-500 text-xs">
                No matching contacts found
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
