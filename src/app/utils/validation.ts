const textEncoder = new TextEncoder();

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

export function getByteLength(value: string): number {
  return textEncoder.encode(value).length;
}

export function normalizeHexInput(value: string): string {
  return value.replace(/\s+/g, '').trim().toUpperCase();
}

export function isHexString(value: string): boolean {
  return /^[0-9A-F]+$/i.test(value);
}

export function parseCounter(value: string): number | null {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0 || parsed > 0xffffffff) {
    return null;
  }

  return parsed;
}

export function validateDESEncryptInput(plaintext: string, key: string): ValidationResult {
  if (!plaintext) {
    return { isValid: false, error: 'Plaintext DES tidak boleh kosong.' };
  }

  if (getByteLength(plaintext) !== 8) {
    return { isValid: false, error: 'Plaintext DES harus tepat 8 byte.' };
  }

  if (getByteLength(key) !== 8) {
    return { isValid: false, error: 'Key DES harus tepat 8 byte.' };
  }

  return { isValid: true, error: null };
}

export function validateDESDecryptInput(ciphertext: string, key: string): ValidationResult {
  const normalizedCiphertext = normalizeHexInput(ciphertext);
  if (!normalizedCiphertext) {
    return { isValid: false, error: 'Ciphertext DES tidak boleh kosong.' };
  }

  if (normalizedCiphertext.length !== 16 || !isHexString(normalizedCiphertext)) {
    return { isValid: false, error: 'Ciphertext DES harus tepat 16 karakter hex.' };
  }

  if (getByteLength(key) !== 8) {
    return { isValid: false, error: 'Key DES harus tepat 8 byte.' };
  }

  return { isValid: true, error: null };
}

export function validateChaCha20EncryptInput(plaintext: string, key: string, nonce: string, counter: string): ValidationResult {
  if (!plaintext) {
    return { isValid: false, error: 'Plaintext ChaCha20 tidak boleh kosong.' };
  }

  if (getByteLength(key) !== 32) {
    return { isValid: false, error: 'Key ChaCha20 harus tepat 32 byte.' };
  }

  if (getByteLength(nonce) !== 12) {
    return { isValid: false, error: 'Nonce ChaCha20 harus tepat 12 byte.' };
  }

  if (parseCounter(counter) === null) {
    return { isValid: false, error: 'Counter ChaCha20 harus numerik dan berada di rentang 0 sampai 4294967295.' };
  }

  return { isValid: true, error: null };
}

export function validateChaCha20DecryptInput(ciphertext: string, key: string, nonce: string, counter: string): ValidationResult {
  const normalizedCiphertext = normalizeHexInput(ciphertext);
  if (!normalizedCiphertext) {
    return { isValid: false, error: 'Ciphertext ChaCha20 tidak boleh kosong.' };
  }

  if (!isHexString(normalizedCiphertext) || normalizedCiphertext.length % 2 !== 0) {
    return { isValid: false, error: 'Ciphertext ChaCha20 harus berupa hex dengan jumlah karakter genap.' };
  }

  if (getByteLength(key) !== 32) {
    return { isValid: false, error: 'Key ChaCha20 harus tepat 32 byte.' };
  }

  if (getByteLength(nonce) !== 12) {
    return { isValid: false, error: 'Nonce ChaCha20 harus tepat 12 byte.' };
  }

  if (parseCounter(counter) === null) {
    return { isValid: false, error: 'Counter ChaCha20 harus numerik dan berada di rentang 0 sampai 4294967295.' };
  }

  return { isValid: true, error: null };
}
