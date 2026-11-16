export type UserStatus = 'online' | 'busy' | 'away' | 'offline';

export interface User {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  status: UserStatus;
  statusMessage: string;
  about?: string;
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
  about?: string;
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
  sharedMediaCount?: number;
  sharedDocsCount?: number;
  lastContactedAt?: number;
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

export interface ReplyMessagePreview {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type?: 'text' | 'image' | 'file' | 'system' | 'code';
  attachmentName?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  date?: string; // e.g., 'Today', 'Yesterday', or ISO/date string
  status: 'sending' | 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'file' | 'system' | 'code';
  attachment?: FileAttachment;
  codeSnippet?: CodeSnippet;
  replyTo?: ReplyMessagePreview;
  isDeleted?: boolean;
  reactions?: Record<string, string[]>; // emoji -> array of usernames
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

export type EmergencyType = 'medical' | 'security' | 'accident' | 'general';

export type EmergencyStatus = 'active' | 'resolved';

export interface RecipientAck {
  contactId: string;
  contactName: string;
  contactAvatar: string;
  contactIp: string;
  status: 'pending' | 'acknowledged';
  acknowledgedAt?: string;
  latencyMs?: number;
}

export interface EmergencyAlert {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  senderIp: string;
  type: EmergencyType;
  title: string;
  message: string;
  createdAt: number;
  timestamp: string;
  date: string;
  status: EmergencyStatus;
  resolvedAt?: number;
  resolvedTimestamp?: string;
  recipients: RecipientAck[];
  location?: {
    name: string;
  };
}

export type ActiveView = 'welcome' | 'chat' | 'contacts' | 'settings' | 'profile' | 'emergency';
