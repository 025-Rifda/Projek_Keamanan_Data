const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const DES_INITIAL_PERMUTATION_TABLE = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7,
];

export const DES_FINAL_PERMUTATION_TABLE = [
  40, 8, 48, 16, 56, 24, 64, 32,
  39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30,
  37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26,
  33, 1, 41, 9, 49, 17, 57, 25,
];

export const DES_EXPANSION_TABLE = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1,
];

export const DES_PERMUTATION_P_TABLE = [
  16, 7, 20, 21, 29, 12, 28, 17,
  1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9,
  19, 13, 30, 6, 22, 11, 4, 25,
];

const PC1 = [
  57, 49, 41, 33, 25, 17, 9,
  1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27,
  19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
  7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29,
  21, 13, 5, 28, 20, 12, 4,
];

const PC2 = [
  14, 17, 11, 24, 1, 5,
  3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8,
  16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32,
];

const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

export const DES_S_BOXES = [
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13],
  ],
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9],
  ],
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12],
  ],
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14],
  ],
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3],
  ],
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13],
  ],
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12],
  ],
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 5, 10, 3, 6, 13, 15, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11],
  ],
];

type Bit = 0 | 1;

export interface DESKeyScheduleRound {
  round: number;
  shift: number;
  c: string;
  d: string;
  combined: string;
  subkey: string;
}

export interface DESRoundDetails {
  round: number;
  subkeyIndex: number;
  L: string;
  R: string;
  expandedR: string;
  xorWithSubkey: string;
  sBoxOutput: string;
  pOutput: string;
  newL: string;
  newR: string;
}

export interface DESDetails {
  mode: 'encrypt' | 'decrypt';
  inputText: string;
  inputHex: string;
  inputBits: string;
  keyText: string;
  keyHex: string;
  keyBits: string;
  keyAfterPc1: string;
  initialPermutation: string;
  initialPermutationBits: string;
  l0: string;
  r0: string;
  keySchedule: DESKeyScheduleRound[];
  rounds: DESRoundDetails[];
  preOutput: string;
  preOutputBits: string;
  finalOutput: string;
  finalOutputBits: string;
  outputText: string;
}

export interface DESAvalancheResult {
  originalPlaintext: string;
  modifiedPlaintext: string;
  changedBitIndex: number;
  originalCiphertext: string;
  modifiedCiphertext: string;
  originalCipherBits: string;
  modifiedCipherBits: string;
  differentBitPositions: number[];
  differentBits: number;
  totalBits: number;
  percentage: number;
}

function stringToFixedBytes(value: string, length: number): Uint8Array {
  const encoded = textEncoder.encode(value);
  const bytes = new Uint8Array(length);
  bytes.set(encoded.slice(0, length));
  return bytes;
}

function bytesToTrimmedString(bytes: Uint8Array): string {
  return textDecoder.decode(bytes).replace(/\0+$/, '');
}

function hexToBytes(hex: string): Uint8Array {
  const normalized = hex.trim().toUpperCase();
  const bytes = new Uint8Array(normalized.length / 2);
  for (let i = 0; i < normalized.length; i += 2) {
    bytes[i / 2] = parseInt(normalized.slice(i, i + 2), 16);
  }
  return bytes;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

function bytesToBits(bytes: Uint8Array): Bit[] {
  const bits: Bit[] = [];
  for (const byte of bytes) {
    for (let i = 7; i >= 0; i--) {
      bits.push(((byte >> i) & 1) as Bit);
    }
  }
  return bits;
}

function bitsToBytes(bits: Bit[]): Uint8Array {
  const bytes = new Uint8Array(Math.ceil(bits.length / 8));
  for (let i = 0; i < bits.length; i++) {
    const byteIndex = Math.floor(i / 8);
    bytes[byteIndex] = (bytes[byteIndex] << 1) | bits[i];
    if (i % 8 === 7) {
      bytes[byteIndex] &= 0xff;
    }
  }
  const remainingBits = bits.length % 8;
  if (remainingBits !== 0) {
    const lastIndex = bytes.length - 1;
    bytes[lastIndex] <<= 8 - remainingBits;
    bytes[lastIndex] &= 0xff;
  }
  return bytes;
}

function bitsToBinaryString(bits: Bit[]): string {
  return bits.join('');
}

function bitsToHex(bits: Bit[]): string {
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j++) {
      nibble = (nibble << 1) | (bits[i + j] ?? 0);
    }
    hex += nibble.toString(16).toUpperCase();
  }
  return hex;
}

function permute(bits: Bit[], table: number[]): Bit[] {
  return table.map((position) => bits[position - 1] ?? 0) as Bit[];
}

function xorBits(left: Bit[], right: Bit[]): Bit[] {
  return left.map((bit, index) => (bit ^ right[index]) as Bit);
}

function leftShift(bits: Bit[], amount: number): Bit[] {
  return [...bits.slice(amount), ...bits.slice(0, amount)] as Bit[];
}

function applySBoxes(bits: Bit[]): Bit[] {
  const output: Bit[] = [];
  for (let index = 0; index < 8; index++) {
    const chunk = bits.slice(index * 6, (index + 1) * 6);
    const row = (chunk[0] << 1) | chunk[5];
    const column = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const value = DES_S_BOXES[index][row][column];
    for (let shift = 3; shift >= 0; shift--) {
      output.push(((value >> shift) & 1) as Bit);
    }
  }
  return output;
}

function generateKeySchedule(keyBits: Bit[]) {
  const keyAfterPc1 = permute(keyBits, PC1);
  let c = keyAfterPc1.slice(0, 28) as Bit[];
  let d = keyAfterPc1.slice(28, 56) as Bit[];
  const rounds: DESKeyScheduleRound[] = [];
  const subkeys: Bit[][] = [];

  for (let round = 0; round < 16; round++) {
    c = leftShift(c, SHIFTS[round]);
    d = leftShift(d, SHIFTS[round]);
    const combined = [...c, ...d] as Bit[];
    const subkey = permute(combined, PC2);
    subkeys.push(subkey);
    rounds.push({
      round: round + 1,
      shift: SHIFTS[round],
      c: bitsToBinaryString(c),
      d: bitsToBinaryString(d),
      combined: bitsToBinaryString(combined),
      subkey: bitsToHex(subkey),
    });
  }

  return {
    keyAfterPc1: bitsToBinaryString(keyAfterPc1),
    subkeys,
    rounds,
  };
}

function computeFeistelRound(L: Bit[], R: Bit[], subkey: Bit[], round: number, subkeyIndex: number): DESRoundDetails & { nextL: Bit[]; nextR: Bit[] } {
  const expandedR = permute(R, DES_EXPANSION_TABLE);
  const xorWithSubkey = xorBits(expandedR, subkey);
  const sBoxOutput = applySBoxes(xorWithSubkey);
  const pOutput = permute(sBoxOutput, DES_PERMUTATION_P_TABLE);
  const nextL = [...R] as Bit[];
  const nextR = xorBits(L, pOutput);

  return {
    round,
    subkeyIndex,
    L: bitsToHex(L),
    R: bitsToHex(R),
    expandedR: bitsToHex(expandedR),
    xorWithSubkey: bitsToHex(xorWithSubkey),
    sBoxOutput: bitsToHex(sBoxOutput),
    pOutput: bitsToHex(pOutput),
    newL: bitsToHex(nextL),
    newR: bitsToHex(nextR),
    nextL,
    nextR,
  };
}

function buildDESDetailsFromBits(
  inputBits: Bit[],
  inputText: string,
  keyBytes: Uint8Array,
  keyDisplayText: string,
  mode: 'encrypt' | 'decrypt',
): DESDetails {
  const keyBits = bytesToBits(keyBytes);
  const keySchedule = generateKeySchedule(keyBits);
  const initialPermutationBits = permute(inputBits, DES_INITIAL_PERMUTATION_TABLE);
  let L = initialPermutationBits.slice(0, 32) as Bit[];
  let R = initialPermutationBits.slice(32, 64) as Bit[];
  const rounds: DESRoundDetails[] = [];

  for (let round = 0; round < 16; round++) {
    const subkeyIndex = mode === 'encrypt' ? round : 15 - round;
    const roundDetails = computeFeistelRound(L, R, keySchedule.subkeys[subkeyIndex], round + 1, subkeyIndex + 1);
    rounds.push(roundDetails);
    L = roundDetails.nextL;
    R = roundDetails.nextR;
  }

  const preOutputBits = [...R, ...L] as Bit[];
  const finalOutputBits = permute(preOutputBits, DES_FINAL_PERMUTATION_TABLE);
  const outputBytes = bitsToBytes(finalOutputBits);

  return {
    mode,
    inputText,
    inputHex: bitsToHex(inputBits),
    inputBits: bitsToBinaryString(inputBits),
    keyText: keyDisplayText,
    keyHex: bytesToHex(keyBytes),
    keyBits: bitsToBinaryString(keyBits),
    keyAfterPc1: keySchedule.keyAfterPc1,
    initialPermutation: bitsToHex(initialPermutationBits),
    initialPermutationBits: bitsToBinaryString(initialPermutationBits),
    l0: bitsToHex(initialPermutationBits.slice(0, 32) as Bit[]),
    r0: bitsToHex(initialPermutationBits.slice(32, 64) as Bit[]),
    keySchedule: keySchedule.rounds,
    rounds,
    preOutput: bitsToHex(preOutputBits),
    preOutputBits: bitsToBinaryString(preOutputBits),
    finalOutput: bitsToHex(finalOutputBits),
    finalOutputBits: bitsToBinaryString(finalOutputBits),
    outputText: bytesToTrimmedString(outputBytes),
  };
}

export function getDESDetails(plaintext: string, key: string): DESDetails {
  const blockBytes = stringToFixedBytes(plaintext, 8);
  const keyBytes = stringToFixedBytes(key, 8);
  return buildDESDetailsFromBits(bytesToBits(blockBytes), bytesToTrimmedString(blockBytes), keyBytes, bytesToTrimmedString(keyBytes), 'encrypt');
}

export function getDESDecryptionDetails(ciphertextHex: string, key: string): DESDetails {
  const cipherBits = bytesToBits(hexToBytes(ciphertextHex));
  const keyBytes = stringToFixedBytes(key, 8);
  return buildDESDetailsFromBits(cipherBits, ciphertextHex.toUpperCase(), keyBytes, bytesToTrimmedString(keyBytes), 'decrypt');
}

export function encryptDES(plaintext: string, key: string): string {
  return getDESDetails(plaintext, key).finalOutput;
}

export function decryptDES(ciphertext: string, key: string): string {
  return getDESDecryptionDetails(ciphertext, key).outputText;
}

export function encryptDESHex(plaintextHex: string, keyHex: string): string {
  const plaintextBits = bytesToBits(hexToBytes(plaintextHex));
  const keyBytes = hexToBytes(keyHex);
  return buildDESDetailsFromBits(plaintextBits, plaintextHex.toUpperCase(), keyBytes, keyHex.toUpperCase(), 'encrypt').finalOutput;
}

export function decryptDESHex(ciphertextHex: string, keyHex: string): string {
  const details = buildDESDetailsFromBits(
    bytesToBits(hexToBytes(ciphertextHex)),
    ciphertextHex.toUpperCase(),
    hexToBytes(keyHex),
    keyHex.toUpperCase(),
    'decrypt',
  );
  return details.finalOutput;
}

export function calculateDESAvalanche(plaintext: string, key: string, changedBitIndex: number = 0): DESAvalancheResult {
  const baseBytes = stringToFixedBytes(plaintext, 8);
  const modifiedBytes = new Uint8Array(baseBytes);
  const byteIndex = Math.floor(changedBitIndex / 8);
  const bitIndex = 7 - (changedBitIndex % 8);
  modifiedBytes[byteIndex] ^= 1 << bitIndex;

  const originalPlaintext = bytesToTrimmedString(baseBytes);
  const modifiedPlaintext = bytesToTrimmedString(modifiedBytes);
  const originalCiphertext = encryptDES(originalPlaintext, key);
  const modifiedCiphertext = encryptDES(modifiedPlaintext, key);
  const originalCipherBits = bitsToBinaryString(bytesToBits(hexToBytes(originalCiphertext)));
  const modifiedCipherBits = bitsToBinaryString(bytesToBits(hexToBytes(modifiedCiphertext)));
  const differentBitPositions = originalCipherBits
    .split('')
    .map((bit, index) => (bit !== modifiedCipherBits[index] ? index : -1))
    .filter((index) => index >= 0);

  return {
    originalPlaintext,
    modifiedPlaintext,
    changedBitIndex,
    originalCiphertext,
    modifiedCiphertext,
    originalCipherBits,
    modifiedCipherBits,
    differentBitPositions,
    differentBits: differentBitPositions.length,
    totalBits: originalCipherBits.length,
    percentage: (differentBitPositions.length / originalCipherBits.length) * 100,
  };
}

export function formatBinaryGroups(bits: string, groupSize: number): string {
  return bits.match(new RegExp(`.{1,${groupSize}}`, 'g'))?.join(' ') ?? bits;
}
