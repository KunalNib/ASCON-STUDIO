"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, Sparkles, Shield, Info, Lightbulb } from "lucide-react";

export interface TermDefinition {
  simpleTerm: string;
  category: "Architecture" | "Math" | "Security" | "Parameter" | "Mode";
  definition: string;
  analogy: string;
  securityImpact: string;
}

export const CRYPTO_DICTIONARY: Record<string, TermDefinition> = {
  "AEAD": {
    simpleTerm: "Authenticated Encryption",
    category: "Mode",
    definition: "A two-in-one cryptographic scheme that locks your data so nobody can read it (confidentiality) AND creates a tamper seal to detect any unauthorized modifications (authenticity).",
    analogy: "Like sending a private letter inside a steel lockbox sealed with a tamper-evident wax seal.",
    securityImpact: "Prevents attackers from silently tampering with encrypted messages in transit.",
  },
  "Sponge Construction": {
    simpleTerm: "Sponge Architecture (Absorb-Mix-Squeeze)",
    category: "Architecture",
    definition: "A cipher design pattern with a fixed internal memory state that first 'absorbs' (soaks up) input data block-by-block, mixes it with permutations, and finally 'squeezes' out outputs like ciphertext or authentication tags.",
    analogy: "Like a kitchen sponge: soak up soapy water (data), squeeze out clean bubbles (ciphertext), and extract the remaining soap scent (tag).",
    securityImpact: "Enables both encryption and hashing using one compact, lightweight cryptographic core.",
  },
  "Sponge": {
    simpleTerm: "Sponge Architecture",
    category: "Architecture",
    definition: "A cipher structure that absorbs input data into memory, mixes it thoroughly, and squeezes out cryptographic results.",
    analogy: "A kitchen sponge soaking up water and squeezing out cleaned liquid.",
    securityImpact: "Eliminates separate encryption and hashing engines, saving chip area.",
  },
  "Duplex": {
    simpleTerm: "Two-Way Continuous Stream",
    category: "Mode",
    definition: "A duplex mode processes inputs and outputs simultaneously in a streaming fashion, absorbing plaintext and feeding ciphertext back into the state after each step.",
    analogy: "A conversation where each word you say immediately changes the flow of the next topic.",
    securityImpact: "Allows real-time streaming encryption for resource-limited IoT sensors.",
  },
  "Permutation": {
    simpleTerm: "Bit Shuffling & Mixing Rounds",
    category: "Math",
    definition: "A fixed mathematical transformation that shuffles, substitutes, and spreads all 320 bits of the cipher state so that any input relationship is completely scrambled.",
    analogy: "A high-speed blender that purees bits together so nobody can tell the original ingredients apart.",
    securityImpact: "Ensures deep mathematical complexity against linear and differential cryptanalysis.",
  },
  "p12": {
    simpleTerm: "12-Round Master Permutation",
    category: "Math",
    definition: "The full 12-round permutation used during Initialization and Finalization to guarantee maximum bit confusion and diffusion.",
    analogy: "Spinning a 12-tumbler combination lock 12 times to make it impossible to pick.",
    securityImpact: "Provides a huge security margin against state-recovery attacks.",
  },
  "p6": {
    simpleTerm: "6-Round Intermediate Permutation",
    category: "Math",
    definition: "A faster 6-round permutation run between plaintext or associated data blocks to maintain throughput without compromising security.",
    analogy: "A quick intermediate stir of ingredients between adding each spoonful of flour.",
    securityImpact: "Balances lightweight performance on microcontrollers with cryptographic integrity.",
  },
  "Rate": {
    simpleTerm: "Data Doorway (64 bits)",
    category: "Architecture",
    definition: "The public-facing portion of the cipher state (word x0, 64 bits) where new data enters and ciphertext exits.",
    analogy: "The front teller window of a bank where money is deposited and withdrawn.",
    securityImpact: "Kept small (64 bits) so attackers can never inspect the hidden interior state.",
  },
  "Capacity": {
    simpleTerm: "Secret Inner Vault (256 bits)",
    category: "Architecture",
    definition: "The remaining 256 bits of the state (words x1 to x4) that are NEVER directly exposed to attackers or visible on the network.",
    analogy: "The locked underground vault behind the teller counter where the bank's master gold is guarded.",
    securityImpact: "Guarantees a 128-bit cryptographic security level against quantum and classical brute-force.",
  },
  "Associated Data": {
    simpleTerm: "Cleartext Header Metadata",
    category: "Parameter",
    definition: "Public routing information (e.g. packet source IP, timestamp, device ID) that remains unencrypted so routers can read it, but is cryptographically bound into the authentication tag so it cannot be tampered with.",
    analogy: "The return address and recipient label on a parcel envelope — visible to the postman, but sealed with tamper-proof tape.",
    securityImpact: "Prevents man-in-the-middle attackers from redirecting or replaying packets.",
  },
  "AD": {
    simpleTerm: "Header Metadata",
    category: "Parameter",
    definition: "Public data that is authenticated (tamper-proofed) but not kept secret.",
    analogy: "The clear postal label on a package.",
    securityImpact: "Protects network headers from injection or forgery.",
  },
  "Nonce": {
    simpleTerm: "One-Time Message ID (Number Used Once)",
    category: "Parameter",
    definition: "A 128-bit number that MUST be unique for every single message encrypted under the same key. It ensures identical sensor readings produce totally different ciphertexts.",
    analogy: "A unique sequential invoice number. Even if you order the exact same item twice, each receipt has its own distinct number.",
    securityImpact: "CRITICAL: Reusing a Nonce with the same key destroys AEAD security and can leak plaintext.",
  },
  "Key": {
    simpleTerm: "Secret Master Key (128 bits)",
    category: "Parameter",
    definition: "The secret 128-bit string shared only between the sender and authorized receiver. It controls the entire cipher permutation trajectory.",
    analogy: "The private physical key that only you and your trusted recipient hold.",
    securityImpact: "Must be kept strictly secret; exposure breaks confidentiality for all messages.",
  },
  "Authentication Tag": {
    simpleTerm: "Digital Tamper Seal (128 bits)",
    category: "Security",
    definition: "A 128-bit cryptographic stamp squeezed from the final state. The receiver computes their own tag and verifies equality: if even 1 bit of data was altered, the tags will completely disagree.",
    analogy: "A royal embossed wax seal on an envelope. If a spy opens or changes the letter, the wax seal shatters.",
    securityImpact: "Proves mathematical proof of origin and authentic integrity.",
  },
  "Tag": {
    simpleTerm: "Tamper Seal",
    category: "Security",
    definition: "A 128-bit signature guaranteeing that the message arrived exactly as sent.",
    analogy: "A tamper-evident hologram sticker on a medicine bottle.",
    securityImpact: "Catches any transmission error or active cyberattack instantly.",
  },
  "Candidate Tag": {
    simpleTerm: "Receiver-Calculated Seal (T*)",
    category: "Security",
    definition: "The 128-bit tag independently calculated by the receiver by re-running the cipher over the received data.",
    analogy: "The receiver making a carbon copy of the seal to compare it with the stamp on the box.",
    securityImpact: "If Candidate Tag (T*) matches Received Tag (T), the data is proven authentic.",
  },
  "S-Box": {
    simpleTerm: "5-bit Bit Shuffler (Substitution Layer)",
    category: "Math",
    definition: "The non-linear substitution box applied across all 5 words simultaneously. It takes 5 bits (one from each register) and swaps them with another 5-bit pattern.",
    analogy: "A secret substitution codebook that replaces letters so linear math equations can't solve it.",
    securityImpact: "Destroys linear relationships between input bits and output bits (confusion).",
  },
  "Linear Diffusion": {
    simpleTerm: "Bit Spreader Layer (Diffusion)",
    category: "Math",
    definition: "Rotates and XORs each 64-bit word with two shifted copies of itself, rapidly dispersing every single bit across the whole 64-bit register.",
    analogy: "Dropping a single drop of ink into water and watching it swirl until every drop is colored.",
    securityImpact: "Ensures high avalanche effect so small changes multiply exponentially.",
  },
  "Strict Avalanche Criterion": {
    simpleTerm: "Avalanche Effect (SAC)",
    category: "Security",
    definition: "A cryptographic property stating that flipping just a single input bit must cause each output bit to flip with approximately 50% probability.",
    analogy: "A tiny snowball rolling down a hill causing a massive, unpredictable snow avalanche.",
    securityImpact: "Prevents attackers from predicting how changing a message will alter the ciphertext.",
  },
  "SAC": {
    simpleTerm: "Avalanche Effect",
    category: "Security",
    definition: "Property where a 1-bit input change flips ~50% of the entire output state.",
    analogy: "A single pebble causing an entire rockslide.",
    securityImpact: "Stops differential cryptanalysis and pattern guessing.",
  },
  "Bit-Flipping": {
    simpleTerm: "In-Transit Message Tampering",
    category: "Security",
    definition: "An active attack where a malicious third-party modifies specific 0s and 1s in the encrypted ciphertext while it travels across Wi-Fi or Bluetooth.",
    analogy: "A postal courier changing a '$100' check into '$900' while delivering the mail.",
    securityImpact: "ASCON's AEAD tag verification catches 100% of bit-flipping tampering attempts.",
  },
  "Constant-Time Verification": {
    simpleTerm: "Timing-Attack Shield",
    category: "Security",
    definition: "Comparing two authentication tags by checking all 16 bytes at the exact same speed, regardless of where a mismatch occurs.",
    analogy: "A guard who always inspects a passport for exactly 10 seconds, whether it's valid or fake, so spies can't learn anything from timing.",
    securityImpact: "Prevents hackers from measuring nanosecond timing delays to guess the secret key.",
  },
  "Zero-Trust Gate": {
    simpleTerm: "Quarantine Release Gate",
    category: "Security",
    definition: "A strict security boundary that holds tentative decrypted plaintext in temporary memory and strictly blocks releasing it to apps until the tag verification passes.",
    analogy: "A quarantine airlock at an airport: passengers wait inside until customs clears their documents.",
    securityImpact: "Prevents decryption oracle attacks and protects downstream IoT devices from malformed commands.",
  },
  "Domain Separation": {
    simpleTerm: "Stage Marker (1-bit separator)",
    category: "Architecture",
    definition: "A single bit (0x01) XORed into word x4 between processing metadata and processing message data.",
    analogy: "A bookmark or divider page placed between the cover letter and the main manuscript.",
    securityImpact: "Stops length-extension attacks and ensures metadata cannot be confused with payload data.",
  },
  "DPA": {
    simpleTerm: "Power Spying (Side-Channel Attack)",
    category: "Security",
    definition: "Differential Power Analysis: an attack where adversaries measure micro-variations in electricity consumed by the IoT chip to deduce secret key bits.",
    analogy: "Listening to the faint clicks of a safe's mechanical gears with a doctor's stethoscope.",
    securityImpact: "ASCON's low-order algebraic S-box enables hardware masking to resist DPA.",
  },
  "IV": {
    simpleTerm: "Algorithm Configuration Tag",
    category: "Parameter",
    definition: "Initialization Vector: a 64-bit constant representing the ASCON version, key length (128 bits), rate (64 bits), and round counts (12 and 6).",
    analogy: "A factory settings label specifying the model and operating speed of an engine.",
    securityImpact: "Ensures the sender and receiver are strictly configured with matching cryptographic parameters.",
  },
};

interface CryptoTermProps {
  term: string;
  display?: React.ReactNode;
  showBadge?: boolean;
  className?: string;
}

export function CryptoTerm({ term, display, showBadge = false, className = "" }: CryptoTermProps) {
  const [isOpen, setIsOpen] = useState(false);
  const info = CRYPTO_DICTIONARY[term] || {
    simpleTerm: term,
    category: "Security" as const,
    definition: "Cryptographic concept in ASCON-128 AEAD.",
    analogy: "Helps safeguard data integrity and confidentiality.",
    securityImpact: "Protects IoT communications against unauthorized interception.",
  };

  return (
    <span className={`relative inline-flex items-center gap-1 group cursor-pointer ${className}`}>
      <span
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 border-b border-dashed border-emerald-500/50 hover:border-emerald-500 text-inherit transition-all"
        title="Click to view simple explanation"
      >
        <span>{display || term}</span>
        {showBadge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            {info.simpleTerm}
          </span>
        )}
        <HelpCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400 opacity-60 group-hover:opacity-100 transition-opacity" />
      </span>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for click outside */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute left-0 bottom-full mb-2 z-50 w-72 sm:w-80 p-3.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-emerald-500/30 rounded-2xl shadow-xl text-left"
            >
              <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-zinc-100 dark:border-white/10">
                <div>
                  <div className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                    {info.category} · Cryptographic Term
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <span>{term}</span>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-normal">
                      → {info.simpleTerm}
                    </span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                  }}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs px-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                    <Info className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Plain English:
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed mt-0.5">
                    {info.definition}
                  </p>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-200/50 dark:border-emerald-500/20">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1 text-[11px]">
                    <Lightbulb className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    Everyday Analogy:
                  </div>
                  <p className="text-emerald-900/90 dark:text-emerald-200/90 text-[11px] leading-relaxed mt-0.5">
                    {info.analogy}
                  </p>
                </div>

                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1 text-[11px]">
                    <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    Why It Matters:
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed mt-0.5">
                    {info.securityImpact}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </span>
  );
}

export function CryptoBadge({ term, showAnalogy = false }: { term: string; showAnalogy?: boolean }) {
  const info = CRYPTO_DICTIONARY[term];
  if (!info) return null;

  return (
    <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs">
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-zinc-900 dark:text-white">{term}</span>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {info.simpleTerm}
        </span>
      </div>
      {showAnalogy && (
        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 italic">
          💡 {info.analogy}
        </span>
      )}
    </div>
  );
}
