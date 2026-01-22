import crypto from 'node:crypto';

const algorithm = 'aes-256-gcm';

export function getFieldKey() {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('FIELD_ENCRYPTION_KEY is not set');
  }
  return Buffer.from(raw, 'base64');
}

export function encryptField(value) {
  if (!value) return null;
  const key = getFieldKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decryptField(payload) {
  if (!payload) return null;
  const data = Buffer.from(payload, 'base64');
  const iv = data.subarray(0, 12);
  const tag = data.subarray(12, 28);
  const text = data.subarray(28);
  const key = getFieldKey();
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(text), decipher.final()]);
  return decrypted.toString('utf8');
}
