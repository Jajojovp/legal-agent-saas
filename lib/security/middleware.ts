import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * RATE LIMITING - Protection against DDoS attacks
 */
export function rateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  // Clean up expired entries
  if (record && now > record.resetTime) {
    rateLimitMap.delete(identifier);
  }

  const current = rateLimitMap.get(identifier);

  if (!current) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { success: false, remaining: 0 };
  }

  current.count++;
  return { success: true, remaining: limit - current.count };
}

/**
 * Get client IP address
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  return 'unknown';
}

/**
 * CSRF Protection middleware
 */
export function validateCSRFToken(request: NextRequest): boolean {
  const token = request.headers.get('x-csrf-token');
  const cookie = request.cookies.get('csrf-token')?.value;
  
  // In production, implement proper CSRF token validation
  // For now, just check if both exist
  return !!(token && cookie && token === cookie);
}

/**
 * SQL Injection Prevention - Input Sanitization
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove SQL keywords and dangerous characters
  return input
    .replace(/['";\\]/g, '') // Remove quotes and semicolons
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove block comments start
    .replace(/\*\//g, '') // Remove block comments end
    .replace(/xp_/gi, '') // Remove SQL Server extended procedures
    .replace(/sp_/gi, '') // Remove SQL Server stored procedures
    .replace(/exec(\s|\+)+(s|x)p\w+/gi, '') // Remove EXEC statements
    .trim();
}

/**
 * XSS Prevention - HTML Sanitization
 */
export function sanitizeHTML(input: string): string {
  if (typeof input !== 'string') return '';
  
  const entityMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return input.replace(/[&<>"'\/]/g, (char) => entityMap[char]);
}

/**
 * Email Validation
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Phone Validation
 */
export function isValidPhone(phone: string): boolean {
  // US/Canada phone format: +1 (555) 123-4567 or variations
  const phoneRegex = /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/;
  return phoneRegex.test(phone);
}

/**
 * Strong Password Validation
 */
export function isStrongPassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Secure Headers
 */
export function addSecurityHeaders(response: NextResponse): NextResponse {
  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Enforce HTTPS
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  );
  
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.google.com https://www.googletagmanager.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https: blob:; " +
    "connect-src 'self' https://*.google-analytics.com; " +
    "frame-src https://googleads.g.doubleclick.net https://*.google.com;"
  );
  
  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );
  
  return response;
}

/**
 * API Key Validation
 */
export function validateAPIKey(apiKey: string | null): boolean {
  if (!apiKey) return false;
  
  // In production, check against database
  // For now, just check format
  return apiKey.startsWith('sk_') && apiKey.length > 20;
}

/**
 * Prevent NoSQL Injection
 */
export function sanitizeMongoQuery(input: any): any {
  if (typeof input !== 'object' || input === null) {
    return input;
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeMongoQuery);
  }
  
  const sanitized: any = {};
  
  for (const key in input) {
    // Remove $ operators that could be used for injection
    if (key.startsWith('$')) {
      continue;
    }
    
    sanitized[key] = sanitizeMongoQuery(input[key]);
  }
  
  return sanitized;
}

/**
 * File Upload Validation
 */
export function validateFileUpload(
  file: File,
  maxSizeMB: number = 10,
  allowedTypes: string[] = ['image/jpeg', 'image/png', 'application/pdf']
): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }
  
  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const mimeToExt: { [key: string]: string[] } = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'application/pdf': ['pdf'],
  };
  
  const allowedExts = mimeToExt[file.type];
  if (allowedExts && extension && !allowedExts.includes(extension)) {
    return {
      valid: false,
      error: 'File extension does not match file type',
    };
  }
  
  return { valid: true };
}

/**
 * Audit Log
 */
export interface AuditLogEntry {
  timestamp: string;
  userId?: string;
  action: string;
  ip: string;
  userAgent: string;
  details?: any;
}

export function logSecurityEvent(entry: AuditLogEntry) {
  // In production, send to logging service (e.g., Datadog, Sentry)
  console.log('[SECURITY]', JSON.stringify(entry));
  
  // TODO: Store in database for compliance
  // await db.insert(auditLogs).values(entry);
}
