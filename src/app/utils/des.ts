// DES Encryption Implementation
// Complete DES algorithm with all permutation tables and S-boxes

// Initial Permutation (IP) Table
const IP = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7
];

// Final Permutation (FP) Table - Inverse of IP
const FP = [
  40, 8, 48, 16, 56, 24, 64, 32,
  39, 7, 47, 15, 55, 23, 63, 31,
  38, 6, 46, 14, 54, 22, 62, 30,
  37, 5, 45, 13, 53, 21, 61, 29,
  36, 4, 44, 12, 52, 20, 60, 28,
  35, 3, 43, 11, 51, 19, 59, 27,
  34, 2, 42, 10, 50, 18, 58, 26,
  33, 1, 41, 9, 49, 17, 57, 25
];

// Expansion (E) Table - expands 32 bits to 48 bits
const E = [
  32, 1, 2, 3, 4, 5,
  4, 5, 6, 7, 8, 9,
  8, 9, 10, 11, 12, 13,
  12, 13, 14, 15, 16, 17,
  16, 17, 18, 19, 20, 21,
  20, 21, 22, 23, 24, 25,
  24, 25, 26, 27, 28, 29,
  28, 29, 30, 31, 32, 1
];

// Permutation (P) Table - used in F function
const P = [
  16, 7, 20, 21, 29, 12, 28, 17,
  1, 15, 23, 26, 5, 18, 31, 10,
  2, 8, 24, 14, 32, 27, 3, 9,
  19, 13, 30, 6, 22, 11, 4, 25
];

// Permuted Choice 1 (PC1) - selects 56 bits from 64-bit key
const PC1 = [
  57, 49, 41, 33, 25, 17, 9,
  1, 58, 50, 42, 34, 26, 18,
  10, 2, 59, 51, 43, 35, 27,
  19, 11, 3, 60, 52, 44, 36,
  63, 55, 47, 39, 31, 23, 15,
  7, 62, 54, 46, 38, 30, 22,
  14, 6, 61, 53, 45, 37, 29,
  21, 13, 5, 28, 20, 12, 4
];

// Permuted Choice 2 (PC2) - selects 48 bits from 56-bit key
const PC2 = [
  14, 17, 11, 24, 1, 5,
  3, 28, 15, 6, 21, 10,
  23, 19, 12, 4, 26, 8,
  16, 7, 27, 20, 13, 2,
  41, 52, 31, 37, 47, 55,
  30, 40, 51, 45, 33, 48,
  44, 49, 39, 56, 34, 53,
  46, 42, 50, 36, 29, 32
];

// Number of left shifts for each round
const SHIFTS = [1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1];

// S-Boxes (Substitution boxes)
const S_BOXES = [
  // S1
  [
    [14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7],
    [0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8],
    [4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0],
    [15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13]
  ],
  // S2
  [
    [15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10],
    [3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5],
    [0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15],
    [13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9]
  ],
  // S3
  [
    [10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8],
    [13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1],
    [13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7],
    [1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12]
  ],
  // S4
  [
    [7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15],
    [13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9],
    [10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4],
    [3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14]
  ],
  // S5
  [
    [2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9],
    [14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6],
    [4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14],
    [11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3]
  ],
  // S6
  [
    [12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11],
    [10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8],
    [9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6],
    [4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13]
  ],
  // S7
  [
    [4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1],
    [13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6],
    [1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2],
    [6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12]
  ],
  // S8
  [
    [13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7],
    [1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2],
    [7, 11, 4, 1, 9, 12, 14, 2, 0, 5, 10, 3, 6, 13, 15, 8],
    [2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11]
  ]
];

// Utility functions
function stringToBits(str: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    for (let j = 7; j >= 0; j--) {
      bits.push((charCode >> j) & 1);
    }
  }
  return bits;
}

function bitsToString(bits: number[]): string {
  let str = '';
  for (let i = 0; i < bits.length; i += 8) {
    let charCode = 0;
    for (let j = 0; j < 8; j++) {
      charCode = (charCode << 1) | (bits[i + j] || 0);
    }
    str += String.fromCharCode(charCode);
  }
  return str;
}

function bitsToHex(bits: number[]): string {
  let hex = '';
  for (let i = 0; i < bits.length; i += 4) {
    let nibble = 0;
    for (let j = 0; j < 4; j++) {
      nibble = (nibble << 1) | (bits[i + j] || 0);
    }
    hex += nibble.toString(16).toUpperCase();
  }
  return hex;
}

function hexToBits(hex: string): number[] {
  const bits: number[] = [];
  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16);
    for (let j = 3; j >= 0; j--) {
      bits.push((nibble >> j) & 1);
    }
  }
  return bits;
}

function permute(bits: number[], table: number[]): number[] {
  return table.map(pos => bits[pos - 1]);
}

function leftShift(bits: number[], shifts: number): number[] {
  return [...bits.slice(shifts), ...bits.slice(0, shifts)];
}

function xor(bits1: number[], bits2: number[]): number[] {
  return bits1.map((bit, i) => bit ^ bits2[i]);
}

// Generate 16 subkeys from the main key
function generateSubkeys(key: string): number[][] {
  // Convert key to 64 bits
  const keyBits = stringToBits(key.padEnd(8, '\0').slice(0, 8));

  // Apply PC1 to get 56-bit key
  const permutedKey = permute(keyBits, PC1);

  // Split into C and D (28 bits each)
  let C = permutedKey.slice(0, 28);
  let D = permutedKey.slice(28, 56);

  const subkeys: number[][] = [];

  // Generate 16 subkeys
  for (let round = 0; round < 16; round++) {
    // Perform left shifts
    C = leftShift(C, SHIFTS[round]);
    D = leftShift(D, SHIFTS[round]);

    // Combine C and D
    const CD = [...C, ...D];

    // Apply PC2 to get 48-bit subkey
    subkeys.push(permute(CD, PC2));
  }

  return subkeys;
}

// F function (Feistel function)
function feistelFunction(R: number[], subkey: number[]): number[] {
  // Expand R from 32 to 48 bits
  const expandedR = permute(R, E);

  // XOR with subkey
  const xored = xor(expandedR, subkey);

  // Apply S-boxes (48 bits -> 32 bits)
  let sBoxOutput: number[] = [];
  for (let i = 0; i < 8; i++) {
    const chunk = xored.slice(i * 6, (i + 1) * 6);
    const row = (chunk[0] << 1) | chunk[5];
    const col = (chunk[1] << 3) | (chunk[2] << 2) | (chunk[3] << 1) | chunk[4];
    const sValue = S_BOXES[i][row][col];

    // Convert to 4 bits
    for (let j = 3; j >= 0; j--) {
      sBoxOutput.push((sValue >> j) & 1);
    }
  }

  // Apply P permutation
  return permute(sBoxOutput, P);
}

// Main DES encryption function
export function encryptDES(plaintext: string, key: string): string {
  // Pad plaintext to 8 bytes
  const paddedPlaintext = plaintext.padEnd(8, '\0').slice(0, 8);

  // Convert to bits
  const bits = stringToBits(paddedPlaintext);

  // Apply initial permutation
  const permuted = permute(bits, IP);

  // Split into L and R (32 bits each)
  let L = permuted.slice(0, 32);
  let R = permuted.slice(32, 64);

  // Generate subkeys
  const subkeys = generateSubkeys(key);

  // 16 rounds of Feistel
  for (let round = 0; round < 16; round++) {
    const temp = R;
    const fResult = feistelFunction(R, subkeys[round]);
    R = xor(L, fResult);
    L = temp;
  }

  // Swap L and R for final permutation
  const combined = [...R, ...L];

  // Apply final permutation
  const finalBits = permute(combined, FP);

  // Convert to hex
  return bitsToHex(finalBits);
}

// Main DES decryption function
export function decryptDES(ciphertext: string, key: string): string {
  // Convert hex to bits
  const bits = hexToBits(ciphertext);

  // Apply initial permutation
  const permuted = permute(bits, IP);

  // Split into L and R (32 bits each)
  let L = permuted.slice(0, 32);
  let R = permuted.slice(32, 64);

  // Generate subkeys
  const subkeys = generateSubkeys(key);

  // 16 rounds of Feistel with reversed subkeys
  for (let round = 0; round < 16; round++) {
    const temp = R;
    const fResult = feistelFunction(R, subkeys[15 - round]);
    R = xor(L, fResult);
    L = temp;
  }

  // Swap L and R for final permutation
  const combined = [...R, ...L];

  // Apply final permutation
  const finalBits = permute(combined, FP);

  // Convert to string and trim padding
  return bitsToString(finalBits).replace(/\0+$/, '');
}

// Export details for visualization
export function getDESDetails(plaintext: string, key: string) {
  const paddedPlaintext = plaintext.padEnd(8, '\0').slice(0, 8);
  const bits = stringToBits(paddedPlaintext);
  const permuted = permute(bits, IP);
  let L = permuted.slice(0, 32);
  let R = permuted.slice(32, 64);
  const subkeys = generateSubkeys(key);

  const rounds = [];
  for (let round = 0; round < 16; round++) {
    const fResult = feistelFunction(R, subkeys[round]);
    const newR = xor(L, fResult);
    const newL = R;

    rounds.push({
      round: round + 1,
      L: bitsToHex(L),
      R: bitsToHex(R),
      subkey: bitsToHex(subkeys[round]),
      newL: bitsToHex(newL),
      newR: bitsToHex(newR)
    });

    L = newL;
    R = newR;
  }

  return {
    initialPermutation: bitsToHex(permuted),
    rounds,
    finalCiphertext: encryptDES(plaintext, key)
  };
}
