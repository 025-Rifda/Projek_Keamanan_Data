import {
  normalizeHexInput,
  parseCounter,
  validateChaCha20DecryptInput,
  validateChaCha20EncryptInput,
  validateDESDecryptInput,
  validateDESEncryptInput,
} from '../app/utils/validation';

describe('input validation', () => {
  it('validates DES encryption and decryption lengths exactly', () => {
    expect(validateDESEncryptInput('HELLO123', 'MYKEY123').isValid).toBe(true);
    expect(validateDESEncryptInput('SHORT', 'MYKEY123').isValid).toBe(false);
    expect(validateDESDecryptInput('A3F48C2DB1E79A40', 'MYKEY123').isValid).toBe(true);
    expect(validateDESDecryptInput('XYZ', 'MYKEY123').isValid).toBe(false);
  });

  it('validates ChaCha20 key, nonce, ciphertext, and counter', () => {
    expect(
      validateChaCha20EncryptInput('hello', '1234567890ABCDEF1234567890ABCDEF', 'NONCE-123456', '0').isValid,
    ).toBe(true);
    expect(
      validateChaCha20EncryptInput('hello', 'short', 'NONCE-123456', '0').isValid,
    ).toBe(false);
    expect(
      validateChaCha20DecryptInput('DEADBEEF', '1234567890ABCDEF1234567890ABCDEF', 'NONCE-123456', '42').isValid,
    ).toBe(true);
    expect(
      validateChaCha20DecryptInput('XYZ', '1234567890ABCDEF1234567890ABCDEF', 'NONCE-123456', 'abc').isValid,
    ).toBe(false);
  });

  it('normalizes hex input and parses counter safely', () => {
    expect(normalizeHexInput(' aa bb cc ')).toBe('AABBCC');
    expect(parseCounter('17')).toBe(17);
    expect(parseCounter('-1')).toBeNull();
    expect(parseCounter('not-a-number')).toBeNull();
  });
});
