/**
 * ASCON Lightweight Cryptography Implementation in TypeScript
 * 
 * Based on NIST SP 800-232 / ASCON v1.2 specifications
 * Utilizing 5 64-bit words for the 320-bit state: (x0, x1, x2, x3, x4)
 */

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
    // In JS BigInt, bitwise NOT on positive numbers extends infinitely with 1s.
    // We must mask to 64-bit using 0xFFFFFFFFFFFFFFFFn
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
    // Combined bitwise OR across all 5 words: if bit i is 1 in any word, S-box i is active
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

  static pad(bytes: number[]): number[] {
    const padded = [...bytes, 0x80];
    while (padded.length % 8 !== 0) {
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

    const k0 =
      (BigInt(keyBytes[0] || 0) << 56n) |
      (BigInt(keyBytes[1] || 0) << 48n) |
      (BigInt(keyBytes[2] || 0) << 40n) |
      (BigInt(keyBytes[3] || 0) << 32n) |
      (BigInt(keyBytes[4] || 0) << 24n) |
      (BigInt(keyBytes[5] || 0) << 16n) |
      (BigInt(keyBytes[6] || 0) << 8n) |
      BigInt(keyBytes[7] || 0);

    const k1 =
      (BigInt(keyBytes[8] || 0) << 56n) |
      (BigInt(keyBytes[9] || 0) << 48n) |
      (BigInt(keyBytes[10] || 0) << 40n) |
      (BigInt(keyBytes[11] || 0) << 32n) |
      (BigInt(keyBytes[12] || 0) << 24n) |
      (BigInt(keyBytes[13] || 0) << 16n) |
      (BigInt(keyBytes[14] || 0) << 8n) |
      BigInt(keyBytes[15] || 0);

    const n0 =
      (BigInt(nonceBytes[0] || 0) << 56n) |
      (BigInt(nonceBytes[1] || 0) << 48n) |
      (BigInt(nonceBytes[2] || 0) << 40n) |
      (BigInt(nonceBytes[3] || 0) << 32n) |
      (BigInt(nonceBytes[4] || 0) << 24n) |
      (BigInt(nonceBytes[5] || 0) << 16n) |
      (BigInt(nonceBytes[6] || 0) << 8n) |
      BigInt(nonceBytes[7] || 0);

    const n1 =
      (BigInt(nonceBytes[8] || 0) << 56n) |
      (BigInt(nonceBytes[9] || 0) << 48n) |
      (BigInt(nonceBytes[10] || 0) << 40n) |
      (BigInt(nonceBytes[11] || 0) << 32n) |
      (BigInt(nonceBytes[12] || 0) << 24n) |
      (BigInt(nonceBytes[13] || 0) << 16n) |
      (BigInt(nonceBytes[14] || 0) << 8n) |
      BigInt(nonceBytes[15] || 0);

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
      const paddedAd = this.pad(adBytes);
      for (let i = 0; i < paddedAd.length; i += 8) {
        let block = 0n;
        for (let j = 0; j < 8; j++) {
          block = (block << 8n) | BigInt(paddedAd[i + j]);
        }
        ascon.state[0] ^= block;
        ascon.permutation(6);
      }
    }
    ascon.state[4] ^= 1n; // 1-bit domain separation

    // Plaintext Encryption
    const ctBytes: number[] = [];
    if (ptBytes.length > 0) {
      const fullBlocks = Math.floor(ptBytes.length / 8);
      for (let i = 0; i < fullBlocks; i++) {
        let block = 0n;
        for (let j = 0; j < 8; j++) {
          block = (block << 8n) | BigInt(ptBytes[i * 8 + j]);
        }
        ascon.state[0] ^= block;
        const ctBlock = ascon.state[0];
        for (let j = 7; j >= 0; j--) {
          ctBytes.push(Number((ctBlock >> BigInt(j * 8)) & 0xffn));
        }
        if (i < fullBlocks - 1 || ptBytes.length % 8 !== 0) {
          ascon.permutation(6);
        }
      }
      const rem = ptBytes.length % 8;
      if (rem > 0 || fullBlocks === 0) {
        const lastBytes = ptBytes.slice(fullBlocks * 8);
        const paddedLast = this.pad(lastBytes);
        let block = 0n;
        for (let j = 0; j < 8; j++) {
          block = (block << 8n) | BigInt(paddedLast[j]);
        }
        ascon.state[0] ^= block;
        for (let j = 0; j < rem; j++) {
          const shift = BigInt((7 - j) * 8);
          ctBytes.push(Number((ascon.state[0] >> shift) & 0xffn));
        }
      }
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

    const k0 =
      (BigInt(keyBytes[0] || 0) << 56n) |
      (BigInt(keyBytes[1] || 0) << 48n) |
      (BigInt(keyBytes[2] || 0) << 40n) |
      (BigInt(keyBytes[3] || 0) << 32n) |
      (BigInt(keyBytes[4] || 0) << 24n) |
      (BigInt(keyBytes[5] || 0) << 16n) |
      (BigInt(keyBytes[6] || 0) << 8n) |
      BigInt(keyBytes[7] || 0);

    const k1 =
      (BigInt(keyBytes[8] || 0) << 56n) |
      (BigInt(keyBytes[9] || 0) << 48n) |
      (BigInt(keyBytes[10] || 0) << 40n) |
      (BigInt(keyBytes[11] || 0) << 32n) |
      (BigInt(keyBytes[12] || 0) << 24n) |
      (BigInt(keyBytes[13] || 0) << 16n) |
      (BigInt(keyBytes[14] || 0) << 8n) |
      BigInt(keyBytes[15] || 0);

    const n0 =
      (BigInt(nonceBytes[0] || 0) << 56n) |
      (BigInt(nonceBytes[1] || 0) << 48n) |
      (BigInt(nonceBytes[2] || 0) << 40n) |
      (BigInt(nonceBytes[3] || 0) << 32n) |
      (BigInt(nonceBytes[4] || 0) << 24n) |
      (BigInt(nonceBytes[5] || 0) << 16n) |
      (BigInt(nonceBytes[6] || 0) << 8n) |
      BigInt(nonceBytes[7] || 0);

    const n1 =
      (BigInt(nonceBytes[8] || 0) << 56n) |
      (BigInt(nonceBytes[9] || 0) << 48n) |
      (BigInt(nonceBytes[10] || 0) << 40n) |
      (BigInt(nonceBytes[11] || 0) << 32n) |
      (BigInt(nonceBytes[12] || 0) << 24n) |
      (BigInt(nonceBytes[13] || 0) << 16n) |
      (BigInt(nonceBytes[14] || 0) << 8n) |
      BigInt(nonceBytes[15] || 0);

    const ascon = new Ascon128();
    const IV = 0x80400c0600000000n;
    ascon.state = [IV, k0, k1, n0, n1];
    ascon.permutation(12);
    ascon.state[3] ^= k0;
    ascon.state[4] ^= k1;

    // AD
    if (adBytes.length > 0) {
      const paddedAd = this.pad(adBytes);
      for (let i = 0; i < paddedAd.length; i += 8) {
        let block = 0n;
        for (let j = 0; j < 8; j++) {
          block = (block << 8n) | BigInt(paddedAd[i + j]);
        }
        ascon.state[0] ^= block;
        ascon.permutation(6);
      }
    }
    ascon.state[4] ^= 1n;

    const rateWordX0AfterInit = this.wordToBytes(ascon.state[0]);

    // Plaintext recovery
    const ptBytes: number[] = [];
    const fullBlocks = Math.floor(ctBytes.length / 8);
    for (let i = 0; i < fullBlocks; i++) {
      let ctBlock = 0n;
      for (let j = 0; j < 8; j++) {
        ctBlock = (ctBlock << 8n) | BigInt(ctBytes[i * 8 + j]);
      }
      const ptBlock = ascon.state[0] ^ ctBlock;
      for (let j = 7; j >= 0; j--) {
        ptBytes.push(Number((ptBlock >> BigInt(j * 8)) & 0xffn));
      }
      ascon.state[0] = ctBlock;
      if (i < fullBlocks - 1 || ctBytes.length % 8 !== 0) {
        ascon.permutation(6);
      }
    }

    const rem = ctBytes.length % 8;
    if (rem > 0 || fullBlocks === 0) {
      for (let j = 0; j < rem; j++) {
        const shift = BigInt((7 - j) * 8);
        const ctByte = ctBytes[fullBlocks * 8 + j];
        const stateByte = Number((ascon.state[0] >> shift) & 0xffn);
        ptBytes.push(stateByte ^ ctByte);
      }
      const paddedPt = this.pad(ptBytes.slice(fullBlocks * 8));
      let block = 0n;
      for (let j = 0; j < 8; j++) {
        block = (block << 8n) | BigInt(paddedPt[j]);
      }
      ascon.state[0] ^= block;
    }

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

  /**
   * Fast encrypt fallback
   */
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
