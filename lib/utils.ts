import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency based on locale and currency code
 */
export function formatCurrency(amount: number, currency: string = 'USD', locale: string = 'en'): string {
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-CL',
  };

  return new Intl.NumberFormat(localeMap[locale] || 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'CLP' ? 0 : 2,
    maximumFractionDigits: currency === 'CLP' ? 0 : 2,
  }).format(amount);
}

/**
 * Format date based on locale
 */
export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-CL',
  };

  return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

/**
 * Format date and time based on locale
 */
export function formatDateTime(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-CL',
  };

  return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(d);
}

export function generateCaseNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CASE-${year}-${random}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `INV-${year}${month}-${random}`;
}

export function calculateLeadScore(data: {
  hasEmail: boolean;
  hasPhone: boolean;
  hasDescription: boolean;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  practiceAreaMatch: boolean;
}): number {
  let score = 0;
  
  if (data.hasEmail) score += 25;
  if (data.hasPhone) score += 25;
  if (data.hasDescription) score += 20;
  if (data.practiceAreaMatch) score += 15;
  
  const urgencyScores = { low: 5, medium: 10, high: 15, urgent: 15 };
  score += urgencyScores[data.urgency];
  
  return Math.min(score, 100);
}
