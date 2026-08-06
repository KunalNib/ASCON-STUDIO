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
