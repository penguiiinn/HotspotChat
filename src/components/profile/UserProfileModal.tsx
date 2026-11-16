import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User as UserIcon,
  Camera,
  Save,
  Copy,
  CheckCheck,
  Terminal,
  ChevronDown
} from 'lucide-react';
import { User, UserStatus } from '../../types';
import { AVATAR_PRESETS } from '../../data/dummyData';
import { Avatar } from '../common/Avatar';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface UserProfileModalProps {
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onSaveProfile: (updatedUser: User) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

const STATUS_OPTIONS: { value: UserStatus; label: string; color: string; desc: string }[] = [
  { value: 'online', label: 'Online', color: 'bg-emerald-500', desc: 'Actively broadcasting packets' },
  { value: 'away', label: 'Away', color: 'bg-amber-500', desc: 'Idle on local hotspot' },
  { value: 'busy', label: 'Do Not Disturb', color: 'bg-rose-500', desc: 'Muted notifications' },
  { value: 'offline', label: 'Stealth Mode', color: 'bg-slate-500', desc: 'Listen only, no broadcast beacon' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSaveProfile,
  onNotify,
}) => {
  // Form State initialized from currentUser
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage);
  const [about, setAbout] = useState(currentUser.about || 'P2P mesh enthusiast. Communicating completely offline over local mobile hotspot.');
  const [status, setStatus] = useState<UserStatus>(currentUser.status);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [isCopiedId, setIsCopiedId] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Cancel: Revert form to currentUser
  const handleCancel = () => {
    setDisplayName(currentUser.displayName);
    setUsername(currentUser.username);
    setStatusMessage(currentUser.statusMessage);
    setAbout(currentUser.about || '');
    setStatus(currentUser.status);
    setAvatar(currentUser.avatar);
    setCustomAvatarUrl('');
    onClose();
  };

  // Handle Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      onNotify('Validation Error', 'Display name cannot be empty', 'info');
      return;
    }
    if (!username.trim()) {
      onNotify('Validation Error', 'Username handle cannot be empty', 'info');
      return;
    }

    const finalAvatar = customAvatarUrl.trim() || avatar;
    const sanitizedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const updated: User = {
      ...currentUser,
      displayName: displayName.trim(),
      username: sanitizedUsername,
      statusMessage: statusMessage.trim() || `${status === 'online' ? 'Online' : status} • ${currentUser.localIp}`,
      about: about.trim(),
      status,
      avatar: finalAvatar,
    };

    onSaveProfile(updated);
    playHotspotChime('sent');
    onNotify('Profile Updated', 'Your identity has been updated across HotspotChat', 'success');
    onClose();
  };

  // Local image file upload via FileReader
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setAvatar(dataUrl);
      setCustomAvatarUrl('');
      onNotify('Photo Loaded', 'Profile photo updated preview', 'info');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Copy User ID
  const handleCopyUserId = () => {
    navigator.clipboard.writeText(`${currentUser.username}#${currentUser.port} (${currentUser.localIp})`);
    setIsCopiedId(true);
    onNotify('Copied User ID', 'Node ID copied to clipboard', 'info');
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCancel}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-xl bg-[#11151F] border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[92vh] z-10 select-none"
        >
          {/* Hidden local image file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleLocalImageUpload}
            className="hidden"
          />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] bg-[#141824]/90">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>User Profile Management</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Node ID: {currentUser.id} • {currentUser.localIp}:{currentUser.port}
                </p>
              </div>
            </div>

            <button
              onClick={handleCancel}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Form */}
          <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
            {/* 1. Avatar Management Hero */}
            <div className="p-4 rounded-2xl bg-[#141824] border border-white/[0.08] flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar
                  src={customAvatarUrl.trim() || avatar}
                  name={displayName || 'User'}
                  size="2xl"
                  status={status}
                  isHost={currentUser.isHost}
                />
                <div className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-medium backdrop-blur-xs">
                  <Camera className="w-5 h-5 mb-1 text-orange-400" />
                  <span>Change</span>
                </div>
              </div>

              <div className="flex-1 space-y-2 text-center sm:text-left">
                <div>
                  <h4 className="text-sm font-bold text-white">{displayName || 'Alex Rivers'}</h4>
                  <p className="text-xs font-mono text-orange-400">@{username || 'alex_rivers'}</p>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/30 text-orange-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Photo</span>
                  </button>

                  <span className="text-[11px] text-slate-500">or pick preset:</span>
                  <div className="flex items-center gap-1.5">
                    {AVATAR_PRESETS.slice(0, 5).map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setAvatar(preset);
                          setCustomAvatarUrl('');
                        }}
                        className={`w-6 h-6 rounded-md overflow-hidden border transition-all cursor-pointer ${
                          avatar === preset && !customAvatarUrl
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

            {/* 2. Display Name & Username Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Display Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Alex Rivers"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Node Handle / Username <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-mono text-slate-500">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="alex_rivers"
                    className="w-full pl-8 pr-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm font-mono focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                    required
                  />
                </div>
              </div>
            </div>

            {/* 3. Broadcast Status Message & Online Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status Headline
                </label>
                <input
                  type="text"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  placeholder="e.g. Broadcasting on wlan0 (192.168.43.120)"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                />
              </div>

              {/* Status Selector Dropdown */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Availability
                </label>
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white text-xs flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        STATUS_OPTIONS.find((s) => s.value === status)?.color
                      }`}
                    />
                    <span>{STATUS_OPTIONS.find((s) => s.value === status)?.label}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showStatusDropdown && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 p-1 bg-[#161B28] border border-white/15 rounded-xl shadow-2xl z-30">
                    {STATUS_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setStatus(opt.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                          status === opt.value
                            ? 'bg-orange-500/15 text-orange-400 font-semibold'
                            : 'text-slate-300 hover:bg-white/5'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 4. About / Bio Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                About / Description
              </label>
              <textarea
                rows={3}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Write a brief description of your node or field role..."
                className="w-full px-3.5 py-2 rounded-xl bg-[#141824] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 resize-none font-sans leading-relaxed"
              />
            </div>

            {/* 5. User ID & Hotspot Node Card */}
            <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Local Node ID</span>
                  <span className="text-slate-200">{currentUser.id} • {currentUser.localIp}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyUserId}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isCopiedId ? (
                  <>
                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
