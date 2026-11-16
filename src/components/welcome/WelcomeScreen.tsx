import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Wifi, Shield, ArrowRight, Sparkles, Laptop, Cpu, Check, Terminal } from 'lucide-react';
import { AVATAR_PRESETS } from '../../data/dummyData';
import { User } from '../../types';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface WelcomeScreenProps {
  currentUser: User;
  onContinue: (updatedUser: User) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success' | 'network') => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  currentUser,
  onContinue,
  onNotify,
}) => {
  const [username, setUsername] = useState(currentUser.username);
  const [displayName, setDisplayName] = useState(currentUser.displayName);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser.avatar);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [nodeRole, setNodeRole] = useState('Local Peer Node');
  const [isInitializing, setIsInitializing] = useState(false);

  const handleLaunch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      onNotify('Username Required', 'Please choose a node username to broadcast on the hotspot.', 'info');
      return;
    }

    setIsInitializing(true);
    playHotspotChime('peer');

    setTimeout(() => {
      setIsInitializing(false);
      onContinue({
        ...currentUser,
        username: username.trim().toLowerCase().replace(/\s+/g, '_'),
        displayName: displayName.trim() || username.trim(),
        avatar: customAvatarUrl.trim() || selectedAvatar,
        statusMessage: `${nodeRole} • 192.168.43.120`,
      });
      onNotify('Node Online', 'Broadcasting HotspotChat beacon on wlan0:4892', 'network');
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0B0E14] text-slate-100 flex flex-col justify-between overflow-x-hidden overflow-y-auto mesh-radial-bg">
      {/* Ambient background grid and animated mesh particles */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Floating subtle ambient orbs */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none"
      />

      {/* Top Bar Branding */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 border border-orange-400/30">
            <Radio className="w-5 h-5 text-white animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-white">HOTSPOTCHAT</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                P2P MESH
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Offline Local Network Protocol</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local AP: AndroidAP_9842</span>
          <span className="text-slate-600">|</span>
          <span className="text-orange-400">Zero Internet Required</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 py-4 flex-1 flex flex-col lg:flex-row items-center justify-center gap-12">
        {/* Left Column: Vision & Features */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex-1 max-w-lg space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Direct Computer-to-Computer Hotspot Chat</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
            Communicate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500">completely offline</span> across laptops.
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Turn any phone or laptop mobile hotspot into an encrypted, ultra-low latency peer-to-peer network. Chat, transfer gigabytes of files, and discover nearby nodes without cell service or cloud servers.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                <Wifi className="w-4 h-4 text-orange-400" />
                <span>Zero Internet</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Communicates over standard Wi-Fi hotspot broadcast packets.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>2ms Latency</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Direct LAN socket routing gives full 5GHz link throughput.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                <Shield className="w-4 h-4 text-cyan-400" />
                <span>100% Private</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                No telemetry, no central login, no data leaves your local room.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.07] backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 mb-1">
                <Laptop className="w-4 h-4 text-amber-400" />
                <span>Auto Discovery</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                UDP beacons automatically detect peers on subnet 192.168.43.x.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Node Setup Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="relative rounded-2xl bg-[#11151F]/90 border border-white/10 shadow-2xl shadow-black/80 backdrop-blur-xl p-6 sm:p-7">
            {/* Form Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/[0.07]">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Configure Local Node</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Set up your peer identity on this hotspot</p>
              </div>
              <span className="px-2 py-1 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-white/5">
                NODE_SETUP
              </span>
            </div>

            <form onSubmit={handleLaunch} className="mt-5 space-y-4">
              {/* Display Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Alex Rivers"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#161B28] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Node Handle
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-mono text-slate-500">@</span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="alex_rivers"
                      className="w-full pl-7 pr-3.5 py-2 rounded-xl bg-[#161B28] border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Node Role / Status Preset */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Node Role / Status
                </label>
                <select
                  value={nodeRole}
                  onChange={(e) => setNodeRole(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#161B28] border border-white/10 text-white text-xs focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50 transition-all"
                >
                  <option value="Local Peer Node">Local Peer Node (Default)</option>
                  <option value="Hotspot Host & AP Gateway">Hotspot Host & AP Gateway</option>
                  <option value="Hardware Engineer">Hardware Engineer</option>
                  <option value="Protocol Architect">Protocol Architect</option>
                  <option value="Emergency Field Responder">Emergency Field Responder</option>
                  <option value="Stealth Node (Listen Only)">Stealth Node (Listen Only)</option>
                </select>
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Select Profile Avatar
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVATAR_PRESETS.map((imgUrl, idx) => {
                    const isSelected = selectedAvatar === imgUrl && !customAvatarUrl;
                    return (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setSelectedAvatar(imgUrl);
                          setCustomAvatarUrl('');
                        }}
                        className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all group ${
                          isSelected
                            ? 'border-orange-500 ring-2 ring-orange-500/30 scale-105'
                            : 'border-transparent hover:border-white/30 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                        {isSelected && (
                          <div className="absolute inset-0 bg-orange-500/30 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Local Network Card Preview */}
              <div className="p-3 rounded-xl bg-[#0B0E14]/80 border border-white/[0.08] font-mono text-[11px] text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-white/5">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-orange-400" />
                    <span>NETWORK INTERFACE</span>
                  </span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    READY
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Adapter:</span>
                  <span className="text-slate-200">wlan0 (Wi-Fi 6 AP)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Local IP:</span>
                  <span className="text-orange-400 font-semibold">192.168.43.120</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Default Port:</span>
                  <span className="text-slate-200">4892 (TCP/UDP)</span>
                </div>
              </div>

              {/* Launch Button */}
              <button
                type="submit"
                disabled={isInitializing}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.98] shadow-lg shadow-orange-500/25 border border-orange-400/30 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isInitializing ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Binding Local Sockets...</span>
                  </>
                ) : (
                  <>
                    <span>Enter HotspotChat</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span>HOTSPOTCHAT v1.0.0-p2p</span>
          <span>•</span>
          <span>Offline Desktop Mesh Architecture</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-slate-400">Subnet: 192.168.43.0/24</span>
          <span className="text-emerald-400">P2P Socket Engine Ready</span>
        </div>
      </footer>
    </div>
  );
};
