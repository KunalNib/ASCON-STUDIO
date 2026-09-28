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

  // Initialization
  initialize(key: bigint, nonce: bigint) {
    // IV for Ascon-128 is 160 bits (e.g. k=128, r=64, a=12, b=6)
    // x0 = IV, x1 = K_high, x2 = K_low, x3 = N_high, x4 = N_low
    // p^12
    // x3 ^= K_high, x4 ^= K_low
  }

  /**
   * Encrypt mock method
   */
  static encrypt(plaintext: string): string {
    // Basic mock hex output for the UI using TextEncoder to avoid Node.js Buffer on client
    const encoded = new TextEncoder().encode(plaintext);
    const hex = Array.from(encoded).map(b => b.toString(16).padStart(2, '0')).join('');
    return hex + "0000000000000000";
  }
}
