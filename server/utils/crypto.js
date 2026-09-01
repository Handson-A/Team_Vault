import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

const getEncryptionKey = () => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is missing.');
  }

  // Support 64-char hex string (32 bytes) or 32-char string, or sha256 derivation
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  } else if (Buffer.byteLength(key, 'utf8') === 32) {
    return Buffer.from(key, 'utf8');
  } else {
    // Hash down/up to 32 bytes
    return crypto.createHash('sha256').update(key).digest();
  }
};

/**
 * Encrypts plaintext using AES-256-GCM
 * Output format: iv_hex:authTag_hex:ciphertext_hex
 */
export const encrypt = (text) => {
  if (text === null || text === undefined) return text;
  const stringValue = typeof text === 'string' ? text : String(text);

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(stringValue, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

/**
 * Decrypts encrypted text using AES-256-GCM
 */
export const decrypt = (encryptedText) => {
  if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;

  const parts = encryptedText.split(':');
  // Format validation: iv (24 hex chars) : tag (32 hex chars) : ciphertext
  if (parts.length !== 3) {
    // Legacy or unencrypted fallback
    return encryptedText;
  }

  const [ivHex, authTagHex, ciphertextHex] = parts;
  try {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed for secret:', error.message);
    return '[Decryption Error]';
  }
};