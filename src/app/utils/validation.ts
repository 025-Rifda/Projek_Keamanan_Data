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
