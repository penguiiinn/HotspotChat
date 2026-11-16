import { User, Contact, Conversation, Message, AppSettings } from '../types';

const STORAGE_KEYS = {
  USER: 'hotspotchat_user_v1',
  CONTACTS: 'hotspotchat_contacts_v1',
  CONVERSATIONS: 'hotspotchat_conversations_v1',
  MESSAGES: 'hotspotchat_messages_v1',
  SETTINGS: 'hotspotchat_settings_v1',
};

export const loadStoredUser = (fallback: User): User => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.USER);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
};

export const saveStoredUser = (user: User): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch {
    // ignore quota/security errors
  }
};

export const loadStoredContacts = (fallback: Contact[]): Contact[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONTACTS);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const saveStoredContacts = (contacts: Contact[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
  } catch {
    // ignore
  }
};

export const loadStoredConversations = (fallback: Conversation[]): Conversation[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const saveStoredConversations = (conversations: Conversation[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch {
    // ignore
  }
};

export const loadStoredMessages = (fallback: Record<string, Message[]>): Record<string, Message[]> => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    return parsed && typeof parsed === 'object' ? parsed : fallback;
  } catch {
    return fallback;
  }
};

export const saveStoredMessages = (messages: Record<string, Message[]>): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  } catch {
    // ignore
  }
};

export const loadStoredSettings = (fallback: AppSettings): AppSettings => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!data) return fallback;
    const parsed = JSON.parse(data);
    return { ...fallback, ...parsed };
  } catch {
    return fallback;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
};
