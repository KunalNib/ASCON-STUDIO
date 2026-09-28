import { 
  Network, Fingerprint, Binary, Shield, Lock, ArrowRightLeft, Key, KeyRound, 
  ShieldCheck, ShieldPlus, Layers, Hash, FileText, Feather, Cpu, Trophy, Unlock, Grid, RefreshCw, Sparkles, AlertTriangle
} from "lucide-react";

export type DiagramType = 
  | "sponge" 
  | "state-matrix" 
  | "permutation" 
  | "decryption-gate" 
  | "iot-hardware" 
  | "aead-pipeline" 
  | "avalanche" 
  | "symmetric-key";

export type SandboxType = 
  | "bit-flip" 
  | "aead-envelope" 
  | null;

export interface LearningLesson {
  id: string;
  title: string;
  simpleTerm: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  estimatedMinutes: number;
  icon: any;
  diagramType: DiagramType;
  sandboxType: SandboxType;
  summary: string;
  analogy: {
    title: string;
    story: string;
    takeaway: string;
  };
  technicalAnatomy: {
    heading: string;
    formula?: string;
    keyPoints: string[];
    specDetail: string;
  };
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export interface LearningCourseCategory {
  id: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  title: string;
  description: string;
  lessons: LearningLesson[];
}

export const LEARNING_CURRICULUM: LearningCourseCategory[] = [
  {
    id: "beginner",
    level: "Beginner",
    title: "Lightweight Cryptography Fundamentals",
    description: "Start from zero: understand why IoT needs lightweight crypto and how ASCON protects smart devices.",
    lessons: [
      {
        id: "iot-problem",
        title: "The IoT Problem & Constrained Devices",
        simpleTerm: "Small Gadgets, Tiny Batteries",
        level: "Beginner",
        estimatedMinutes: 3,
        icon: Network,
        diagramType: "iot-hardware",
        sandboxType: null,
        summary: "IoT microcontrollers have tiny microprocessors, just kilobytes of RAM, and coin-cell batteries that must last years. Traditional ciphers like AES drain their power in days.",
        analogy: {
          title: "The Semi-Truck vs. The Electric Scooter",
          story: "Imagine delivering a small letter across a narrow footbridge. Traditional AES is like driving a massive 18-wheel semi-truck: it's incredibly secure, but it burns huge amounts of gas and gets stuck in tight spaces. ASCON is an electric scooter: agile, lightweight, yet carrying the same bulletproof locked briefcase.",
          takeaway: "Cryptographic security should not come at the cost of killing a battery or overheating a microcontroller."
        },
        technicalAnatomy: {
          heading: "Microcontroller Constraints (ESP32 / Cortex-M0)",
          keyPoints: [
            "RAM limit: Constrained microcontrollers often have under 8 KB of SRAM total.",
            "Energy budget: Coin cell batteries (e.g. CR2032) provide only ~220 mAh of total capacity.",
            "Table penalties: Traditional AES uses 256-byte S-box lookups (T-tables) that blow past cache and cause timing side-channel leaks on simple CPUs.",
            "ASCON advantage: Operates entirely in five 64-bit registers with ~64 bytes of working memory total."
          ],
          specDetail: "Selected by NIST in 2023 for the Lightweight Cryptography (LWC) standard after a 4-year multi-round international competition evaluating security, efficiency, and hardware footprint."
        },
        quiz: {
          question: "Why can't tiny IoT sensors simply use traditional AES encryption?",
          options: [
            "AES is broken and hackers know the master key",
            "AES consumes too much RAM and battery power for constrained microcontrollers",
            "AES only works on Linux supercomputers"
          ],
          correctIndex: 1,
          explanation: "Traditional AES requires table caches and substantial CPU cycles, quickly draining the batteries of tiny microcontrollers like smart locks or medical monitors."
        }
      },
      {
        id: "sponge-construction",
        title: "The Sponge Construction",
        simpleTerm: "The Kitchen Sponge Model",
        level: "Beginner",
        estimatedMinutes: 4,
        icon: Binary,
        diagramType: "sponge",
        sandboxType: null,
        summary: "ASCON uses a sponge architecture that maintains a 320-bit internal state divided into Rate (public window) and Capacity (hidden secret core).",
        analogy: {
          title: "Absorbing Spilled Water and Squeezing Out Lemonade",
          story: "Think of a kitchen sponge. In the 'Absorb' phase, you dip it into liquid (your plaintext message), soaking the information into its porous interior. The cryptographic permutation is like squeezing and twisting the sponge in a blender. In the 'Squeeze' phase, you press the sponge to extract ciphertext and the authentication tag.",
          takeaway: "The same underlying sponge state handles absorbing headers, encrypting messages, and generating security tags without needing separate algorithms."
        },
        technicalAnatomy: {
          heading: "State Division: Rate vs. Capacity",
          formula: "State S = Rate (r = 64 bits) ∥ Capacity (c = 256 bits)",
          keyPoints: [
            "Rate (Word x0): The 64-bit portion exposed to inputs and outputs. Plaintext blocks XOR into here.",
            "Capacity (Words x1..x4): The 256-bit hidden interior. Never revealed directly to an attacker; guarantees 128-bit cryptographic security.",
            "Duplex Operation: Unlike classic Keccak hashing sponges, ASCON immediately squeezes ciphertext during the absorb phase (duplex mode)."
          ],
          specDetail: "Operates with 320 bits internal memory. 320 bits was specifically chosen by the designers to allow native bitsliced 64-bit register computation on modern ARM and RISC-V architectures."
        },
        quiz: {
          question: "In ASCON's 320-bit sponge, what is the role of the 256-bit 'Capacity'?",
          options: [
            "It holds the readable network headers",
            "It is the secret internal core that is never directly exposed, guaranteeing 128-bit security",
            "It compresses images before encryption"
          ],
          correctIndex: 1,
          explanation: "The Capacity remains shielded from outside observers, ensuring attackers cannot reconstruct the internal cipher state."
        }
      },
      {
        id: "aead-concept",
        title: "Authenticated Encryption (AEAD)",
        simpleTerm: "Envelope with Tamper-Proof Wax Seal",
        level: "Beginner",
        estimatedMinutes: 4,
        icon: ShieldCheck,
        diagramType: "aead-pipeline",
        sandboxType: "aead-envelope",
        summary: "Encryption alone is not enough: hackers can flip bits in transit. AEAD encrypts the secret message while generating a cryptographic tag that guarantees nothing was altered.",
        analogy: {
          title: "The Postal Envelope with an Indelible Seal",
          story: "Imagine sending a letter. The recipient's mailing address on the outside is Associated Data (it must be readable by mail carriers). The letter inside is Plaintext (scrambled into Ciphertext so snoops can't read it). The wax seal on the back is the Authentication Tag. If a spy opens the envelope or alters the destination address, the wax seal shatters.",
          takeaway: "AEAD protects confidentiality (hiding data) AND integrity (detecting any modification) in a single unified operation."
        },
        technicalAnatomy: {
          heading: "AEAD Security Properties",
          formula: "AEAD(K, N, AD, P) → (C, Tag)",
          keyPoints: [
            "Confidentiality: Only holders of the secret key K can decrypt ciphertext C.",
            "Integrity & Authenticity: The 128-bit Tag binds both the ciphertext C and the plaintext associated data AD.",
            "Chosen-Ciphertext Attack (IND-CCA2) resilience: An attacker cannot forge valid ciphertext/tag combinations without knowing the key."
          ],
          specDetail: "ASCON-128 generates a 128-bit MAC tag. The probability of an adversary forging a valid tag by pure luck is 2⁻¹²⁸."
        },
        quiz: {
          question: "What happens if a hacker modifies 1 bit of Associated Data (AD) during network transit?",
          options: [
            "The message still decrypts normally because AD is not encrypted",
            "The authentication tag verification will fail, and the receiver will immediately reject the message",
            "The sender's computer automatically restarts"
          ],
          correctIndex: 1,
          explanation: "Even though Associated Data travels in plaintext, it is mathematically bound to the authentication tag. Any tampering invalidates the tag check."
        }
      },
      {
        id: "symmetric-keys",
        title: "Symmetric Keys & Nonce Security",
        simpleTerm: "The Shared Key & Single-Use Stamp",
        level: "Beginner",
        estimatedMinutes: 3,
        icon: Key,
        diagramType: "symmetric-key",
        sandboxType: null,
        summary: "ASCON is a symmetric cipher: sender and receiver share the same secret 128-bit key. A unique Nonce must be used for every single message to prevent pattern analysis.",
        analogy: {
          title: "Twin Padlocks and Unique Date Stamps",
          story: "You and your bank both own a copy of the same key. Every time you send a message, you also stamp a unique, never-repeated serial number (Nonce) on the box. Even if you send the exact same word 'HELLO' 100 times, each box looks completely different because the serial number scrambles the initial lock state.",
          takeaway: "Never reuse a Nonce with the same key. Reusing a nonce breaks the cipher's mathematical guarantees."
        },
        technicalAnatomy: {
          heading: "Key and Nonce Sizing in ASCON-128",
          formula: "Key K ∈ {0,1}¹²⁸, Nonce N ∈ {0,1}¹²⁸",
          keyPoints: [
            "Key: 128 bits (16 bytes). Provides standard 128-bit security level against brute-force attacks (2¹²⁸ operations).",
            "Nonce: 128 bits (16 bytes). Must be unique for every execution under the same key (e.g. packet counter or timestamp + random suffix).",
            "Catastrophic failure of nonce reuse: Allows an eavesdropper to XOR two ciphertexts and recover XOR of plaintexts."
          ],
          specDetail: "ASCON also features an optional nonce-misuse resilient variant (ASCON-128a) that mitigates damage in devices that fail to generate proper nonces."
        },
        quiz: {
          question: "What is the single most critical rule regarding a cryptographic Nonce?",
          options: [
            "It must always be kept strictly secret from everyone",
            "It must NEVER be reused with the same secret key",
            "It must always consist of only vowels"
          ],
          correctIndex: 1,
          explanation: "Nonce stands for 'Number used ONCE'. Reusing a nonce with the same key breaks the security proofs of stream ciphers and AEAD schemes."
        }
      }
    ]
  },
  {
    id: "intermediate",
    level: "Intermediate",
    title: "The 320-Bit State & Permutation",
    description: "Explore the internal architecture: 5 word lanes, bitsliced design, and the zero-trust decryption gate.",
    lessons: [
      {
        id: "state-matrix-structure",
        title: "The 320-Bit State Matrix (x0 to x4)",
        simpleTerm: "Five 64-Bit Data Highways",
        level: "Intermediate",
        estimatedMinutes: 5,
        icon: Grid,
        diagramType: "state-matrix",
        sandboxType: null,
        summary: "ASCON's memory consists of exactly five 64-bit words named x0, x1, x2, x3, and x4. This compact 40-byte footprint fits directly into CPU hardware registers.",
        analogy: {
          title: "Five Shelves in a Narrow Vault",
          story: "Picture five long shelves stacked horizontally, each holding 64 items. Shelf 0 (x0) is the loading dock right by the door where new packages arrive. Shelves 1 through 4 (x1..x4) are pushed deep in the back vault where secret key material and internal churn are hidden from outside sight.",
          takeaway: "Grouping the 320 bits into five standard 64-bit integers allows ultra-fast processing on 64-bit processors and clean byte slicing on 8-bit chips."
        },
        technicalAnatomy: {
          heading: "Word Allocation in ASCON-128",
          formula: "State S = (x₀, x₁, x₂, x₃, x₄) ∈ (𝔽₂⁶⁴)⁵",
          keyPoints: [
            "x0 (Rate): Initialized with IV (64-bit parameter specifying key length and round counts).",
            "x1, x2 (Capacity): Initialized with the 128-bit Secret Key K (K[127:64] and K[63:0]).",
            "x3, x4 (Capacity): Initialized with the 128-bit Nonce N (N[127:64] and N[63:0]).",
            "Bitslice alignment: Bit i of all 5 words forms column (x0[i], x1[i], x2[i], x3[i], x4[i])."
          ],
          specDetail: "Standard ASCON-128 IV is hex 80400c0600000000 (specifying 128-bit key, 64-bit rate, 12 rounds for p^a, and 6 rounds for p^b)."
        },
        quiz: {
          question: "Which register in the 320-bit state acts as the public 'Rate' word that absorbs plaintext?",
          options: [
            "Register x4",
            "Register x0",
            "Register x2"
          ],
          correctIndex: 1,
          explanation: "Word x0 is the 64-bit Rate register. Words x1 through x4 form the 256-bit secret Capacity."
        }
      },
      {
        id: "decryption-gate",
        title: "Decryption & The Zero-Trust Gate",
        simpleTerm: "Quarantine & Release Guard",
        level: "Intermediate",
        estimatedMinutes: 5,
        icon: Unlock,
        diagramType: "decryption-gate",
        sandboxType: "aead-envelope",
        summary: "In ASCON decryption, the decrypted plaintext is kept in a strict quarantine buffer. If the computed candidate tag does not match the received tag, everything is wiped.",
        analogy: {
          title: "The Airport Customs Isolation Chamber",
          story: "Incoming packages are kept in an isolated chamber. The customs officer rebuilds the security stamp from scratch. Only if the stamps match 100% does the door unlock to release the package. If a single pixel is wrong, the shredder activates and drops the package into incinerator ash.",
          takeaway: "Never release unverified candidate plaintext to the application layer. Doing so creates Chosen-Ciphertext Attack (CCA2) vulnerabilities."
        },
        technicalAnatomy: {
          heading: "Constant-Time Verification Principle",
          formula: "T* == T ? Release(P) : Reject(⊥)",
          keyPoints: [
            "Quarantine buffer: Candidate plaintext P* must not be forwarded to consumer APIs until verification succeeds.",
            "Constant-Time comparison: Comparison of T* and T must execute in constant time (e.g. crypto_verify_16) to prevent timing side-channel leaks.",
            "Output on failure: Return error symbol ⊥ (bottom), wipe candidate plaintext buffer with zeros."
          ],
          specDetail: "Timing attacks against standard memcmp() functions can reveal tag bytes one by one based on early-exit CPU comparisons."
        },
        quiz: {
          question: "Why must decrypted candidate plaintext remain quarantined until tag verification succeeds?",
          options: [
            "To save memory on the hard drive",
            "To prevent attackers from using the decrypted corrupted text to decipher the secret key",
            "Because microcontrollers cannot print text until tags match"
          ],
          correctIndex: 1,
          explanation: "Releasing unauthenticated plaintext allows chosen-ciphertext attacks (like padding oracle attacks) that can completely leak secret keys."
        }
      }
    ]
  },
  {
    id: "advanced",
    level: "Advanced",
    title: "Permutation Math & Cryptanalysis",
    description: "Deep dive into the 3 round layers: Constant Addition (p_C), 5-bit S-Box (p_S), and Linear Diffusion (p_L).",
    lessons: [
      {
        id: "round-permutation",
        title: "The Three Permutation Layers",
        simpleTerm: "The Multi-Stage Scrambler",
        level: "Advanced",
        estimatedMinutes: 6,
        icon: RefreshCw,
        diagramType: "permutation",
        sandboxType: null,
        summary: "Each round of ASCON applies three successive mathematical operations: Constant Addition (p_C), S-Box Substitution (p_S), and Linear Diffusion (p_L).",
        analogy: {
          title: "The Season, Dice, and Spin Kitchen Method",
          story: "To make a completely unidentifiable stew: First, you add a pinch of unique spice to break symmetry (Constant Addition). Next, you run ingredients through a sharp vertical mincer that scrambles colors and shapes non-linearly (S-Box). Finally, you spin the blender bowl to fling bits across all directions (Linear Diffusion).",
          takeaway: "Confusion (S-Box) and Diffusion (Linear Rotations) working together ensure that no input bit can be tracked through the cipher."
        },
        technicalAnatomy: {
          heading: "Round Definition: p = p_L ∘ p_S ∘ p_C",
          formula: "S_{i+1} = p_L(p_S(p_C(S_i, c_r)))",
          keyPoints: [
            "p_C (Constant Addition): Round constant c_r XORed into x2[7:0] to prevent slide attacks and self-similarity.",
            "p_S (Substitution Layer): 64 parallel 5-bit vertical S-boxes provide non-linearity (algebraic degree 2).",
            "p_L (Linear Diffusion): Rotates each 64-bit register by two distinct prime amounts: x_i ⊕ (x_i ≫ r_1) ⊕ (x_i ≫ r_2)."
          ],
          specDetail: "ASCON uses 12 rounds (p¹²) for Initialization and Finalization where security against key-recovery attacks is paramount, and 6 rounds (p⁶) between data blocks for high throughput."
        },
        quiz: {
          question: "What is the purpose of adding round constants (p_C) into register x2?",
          options: [
            "To make the ciphertext longer",
            "To break symmetry between rounds and prevent slide attacks",
            "To calculate the final checksum"
          ],
          correctIndex: 1,
          explanation: "Round constants ensure each round is mathematically distinct, preventing slide attacks and fixed-point cryptographic vulnerabilities."
        }
      },
      {
        id: "linear-diffusion",
        title: "Linear Diffusion & Word Rotations (p_L)",
        simpleTerm: "Horizontal Bit Rotation Dispersion",
        level: "Advanced",
        estimatedMinutes: 5,
        icon: Sparkles,
        diagramType: "permutation",
        sandboxType: null,
        summary: "Linear diffusion spreads bits horizontally across all 64 column lanes using fast circular right rotations (ROTR) and bitwise XOR.",
        analogy: {
          title: "The Rapid Paint Stirrer",
          story: "If you drop a single speck of blue dye into white paint, stirring it with a drill causes the speck to stretch into long spirals that rapidly diffuse into a uniform baby blue. Linear diffusion does the exact same thing to bit differences across the 64-bit words.",
          takeaway: "By rotating each word by different amounts, bits rapidly blend across columns so local modifications become globally chaotic."
        },
        technicalAnatomy: {
          heading: "Rotation Offsets (r1, r2) for Registers x0..x4",
          formula: "Σ_i(x_i) = x_i ⊕ (x_i ⋙ r_{i,1}) ⊕ (x_i ⋙ r_{i,2})",
          keyPoints: [
            "x0 offsets: (19, 28) — prime-like intervals ensuring rapid diffusion.",
            "x1 offsets: (61, 39) — mixes lower and upper halves of the 64-bit word.",
            "x2 offsets: (1, 6) — fine-grained single-byte local mixing.",
            "x3 offsets: (10, 17) & x4 offsets: (7, 41) — complete asymmetric dispersion."
          ],
          specDetail: "These specific rotation offsets were mathematically chosen through search algorithms to maximize branch numbers and branch diffusion speed."
        },
        quiz: {
          question: "How does ASCON achieve linear diffusion across 64-bit words?",
          options: [
            "Using floating-point square root instructions",
            "Using circular right rotations (ROTR) and bitwise XOR operations",
            "By sorting the numbers from lowest to highest"
          ],
          correctIndex: 1,
          explanation: "ASCON uses native right rotations and XORs: Σ_i(x_i) = x_i ⊕ (x_i ⋙ r1) ⊕ (x_i ⋙ r2), which execute in only 2 to 3 CPU cycles."
        }
      }
    ]
  },
  {
    id: "expert",
    level: "Expert",
    title: "Security Proofs & Cryptanalysis",
    description: "Evaluate the Strict Avalanche Criterion (SAC), differential trails, and active security against attacks.",
    lessons: [
      {
        id: "avalanche-criterion",
        title: "Strict Avalanche Criterion (SAC)",
        simpleTerm: "The Butterfly Effect of Bits",
        level: "Expert",
        estimatedMinutes: 6,
        icon: AlertTriangle,
        diagramType: "avalanche",
        sandboxType: "bit-flip",
        summary: "A cipher satisfies the Strict Avalanche Criterion if flipping a single input bit causes each output bit to flip with a probability of exactly 50%.",
        analogy: {
          title: "The Single Snowflake That Triggers a Mountain Slide",
          story: "In chaotic systems, a butterfly flapping its wings in Brazil can cause a tornado in Texas. In ASCON, changing just 1 bit in your password causes approximately 160 bits (half of the entire state) to flip completely at random after only 4 rounds of permutation.",
          takeaway: "Any predictable relationship between input bits and output bits allows attackers to solve linear equations to uncover the secret key."
        },
        technicalAnatomy: {
          heading: "SAC Mathematical Formalization",
          formula: "∀ i, j : Pr[ Output_j(X) ≠ Output_j(X ⊕ e_i) ] = 0.5",
          keyPoints: [
            "Round 0: 1 bit difference (0.3% difference).",
            "Round 1: S-Box vertical expansion spreads difference to ~14 bits (4.4%).",
            "Round 2: Linear rotations disperse differences to ~68 bits (21.3%).",
            "Round 4: Full SAC equilibrium reached (~160 bits / 50% state divergence)."
          ],
          specDetail: "ASCON's 12-round initialization provides a safety margin of more than 5 rounds against known differential and linear cryptanalysis trails."
        },
        quiz: {
          question: "What is the target bit flip probability for an ideal cipher under the Strict Avalanche Criterion?",
          options: [
            "100% of all bits must flip",
            "50% (every bit flips with independent 0.5 probability)",
            "0% (no bits should change)"
          ],
          correctIndex: 1,
          explanation: "Under the Strict Avalanche Criterion, each output bit should flip with exactly 50% probability, rendering output bits indistinguishable from random coin tosses."
        }
      }
    ]
  }
];
