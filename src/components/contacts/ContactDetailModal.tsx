import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  Zap,
  Trash2,
  FileText,
  ShieldCheck,
  Copy,
  CheckCheck,
  Radio,
  Download
} from 'lucide-react';
import type { Contact } from '../../types';
import { Avatar } from '../common/Avatar';
import { SHARED_MEDIA_ITEMS, SHARED_DOCUMENTS } from '../../data/dummyData';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface ContactDetailModalProps {
  isOpen: boolean;
  contact: Contact | null;
  onClose: () => void;
  onOpenConversation: (contact: Contact) => void;
  onRequestRemoveContact: (contact: Contact) => void;
  onOpenImage: (url: string, title?: string, sender?: string) => void;
  onDownloadFile: (fileName: string) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  isOpen,
  contact,
  onClose,
  onOpenConversation,
  onRequestRemoveContact,
  onOpenImage,
  onDownloadFile,
  onNotify,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'media' | 'docs'>('media');
  const [isCopiedId, setIsCopiedId] = useState(false);
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen || !contact) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(`${contact.username}#${contact.port} (${contact.ip})`);
    setIsCopiedId(true);
    onNotify('Copied User ID', 'Contact Node ID copied', 'info');
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  const handlePing = () => {
    setIsPinging(true);
    playHotspotChime('click');
    setTimeout(() => {
      setIsPinging(false);
      playHotspotChime('peer');
      onNotify('Pong Received', `Direct peer ${contact.ip} replied in ${contact.pingMs}ms. 0% loss.`, 'success');
    }, 500);
  };

  const mediaCount = contact.sharedMediaCount ?? SHARED_MEDIA_ITEMS.length;
  const docsCount = contact.sharedDocsCount ?? SHARED_DOCUMENTS.length;

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
          className="relative w-full max-w-lg bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh] z-10 select-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#141824]/90">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Contact Information</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-400 border border-orange-500/30">
                P2P NODE
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Hero Profile Card */}
            <div className="flex flex-col items-center text-center">
              <Avatar
                src={contact.avatar}
                name={contact.displayName}
                size="2xl"
                status={contact.status}
                isHost={contact.isHotspotHost}
                className="mb-3"
              />

              <div className="flex items-center gap-1.5">
                <h4 className="text-lg font-bold text-white">{contact.displayName}</h4>
                {contact.isHotspotHost && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    GATEWAY HOST
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-orange-400">@{contact.username}</p>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{contact.role || 'Hotspot Node'}</p>

              {/* Status & About */}
              <p className="text-xs text-slate-300 max-w-sm mt-2.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 leading-relaxed">
                {contact.about || contact.bio || contact.statusMessage}
              </p>

              {/* Direct Action Buttons */}
              <div className="grid grid-cols-3 gap-2 w-full mt-4">
                <button
                  type="button"
                  onClick={() => {
                    onOpenConversation(contact);
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </button>

                <button
                  type="button"
                  onClick={handlePing}
                  disabled={isPinging}
                  className="py-2.5 px-3 rounded-xl bg-[#161B28] hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${isPinging ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
                  <span>{isPinging ? 'Pinging...' : `${contact.pingMs}ms Ping`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onRequestRemoveContact(contact);
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              </div>
            </div>

            {/* Socket Node ID & IP Card */}
            <div className="p-3.5 rounded-xl bg-[#141824] border border-white/[0.08] text-xs font-mono space-y-2">
              <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-white/5">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-orange-400" />
                  <span>PEER IDENTIFICATION</span>
                </span>
                <span className="text-emerald-400 font-semibold">{contact.status.toUpperCase()}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Node IP:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-orange-400 font-bold">{contact.ip}:{contact.port}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Copy Node Address"
                    className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {isCopiedId ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Signal Strength:</span>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${contact.signalStrength}%` }} />
                  </div>
                  <span>{contact.signalStrength}%</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Data Exchanged:</span>
                <span className="text-slate-300">{contact.dataExchanged || '14.2 MB'}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Encryption:</span>
                <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
                  <ShieldCheck className="w-3 h-3" />
                  <span>E2EE Local Key</span>
                </span>
              </div>
            </div>

            {/* Shared Media & Documents Tabs with Counts */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Shared Over Hotspot
                </span>
                <div className="flex items-center gap-1 p-0.5 bg-black/40 rounded-lg border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('media')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeMediaTab === 'media'
                        ? 'bg-orange-500/20 text-orange-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Images ({mediaCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMediaTab('docs')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      activeMediaTab === 'docs'
                        ? 'bg-orange-500/20 text-orange-400 font-medium'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Docs ({docsCount})
                  </button>
                </div>
              </div>

              {activeMediaTab === 'media' ? (
                <div className="grid grid-cols-3 gap-2">
                  {SHARED_MEDIA_ITEMS.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onOpenImage(item.url, item.title, contact.displayName)}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 cursor-pointer bg-slate-900"
                    >
                      <img src={item.url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono p-1 text-center">
                        {item.title}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1.5">
                  {SHARED_DOCUMENTS.slice(0, 3).map((doc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-[#141824] border border-white/[0.06] text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-orange-400 shrink-0" />
                        <span className="truncate text-slate-200 font-medium">{doc.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onDownloadFile(doc.name)}
                        className="p-1 hover:text-white text-slate-400 cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
