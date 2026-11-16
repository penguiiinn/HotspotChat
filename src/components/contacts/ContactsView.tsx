import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  UserPlus,
  MessageSquare,
  Trash2,
  Zap,
  Radio,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Download
} from 'lucide-react';
import { Contact } from '../../types';
import { Avatar } from '../common/Avatar';
import { SHARED_MEDIA_ITEMS, SHARED_DOCUMENTS } from '../../data/dummyData';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface ContactsViewProps {
  contacts: Contact[];
  onOpenConversation: (contact: Contact) => void;
  onOpenAddContactModal: () => void;
  onRemoveContact: (contactId: string) => void;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

type SortOption = 'name-asc' | 'name-desc' | 'status-online' | 'recent';

export const ContactsView: React.FC<ContactsViewProps> = ({
  contacts,
  onOpenConversation,
  onOpenAddContactModal,
  onRemoveContact,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'hosts'>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  // Selected contact
  const selectedContact = useMemo(() => {
    return contacts.find((c) => c.id === selectedContactId) || contacts[0];
  }, [contacts, selectedContactId]);

  // Filtered & Sorted contacts
  const filteredAndSortedContacts = useMemo(() => {
    let result = contacts.filter((c) => {
      const matchesSearch =
        c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.ip.includes(searchQuery) ||
        (c.role || '').toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (filterType === 'online') return c.status === 'online';
      if (filterType === 'hosts') return c.isHotspotHost;
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortOption === 'name-asc') {
        return a.displayName.localeCompare(b.displayName);
      }
      if (sortOption === 'name-desc') {
        return b.displayName.localeCompare(a.displayName);
      }
      if (sortOption === 'status-online') {
        if (a.status === 'online' && b.status !== 'online') return -1;
        if (a.status !== 'online' && b.status === 'online') return 1;
        return a.displayName.localeCompare(b.displayName);
      }
      if (sortOption === 'recent') {
        return (b.lastContactedAt || 0) - (a.lastContactedAt || 0);
      }
      return 0;
    });

    return result;
  }, [contacts, searchQuery, filterType, sortOption]);

  // Recently contacted users (top 3)
  const recentlyContacted = useMemo(() => {
    return [...contacts]
      .sort((a, b) => (b.lastContactedAt || 0) - (a.lastContactedAt || 0))
      .slice(0, 4);
  }, [contacts]);

  // Group contacts by first letter for directory feel
  const groupedContacts = useMemo(() => {
    const groups: Record<string, Contact[]> = {};
    filteredAndSortedContacts.forEach((contact) => {
      const firstLetter = contact.displayName.charAt(0).toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(contact);
    });
    return groups;
  }, [filteredAndSortedContacts]);

  // Handle Remove Confirmation
  const confirmDelete = () => {
    if (!contactToDelete) return;
    onRemoveContact(contactToDelete.id);
    playHotspotChime('click');
    onNotify('Contact Removed', `${contactToDelete.displayName} was removed from your address book`, 'info');
    setContactToDelete(null);
  };

  const handlePing = () => {
    if (!selectedContact) return;
    setIsPinging(true);
    playHotspotChime('click');
    setTimeout(() => {
      setIsPinging(false);
      playHotspotChime('peer');
      onNotify('Pong Response', `Latency to ${selectedContact.ip}: ${selectedContact.pingMs}ms. Link optimal.`, 'success');
    }, 450);
  };

  return (
    <div className="flex-1 h-full bg-[#0B0E14] flex flex-col overflow-hidden select-none">
      {/* Top Bar */}
      <div className="h-16 px-6 bg-[#0E121A] border-b border-white/[0.07] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Contacts Directory</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                {contacts.length} PEERS
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">Verified hotspot nodes on subnet 192.168.43.0/24</p>
          </div>
        </div>

        <button
          onClick={onOpenAddContactModal}
          className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Contact</span>
        </button>
      </div>

      {/* Main 2-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Contact List with Search, Filters, and Directory */}
        <div className="w-full md:w-96 lg:w-108 h-full border-r border-white/[0.07] bg-[#0E121A] flex flex-col shrink-0 overflow-hidden">
          {/* Search & Sort Controls */}
          <div className="p-4 border-b border-white/[0.06] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts by name, handle, IP..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500/60"
              />
            </div>

            <div className="flex items-center justify-between gap-2">
              {/* Filter Tabs */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterType('all')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterType === 'all'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  All ({contacts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('online')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterType === 'online'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Online
                </button>
                <button
                  type="button"
                  onClick={() => setFilterType('hosts')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    filterType === 'hosts'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Gateway AP
                </button>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-2.5 py-1 rounded-lg bg-[#141824] border border-white/10 text-slate-300 text-xs font-medium focus:outline-none focus:border-orange-500/60 cursor-pointer"
              >
                <option value="name-asc">Sort: Name (A-Z)</option>
                <option value="name-desc">Sort: Name (Z-A)</option>
                <option value="status-online">Sort: Online First</option>
                <option value="recent">Sort: Recently Contacted</option>
              </select>
            </div>
          </div>

          {/* Recently Contacted Horizontal Row */}
          {!searchQuery && recentlyContacted.length > 0 && (
            <div className="px-4 py-3 border-b border-white/[0.05] bg-[#11151F]/40">
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-orange-400" />
                <span>Recently Contacted</span>
              </p>
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {recentlyContacted.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContactId(c.id)}
                    className="flex flex-col items-center gap-1 cursor-pointer group shrink-0"
                    title={c.displayName}
                  >
                    <Avatar
                      src={c.avatar}
                      name={c.displayName}
                      size="sm"
                      status={c.status}
                      isHost={c.isHotspotHost}
                      className="group-hover:scale-105 transition-transform"
                    />
                    <span className="text-[10px] font-medium text-slate-400 group-hover:text-white max-w-[60px] truncate">
                      {c.displayName.split(' ')[0]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Directory Contact List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {Object.keys(groupedContacts).length > 0 ? (
              Object.entries(groupedContacts).map(([letter, groupList]) => (
                <div key={letter} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold text-orange-400/90 font-mono">
                    {letter}
                  </div>
                  {groupList.map((contact) => {
                    const isSelected = selectedContact?.id === contact.id;

                    return (
                      <div
                        key={contact.id}
                        onClick={() => setSelectedContactId(contact.id)}
                        className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#182030] border border-white/10 shadow-md'
                            : 'hover:bg-white/[0.04] border border-transparent'
                        }`}
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
                              <p className={`text-xs font-semibold truncate ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                {contact.displayName}
                              </p>
                              {contact.isHotspotHost && (
                                <span className="text-[9px] font-mono px-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                  AP
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-400 truncate">
                              @{contact.username} • <span className="font-mono">{contact.ip}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenConversation(contact);
                            }}
                            title="Open Conversation"
                            className="p-2 rounded-lg bg-orange-500/10 hover:bg-orange-500 text-orange-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                No matching contacts found in address book
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Complete Contact Information Panel */}
        <div className="flex-1 h-full bg-[#0B0E14] overflow-y-auto p-6 sm:p-8 flex flex-col max-w-3xl">
          {selectedContact ? (
            <motion.div
              key={selectedContact.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* Contact Hero Banner */}
              <div className="p-6 rounded-2xl bg-[#141824] border border-white/[0.08] flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                  <Avatar
                    src={selectedContact.avatar}
                    name={selectedContact.displayName}
                    size="2xl"
                    status={selectedContact.status}
                    isHost={selectedContact.isHotspotHost}
                  />

                  <div className="space-y-1">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-xl font-bold text-white">{selectedContact.displayName}</h3>
                      {selectedContact.isHotspotHost && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                          GATEWAY HOST
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-orange-400">@{selectedContact.username}</p>
                    <p className="text-xs text-slate-400 font-medium">{selectedContact.role || 'Hotspot Peer Node'}</p>
                    <p className="text-xs text-slate-300 max-w-md pt-1 leading-relaxed">
                      {selectedContact.about || selectedContact.bio || selectedContact.statusMessage}
                    </p>
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenConversation(selectedContact)}
                    className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Open Chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setContactToDelete(selectedContact)}
                    className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    title="Remove Contact"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Technical Node Specifications Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-white/5">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Radio className="w-3.5 h-3.5 text-orange-400" />
                      <span>SOCKET LINK</span>
                    </span>
                    <span className="text-emerald-400 font-semibold">{selectedContact.status.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Peer Address:</span>
                    <span className="text-orange-400 font-bold">{selectedContact.ip}:{selectedContact.port}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Latency:</span>
                    <span className="text-emerald-400 font-bold">{selectedContact.pingMs} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Signal:</span>
                    <span className="text-slate-300">{selectedContact.signalStrength}% Quality</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Data Exchanged:</span>
                    <span className="text-slate-300">{selectedContact.dataExchanged || '14.2 MB'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-white/5">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SECURITY</span>
                    </span>
                    <span className="text-emerald-400">VERIFIED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Encryption:</span>
                    <span className="text-slate-300">AES-256-GCM Local</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fingerprint:</span>
                    <span className="text-slate-400 truncate max-w-[140px]">{selectedContact.fingerprint || 'Verified'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MAC Addr:</span>
                    <span className="text-slate-300">{selectedContact.macAddress || '7A:4B:92:DF:11'}</span>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePing}
                      disabled={isPinging}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Zap className={`w-3.5 h-3.5 ${isPinging ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
                      <span>{isPinging ? 'Testing Link...' : 'Send Socket Ping'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Shared Assets Counters & Previews */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Shared Media & Files With {selectedContact.displayName}
                </h4>

                <div className="grid grid-cols-2 gap-4">
                  {/* Photos Card */}
                  <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-400" />
                        <span>Shared Photos</span>
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {selectedContact.sharedMediaCount ?? SHARED_MEDIA_ITEMS.length} Photos
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {SHARED_MEDIA_ITEMS.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => onOpenImage(item.url, item.title, selectedContact.displayName)}
                          className="aspect-square rounded-lg overflow-hidden border border-white/10 cursor-pointer bg-slate-900 group relative"
                        >
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents Card */}
                  <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-orange-400" />
                        <span>Shared Documents</span>
                      </span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                        {selectedContact.sharedDocsCount ?? SHARED_DOCUMENTS.length} Files
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {SHARED_DOCUMENTS.slice(0, 2).map((doc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-lg bg-[#0E121A] border border-white/5 text-xs"
                        >
                          <span className="truncate text-slate-200 text-[11px]">{doc.name}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[10px] font-mono text-slate-500">{doc.size}</span>
                            <button
                              type="button"
                              onClick={() => onDownloadFile(doc.name)}
                              className="p-1 rounded text-slate-400 hover:text-white cursor-pointer"
                              title="Download"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500">
              <Users className="w-12 h-12 mb-3 opacity-40" />
              <p className="text-sm font-semibold text-slate-300">Select a Contact</p>
              <p className="text-xs text-slate-500 mt-1">Choose a peer from the directory to inspect node credentials</p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Removing a Contact */}
      {contactToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setContactToDelete(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-sm bg-[#161B28] border border-white/10 rounded-2xl shadow-2xl p-6 z-10 space-y-4"
          >
            <div className="w-10 h-10 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h4 className="text-base font-bold text-white">Remove Contact?</h4>
              <p className="text-xs text-slate-400 mt-1">
                Are you sure you want to remove <span className="font-semibold text-white">{contactToDelete.displayName}</span> (@{contactToDelete.username}) from your contacts directory?
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setContactToDelete(null)}
                className="flex-1 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer shadow-lg shadow-rose-500/25"
              >
                Yes, Remove
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
