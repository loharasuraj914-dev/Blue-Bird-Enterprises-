/**
 * Secure authentication module for Blue Bird Enterprises Owner Portal.
 * Uses cryptographic SHA-256 validation so passwords are never stored in plaintext
 * or exposed in frontend code/bundles.
 */

// Cryptographic SHA-256 hash of the authorized owner password
const AUTHORIZED_OWNER_HASH = '65d9078fcef85450c814437a44bde4e34e815f11f653181b21ab507dce67d690';

/**
 * Calculates SHA-256 hex string using Web Crypto API
 */
export async function computeSHA256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Node.js fallback for unit tests
  try {
    const crypto = await import('node:crypto');
    return crypto.createHash('sha256').update(text).digest('hex');
  } catch {
    return '';
  }
}

/**
 * Verifies owner credentials securely against the authorized cryptographic hash
 */
export async function verifyOwnerCredentials(candidatePassword: string): Promise<boolean> {
  if (!candidatePassword) return false;
  const hash = await computeSHA256(candidatePassword.trim());
  return hash === AUTHORIZED_OWNER_HASH;
}
