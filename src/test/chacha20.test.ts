import {
  decryptChaCha20,
  encryptChaCha20,
  encryptChaCha20Bytes,
  getChaCha20DetailsFromBytes,
  hexToUint8Array,
  uint8ArrayToHex,
} from '../app/utils/chacha20';

describe('ChaCha20 utilities', () => {
  it('matches RFC 8439 keystream and ciphertext test vectors', () => {
    const key = hexToUint8Array('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F');
    const plaintext = new TextEncoder().encode(
      "Ladies and Gentlemen of the class of '99: If I could offer you only one tip for the future, sunscreen would be it.",
    );

    const blockVector = getChaCha20DetailsFromBytes(plaintext, key, hexToUint8Array('000000090000004A00000000'), 1);
    const cipherVector = getChaCha20DetailsFromBytes(plaintext, key, hexToUint8Array('000000000000004A00000000'), 1);

    expect(blockVector.keystream).toBe(
      '10F1E7E4D13B5915500FDD1FA32071C4C7D1F4C733C068030422AA9AC3D46C4ED2826446079FAA0914C2D705D98B02A2B5129CD1DE164EB9CBD083E8A2503C4E',
    );
    expect(cipherVector.ciphertext).toBe(
      '6E2E359A2568F98041BA0728DD0D6981E97E7AEC1D4360C20A27AFCCFD9FAE0BF91B65C5524733AB8F593DABCD62B3571639D624E65152AB8F530C359F0861D807CA0DBF500D6A6156A38E088A22B65E52BC514D16CCF806818CE91AB77937365AF90BBF74A35BE6B40B8EEDF2785E42874D',
    );
    expect(blockVector.initialState[12]).toBe(1);
  });

  it('encryptChaCha20Bytes produces the same ciphertext bytes as the detailed block builder', () => {
    const key = hexToUint8Array('000102030405060708090A0B0C0D0E0F101112131415161718191A1B1C1D1E1F');
    const nonce = hexToUint8Array('000000000000004A00000000');
    const plaintext = new TextEncoder().encode('OpenAI stream cipher test');

    const ciphertext = encryptChaCha20Bytes(plaintext, key, nonce, 7);
    const details = getChaCha20DetailsFromBytes(plaintext, key, nonce, 7);

    expect(uint8ArrayToHex(ciphertext)).toBe(details.ciphertext);
  });

  it('decryptChaCha20 restores plaintext with the same key, nonce, and counter', () => {
    const plaintext = 'Visualisasi ChaCha20';
    const key = '1234567890ABCDEF1234567890ABCDEF';
    const nonce = 'NONCE-123456';
    const counter = 9;

    const ciphertext = encryptChaCha20(plaintext, key, nonce, counter);

    expect(decryptChaCha20(ciphertext, key, nonce, counter)).toBe(plaintext);
  });
});
