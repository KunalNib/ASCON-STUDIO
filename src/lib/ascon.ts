/**
 * ASCON Lightweight Cryptography Implementation in TypeScript
 * 
 * Based on NIST SP 800-232 / ASCON v1.2 specifications
 * Utilizing 5 64-bit words for the 320-bit state: (x0, x1, x2, x3, x4)
 * Supporting:
 * - ASCON-128 (Primary AEAD standard, 64-bit rate, a=12, b=6)
 * - ASCON-128a (High-throughput AEAD, 128-bit rate, a=12, b=8)
 * - ASCON-Hash (Standard 256-bit cryptographic sponge hash, 64-bit rate, a=12, b=12)
 */

export type AsconAlgorithm = "ASCON-128" | "ASCON-128a" | "ASCON-Hash";

export interface AlgorithmMetadata {
  id: AsconAlgorithm;
  name: string;
  category: "AEAD Cipher" | "Cryptographic Hash";
  rateBits: number;
  rateBytes: number;
  capacityBits: number;
  roundsA: number;
  roundsB: number;
  keyBits?: number;
  nonceBits?: number;
  tagBits: number;
  ivHex: string;
  badge: string;
  description: string;
  specs: {
    rate: string;
    capacity: string;
    rounds: string;
    security: string;
    output: string;
  };
  features: string[];
}

export const ALGORITHM_REGISTRY: Record<AsconAlgorithm, AlgorithmMetadata> = {
  "ASCON-128": {
    id: "ASCON-128",
    name: "ASCON-128",
    category: "AEAD Cipher",
    rateBits: 64,
    rateBytes: 8,
    capacityBits: 256,
    roundsA: 12,
    roundsB: 6,
    keyBits: 128,
    nonceBits: 128,
    tagBits: 128,
    ivHex: "80400C0600000000",
    badge: "Primary NIST Standard",
    description: "The primary standard for lightweight AEAD. Highly optimized for deeply constrained microcontroller and IoT environments.",
    specs: {
      rate: "64 bits (8 bytes)",
      capacity: "256 bits (32 bytes)",
      rounds: "a=12, b=6",
      security: "128-bit security level",
      output: "Ciphertext + 128-bit Tag",
    },
    features: [
      "128-bit key & 128-bit nonce protection",
      "Duplex sponge with 256-bit capacity margin",
      "p^12 initialization & finalization, p^6 intermediate mixing",
      "Autonomous bit-flipping & nonce tamper defense",
    ],
  },
  "ASCON-128a": {
    id: "ASCON-128a",
    name: "ASCON-128a",
    category: "AEAD Cipher",
    rateBits: 128,
    rateBytes: 16,
    capacityBits: 192,
    roundsA: 12,
    roundsB: 8,
    keyBits: 128,
    nonceBits: 128,
    tagBits: 128,
    ivHex: "80800C0800000000",
    badge: "High-Throughput",
    description: "An accelerated AEAD variant with 128-bit rate, absorbing twice as much data per permutation for 2x data throughput.",
    specs: {
      rate: "128 bits (16 bytes)",
      capacity: "192 bits (24 bytes)",
      rounds: "a=12, b=8",
      security: "128-bit security level",
      output: "Ciphertext + 128-bit Tag",
    },
    features: [
      "Absorbs two 64-bit words (x0, x1) per block",
      "Higher throughput for large data payloads & telemetry streams",
      "b=8 intermediate rounds to maintain robust security margin",
      "Same 320-bit permutation hardware/software core",
    ],
  },
  "ASCON-Hash": {
    id: "ASCON-Hash",
    name: "ASCON-Hash",
    category: "Cryptographic Hash",
    rateBits: 64,
    rateBytes: 8,
    capacityBits: 256,
    roundsA: 12,
    roundsB: 12,
    tagBits: 256,
    ivHex: "00400C0000000100",
    badge: "Companion Hash",
    description: "NIST-standardized cryptographic hash producing a fixed 256-bit collision-resistant digest using the core 320-bit permutation.",
    specs: {
      rate: "64 bits (8 bytes)",
      capacity: "256 bits (32 bytes)",
      rounds: "a=12, b=12",
      security: "128-bit collision & preimage security",
      output: "256-bit Digest (32 bytes)",
    },
    features: [
      "No secret key required (unkeyed cryptographic hashing)",
      "Standard 256-bit digest output via 4 sponge squeeze iterations",
      "Full 12-round permutation for both absorbing and squeezing",
      "Extreme avalanche effect & strict collision resistance",
    ],
  },
};

export class Ascon128 {
  state: bigint[]; // 5 elements of 64 bits

  constructor() {
    this.state = [0n, 0n, 0n, 0n, 0n];
  }

  // Linear constants for rounds
  static ROUND_CONSTANTS = [
    0x00000000000000f0n,
    0x00000000000000e1n,
    0x00000000000000d2n,
    0x00000000000000c3n,
    0x00000000000000b4n,
    0x00000000000000a5n,
    0x0000000000000096n,
    0x0000000000000087n,
    0x0000000000000078n,
    0x0000000000000069n,
    0x000000000000005an,
    0x000000000000004bn,
  ];

  /**
   * Addition of Constants (p_C)
   */
  addConstant(round: number) {
    this.state[2] ^= Ascon128.ROUND_CONSTANTS[round];
  }

  /**
   * Substitution Layer (p_S)
   * Applies the ASCON 5-bit S-box to the whole state using bitslicing
   */
  substitution() {
    let x0 = this.state[0];
    let x1 = this.state[1];
    let x2 = this.state[2];
    let x3 = this.state[3];
    let x4 = this.state[4];

    x0 ^= x4; x4 ^= x3; x2 ^= x1;
    
    // Bitsliced multiplication (using Bitwise NOT and AND)
    const MASK = 0xffffffffffffffffn;
    const t0 = (x0 ^ MASK) & x1;
    const t1 = (x1 ^ MASK) & x2;
    const t2 = (x2 ^ MASK) & x3;
    const t3 = (x3 ^ MASK) & x4;
    const t4 = (x4 ^ MASK) & x0;

    x0 ^= t1; x1 ^= t2; x2 ^= t3; x3 ^= t4; x4 ^= t0;
    
    x1 ^= x0; x0 ^= x4; x3 ^= x2; x2 ^= MASK; // x2 = ~x2 masked

    this.state[0] = x0;
    this.state[1] = x1;
    this.state[2] = x2;
    this.state[3] = x3;
    this.state[4] = x4;
  }

  // Helper for 64-bit right rotation
  private rotr(x: bigint, n: bigint): bigint {
    const MASK = 0xffffffffffffffffn;
    return ((x >> n) | (x << (64n - n))) & MASK;
  }

  /**
   * Linear Diffusion Layer (p_L)
   */
  diffusion() {
    this.state[0] ^= this.rotr(this.state[0], 19n) ^ this.rotr(this.state[0], 28n);
    this.state[1] ^= this.rotr(this.state[1], 61n) ^ this.rotr(this.state[1], 39n);
    this.state[2] ^= this.rotr(this.state[2], 1n) ^ this.rotr(this.state[2], 6n);
    this.state[3] ^= this.rotr(this.state[3], 10n) ^ this.rotr(this.state[3], 17n);
    this.state[4] ^= this.rotr(this.state[4], 7n) ^ this.rotr(this.state[4], 41n);
  }

  /**
   * The core permutation algorithm p^a or p^b
   */
  permutation(rounds: number = 12) {
    const startRound = 12 - rounds;
    for (let r = startRound; r < 12; r++) {
      this.addConstant(r);
      this.substitution();
      this.diffusion();
    }
  }

  // Clone current state
  clone(): Ascon128 {
    const copy = new Ascon128();
    copy.state = [...this.state];
    return copy;
  }

  // Set explicit 5-word state
  setState(words: bigint[]) {
    this.state = words.map(w => w & 0xffffffffffffffffn);
  }

  // Flip bit at wordIdx (0..4) and bitIdx (0..63)
  flipBit(wordIdx: number, bitIdx: number) {
    if (wordIdx >= 0 && wordIdx < 5 && bitIdx >= 0 && bitIdx < 64) {
      this.state[wordIdx] ^= (1n << BigInt(bitIdx));
    }
  }

  // Execute a specific sub-layer of a round
  performSubStep(layer: "constant" | "substitution" | "diffusion", round: number) {
    if (layer === "constant") {
      this.addConstant(round);
    } else if (layer === "substitution") {
      this.substitution();
    } else if (layer === "diffusion") {
      this.diffusion();
    }
  }

  // Compute total Hamming distance between two 320-bit states (0..320)
  static hammingDistance(s1: bigint[], s2: bigint[]): number {
    let diff = 0;
    for (let i = 0; i < 5; i++) {
      let xor = (s1[i] ^ s2[i]) & 0xffffffffffffffffn;
      while (xor > 0n) {
        if (xor & 1n) diff++;
        xor >>= 1n;
      }
    }
    return diff;
  }

  // Compute number of active S-boxes (5-bit vertical slices with at least one flipped bit)
  static getActiveSboxes(s1: bigint[], s2: bigint[]): number {
    let active = 0;
    const diffs = [
      (s1[0] ^ s2[0]) & 0xffffffffffffffffn,
      (s1[1] ^ s2[1]) & 0xffffffffffffffffn,
      (s1[2] ^ s2[2]) & 0xffffffffffffffffn,
      (s1[3] ^ s2[3]) & 0xffffffffffffffffn,
      (s1[4] ^ s2[4]) & 0xffffffffffffffffn,
    ];
    let combined = diffs[0] | diffs[1] | diffs[2] | diffs[3] | diffs[4];
    while (combined > 0n) {
      if (combined & 1n) active++;
      combined >>= 1n;
    }
    return active;
  }

  static hexToBytes(hex: string): number[] {
    const clean = hex.replace(/[^0-9a-fA-F]/g, "");
    const bytes: number[] = [];
    for (let i = 0; i < clean.length; i += 2) {
      bytes.push(parseInt(clean.substr(i, 2), 16));
    }
    return bytes;
  }

  static bytesToHex(bytes: number[]): string {
    return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ");
  }

  static pad(bytes: number[], rate: number = 8): number[] {
    const rem = bytes.length % rate;
    const padLen = rate - rem;
    const padded = [...bytes, 0x80];
    for (let i = 1; i < padLen; i++) {
      padded.push(0x00);
    }
    return padded;
  }

  static wordToHex(w: bigint): string {
    return (w & 0xffffffffffffffffn).toString(16).toUpperCase().padStart(16, "0");
  }

  static wordToBytes(w: bigint): string[] {
    const bytes: string[] = [];
    for (let j = 7; j >= 0; j--) {
      bytes.push(Number((w >> BigInt(j * 8)) & 0xffn).toString(16).toUpperCase().padStart(2, "0"));
    }
    return bytes;
  }

  static bytesToWord(bytes: number[] | Uint8Array, offset: number = 0): bigint {
    let w = 0n;
    for (let i = 0; i < 8; i++) {
      w = (w << 8n) | BigInt(bytes[offset + i] || 0);
    }
    return w;
  }

  /**
   * Real ASCON-128 Authenticated Encryption (AEAD)
   */
  static encryptAEAD(
    keyHex: string,
    nonceHex: string,
    adStr: string,
    ptStr: string
  ): {
    ciphertext: string;
    ciphertextBytes: string[];
    authenticationTag: string;
    tagBytes: string[];
    initialStateWords: string[];
    initializedStateWords: string[];
    finalStateWords: string[];
  } {
    const keyBytes = this.hexToBytes(keyHex.padEnd(32, "0").slice(0, 32));
    const nonceBytes = this.hexToBytes(nonceHex.padEnd(32, "0").slice(0, 32));
    const adBytes = Array.from(new TextEncoder().encode(adStr));
    const ptBytes = Array.from(new TextEncoder().encode(ptStr));

    const k0 = this.bytesToWord(keyBytes, 0);
    const k1 = this.bytesToWord(keyBytes, 8);
    const n0 = this.bytesToWord(nonceBytes, 0);
    const n1 = this.bytesToWord(nonceBytes, 8);

    const ascon = new Ascon128();
    const IV = 0x80400c0600000000n;
    ascon.state = [IV, k0, k1, n0, n1];
    const initialStateWords = ascon.state.map((w) => this.wordToHex(w));

    // Initialization (p^12)
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;
    const initializedStateWords = ascon.state.map((w) => this.wordToHex(w));

    // Associated Data Absorption
    if (adBytes.length > 0) {
      const paddedAd = this.pad(adBytes, 8);
      for (let i = 0; i < paddedAd.length; i += 8) {
        ascon.state[0] ^= this.bytesToWord(paddedAd, i);
        ascon.permutation(6);
      }
    }
    ascon.state[4] ^= 1n; // 1-bit domain separation

    // Plaintext Encryption
    const pLastLen = ptBytes.length % 8;
    const paddedPt = this.pad(ptBytes, 8);
    const ctBytes: number[] = [];
    const numBlocks = paddedPt.length / 8;

    for (let b = 0; b < numBlocks - 1; b++) {
      ascon.state[0] ^= this.bytesToWord(paddedPt, b * 8);
      for (let j = 7; j >= 0; j--) {
        ctBytes.push(Number((ascon.state[0] >> BigInt(j * 8)) & 0xffn));
      }
      ascon.permutation(6);
    }

    // Last block
    ascon.state[0] ^= this.bytesToWord(paddedPt, (numBlocks - 1) * 8);
    for (let j = 0; j < pLastLen; j++) {
      const shift = BigInt((7 - j) * 8);
      ctBytes.push(Number((ascon.state[0] >> shift) & 0xffn));
    }

    // Finalization (p^12)
    ascon.state[1] ^= k0;
    ascon.state[2] ^= k1;
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;
    const finalStateWords = ascon.state.map((w) => this.wordToHex(w));

    const tagBytesList: number[] = [];
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[3] >> BigInt(j * 8)) & 0xffn));
    }
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[4] >> BigInt(j * 8)) & 0xffn));
    }

    const ciphertext = this.bytesToHex(ctBytes);
    const authenticationTag = this.bytesToHex(tagBytesList);
    const ciphertextBytes = ctBytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));
    const tagBytes = tagBytesList.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));

    return {
      ciphertext,
      ciphertextBytes,
      authenticationTag,
      tagBytes,
      initialStateWords,
      initializedStateWords,
      finalStateWords,
    };
  }

  /**
   * Real ASCON-128 Authenticated Decryption
   */
  static decryptAEAD(
    keyHex: string,
    nonceHex: string,
    adStr: string,
    ctHex: string,
    expectedTagHex: string
  ): {
    recoveredPlaintext: string;
    recoveredBytes: string[];
    candidateTag: string;
    candidateTagBytes: string[];
    isValid: boolean;
    rateWordX0AfterInit: string[];
  } {
    const keyBytes = this.hexToBytes(keyHex.padEnd(32, "0").slice(0, 32));
    const nonceBytes = this.hexToBytes(nonceHex.padEnd(32, "0").slice(0, 32));
    const ctBytes = this.hexToBytes(ctHex);
    const adBytes = Array.from(new TextEncoder().encode(adStr));

    const k0 = this.bytesToWord(keyBytes, 0);
    const k1 = this.bytesToWord(keyBytes, 8);
    const n0 = this.bytesToWord(nonceBytes, 0);
    const n1 = this.bytesToWord(nonceBytes, 8);

    const ascon = new Ascon128();
    const IV = 0x80400c0600000000n;
    ascon.state = [IV, k0, k1, n0, n1];
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;

    // AD
    if (adBytes.length > 0) {
      const paddedAd = this.pad(adBytes, 8);
      for (let i = 0; i < paddedAd.length; i += 8) {
        ascon.state[0] ^= this.bytesToWord(paddedAd, i);
        ascon.permutation(6);
      }
    }
    ascon.state[4] ^= 1n;

    const rateWordX0AfterInit = this.wordToBytes(ascon.state[0]);

    // Plaintext recovery
    const cLastLen = ctBytes.length % 8;
    const ptBytes: number[] = [];
    const numBlocks = Math.ceil(ctBytes.length / 8) || 1;

    for (let b = 0; b < numBlocks - 1; b++) {
      const ci = this.bytesToWord(ctBytes, b * 8);
      const ptBlock = ascon.state[0] ^ ci;
      for (let j = 7; j >= 0; j--) {
        ptBytes.push(Number((ptBlock >> BigInt(j * 8)) & 0xffn));
      }
      ascon.state[0] = ci;
      ascon.permutation(6);
    }

    // Last block
    const lastOffset = (numBlocks - 1) * 8;
    const lastCi = this.bytesToWord(ctBytes, lastOffset);
    const ptBlockLast = ascon.state[0] ^ lastCi;
    for (let j = 0; j < cLastLen; j++) {
      const shift = BigInt((7 - j) * 8);
      ptBytes.push(Number((ptBlockLast >> shift) & 0xffn));
    }

    // State update for finalization
    const cLastWord = cLastLen % 8;
    const cPadding1 = 0x80n << BigInt((8 - cLastWord - 1) * 8);
    const cMask = cLastWord === 0 ? 0xffffffffffffffffn : (0xffffffffffffffffn >> BigInt(cLastWord * 8));
    ascon.state[0] = lastCi ^ (ascon.state[0] & cMask) ^ cPadding1;

    // Finalization (p^12)
    ascon.state[1] ^= k0;
    ascon.state[2] ^= k1;
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;

    const tagBytesList: number[] = [];
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[3] >> BigInt(j * 8)) & 0xffn));
    }
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[4] >> BigInt(j * 8)) & 0xffn));
    }

    const candidateTag = this.bytesToHex(tagBytesList);
    const candidateTagBytes = tagBytesList.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));

    const receivedBytes = this.hexToBytes(expectedTagHex);
    let diff = 0;
    for (let i = 0; i < 16; i++) {
      diff |= tagBytesList[i] ^ (receivedBytes[i] ?? 0);
    }
    const isValid = diff === 0 && receivedBytes.length === 16;

    const recoveredPlaintext = new TextDecoder().decode(new Uint8Array(ptBytes));
    const recoveredBytes = ptBytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));

    return {
      recoveredPlaintext,
      recoveredBytes,
      candidateTag,
      candidateTagBytes,
      isValid,
      rateWordX0AfterInit,
    };
  }

  static encrypt(plaintext: string): string {
    const res = this.encryptAEAD(
      "000102030405060708090A0B0C0D0E0F",
      "000102030405060708090A0B0C0D0E0F",
      "ESP32-STATION-1",
      plaintext
    );
    return res.ciphertext;
  }
}

/**
 * ASCON-128a Implementation
 * High-Throughput AEAD with 128-bit rate (x0, x1), 192-bit capacity (x2, x3, x4), rounds a=12, b=8.
 */
export class Ascon128a {
  /**
   * Real ASCON-128a Authenticated Encryption
   */
  static encryptAEAD(
    keyHex: string,
    nonceHex: string,
    adStr: string,
    ptStr: string
  ): {
    ciphertext: string;
    ciphertextBytes: string[];
    authenticationTag: string;
    tagBytes: string[];
    initialStateWords: string[];
    initializedStateWords: string[];
    finalStateWords: string[];
  } {
    const keyBytes = Ascon128.hexToBytes(keyHex.padEnd(32, "0").slice(0, 32));
    const nonceBytes = Ascon128.hexToBytes(nonceHex.padEnd(32, "0").slice(0, 32));
    const adBytes = Array.from(new TextEncoder().encode(adStr));
    const ptBytes = Array.from(new TextEncoder().encode(ptStr));

    const k0 = Ascon128.bytesToWord(keyBytes, 0);
    const k1 = Ascon128.bytesToWord(keyBytes, 8);
    const n0 = Ascon128.bytesToWord(nonceBytes, 0);
    const n1 = Ascon128.bytesToWord(nonceBytes, 8);

    const ascon = new Ascon128();
    const IV = 0x80800c0800000000n;
    ascon.state = [IV, k0, k1, n0, n1];
    const initialStateWords = ascon.state.map((w) => Ascon128.wordToHex(w));

    // Initialization (p^12)
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;
    const initializedStateWords = ascon.state.map((w) => Ascon128.wordToHex(w));

    // Associated Data Absorption (rate = 16 bytes)
    const rate = 16;
    if (adBytes.length > 0) {
      const paddedAd = Ascon128.pad(adBytes, rate);
      for (let i = 0; i < paddedAd.length; i += rate) {
        ascon.state[0] ^= Ascon128.bytesToWord(paddedAd, i);
        ascon.state[1] ^= Ascon128.bytesToWord(paddedAd, i + 8);
        ascon.permutation(8); // b = 8 for Ascon-128a
      }
    }
    ascon.state[4] ^= 1n; // 1-bit domain separation

    // Plaintext Encryption (rate = 16 bytes)
    const pLastLen = ptBytes.length % rate;
    const paddedPt = Ascon128.pad(ptBytes, rate);
    const ctBytes: number[] = [];
    const numBlocks = paddedPt.length / rate;

    for (let b = 0; b < numBlocks - 1; b++) {
      ascon.state[0] ^= Ascon128.bytesToWord(paddedPt, b * rate);
      ascon.state[1] ^= Ascon128.bytesToWord(paddedPt, b * rate + 8);
      for (let j = 7; j >= 0; j--) {
        ctBytes.push(Number((ascon.state[0] >> BigInt(j * 8)) & 0xffn));
      }
      for (let j = 7; j >= 0; j--) {
        ctBytes.push(Number((ascon.state[1] >> BigInt(j * 8)) & 0xffn));
      }
      ascon.permutation(8);
    }

    // Last block
    ascon.state[0] ^= Ascon128.bytesToWord(paddedPt, (numBlocks - 1) * rate);
    ascon.state[1] ^= Ascon128.bytesToWord(paddedPt, (numBlocks - 1) * rate + 8);

    const lastBlockWords: number[] = [];
    for (let j = 7; j >= 0; j--) {
      lastBlockWords.push(Number((ascon.state[0] >> BigInt(j * 8)) & 0xffn));
    }
    for (let j = 7; j >= 0; j--) {
      lastBlockWords.push(Number((ascon.state[1] >> BigInt(j * 8)) & 0xffn));
    }
    for (let j = 0; j < pLastLen; j++) {
      ctBytes.push(lastBlockWords[j]);
    }

    // Finalization (p^12)
    ascon.state[2] ^= k0;
    ascon.state[3] ^= k1;
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;
    const finalStateWords = ascon.state.map((w) => Ascon128.wordToHex(w));

    const tagBytesList: number[] = [];
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[3] >> BigInt(j * 8)) & 0xffn));
    }
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[4] >> BigInt(j * 8)) & 0xffn));
    }

    const ciphertext = Ascon128.bytesToHex(ctBytes);
    const authenticationTag = Ascon128.bytesToHex(tagBytesList);
    const ciphertextBytes = ctBytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));
    const tagBytes = tagBytesList.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));

    return {
      ciphertext,
      ciphertextBytes,
      authenticationTag,
      tagBytes,
      initialStateWords,
      initializedStateWords,
      finalStateWords,
    };
  }

  /**
   * Real ASCON-128a Authenticated Decryption
   */
  static decryptAEAD(
    keyHex: string,
    nonceHex: string,
    adStr: string,
    ctHex: string,
    expectedTagHex: string
  ): {
    recoveredPlaintext: string;
    recoveredBytes: string[];
    candidateTag: string;
    candidateTagBytes: string[];
    isValid: boolean;
    rateWordsAfterInit: string[];
  } {
    const keyBytes = Ascon128.hexToBytes(keyHex.padEnd(32, "0").slice(0, 32));
    const nonceBytes = Ascon128.hexToBytes(nonceHex.padEnd(32, "0").slice(0, 32));
    const ctBytes = Ascon128.hexToBytes(ctHex);
    const adBytes = Array.from(new TextEncoder().encode(adStr));

    const k0 = Ascon128.bytesToWord(keyBytes, 0);
    const k1 = Ascon128.bytesToWord(keyBytes, 8);
    const n0 = Ascon128.bytesToWord(nonceBytes, 0);
    const n1 = Ascon128.bytesToWord(nonceBytes, 8);

    const ascon = new Ascon128();
    const IV = 0x80800c0800000000n;
    ascon.state = [IV, k0, k1, n0, n1];
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;

    // AD
    const rate = 16;
    if (adBytes.length > 0) {
      const paddedAd = Ascon128.pad(adBytes, rate);
      for (let i = 0; i < paddedAd.length; i += rate) {
        ascon.state[0] ^= Ascon128.bytesToWord(paddedAd, i);
        ascon.state[1] ^= Ascon128.bytesToWord(paddedAd, i + 8);
        ascon.permutation(8);
      }
    }
    ascon.state[4] ^= 1n;

    const rateWordsAfterInit = [
      ...Ascon128.wordToBytes(ascon.state[0]),
      ...Ascon128.wordToBytes(ascon.state[1]),
    ];

    // Ciphertext processing
    const cLastLen = ctBytes.length % rate;
    const ptBytes: number[] = [];
    const numBlocks = Math.ceil(ctBytes.length / rate) || 1;

    for (let b = 0; b < numBlocks - 1; b++) {
      const ci0 = Ascon128.bytesToWord(ctBytes, b * rate);
      const ci1 = Ascon128.bytesToWord(ctBytes, b * rate + 8);
      const p0 = ascon.state[0] ^ ci0;
      const p1 = ascon.state[1] ^ ci1;
      for (let j = 7; j >= 0; j--) ptBytes.push(Number((p0 >> BigInt(j * 8)) & 0xffn));
      for (let j = 7; j >= 0; j--) ptBytes.push(Number((p1 >> BigInt(j * 8)) & 0xffn));
      ascon.state[0] = ci0;
      ascon.state[1] = ci1;
      ascon.permutation(8);
    }

    // Last block
    const lastOffset = (numBlocks - 1) * rate;
    const ci0 = Ascon128.bytesToWord(ctBytes, lastOffset);
    const ci1 = Ascon128.bytesToWord(ctBytes, lastOffset + 8);
    const p0 = ascon.state[0] ^ ci0;
    const p1 = ascon.state[1] ^ ci1;

    const lastRecovered: number[] = [];
    for (let j = 7; j >= 0; j--) lastRecovered.push(Number((p0 >> BigInt(j * 8)) & 0xffn));
    for (let j = 7; j >= 0; j--) lastRecovered.push(Number((p1 >> BigInt(j * 8)) & 0xffn));
    for (let j = 0; j < cLastLen; j++) ptBytes.push(lastRecovered[j]);

    // Restore state for finalization
    if (cLastLen < 8) {
      const cLastWord = cLastLen % 8;
      const cPadding1 = 0x80n << BigInt((8 - cLastWord - 1) * 8);
      const cMask = cLastWord === 0 ? 0xffffffffffffffffn : (0xffffffffffffffffn >> BigInt(cLastWord * 8));
      ascon.state[0] = ci0 ^ (ascon.state[0] & cMask) ^ cPadding1;
    } else {
      const cLastWord = cLastLen % 8;
      const cPadding1 = 0x80n << BigInt((8 - cLastWord - 1) * 8);
      const cMask = cLastWord === 0 ? 0xffffffffffffffffn : (0xffffffffffffffffn >> BigInt(cLastWord * 8));
      ascon.state[0] = ci0;
      ascon.state[1] = ci1 ^ (ascon.state[1] & cMask) ^ cPadding1;
    }

    // Finalization (p^12)
    ascon.state[2] ^= k0;
    ascon.state[3] ^= k1;
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;

    const tagBytesList: number[] = [];
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[3] >> BigInt(j * 8)) & 0xffn));
    }
    for (let j = 7; j >= 0; j--) {
      tagBytesList.push(Number((ascon.state[4] >> BigInt(j * 8)) & 0xffn));
    }

    const candidateTag = Ascon128.bytesToHex(tagBytesList);
    const candidateTagBytes = tagBytesList.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));

    const receivedBytes = Ascon128.hexToBytes(expectedTagHex);
    let diff = 0;
    for (let i = 0; i < 16; i++) {
      diff |= tagBytesList[i] ^ (receivedBytes[i] ?? 0);
    }
    const isValid = diff === 0 && receivedBytes.length === 16;

    const recoveredPlaintext = new TextDecoder().decode(new Uint8Array(ptBytes));
    const recoveredBytes = ptBytes.map((b) => b.toString(16).toUpperCase().padStart(2, "0"));

    return {
      recoveredPlaintext,
      recoveredBytes,
      candidateTag,
      candidateTagBytes,
      isValid,
      rateWordsAfterInit,
    };
  }
}

/**
 * ASCON-Hash Implementation
 * Standard 256-bit cryptographic hash function (SP 800-232 / ASCON v1.2)
 * Rate: 64 bits (8 bytes), Capacity: 256 bits (32 bytes), Rounds: a=12, b=12
 */
export class AsconHash {
  static hash(
    message: string | Uint8Array,
    hashLength: number = 32
  ): {
    digest: string;
    digestBytes: string[];
    initialStateWords: string[];
    initializedStateWords: string[];
    finalStateWords: string[];
    absorbingBlocks: {
      blockIndex: number;
      blockHex: string;
      chunkText: string;
      stateWords: string[];
    }[];
    squeezedBlocks: {
      squeezeIndex: number;
      wordHex: string;
      bytesHex: string;
      stateWords: string[];
    }[];
  } {
    const messageBytes =
      typeof message === "string"
        ? new TextEncoder().encode(message)
        : message;

    const ascon = new Ascon128();
    const IV = 0x00400c0000000100n;
    ascon.state = [IV, 0n, 0n, 0n, 0n];
    const initialStateWords = ascon.state.map((w) => Ascon128.wordToHex(w));

    // Initialization (p^12)
    ascon.permutation(12);
    const initializedStateWords = ascon.state.map((w) => Ascon128.wordToHex(w));

    // Padding: 0x80 followed by zeros to multiple of 8 bytes
    const rate = 8;
    const padded = Ascon128.pad(Array.from(messageBytes), rate);
    const numBlocks = padded.length / rate;
    const absorbingBlocks: {
      blockIndex: number;
      blockHex: string;
      chunkText: string;
      stateWords: string[];
    }[] = [];

    // Absorbing (first s - 1 blocks)
    for (let b = 0; b < numBlocks - 1; b++) {
      const blockWord = Ascon128.bytesToWord(padded, b * rate);
      ascon.state[0] ^= blockWord;
      const blockBytes = padded.slice(b * rate, (b + 1) * rate);
      const chunkText = new TextDecoder().decode(new Uint8Array(blockBytes)).replace(/[\x00-\x1F\x7F-\x9F]/g, ".");
      ascon.permutation(12);

      absorbingBlocks.push({
        blockIndex: b + 1,
        blockHex: Ascon128.bytesToHex(blockBytes),
        chunkText,
        stateWords: ascon.state.map((w) => Ascon128.wordToHex(w)),
      });
    }

    // Last block
    const lastBlockWord = Ascon128.bytesToWord(padded, (numBlocks - 1) * rate);
    ascon.state[0] ^= lastBlockWord;
    const lastBlockBytes = padded.slice((numBlocks - 1) * rate);
    const lastChunkText = new TextDecoder().decode(new Uint8Array(lastBlockBytes)).replace(/[\x00-\x1F\x7F-\x9F]/g, ".");

    absorbingBlocks.push({
      blockIndex: numBlocks,
      blockHex: Ascon128.bytesToHex(lastBlockBytes),
      chunkText: lastChunkText,
      stateWords: ascon.state.map((w) => Ascon128.wordToHex(w)),
    });

    // Finalization / Squeezing
    ascon.permutation(12);
    const finalStateWords = ascon.state.map((w) => Ascon128.wordToHex(w));

    const squeezedBlocks: {
      squeezeIndex: number;
      wordHex: string;
      bytesHex: string;
      stateWords: string[];
    }[] = [];

    const outBytes: number[] = [];
    const numSqueezes = Math.ceil(hashLength / 8);

    for (let i = 0; i < numSqueezes; i++) {
      const squeezeBytes: number[] = [];
      for (let j = 7; j >= 0; j--) {
        squeezeBytes.push(Number((ascon.state[0] >> BigInt(j * 8)) & 0xffn));
      }
      outBytes.push(...squeezeBytes);

      squeezedBlocks.push({
        squeezeIndex: i + 1,
        wordHex: Ascon128.wordToHex(ascon.state[0]),
        bytesHex: Ascon128.bytesToHex(squeezeBytes),
        stateWords: ascon.state.map((w) => Ascon128.wordToHex(w)),
      });

      if (i < numSqueezes - 1) {
        ascon.permutation(12);
      }
    }

    const digestBytes = outBytes.slice(0, hashLength).map((b) => b.toString(16).toUpperCase().padStart(2, "0"));
    const digest = digestBytes.join(" ");

    return {
      digest,
      digestBytes,
      initialStateWords,
      initializedStateWords,
      finalStateWords,
      absorbingBlocks,
      squeezedBlocks,
    };
  }
}

/**
 * Unified Ascon Cryptographic Suite API
 */
export class AsconSuite {
  static getMetadata(algorithm: AsconAlgorithm): AlgorithmMetadata {
    return ALGORITHM_REGISTRY[algorithm] || ALGORITHM_REGISTRY["ASCON-128"];
  }

  static encrypt(
    algorithm: AsconAlgorithm,
    keyHex: string,
    nonceHex: string,
    adStr: string,
    ptStr: string
  ) {
    if (algorithm === "ASCON-128a") {
      return Ascon128a.encryptAEAD(keyHex, nonceHex, adStr, ptStr);
    }
    // Default to ASCON-128
    return Ascon128.encryptAEAD(keyHex, nonceHex, adStr, ptStr);
  }

  static decrypt(
    algorithm: AsconAlgorithm,
    keyHex: string,
    nonceHex: string,
    adStr: string,
    ctHex: string,
    expectedTagHex: string
  ) {
    if (algorithm === "ASCON-128a") {
      return Ascon128a.decryptAEAD(keyHex, nonceHex, adStr, ctHex, expectedTagHex);
    }
    return Ascon128.decryptAEAD(keyHex, nonceHex, adStr, ctHex, expectedTagHex);
  }

  static hash(message: string | Uint8Array, hashLength: number = 32) {
    return AsconHash.hash(message, hashLength);
  }
}
