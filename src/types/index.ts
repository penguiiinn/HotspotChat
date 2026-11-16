export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: UserStatus;
  statusMessage: string;
  localIp: string;
  port: number;
  hotspotSsid: string;
  isHost: boolean;
  joinedAt: string;
}

export interface Contact {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: UserStatus;
  statusMessage: string;
  ip: string;
  port: number;
  signalStrength: number; // 0-100%
  pingMs: number;
  isHotspotHost: boolean;
  role?: string;
  bio?: string;
  lastSeen?: string;
  dataExchanged?: string;
  macAddress?: string;
  fingerprint?: string;
}

export interface FileAttachment {
  name: string;
  size: string;
  type: string;
  url?: string;
  downloadUrl?: string;
  extension: string;
}

export interface CodeSnippet {
  language: string;
  code: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'system' | 'code';
  attachment?: FileAttachment;
  codeSnippet?: CodeSnippet;
}

export interface Conversation {
  id: string;
  peer: Contact;
  lastMessage?: Message;
  unreadCount: number;
  isPinned?: boolean;
  isMuted?: boolean;
  draft?: string;
}

export interface DiscoveredPeer {
  ip: string;
  port: number;
  hostname: string;
  avatar: string;
  signal: number;
  ssid: string;
  status: 'available' | 'connected' | 'pairing';
}

export interface SharedMediaItem {
  id: string;
  type: 'image' | 'video' | 'file';
  title: string;
  url: string;
  size: string;
  timestamp: string;
  senderName: string;
}

export interface AppSettings {
  theme: 'charcoal' | 'midnight' | 'obsidian' | 'slate';
  accentColor: 'orange' | 'emerald' | 'indigo' | 'cyan';
  soundEnabled: boolean;
  peerDiscoveryInterval: number;
  autoAcceptFiles: boolean;
  listenPort: number;
  subnetScanRange: string;
  enableEncryption: boolean;
  notificationsEnabled: boolean;
  offlineLogRetentionDays: number;
  hotspotInterface: string;
}

export type ActiveView = 'welcome' | 'chat' | 'settings';
