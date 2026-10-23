/**
 * Validation utilities for Blue Bird Enterprises
 * Handles Indian phone validation, email validation, and reference generation.
 */

export function sanitizeTenDigitMobile(value: string): string {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 10);
}

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

export function validateQuoteMandatoryFields(fields: {
  customerName: string;
  companyName: string;
  mobileNumber: string;
  email?: string;
}): { valid: boolean; error?: string } {
  if (!fields.customerName || !fields.customerName.trim()) {
    return { valid: false, error: 'Please enter your name.' };
  }
  if (!fields.companyName || !fields.companyName.trim()) {
    return { valid: false, error: 'Please enter your company / facility name.' };
  }
  const sanitizedMobile = sanitizeTenDigitMobile(fields.mobileNumber);
  if (sanitizedMobile.length !== 10 || !validateIndianPhone(sanitizedMobile)) {
    return {
      valid: false,
      error: 'Please enter a valid 10-digit mobile number (e.g. 9867833456).',
    };
  }
  if (fields.email && fields.email.trim() && !validateEmail(fields.email.trim())) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }
  return { valid: true };
}

export function generateInquiryRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BBE-INQ-${new Date().getFullYear()}-${rand}`;
}

