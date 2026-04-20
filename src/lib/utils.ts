import { ModuleType } from './store';

export const MODULE_CONFIG: Record<
  ModuleType,
  { label: string; color: string; icon: string; category: 'trigger' | 'action' | 'logic' }
> = {
  schedule: {
    label: 'Schedule',
    color: '#6366f1',
    icon: '🕐',
    category: 'trigger',
  },
  webhook: {
    label: 'Webhook',
    color: '#8b5cf6',
    icon: '🔗',
    category: 'trigger',
  },
  carousel_post: {
    label: 'Carousel Post',
    color: '#ec4899',
    icon: '🎠',
    category: 'action',
  },
  single_post: {
    label: 'Single Post',
    color: '#f59e0b',
    icon: '📸',
    category: 'action',
  },
  reel: {
    label: 'Reel',
    color: '#10b981',
    icon: '🎬',
    category: 'action',
  },
  caption_tags: {
    label: 'Caption + Tags',
    color: '#06b6d4',
    icon: '✍️',
    category: 'action',
  },
  tag_location: {
    label: 'Tag Location',
    color: '#f97316',
    icon: '📍',
    category: 'action',
  },
  if_else: {
    label: 'If / Else',
    color: '#7c3aed',
    icon: '⚡',
    category: 'logic',
  },
};

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
