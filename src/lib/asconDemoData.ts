/**
 * Deterministic ASCON Demo Data
 *
 * A single source of truth for all visualization panels.
 * All values here are pre-computed so they never trigger
 * re-renders, never flicker, and remain consistent across stages.
 *
 * Plaintext: "Hello IoT" (9 bytes, padded to 64-bit block)
 */

// ─── Plaintext ────────────────────────────────────────────────────────────────

export const DEMO_PLAINTEXT = "Hello IoT";

export const DEMO_PLAINTEXT_CHARS: {
  char: string;
  hex: string;
  bin: string;
  dec: number;
}[] = [
  { char: "H", hex: "48", bin: "01001000", dec: 72 },
  { char: "e", hex: "65", bin: "01100101", dec: 101 },
  { char: "l", hex: "6C", bin: "01101100", dec: 108 },
  { char: "l", hex: "6C", bin: "01101100", dec: 108 },
  { char: "o", hex: "6F", bin: "01101111", dec: 111 },
  { char: " ", hex: "20", bin: "00100000", dec: 32 },
  { char: "I", hex: "49", bin: "01001001", dec: 73 },
  { char: "o", hex: "6F", bin: "01101111", dec: 111 },
  { char: "T", hex: "54", bin: "01010100", dec: 84 },
];

// ─── Crypto Parameters ────────────────────────────────────────────────────────

export const DEMO_KEY        = "000102030405060708090A0B0C0D0E0F";
export const DEMO_NONCE      = "101112131415161718191A1B1C1D1E1F";
export const DEMO_ASSOC_DATA = "ESP32-STATION-1";

// ─── Initial State (320-bit = 5 × 64-bit words) ───────────────────────────────
// Layout: [IV | Key_Hi | Key_Lo | Nonce_Hi | Nonce_Lo]

export const INITIAL_STATE_WORDS = [
  { label: "x0", hex: "80400C0600000000", role: "IV",        color: "blue"   },
  { label: "x1", hex: "0001020304050607", role: "Key[0:7]",  color: "amber"  },
  { label: "x2", hex: "08090A0B0C0D0E0F", role: "Key[8:15]", color: "amber"  },
  { label: "x3", hex: "1011121314151617", role: "Nonce[0:7]",color: "rose"   },
  { label: "x4", hex: "18191A1B1C1D1E1F", role: "Nonce[8:15]",color: "rose"  },
];

// Bytes per word (8 bytes = 64 bits each) — used by InteractiveStateGrid
export const INITIAL_STATE_BYTES: Record<string, string[]> = {
  x0: ["80", "40", "0C", "06", "00", "00", "00", "00"],
  x1: ["00", "01", "02", "03", "04", "05", "06", "07"],
  x2: ["08", "09", "0A", "0B", "0C", "0D", "0E", "0F"],
  x3: ["10", "11", "12", "13", "14", "15", "16", "17"],
  x4: ["18", "19", "1A", "1B", "1C", "1D", "1E", "1F"],
};

// After 12-round permutation (initialization) — fake but deterministic
export const INITIALIZED_STATE_BYTES: Record<string, string[]> = {
  x0: ["E8", "F1", "23", "A7", "4C", "9B", "D2", "51"],
  x1: ["3B", "7E", "AC", "60", "D4", "F8", "15", "89"],
  x2: ["C2", "54", "9D", "E0", "71", "AB", "38", "6F"],
  x3: ["47", "BC", "05", "DA", "93", "2E", "67", "F1"],
  x4: ["9A", "31", "EE", "78", "B5", "04", "CD", "42"],
};

// ─── Permutation Round Constants ───────────────────────────────────────────────
// ASCON uses 12 rounds for initialization (p^12) and 8 for intermediate (p^8)
// Constants are added to x2 as: x2 ^= ROUND_CONST[r]

export const ROUND_CONSTANTS: { round: number; constant: string; binary: string }[] = [
  { round: 0,  constant: "f0", binary: "11110000" },
  { round: 1,  constant: "e1", binary: "11100001" },
  { round: 2,  constant: "d2", binary: "11010010" },
  { round: 3,  constant: "c3", binary: "11000011" },
  { round: 4,  constant: "b4", binary: "10110100" },
  { round: 5,  constant: "a5", binary: "10100101" },
  { round: 6,  constant: "96", binary: "10010110" },
  { round: 7,  constant: "87", binary: "10000111" },
  { round: 8,  constant: "78", binary: "01111000" },
  { round: 9,  constant: "69", binary: "01101001" },
  { round: 10, constant: "5a", binary: "01011010" },
  { round: 11, constant: "4b", binary: "01001011" },
];

// Example x2 value before constant addition (for round visualization)
export const PERM_X2_BEFORE = "C2549DE071AB386F";
export const PERM_X2_BITS_BEFORE = "1100001001010100"; // first 16 bits for display

// Example after XOR with round 0 constant (0xf0 applied to byte 0)
export const PERM_X2_AFTER  = "3254...";
export const PERM_X2_BITS_AFTER  = "0010001001010100"; // first 16 bits flipped

// ─── S-Box (5-bit) — ASCON's non-linear layer ─────────────────────────────────
// Takes a 5-bit column from x0..x4 and substitutes it

export const SBOX_INPUT_BITS  = [1, 0, 1, 1, 0]; // column bit from x0,x1,x2,x3,x4
export const SBOX_OUTPUT_BITS = [0, 1, 0, 0, 1]; // after S-box substitution
export const SBOX_INPUT_HEX   = "0x16";
export const SBOX_OUTPUT_HEX  = "0x09";

// All 5 words x0..x4 (first 5 bits shown for S-box demo)
export const SBOX_INPUT_WORDS = [
  { label: "x0", bit: 1, color: "blue" },
  { label: "x1", bit: 0, color: "purple" },
  { label: "x2", bit: 1, color: "teal" },
  { label: "x3", bit: 1, color: "rose" },
  { label: "x4", bit: 0, color: "amber" },
];

export const SBOX_OUTPUT_WORDS = [
  { label: "y0", bit: 0, color: "blue" },
  { label: "y1", bit: 1, color: "purple" },
  { label: "y2", bit: 0, color: "teal" },
  { label: "y3", bit: 0, color: "rose" },
  { label: "y4", bit: 1, color: "amber" },
];

// ─── Linear Diffusion ─────────────────────────────────────────────────────────
// Each word Xi is XORed with two rotations: Xi ^= ROTR(Xi, a) ^ ROTR(Xi, b)

export const DIFFUSION_WORDS = [
  {
    label: "x0",
    original: "10110100",
    rot1val: 19, rot1bits: "00101101",
    rot2val: 28, rot2bits: "11000010",
    result:       "01011011",
    color: "blue",
  },
  {
    label: "x1",
    original: "01001101",
    rot1val: 61, rot1bits: "10100110",
    rot2val: 39, rot2bits: "01100100",
    result:       "00001111",
    color: "purple",
  },
  {
    label: "x2",
    original: "11000010",
    rot1val:  1, rot1bits: "01100001",
    rot2val:  6, rot2bits: "00101100",
    result:       "10000111",
    color: "teal",
  },
  {
    label: "x3",
    original: "10011010",
    rot1val: 10, rot1bits: "10100110",
    rot2val: 17, rot2bits: "01001101",
    result:       "01110011",
    color: "rose",
  },
  {
    label: "x4",
    original: "01110001",
    rot1val:  7, rot1bits: "00111000",
    rot2val: 41, rot2bits: "10111000",
    result:       "11000001",
    color: "amber",
  },
];

// ─── Plaintext Block Processing (XOR with state) ──────────────────────────────

export const PLAINTEXT_BLOCK_BYTES  = ["48", "65", "6C", "6C", "6F", "20", "49", "6F"];
export const STATE_X0_BYTES         = ["E8", "F1", "23", "A7", "4C", "9B", "D2", "51"];
export const CIPHERTEXT_BLOCK_BYTES = ["A0", "94", "4F", "CB", "23", "BB", "9B", "3E"]; // P XOR X0

// ─── Finalization & Auth Tag ──────────────────────────────────────────────────

export const DEMO_AUTH_TAG = "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09";

// State after XOR-ing key back in, before final p^12  
export const FINAL_STATE_BEFORE_TAG: Record<string, string[]> = {
  x0: ["A8", "CF", "11", "55", "7B", "33", "16", "D0"],
  x1: ["9C", "2A", "FE", "64", "B8", "4D", "71", "23"],
  x2: ["5E", "97", "38", "C4", "2B", "60", "A1", "88"],
  x3: ["1A", "2B", "3C", "4D", "5E", "6F", "70", "81"], // → Tag first half
  x4: ["92", "A3", "B4", "C5", "D6", "E7", "F8", "09"], // → Tag second half
};

export const AUTH_TAG_BYTES = [
  "1A","2B","3C","4D","5E","6F","70","81",
  "92","A3","B4","C5","D6","E7","F8","09"
];

// ─── Final Ciphertext ─────────────────────────────────────────────────────────

export const DEMO_CIPHERTEXT = "A0 94 4F CB 23 BB 9B 3E";
