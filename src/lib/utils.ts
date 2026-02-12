import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Time formatting utilities
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true
  });
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
}

// SLA calculation
export function calculateSLAStatus(createdAt: string, slaMinutes: number): {
  status: 'on-time' | 'warning' | 'overdue';
  remainingMinutes: number;
  progressPercent: number;
} {
  const created = new Date(createdAt).getTime();
  const now = new Date().getTime();
  const elapsedMs = now - created;
  const elapsedMinutes = elapsedMs / 60000;
  const remainingMinutes = slaMinutes - elapsedMinutes;
  const progressPercent = Math.min((elapsedMinutes / slaMinutes) * 100, 100);

  if (remainingMinutes < 0) {
    return { status: 'overdue', remainingMinutes: Math.abs(remainingMinutes), progressPercent };
  }
  if (remainingMinutes < slaMinutes * 0.2) {
    return { status: 'warning', remainingMinutes, progressPercent };
  }
  return { status: 'on-time', remainingMinutes, progressPercent };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

// Priority and Status helpers
export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'stat':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'urgent':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'routine':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'todo':
      return 'text-slate-600 bg-slate-50 border-slate-200';
    case 'in-progress':
      return 'text-sky-600 bg-sky-50 border-sky-200';
    case 'completed':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'delayed':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function getPriorityIcon(priority: string): string {
  switch (priority) {
    case 'stat':
      return '🔴';
    case 'urgent':
      return '🟠';
    case 'routine':
      return '🟢';
    default:
      return '⚪';
  }
}

// Department colors
export function getDepartmentColor(department: string): string {
  const colors: Record<string, string> = {
    'Laboratory': '#3b82f6',
    'Pharmacy': '#10b981',
    'Radiology': '#8b5cf6',
    'Cardiology': '#ef4444',
    'Nursing': '#f59e0b',
    'General Medicine': '#06b6d4',
    'Neurology': '#ec4899',
    'Orthopedics': '#84cc16',
    'Obstetrics': '#f97316',
    'ICU': '#dc2626',
  };
  return colors[department] || '#6b7280';
}

// Task type icons
export function getTaskTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    'prescription': '💊',
    'lab-test': '🧪',
    'imaging': '📷',
    'procedure': '🔬',
    'referral': '↗️',
    'care-instruction': '📋',
  };
  return icons[type] || '📄';
}

// Patient status colors
export function getPatientStatusColor(status: string): string {
  switch (status) {
    case 'Critical':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'Stable':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'Active':
      return 'text-sky-600 bg-sky-50 border-sky-200';
    case 'Discharged':
      return 'text-slate-600 bg-slate-50 border-slate-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

// Generate unique ID
export function generateId(prefix: string = ''): string {
  return `${prefix}${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Group array by key
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

// Sort by date
export function sortByDate<T>(array: T[], dateKey: keyof T, order: 'asc' | 'desc' = 'desc'): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateKey] as string).getTime();
    const dateB = new Date(b[dateKey] as string).getTime();
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
}
