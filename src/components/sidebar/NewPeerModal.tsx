import React, { useState } from 'react';
import { Radio, Plus, Search, Server, Check, Terminal } from 'lucide-react';
import { Modal } from '../common/Modal';
import { DiscoveredPeer, Contact, Conversation } from '../../types';
import { DISCOVERED_PEERS_POOL, AVATAR_PRESETS } from '../../data/dummyData';
import { playHotspotChime } from '../../hooks/useHotspotSound';

interface NewPeerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddConversation: (newConv: Conversation) => void;
  onNotify: (title: string, msg?: string, type?: 'info' | 'success' | 'network') => void;
  existingPeerIps: string[];
}

export const NewPeerModal: React.FC<NewPeerModalProps> = ({
  isOpen,
  onClose,
  onAddConversation,
  onNotify,
  existingPeerIps,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'manual'>('scan');
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredPeers] = useState<DiscoveredPeer[]>(DISCOVERED_PEERS_POOL);

  // Manual IP Connect state
  const [manualIp, setManualIp] = useState('192.168.43.');
  const [manualPort, setManualPort] = useState('4892');
  const [manualName, setManualName] = useState('');

  const handleStartScan = () => {
    setIsScanning(true);
    playHotspotChime('peer');

    setTimeout(() => {
      setIsScanning(false);
      onNotify('Subnet Scan Complete', 'Discovered 4 active peers on subnet 192.168.43.0/24', 'network');
    }, 1400);
  };

  const handleConnectPeer = (peer: DiscoveredPeer) => {
    playHotspotChime('sent');
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      username: peer.hostname.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      displayName: peer.hostname,
      avatar: peer.avatar,
      status: 'online',
      statusMessage: `Connected via hotspot • ${peer.ip}`,
      ip: peer.ip,
      port: peer.port,
      signalStrength: peer.signal,
      pingMs: Math.floor(Math.random() * 4) + 2,
      isHotspotHost: false,
      role: 'Discovered P2P Node',
      bio: `Direct device connected over hotspot network ${peer.ssid}.`,
      lastSeen: 'Just now',
      dataExchanged: '0 KB',
      fingerprint: `SHA256: ${Math.random().toString(16).substring(2, 10)}...`,
    };

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      peer: newContact,
      unreadCount: 0,
      isPinned: false,
    };

    onAddConversation(newConversation);
    onNotify('Peer Connected', `Direct socket established with ${peer.hostname} (${peer.ip})`, 'success');
    onClose();
  };

  const handleManualConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualIp.trim()) {
      onNotify('Missing Info', 'Please enter both peer name and valid IP address.', 'info');
      return;
    }

    playHotspotChime('sent');
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      username: manualName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_'),
      displayName: manualName.trim(),
      avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      status: 'online',
      statusMessage: `Direct connection • ${manualIp}:${manualPort}`,
      ip: manualIp.trim(),
      port: parseInt(manualPort) || 4892,
      signalStrength: 92,
      pingMs: 3,
      isHotspotHost: false,
      role: 'Manual P2P Node',
      bio: 'Manually configured direct TCP connection.',
      lastSeen: 'Just now',
      dataExchanged: '0 KB',
    };

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      peer: newContact,
      unreadCount: 0,
      isPinned: false,
    };

    onAddConversation(newConversation);
    onNotify('Node Linked', `Direct connection initialized to ${manualIp}:${manualPort}`, 'success');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Discover Hotspot Peers"
      subtitle="Find nearby computers on your local Wi-Fi hotspot"
      maxWidth="md"
    >
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 bg-black/40 rounded-xl border border-white/[0.08] mb-5">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Hotspot Radar Scan</span>
        </button>

        <button
          onClick={() => setActiveTab('manual')}
          className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'manual'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Direct IP Connect</span>
        </button>
      </div>

      {activeTab === 'scan' ? (
        <div className="space-y-4">
          {/* Radar Scanning Banner */}
          <div className="relative p-4 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20 flex items-center justify-between overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Radio className={`w-5 h-5 ${isScanning ? 'animate-spin' : ''}`} />
                {isScanning && (
                  <span className="absolute inset-0 rounded-xl border border-orange-400 animate-ping opacity-50" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-100">Broadcast Subnet: 192.168.43.0/24</p>
                <p className="text-[11px] text-slate-400">UDP multicast discovery listening on port 4892</p>
              </div>
            </div>

            <button
              onClick={handleStartScan}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-xs font-medium flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{isScanning ? 'Pinging Subnet...' : 'Scan Now'}</span>
            </button>
          </div>

          {/* Discovered Peer List */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-2">
              <span>Discovered Nodes Nearby ({discoveredPeers.length})</span>
              <span className="text-[10px] font-mono text-emerald-400">HotspotMesh_AP5</span>
            </div>

            <div className="space-y-2">
              {discoveredPeers.map((peer, idx) => {
                const isAlreadyAdded = existingPeerIps.includes(peer.ip);

                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#161B28]/80 border border-white/[0.06] hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 shrink-0">
                        <img src={peer.avatar} alt={peer.hostname} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-200">{peer.hostname}</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {peer.signal}% Signal
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-slate-400">
                          {peer.ip}:{peer.port}
                        </p>
                      </div>
                    </div>

                    {isAlreadyAdded ? (
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1 px-3 py-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Connected</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnectPeer(peer)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-orange-500 hover:text-white border border-white/10 text-slate-200 text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleManualConnect} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-orange-300 flex items-start gap-2.5">
            <Server className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
            <p className="leading-relaxed">
              If your colleague's device has firewall blocks or UDP multicast disabled, connect directly by specifying their local hotspot assigned IP address.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Peer Node Name</label>
            <input
              type="text"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="e.g. Marcus Precision Laptop"
              className="w-full px-3.5 py-2 rounded-xl bg-[#161B28] border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">Local Hotspot IP</label>
              <input
                type="text"
                value={manualIp}
                onChange={(e) => setManualIp(e.target.value)}
                placeholder="192.168.43.77"
                className="w-full px-3.5 py-2 rounded-xl bg-[#161B28] border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Port</label>
              <input
                type="text"
                value={manualPort}
                onChange={(e) => setManualPort(e.target.value)}
                placeholder="4892"
                className="w-full px-3.5 py-2 rounded-xl bg-[#161B28] border border-white/10 text-white placeholder-slate-500 text-sm font-mono focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/50"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/20 transition-all cursor-pointer mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Establish Direct P2P Channel</span>
          </button>
        </form>
      )}
    </Modal>
  );
};
