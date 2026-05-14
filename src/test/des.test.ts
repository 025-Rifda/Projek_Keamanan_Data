import { calculateDESAvalanche, decryptDESHex, encryptDESHex, getDESDetails } from '../app/utils/des';

describe('DES utilities', () => {
  it('matches the standard DES test vector', () => {
    const plaintextHex = '0123456789ABCDEF';
    const keyHex = '133457799BBCDFF1';

    expect(encryptDESHex(plaintextHex, keyHex)).toBe('85E813540F0AB405');
    expect(decryptDESHex('85E813540F0AB405', keyHex)).toBe(plaintextHex);
  });

  it('produces 16 subkeys and detailed rounds for user input', () => {
    const details = getDESDetails('HELLO123', 'MYKEY123');

    expect(details.keySchedule).toHaveLength(16);
    expect(details.rounds).toHaveLength(16);
    expect(details.inputBits).toHaveLength(64);
    expect(details.finalOutput).toHaveLength(16);
  });

  it('calculates avalanche effect from a 1-bit plaintext change', () => {
    const avalanche = calculateDESAvalanche('HELLO123', 'MYKEY123', 0);

    expect(avalanche.totalBits).toBe(64);
    expect(avalanche.originalCiphertext).not.toBe(avalanche.modifiedCiphertext);
    expect(avalanche.differentBits).toBe(avalanche.differentBitPositions.length);
    expect(avalanche.percentage).toBeCloseTo((avalanche.differentBits / avalanche.totalBits) * 100, 10);
  });
});
