import { Message } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export interface MessageDateGroup {
  date: string;
  messages: Message[];
}

/**
 * Groups messages by date (e.g. 'Today', 'Yesterday', or actual date string)
 */
export const groupMessagesByDate = (messages: Message[]): MessageDateGroup[] => {
  const groups: MessageDateGroup[] = [];

  messages.forEach((msg) => {
    const messageDate = msg.date || 'Today';
    const lastGroup = groups[groups.length - 1];

    if (lastGroup && lastGroup.date === messageDate) {
      lastGroup.messages.push(msg);
    } else {
      groups.push({
        date: messageDate,
        messages: [msg],
      });
    }
  });

  return groups;
};

/**
 * Determines whether a message is part of a consecutive cluster from the same sender
 */
export const getMessageClusterInfo = (
  messages: Message[],
  index: number
) => {
  const current = messages[index];
  const prev = messages[index - 1];
  const next = messages[index + 1];

  const isPrevSameSender =
    prev &&
    prev.type !== 'system' &&
    current.type !== 'system' &&
    prev.senderId === current.senderId &&
    (prev.date || 'Today') === (current.date || 'Today');

  const isNextSameSender =
    next &&
    next.type !== 'system' &&
    current.type !== 'system' &&
    next.senderId === current.senderId &&
    (next.date || 'Today') === (current.date || 'Today');

  const isFirstInCluster = !isPrevSameSender;
  const isLastInCluster = !isNextSameSender;

  return {
    isFirstInCluster,
    isLastInCluster,
    isMiddleInCluster: isPrevSameSender && isNextSameSender,
    showAvatar: isLastInCluster && current.senderId !== 'local-node-01',
    showSenderName: isFirstInCluster && current.senderId !== 'local-node-01',
  };
};
