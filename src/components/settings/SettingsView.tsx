import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User as UserIcon,
  Wifi,
  Palette,
  Bell,
  Info,
  Save,
  ArrowLeft,
  Radio,
  Volume2
} from 'lucide-react';
import { User, AppSettings } from '../../types';
import { AVATAR_PRESETS } from '../../data/dummyData';
import { Avatar } from '../common/Avatar';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface SettingsViewProps {
  currentUser: User;
  settings: AppSettings;
  onUpdateUser: (updatedUser: User) => void;
  onUpdateSettings: (updatedSettings: AppSettings) => void;
  onBackToChat: () => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  settings,
  onUpdateUser,
  onUpdateSettings,
  onBackToChat,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'network' | 'appearance' | 'notifications' | 'about'>('profile');

  // Profile Form State
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [username, setUsername] = useState(currentUser.username);
  const [statusMessage, setStatusMessage] = useState(currentUser.statusMessage);
  const [about, setAbout] = useState(currentUser.about || 'P2P mesh enthusiast. Communicating completely offline over local mobile hotspot.');
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  // Handle Cancel Profile Editing
  const handleCancelProfile = () => {
    setDisplayName(currentUser.displayName);
    setUsername(currentUser.username);
    setStatusMessage(currentUser.statusMessage);
    setAbout(currentUser.about || '');
    setAvatar(currentUser.avatar);
    setCustomAvatarInput('');
    onNotify('Changes Cancelled', 'Profile form reverted to current identity', 'info');
  };

  // Settings State
  const [appTheme, setAppTheme] = useState(settings.theme);
  const [accentColor, setAccentColor] = useState(settings.accentColor);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [listenPort, setListenPort] = useState(settings.listenPort.toString());
  const [discoveryInterval, setDiscoveryInterval] = useState(settings.peerDiscoveryInterval.toString());
  const [autoAcceptFiles, setAutoAcceptFiles] = useState(settings.autoAcceptFiles);
  const [enableEncryption, setEnableEncryption] = useState(settings.enableEncryption);
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notificationsEnabled);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAvatar = customAvatarInput.trim() || avatar;
    onUpdateUser({
      ...currentUser,
      displayName: displayName.trim() || currentUser.displayName,
      username: username.trim().toLowerCase().replace(/\s+/g, '_'),
      statusMessage: statusMessage.trim(),
      about: about.trim(),
      avatar: finalAvatar,
    });
    playHotspotChime('sent');
    onNotify('Profile Updated', 'Local node broadcast info has been saved', 'success');
  };

  const handleSaveNetworkSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      theme: appTheme,
      accentColor,
      soundEnabled,
      listenPort: parseInt(listenPort) || 4892,
      peerDiscoveryInterval: parseInt(discoveryInterval) || 5,
      autoAcceptFiles,
      enableEncryption,
      notificationsEnabled,
    });
    playHotspotChime('sent');
    onNotify('Settings Saved', 'P2P mesh parameters updated successfully', 'success');
  };

  return (
    <div className="flex-1 h-full bg-[#0B0E14] flex flex-col overflow-hidden select-none">
      {/* Settings Top Bar */}
      <div className="h-14 px-6 bg-[#0E121A] border-b border-white/[0.07] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              playHotspotChime('click');
              onBackToChat();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Messages</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Application Settings</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
              CONFIG
            </span>
          </h2>
        </div>

        <div className="text-xs font-mono text-slate-500">
          Node: {currentUser.localIp}:{currentUser.port}
        </div>
      </div>

      {/* Main Settings Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Internal Sidebar */}
        <aside className="w-64 border-r border-white/[0.07] bg-[#0E121A] p-3 space-y-1 shrink-0 hidden sm:block">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Node Identity & Profile</span>
          </button>

          <button
            onClick={() => setActiveTab('network')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'network'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>Hotspot & P2P Sockets</span>
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'appearance'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Theme & Accents</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Audio & Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('about')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>About HotspotChat</span>
          </button>
        </aside>

        {/* Settings Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-3xl">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-white">Local Node Identity</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your identity as broadcasted to other computers on the hotspot
                </p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Preview & Selection */}
                <div className="p-4 rounded-2xl bg-[#141824] border border-white/[0.08] space-y-3">
                  <label className="block text-xs font-semibold text-slate-300">
                    Profile Picture Management
                  </label>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={customAvatarInput.trim() || avatar}
                      name={displayName}
                      size="xl"
                      status={currentUser.status}
                      isHost={currentUser.isHost}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-200 mb-1.5">Choose from Presets</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {AVATAR_PRESETS.map((presetUrl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setAvatar(presetUrl);
                              setCustomAvatarInput('');
                            }}
                            className={`w-8 h-8 rounded-lg overflow-hidden border-2 transition-transform cursor-pointer ${
                              avatar === presetUrl && !customAvatarInput
                                ? 'border-orange-500 scale-110 shadow-sm'
                                : 'border-transparent opacity-60 hover:opacity-100'
                            }`}
                          >
                            <img src={presetUrl} alt="Preset" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Node Username
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Broadcast Status Message
                  </label>
                  <input
                    type="text"
                    value={statusMessage}
                    onChange={(e) => setStatusMessage(e.target.value)}
                    placeholder="e.g. Online • Direct peer connection active"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    About / Description
                  </label>
                  <textarea
                    rows={2}
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    placeholder="Short description of your peer node..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#141824] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 resize-none"
                  />
                </div>

                {/* User ID Card */}
                <div className="p-3.5 rounded-xl bg-[#0E121A] border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Node ID</span>
                    <span className="text-slate-200">{currentUser.id} • {currentUser.localIp}</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">ONLINE</span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelProfile}
                    className="py-2.5 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Profile Identity</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* TAB 2: Network & Hotspot Sockets */}
          {activeTab === 'network' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-white">Hotspot & P2P Sockets</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure local socket listening ports and subnet multicast discovery
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08]">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Listening Socket Port
                    </label>
                    <p className="text-[11px] text-slate-400 mb-2">Default P2P TCP port for incoming chats</p>
                    <input
                      type="text"
                      value={listenPort}
                      onChange={(e) => setListenPort(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E121A] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-orange-500/60"
                    />
                  </div>

                  <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08]">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Multicast Beacon Interval (seconds)
                    </label>
                    <p className="text-[11px] text-slate-400 mb-2">How frequently this node broadcasts UDP beacons</p>
                    <input
                      type="text"
                      value={discoveryInterval}
                      onChange={(e) => setDiscoveryInterval(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0E121A] border border-white/10 text-white font-mono text-xs focus:outline-none focus:border-orange-500/60"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Auto-Accept Direct File Transfers</p>
                    <p className="text-[11px] text-slate-400">
                      Automatically receive binary payloads without prompt
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoAcceptFiles}
                    onChange={(e) => setAutoAcceptFiles(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Local AES-256 E2E Encryption</p>
                    <p className="text-[11px] text-slate-400">
                      Encrypt socket packets with local peer public key
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableEncryption}
                    onChange={(e) => setEnableEncryption(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNetworkSettings}
                  className="py-2.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Update Socket Parameters</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 3: Appearance & Themes */}
          {activeTab === 'appearance' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-white">Appearance & Themes</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your desktop workspace aesthetic and accent color
                </p>
              </div>

              {/* Theme Variants */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-300">
                  Dark Interface Theme
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'charcoal', name: 'Charcoal Dark', bg: 'bg-[#0B0E14]' },
                    { id: 'midnight', name: 'Midnight Blue', bg: 'bg-[#0A101D]' },
                    { id: 'obsidian', name: 'Obsidian OLED', bg: 'bg-[#050608]' },
                    { id: 'slate', name: 'Slate Steel', bg: 'bg-[#0F172A]' },
                  ].map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setAppTheme(theme.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        appTheme === theme.id
                          ? 'border-orange-500 ring-1 ring-orange-500/50 bg-[#161B28]'
                          : 'border-white/10 hover:border-white/20 bg-[#141824]'
                      }`}
                    >
                      <div className={`w-full h-8 rounded-lg ${theme.bg} border border-white/10 mb-2`} />
                      <p className="text-xs font-semibold text-white">{theme.name}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Colors */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-semibold text-slate-300">
                  Hotspot Accent Color
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { id: 'orange', name: 'Hotspot Amber', color: 'bg-orange-500' },
                    { id: 'emerald', name: 'Cyber Emerald', color: 'bg-emerald-500' },
                    { id: 'indigo', name: 'Electric Indigo', color: 'bg-indigo-500' },
                    { id: 'cyan', name: 'Neon Cyan', color: 'bg-cyan-500' },
                  ].map((accent) => (
                    <button
                      key={accent.id}
                      type="button"
                      onClick={() => setAccentColor(accent.id as any)}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all cursor-pointer ${
                        accentColor === accent.id
                          ? 'border-orange-500 ring-1 ring-orange-500/50 bg-[#161B28]'
                          : 'border-white/10 hover:border-white/20 bg-[#141824]'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${accent.color}`} />
                      <span className="text-xs font-semibold text-white">{accent.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSaveNetworkSettings}
                className="py-2.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Apply Appearance</span>
              </button>
            </motion.div>
          )}

          {/* TAB 4: Audio & Notifications */}
          {activeTab === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-base font-bold text-white">Audio & Alerts</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synthesized Web Audio chimes for offline messaging feedback
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Volume2 className="w-5 h-5 text-orange-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Message Transmission Chimes</p>
                      <p className="text-[11px] text-slate-400">Play subtle tone when sending or receiving packets</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-semibold text-slate-200">Peer Discovery Alerts</p>
                      <p className="text-[11px] text-slate-400">Notify when a new computer joins the hotspot subnet</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationsEnabled}
                    onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveNetworkSettings}
                  className="py-2.5 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Audio Preferences</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 5: About HotspotChat */}
          {activeTab === 'about' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-orange-500/15 via-amber-500/5 to-transparent border border-orange-500/20">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">HOTSPOTCHAT Desktop</h3>
                  <p className="text-xs font-mono text-orange-400">Version 1.0.0-p2p (Offline Engine Ready)</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#141824] border border-white/[0.08] text-xs text-slate-300 leading-relaxed space-y-3">
                <p>
                  <strong>HotspotChat</strong> is built for environments where the public internet is compromised, unavailable, or restricted. By leveraging Wi-Fi Direct and mobile hotspot tethering, nearby laptops can communicate at hardware-level speeds with 0 bytes of cellular data.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-500 block">Discovery:</span>
                    <span className="text-emerald-400">UDP Multicast on 255.255.255.255</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-slate-500 block">Payload Transport:</span>
                    <span className="text-orange-400">TCP Streaming Socket (Port 4892)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};
