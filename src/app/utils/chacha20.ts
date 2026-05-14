// ChaCha20 Stream Cipher Implementation
// Based on RFC 8439

// ChaCha20 constants
const CHACHA_CONSTANTS = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

// Utility functions
function stringToUint8Array(str: string): Uint8Array {
  const arr = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    arr[i] = str.charCodeAt(i);
  }
  return arr;
}

function uint8ArrayToString(arr: Uint8Array): string {
  return String.fromCharCode(...Array.from(arr));
}

function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

function hexToUint8Array(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return arr;
}

function littleEndianToUint32(bytes: Uint8Array, offset: number): number {
  return (
    bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)
  ) >>> 0;
}

function uint32ToLittleEndian(value: number, bytes: Uint8Array, offset: number): void {
  bytes[offset] = value & 0xff;
  bytes[offset + 1] = (value >>> 8) & 0xff;
  bytes[offset + 2] = (value >>> 16) & 0xff;
  bytes[offset + 3] = (value >>> 24) & 0xff;
}

// Quarter round operation
function quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number): void {
  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotateLeft(state[d] ^ state[a], 16);

  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotateLeft(state[b] ^ state[c], 12);

  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotateLeft(state[d] ^ state[a], 8);

  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotateLeft(state[b] ^ state[c], 7);
}

// Rotate left operation
function rotateLeft(value: number, bits: number): number {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

// Initialize ChaCha20 state
function initializeState(key: Uint8Array, nonce: Uint8Array, counter: number): Uint32Array {
  const state = new Uint32Array(16);

  // Constants (positions 0-3)
  state[0] = CHACHA_CONSTANTS[0];
  state[1] = CHACHA_CONSTANTS[1];
  state[2] = CHACHA_CONSTANTS[2];
  state[3] = CHACHA_CONSTANTS[3];

  // Key (positions 4-11)
  for (let i = 0; i < 8; i++) {
    state[4 + i] = littleEndianToUint32(key, i * 4);
  }

  // Counter (position 12)
  state[12] = counter;

  // Nonce (positions 13-15)
  for (let i = 0; i < 3; i++) {
    state[13 + i] = littleEndianToUint32(nonce, i * 4);
  }

  return state;
}

// Perform ChaCha20 block operation (20 rounds)
function chachaBlock(state: Uint32Array): Uint32Array {
  const workingState = new Uint32Array(state);
  const initialState = new Uint32Array(state);

  // 20 rounds (10 double rounds)
  for (let i = 0; i < 10; i++) {
    // Column rounds
    quarterRound(workingState, 0, 4, 8, 12);
    quarterRound(workingState, 1, 5, 9, 13);
    quarterRound(workingState, 2, 6, 10, 14);
    quarterRound(workingState, 3, 7, 11, 15);

    // Diagonal rounds
    quarterRound(workingState, 0, 5, 10, 15);
    quarterRound(workingState, 1, 6, 11, 12);
    quarterRound(workingState, 2, 7, 8, 13);
    quarterRound(workingState, 3, 4, 9, 14);
  }

  // Add initial state to working state
  for (let i = 0; i < 16; i++) {
    workingState[i] = (workingState[i] + initialState[i]) >>> 0;
  }

  return workingState;
}

// Serialize state to bytes
function serializeState(state: Uint32Array): Uint8Array {
  const bytes = new Uint8Array(64);
  for (let i = 0; i < 16; i++) {
    uint32ToLittleEndian(state[i], bytes, i * 4);
  }
  return bytes;
}

// Main ChaCha20 encryption/decryption function
export function chaCha20(data: Uint8Array, key: Uint8Array, nonce: Uint8Array, counter: number = 0): Uint8Array {
  const output = new Uint8Array(data.length);
  let blockCounter = counter;

  for (let i = 0; i < data.length; i += 64) {
    // Generate keystream block
    const state = initializeState(key, nonce, blockCounter);
    const keystream = serializeState(chachaBlock(state));

    // XOR data with keystream
    const blockSize = Math.min(64, data.length - i);
    for (let j = 0; j < blockSize; j++) {
      output[i + j] = data[i + j] ^ keystream[j];
    }

    blockCounter++;
  }

  return output;
}

// Encrypt plaintext with ChaCha20
export function encryptChaCha20(plaintext: string, keyStr: string, nonceStr: string): string {
  // Prepare key (32 bytes)
  const key = new Uint8Array(32);
  const keyBytes = stringToUint8Array(keyStr);
  key.set(keyBytes.slice(0, Math.min(32, keyBytes.length)));

  // Prepare nonce (12 bytes)
  const nonce = new Uint8Array(12);
  const nonceBytes = stringToUint8Array(nonceStr);
  nonce.set(nonceBytes.slice(0, Math.min(12, nonceBytes.length)));

  // Encrypt
  const plaintextBytes = stringToUint8Array(plaintext);
  const ciphertext = chaCha20(plaintextBytes, key, nonce, 0);

  return uint8ArrayToHex(ciphertext);
}

// Decrypt ciphertext with ChaCha20
export function decryptChaCha20(ciphertextHex: string, keyStr: string, nonceStr: string): string {
  // Prepare key (32 bytes)
  const key = new Uint8Array(32);
  const keyBytes = stringToUint8Array(keyStr);
  key.set(keyBytes.slice(0, Math.min(32, keyBytes.length)));

  // Prepare nonce (12 bytes)
  const nonce = new Uint8Array(12);
  const nonceBytes = stringToUint8Array(nonceStr);
  nonce.set(nonceBytes.slice(0, Math.min(12, nonceBytes.length)));

  // Decrypt (same as encrypt for stream cipher)
  const ciphertext = hexToUint8Array(ciphertextHex);
  const plaintext = chaCha20(ciphertext, key, nonce, 0);

  return uint8ArrayToString(plaintext);
}

// Get ChaCha20 details for visualization
export function getChaCha20Details(plaintext: string, keyStr: string, nonceStr: string) {
  // Prepare key and nonce
  const key = new Uint8Array(32);
  const keyBytes = stringToUint8Array(keyStr);
  key.set(keyBytes.slice(0, Math.min(32, keyBytes.length)));

  const nonce = new Uint8Array(12);
  const nonceBytes = stringToUint8Array(nonceStr);
  nonce.set(nonceBytes.slice(0, Math.min(12, nonceBytes.length)));

  // Initialize state
  const initialState = initializeState(key, nonce, 0);

  // Track state through rounds
  const rounds = [];
  const workingState = new Uint32Array(initialState);

  for (let i = 0; i < 10; i++) {
    const beforeColumn = new Uint32Array(workingState);

    // Column rounds
    quarterRound(workingState, 0, 4, 8, 12);
    quarterRound(workingState, 1, 5, 9, 13);
    quarterRound(workingState, 2, 6, 10, 14);
    quarterRound(workingState, 3, 7, 11, 15);

    const afterColumn = new Uint32Array(workingState);

    // Diagonal rounds
    quarterRound(workingState, 0, 5, 10, 15);
    quarterRound(workingState, 1, 6, 11, 12);
    quarterRound(workingState, 2, 7, 8, 13);
    quarterRound(workingState, 3, 4, 9, 14);

    const afterDiagonal = new Uint32Array(workingState);

    rounds.push({
      doubleRound: i + 1,
      beforeColumn: Array.from(beforeColumn),
      afterColumn: Array.from(afterColumn),
      afterDiagonal: Array.from(afterDiagonal)
    });
  }

  // Final state (after adding initial state)
  const finalState = new Uint32Array(workingState);
  for (let i = 0; i < 16; i++) {
    finalState[i] = (finalState[i] + initialState[i]) >>> 0;
  }

  return {
    initialState: Array.from(initialState),
    rounds,
    finalState: Array.from(finalState),
    keystream: uint8ArrayToHex(serializeState(finalState)),
    ciphertext: encryptChaCha20(plaintext, keyStr, nonceStr)
  };
}

// Format state matrix for display
export function formatStateMatrix(state: number[] | Uint32Array): string[][] {
  const stateArray = Array.from(state);
  const matrix: string[][] = [];

  for (let row = 0; row < 4; row++) {
    const rowData: string[] = [];
    for (let col = 0; col < 4; col++) {
      const value = stateArray[row + col * 4];
      rowData.push(value.toString(16).padStart(8, '0').toUpperCase());
    }
    matrix.push(rowData);
  }

  return matrix;
}
