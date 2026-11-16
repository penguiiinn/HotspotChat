import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  UserPlus,
  Terminal,
  Sparkles,
  AlertCircle,
  Plus
} from 'lucide-react';
import { Contact, DiscoveredPeer } from '../../types';
import { AVATAR_PRESETS, DISCOVERED_PEERS_POOL } from '../../data/dummyData';
import { Avatar } from '../common/Avatar';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingContacts: Contact[];
  onAddContact: (newContact: Contact) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  existingContacts,
  onAddContact,
  onNotify,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [userIdOrIp, setUserIdOrIp] = useState('192.168.43.');
  const [role, setRole] = useState('Hardware Engineer');
  const [about, setAbout] = useState('Direct peer node connected via local mobile hotspot.');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[3]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setDisplayName('');
    setUsername('');
    setUserIdOrIp('192.168.43.');
    setValidationError(null);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // 1. Validation checks
    if (!displayName.trim()) {
      setValidationError('Please enter a display name for the contact');
      return;
    }
    if (!username.trim()) {
      setValidationError('Please enter a unique username/handle');
      return;
    }
    if (!userIdOrIp.trim() || userIdOrIp.trim() === '192.168.43.') {
      setValidationError('Please specify a valid hotspot IP address or node ID (e.g. 192.168.43.77)');
      return;
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const cleanIp = userIdOrIp.trim();

    // 2. Duplicate check
    const isDuplicateUsername = existingContacts.some(
      (c) => c.username.toLowerCase() === cleanUsername
    );
    if (isDuplicateUsername) {
      setValidationError(`A contact with handle @${cleanUsername} already exists.`);
      return;
    }

    const isDuplicateIp = existingContacts.some(
      (c) => c.ip === cleanIp
    );
    if (isDuplicateIp) {
      setValidationError(`A contact with node IP ${cleanIp} is already registered.`);
      return;
    }

    // 3. Create Contact
    const finalAvatar = customAvatarUrl.trim() || selectedAvatar;
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      username: cleanUsername,
      displayName: displayName.trim(),
      avatar: finalAvatar,
      status: 'online',
      statusMessage: `${role} • ${cleanIp}`,
      about: about.trim(),
      ip: cleanIp,
      port: 4892,
      signalStrength: 92,
      pingMs: Math.floor(Math.random() * 4) + 2,
      isHotspotHost: false,
      role: role.trim(),
      bio: about.trim(),
      lastSeen: 'Just now',
      dataExchanged: '0 KB',
      fingerprint: `SHA256: ${Math.random().toString(16).substring(2, 10)}...`,
      sharedMediaCount: 0,
      sharedDocsCount: 0,
      lastContactedAt: Date.now(),
    };

    onAddContact(newContact);
    playHotspotChime('sent');
    onNotify('Contact Added', `${newContact.displayName} (@${newContact.username}) is now in your directory`, 'success');
    handleReset();
  };

  // Quick Add helper from discovered peers pool
  const handleQuickAddPeer = (peer: DiscoveredPeer) => {
    setDisplayName(peer.hostname);
    setUsername(peer.hostname.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
    setUserIdOrIp(peer.ip);
    setSelectedAvatar(peer.avatar);
    setValidationError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleReset}
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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Add New Contact</h3>
                <p className="text-xs text-slate-400">Register a local hotspot peer in your address book</p>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
            {/* Validation Banner if error exists */}
            {validationError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Quick Suggestions from discovered hotspot peers */}
            <div className="p-3 rounded-xl bg-[#141824] border border-white/[0.06]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Available on Hotspot</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400">192.168.43.0/24</span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {DISCOVERED_PEERS_POOL.slice(0, 3).map((peer, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickAddPeer(peer)}
                    className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500/15 hover:border-orange-500/30 border border-white/10 text-xs text-slate-200 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <img src={peer.avatar} alt={peer.hostname} className="w-4 h-4 rounded-full object-cover" />
                    <span className="font-medium truncate max-w-[110px]">{peer.hostname}</span>
                    <Plus className="w-3 h-3 text-orange-400" />
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Avatar Selection & Live Preview */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Contact Avatar Preview
              </label>
              <div className="flex items-center gap-4">
                <Avatar
                  src={customAvatarUrl.trim() || selectedAvatar}
                  name={displayName || 'Contact'}
                  size="xl"
                  status="online"
                />

                <div className="flex-1">
                  <p className="text-[11px] text-slate-400 mb-1.5">Choose avatar preset:</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {AVATAR_PRESETS.slice(0, 6).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setSelectedAvatar(preset);
                          setCustomAvatarUrl('');
                        }}
                        className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedAvatar === preset && !customAvatarUrl
                            ? 'border-orange-500 scale-110 shadow-sm'
                            : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Display Name & Handle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Username / Handle <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono text-slate-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="maya_lin"
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Peer Node IP / User ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Hotspot Peer IP or Node ID <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <Terminal className="absolute left-3.5 top-2.5 w-4 h-4 text-orange-400" />
                <input
                  type="text"
                  value={userIdOrIp}
                  onChange={(e) => setUserIdOrIp(e.target.value)}
                  placeholder="192.168.43.77"
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                  required
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500 mt-1">
                Port 4892 is used automatically for direct socket negotiation
              </p>
            </div>

            {/* Role & Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Specialization</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500/60"
                >
                  <option value="Hardware Engineer">Hardware Engineer</option>
                  <option value="Protocol Architect">Protocol Architect</option>
                  <option value="Robotics & Telemetry">Robotics & Telemetry</option>
                  <option value="Firmware Lead">Firmware Lead</option>
                  <option value="Field Operator">Field Operator</option>
                  <option value="Hotspot Node">Hotspot Node</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Status / About</label>
                <input
                  type="text"
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Status description"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500/60"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Save Contact</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
