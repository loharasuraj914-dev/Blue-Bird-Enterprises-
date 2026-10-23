/**
 * Validation utilities for Blue Bird Enterprises
 * Handles Indian phone validation, email validation, and reference generation.
 */

export function cleanPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Remove spaces, hyphens, parentheses, and leading +91 or 91 or 0
  let cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  if (cleaned.startsWith('91') && cleaned.length > 10) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
}

export function validateIndianPhone(phone: string): boolean {
  const cleaned = cleanPhoneNumber(phone);
  // Must be exactly 10 digits starting with 6, 7, 8, or 9
  return /^[6-9]\d{9}$/.test(cleaned);
}

export function validateEmail(email: string): boolean {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

export function generateInquiryRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BBE-INQ-${new Date().getFullYear()}-${rand}`;
}
