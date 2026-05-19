import {
  normalizeHexInput,
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

  it('normalizes hex input safely', () => {
    expect(normalizeHexInput(' aa bb cc ')).toBe('AABBCC');
  });
});
