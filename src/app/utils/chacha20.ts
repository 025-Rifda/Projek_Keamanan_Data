const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const CHACHA_CONSTANTS = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];

export interface ChaChaRoundDetails {
  doubleRound: number;
  beforeColumn: number[];
  afterColumn: number[];
  afterDiagonal: number[];
}

export interface ChaCha20Details {
  counter: number;
  plaintext: string;
  plaintextHex: string;
  keyHex: string;
  nonceHex: string;
  initialState: number[];
  rounds: ChaChaRoundDetails[];
  finalWorkingState: number[];
  finalState: number[];
  keystream: string;
  keystreamBytes: number[];
  ciphertext: string;
  ciphertextBytes: number[];
}

function stringToFixedBytes(value: string, length: number): Uint8Array {
  const encoded = textEncoder.encode(value);
  const bytes = new Uint8Array(length);
  bytes.set(encoded.slice(0, length));
  return bytes;
}

function stringToBytes(value: string): Uint8Array {
  return textEncoder.encode(value);
}

function bytesToString(bytes: Uint8Array): string {
  return textDecoder.decode(bytes);
}

export function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

export function hexToUint8Array(hex: string): Uint8Array {
  const normalized = hex.trim().toUpperCase();
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
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

function rotateLeft(value: number, bits: number): number {
  return ((value << bits) | (value >>> (32 - bits))) >>> 0;
}

export function quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number): void {
  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotateLeft(state[d] ^ state[a], 16);

  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotateLeft(state[b] ^ state[c], 12);

  state[a] = (state[a] + state[b]) >>> 0;
  state[d] = rotateLeft(state[d] ^ state[a], 8);

  state[c] = (state[c] + state[d]) >>> 0;
  state[b] = rotateLeft(state[b] ^ state[c], 7);
}

export function initializeChaChaState(key: Uint8Array, nonce: Uint8Array, counter: number): Uint32Array {
  const state = new Uint32Array(16);

  state[0] = CHACHA_CONSTANTS[0];
  state[1] = CHACHA_CONSTANTS[1];
  state[2] = CHACHA_CONSTANTS[2];
  state[3] = CHACHA_CONSTANTS[3];

  for (let index = 0; index < 8; index++) {
    state[4 + index] = littleEndianToUint32(key, index * 4);
  }

  state[12] = counter >>> 0;

  for (let index = 0; index < 3; index++) {
    state[13 + index] = littleEndianToUint32(nonce, index * 4);
  }

  return state;
}

export function serializeState(state: Uint32Array): Uint8Array {
  const bytes = new Uint8Array(64);
  for (let index = 0; index < 16; index++) {
    uint32ToLittleEndian(state[index], bytes, index * 4);
  }
  return bytes;
}

function runChaChaRounds(initialState: Uint32Array): { rounds: ChaChaRoundDetails[]; finalWorkingState: Uint32Array; finalState: Uint32Array } {
  const workingState = new Uint32Array(initialState);
  const rounds: ChaChaRoundDetails[] = [];

  for (let round = 0; round < 10; round++) {
    const beforeColumn = new Uint32Array(workingState);

    quarterRound(workingState, 0, 4, 8, 12);
    quarterRound(workingState, 1, 5, 9, 13);
    quarterRound(workingState, 2, 6, 10, 14);
    quarterRound(workingState, 3, 7, 11, 15);

    const afterColumn = new Uint32Array(workingState);

    quarterRound(workingState, 0, 5, 10, 15);
    quarterRound(workingState, 1, 6, 11, 12);
    quarterRound(workingState, 2, 7, 8, 13);
    quarterRound(workingState, 3, 4, 9, 14);

    rounds.push({
      doubleRound: round + 1,
      beforeColumn: Array.from(beforeColumn),
      afterColumn: Array.from(afterColumn),
      afterDiagonal: Array.from(workingState),
    });
  }

  const finalWorkingState = new Uint32Array(workingState);
  const finalState = new Uint32Array(workingState);
  for (let index = 0; index < 16; index++) {
    finalState[index] = (finalState[index] + initialState[index]) >>> 0;
  }

  return {
    rounds,
    finalWorkingState,
    finalState,
  };
}

export function chaCha20(data: Uint8Array, key: Uint8Array, nonce: Uint8Array, counter: number = 0): Uint8Array {
  const output = new Uint8Array(data.length);
  let blockCounter = counter >>> 0;

  for (let offset = 0; offset < data.length; offset += 64) {
    const initialState = initializeChaChaState(key, nonce, blockCounter);
    const { finalState } = runChaChaRounds(initialState);
    const keystream = serializeState(finalState);
    const blockSize = Math.min(64, data.length - offset);

    for (let index = 0; index < blockSize; index++) {
      output[offset + index] = data[offset + index] ^ keystream[index];
    }

    blockCounter = (blockCounter + 1) >>> 0;
  }

  return output;
}

export function encryptChaCha20Bytes(data: Uint8Array, key: Uint8Array, nonce: Uint8Array, counter: number = 0): Uint8Array {
  return chaCha20(data, key, nonce, counter);
}

export function encryptChaCha20(plaintext: string, keyStr: string, nonceStr: string, counter: number = 0): string {
  const key = stringToFixedBytes(keyStr, 32);
  const nonce = stringToFixedBytes(nonceStr, 12);
  return uint8ArrayToHex(chaCha20(stringToBytes(plaintext), key, nonce, counter));
}

export function decryptChaCha20(ciphertextHex: string, keyStr: string, nonceStr: string, counter: number = 0): string {
  const key = stringToFixedBytes(keyStr, 32);
  const nonce = stringToFixedBytes(nonceStr, 12);
  return bytesToString(chaCha20(hexToUint8Array(ciphertextHex), key, nonce, counter));
}

export function getChaCha20DetailsFromBytes(data: Uint8Array, key: Uint8Array, nonce: Uint8Array, counter: number = 0): ChaCha20Details {
  const initialState = initializeChaChaState(key, nonce, counter);
  const { rounds, finalWorkingState, finalState } = runChaChaRounds(initialState);
  const keystreamBytes = serializeState(finalState);
  const ciphertextBytes = chaCha20(data, key, nonce, counter);

  return {
    counter: counter >>> 0,
    plaintext: bytesToString(data),
    plaintextHex: uint8ArrayToHex(data),
    keyHex: uint8ArrayToHex(key),
    nonceHex: uint8ArrayToHex(nonce),
    initialState: Array.from(initialState),
    rounds,
    finalWorkingState: Array.from(finalWorkingState),
    finalState: Array.from(finalState),
    keystream: uint8ArrayToHex(keystreamBytes),
    keystreamBytes: Array.from(keystreamBytes),
    ciphertext: uint8ArrayToHex(ciphertextBytes),
    ciphertextBytes: Array.from(ciphertextBytes),
  };
}

export function getChaCha20Details(plaintext: string, keyStr: string, nonceStr: string, counter: number = 0): ChaCha20Details {
  const key = stringToFixedBytes(keyStr, 32);
  const nonce = stringToFixedBytes(nonceStr, 12);
  return getChaCha20DetailsFromBytes(stringToBytes(plaintext), key, nonce, counter);
}

export function formatStateMatrix(state: number[] | Uint32Array): string[][] {
  const values = Array.from(state);
  const matrix: string[][] = [];
  for (let row = 0; row < 4; row++) {
    const currentRow: string[] = [];
    for (let column = 0; column < 4; column++) {
      currentRow.push(values[row * 4 + column].toString(16).padStart(8, '0').toUpperCase());
    }
    matrix.push(currentRow);
  }
  return matrix;
}
