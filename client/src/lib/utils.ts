import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getPercentageColor(percentage: number): string {
  if (percentage >= 70) return 'bg-green-600';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function getStatusColor(status: string): {
  bg: string;
  text: string;
} {
  switch (status.toLowerCase()) {
    case 'on track':
      return { bg: 'bg-green-100', text: 'text-green-800' };
    case 'at risk':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
    case 'delayed':
      return { bg: 'bg-red-100', text: 'text-red-800' };
    case 'completed':
      return { bg: 'bg-blue-100', text: 'text-blue-800' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800' };
  }
}

export function getCategoryColor(category: string): {
  bg: string;
  text: string;
  icon: string;
} {
  switch (category.toLowerCase()) {
    case 'environmental':
      return { 
        bg: 'bg-green-100', 
        text: 'text-green-800',
        icon: 'bg-green-100 text-green-700'
      };
    case 'social':
      return { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800',
        icon: 'bg-blue-100 text-blue-700'
      };
    case 'governance':
      return { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800',
        icon: 'bg-yellow-100 text-yellow-700'
      };
    default:
      return { 
        bg: 'bg-gray-100', 
        text: 'text-gray-800',
        icon: 'bg-gray-100 text-gray-700'
      };
  }
}

export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  return text.length > maxLength 
    ? `${text.substring(0, maxLength)}...` 
    : text;
}

export function generateInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function timeSince(date: Date | string): string {
  const now = new Date();
  const pastDate = typeof date === 'string' ? new Date(date) : date;
  const secondsPast = Math.floor((now.getTime() - pastDate.getTime()) / 1000);
  
  if (secondsPast < 60) {
    return `${secondsPast} seconds ago`;
  }
  if (secondsPast < 3600) {
    return `${Math.floor(secondsPast / 60)} minutes ago`;
  }
  if (secondsPast < 86400) {
    return `${Math.floor(secondsPast / 3600)} hours ago`;
  }
  if (secondsPast < 2592000) {
    return `${Math.floor(secondsPast / 86400)} days ago`;
  }
  if (secondsPast < 31536000) {
    return `${Math.floor(secondsPast / 2592000)} months ago`;
  }
  return `${Math.floor(secondsPast / 31536000)} years ago`;
}

export function calculateCompletionPercentage(start: Date | string, end: Date | string): number {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const endDate = typeof end === 'string' ? new Date(end) : end;
  const now = new Date();
  
  if (now < startDate) return 0;
  if (now > endDate) return 100;
  
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsedDuration = now.getTime() - startDate.getTime();
  
  return Math.floor((elapsedDuration / totalDuration) * 100);
}
