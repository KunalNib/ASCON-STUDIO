import { 
  Network, Fingerprint, Binary, Shield, Lock, ArrowRightLeft, Key, KeyRound, 
  ShieldCheck, ShieldPlus, Layers, Hash, FileText, Feather, Cpu, Trophy, Unlock, Grid, RefreshCw
} from "lucide-react";

export type ModuleItem = {
  id: string;
  title: string;
  icon: any;
  intro: string;
  objective: string;
  explanation: string;
  interactiveType?: 'encryption-flow' | 'keys' | 'state' | 'aead';
  takeaway: string;
  quiz?: {
    question: string;
    options: string[];
    correctIndex: number;
  };
};

export type Course = {
  level: string;
  title: string;
  description: string;
  status: "completed" | "in-progress" | "locked";
  modules: ModuleItem[];
};

export const courses: Course[] = [
  {
    level: "Beginner",
    title: "Introduction to Lightweight Cryptography",
    description: "A simple journey from crypto basics to understanding ASCON.",
    status: "in-progress",
    modules: [
      {
        id: "cryptography",
        title: "What is Cryptography?",
        icon: Shield,
        intro: "Cryptography is the science of keeping secrets safe in the digital world.",
        objective: "Learn the basic terms used to protect data.",
        explanation: "At its core, cryptography turns readable messages (Plaintext) into scrambled gibberish (Ciphertext) using a secret Key. Only someone with the correct Key can scramble or unscramble the message.",
        interactiveType: 'encryption-flow',
        takeaway: "Cryptography transforms readable data into unreadable form to protect it from attackers.",
        quiz: {
          question: "What is 'Ciphertext'?",
          options: ["The secret key", "The original readable message", "The scrambled, unreadable message"],
          correctIndex: 2
        }
      },
      {
        id: "why-encrypt",
        title: "Why Do We Need Encryption?",
        icon: Lock,
        intro: "Without encryption, everything you send on the internet is like a postcard that anyone can read.",
        objective: "Understand why data must be hidden.",
        explanation: "When you send a message, it travels through many routers and networks. Encryption ensures that hackers, spies, or internet providers can only see scrambled data, protecting your passwords and private info.",
        takeaway: "Encryption prevents unauthorized people from reading your data.",
        quiz: {
          question: "What happens if you send a message without encryption?",
          options: ["It gets delivered faster", "Anyone on the network can read it", "It requires a larger key"],
          correctIndex: 1
        }
      },
      {
        id: "enc-vs-dec",
        title: "Encryption vs Decryption",
        icon: ArrowRightLeft,
        intro: "Encryption is locking the door. Decryption is unlocking it.",
        objective: "Understand the two core directions of cryptography.",
        explanation: "Encryption takes Plaintext and mathematically scrambles it into Ciphertext. Decryption reverses this process, taking Ciphertext and turning it back into Plaintext using the right key.",
        interactiveType: 'encryption-flow',
        takeaway: "Encryption scrambles data; decryption unscrambles it.",
        quiz: {
          question: "Which process converts Ciphertext back to Plaintext?",
          options: ["Encryption", "Authentication", "Decryption"],
          correctIndex: 2
        }
      },
      {
        id: "crypto-key",
        title: "What is a Cryptographic Key?",
        icon: Key,
        intro: "A key is a secret string of data that controls the encryption process.",
        objective: "Learn what makes keys so important.",
        explanation: "Even if hackers know exactly how an encryption algorithm works, they can't unscramble the message without the secret Key. A strong key acts as a secure password for your data.",
        interactiveType: 'keys',
        takeaway: "Without the correct secret key, ciphertext cannot be read.",
        quiz: {
          question: "What does Kerckhoffs's principle state?",
          options: ["Algorithms must be kept secret", "Security should depend only on the key, not hiding the algorithm", "Keys should be as short as possible"],
          correctIndex: 1
        }
      },
      {
        id: "symmetric",
        title: "Symmetric Encryption",
        icon: KeyRound,
        intro: "Symmetric encryption uses the exact SAME key to lock and unlock the data.",
        objective: "Understand shared-key encryption.",
        explanation: "Imagine you and a friend both have a copy of the same house key. You can lock a box with your key, and your friend can unlock it with theirs. This is very fast and efficient, making it perfect for small IoT devices.",
        takeaway: "Symmetric encryption uses one shared key to encrypt and decrypt.",
        quiz: {
          question: "What is the main characteristic of Symmetric Encryption?",
          options: ["It uses two different keys", "It uses the same key for encryption and decryption", "It doesn't use any keys"],
          correctIndex: 1
        }
      },
      {
        id: "auth-integrity",
        title: "Authentication and Integrity",
        icon: ShieldCheck,
        intro: "Encryption hides data, but it doesn't prove who sent it or if it was tampered with.",
        objective: "Learn why hiding data isn't always enough.",
        explanation: "An attacker might not be able to read your encrypted bank transfer, but they could still modify the scrambled data in transit. We need Integrity (proof it wasn't changed) and Authentication (proof of who sent it).",
        takeaway: "Integrity and Authentication protect data from being altered or forged.",
        quiz: {
          question: "What does 'Integrity' mean in cryptography?",
          options: ["The data is kept secret", "The data hasn't been modified", "The data is very large"],
          correctIndex: 1
        }
      },
      {
        id: "authenticated-encryption",
        title: "What is Authenticated Encryption?",
        icon: ShieldPlus,
        intro: "Authenticated Encryption (AE) does two things at once: it hides the data AND protects it from tampering.",
        objective: "Understand how AE secures messages.",
        explanation: "AE creates the Ciphertext and a special 'Authentication Tag'. The receiver checks this Tag first. If a hacker alters even a single bit of the Ciphertext, the Tag check fails, and the message is instantly rejected.",
        interactiveType: 'aead',
        takeaway: "AE combines confidentiality and integrity in one secure step.",
        quiz: {
          question: "What happens if an attacker modifies the ciphertext in an AE system?",
          options: ["The tag verification fails and the message is rejected", "The receiver reads corrupted data", "The system crashes"],
          correctIndex: 0
        }
      },
      {
        id: "aead",
        title: "What is AEAD?",
        icon: Layers,
        intro: "AEAD stands for Authenticated Encryption with Associated Data.",
        objective: "Learn what 'Associated Data' adds to the mix.",
        explanation: "Sometimes you have data like a network address (Associated Data) that must be readable by routers, but you still want to ensure hackers haven't tampered with it. AEAD protects the integrity of BOTH the readable data and the encrypted data.",
        interactiveType: 'aead',
        takeaway: "AEAD protects the integrity of readable headers alongside secret data.",
        quiz: {
          question: "What does the 'AD' in AEAD stand for?",
          options: ["Advanced Decryption", "Associated Data", "Authentication Details"],
          correctIndex: 1
        }
      },
      {
        id: "nonce",
        title: "What is a Nonce?",
        icon: Hash,
        intro: "A Nonce is a 'Number used ONCE'. It ensures the same message never looks the same twice.",
        objective: "Understand why randomness is injected into encryption.",
        explanation: "If you encrypt the word 'HELLO' 10 times with the same key, a hacker might notice the pattern. A unique Nonce is added every time so that 'HELLO' looks completely different every single time it's sent.",
        takeaway: "A Nonce prevents attackers from identifying patterns in encrypted data.",
        quiz: {
          question: "What is the most critical rule for a Nonce?",
          options: ["It must never be repeated with the same key", "It must be kept secret", "It must be very small"],
          correctIndex: 0
        }
      },
      {
        id: "assoc-data",
        title: "What is Associated Data?",
        icon: FileText,
        intro: "Associated Data (AD) travels with your secret message but remains completely readable.",
        objective: "Understand the role of AD in network traffic.",
        explanation: "Think of an envelope. The address on the outside is the Associated Data — the post office needs to read it to deliver it. The letter inside is the Encrypted Plaintext. The AEAD Tag acts like a wax seal protecting the whole envelope.",
        takeaway: "AD is authenticated for tampering but not encrypted.",
        quiz: {
          question: "Is Associated Data encrypted?",
          options: ["Yes, always", "No, it is readable but checked for tampering", "Only on Tuesdays"],
          correctIndex: 1
        }
      },
      {
        id: "lightweight",
        title: "What is Lightweight Cryptography?",
        icon: Feather,
        intro: "Standard encryption is too heavy for tiny devices. Lightweight crypto solves this.",
        objective: "Learn the difference between standard and lightweight crypto.",
        explanation: "Traditional AES encryption requires lots of RAM and CPU power. Lightweight cryptography uses smaller 'states' and simpler math operations (like XOR) to provide the same strong security using a fraction of the battery and memory.",
        takeaway: "Lightweight cryptography secures devices that have very limited computing power.",
        quiz: {
          question: "Why can't tiny devices just use standard AES encryption?",
          options: ["AES is not secure enough", "AES drains battery and uses too much memory", "AES cannot encrypt small messages"],
          correctIndex: 1
        }
      },
      {
        id: "iot-problem",
        title: "The IoT Problem",
        icon: Network,
        intro: "The Internet of Things (IoT) includes smart locks, medical sensors, and home appliances.",
        objective: "Understand the hardware constraints of the IoT world.",
        explanation: "IoT devices run on tiny microcontrollers (often 8-bit or 32-bit) with just kilobytes of RAM and batteries that must last years. They urgently need security to protect our homes and health, but cannot run heavy desktop software.",
        takeaway: "IoT devices have extreme constraints on power, memory, and CPU.",
        quiz: {
          question: "Which of the following is a typical constraint of an IoT device?",
          options: ["Excessive RAM", "Unlimited power", "Battery life that must last for months/years"],
          correctIndex: 2
        }
      },
      {
        id: "iot-security",
        title: "Why Lightweight Crypto is Important for IoT",
        icon: Cpu,
        intro: "If a smart lock uses heavy encryption, its battery dies in days. If it uses no encryption, hackers can open your door.",
        objective: "Learn the real-world impact of lightweight crypto.",
        explanation: "By utilizing lightweight cryptography, IoT devices can maintain high-end security without draining their small batteries or requiring expensive processor upgrades. This makes the modern smart world possible.",
        takeaway: "Lightweight crypto balances strong security with long battery life.",
        quiz: {
          question: "What is the consequence of a smart lock using no encryption?",
          options: ["It becomes too heavy", "Hackers can easily bypass it", "The battery lasts forever"],
          correctIndex: 1
        }
      },
      {
        id: "what-is-ascon",
        title: "Introduction to ASCON",
        icon: Fingerprint,
        intro: "ASCON is the global champion of lightweight cryptography.",
        objective: "Meet the ASCON algorithm.",
        explanation: "ASCON is a family of lightweight cryptographic algorithms specifically built for IoT. It provides Authenticated Encryption (AEAD) using a highly efficient 'sponge construction', which absorbs data and squeezes out secure ciphertexts.",
        takeaway: "ASCON is the standard algorithm for securing constrained devices.",
        quiz: {
          question: "What core architecture does ASCON use?",
          options: ["Block cipher", "Sponge construction", "Public key infrastructure"],
          correctIndex: 1
        }
      },
      {
        id: "why-ascon",
        title: "Why Was ASCON Selected?",
        icon: Trophy,
        intro: "In 2023, the US government (NIST) chose ASCON as the global standard after a 4-year competition.",
        objective: "Understand ASCON's victory.",
        explanation: "ASCON beat dozens of competitors because it offers the perfect balance: it is extremely secure against hackers, runs incredibly fast in software and hardware, and uses minimal RAM. It uses simple bitwise math (AND, XOR, NOT).",
        takeaway: "ASCON provides maximum security with minimal resources.",
        quiz: {
          question: "Which organization selected ASCON as the standard?",
          options: ["NASA", "NIST", "WHO"],
          correctIndex: 1
        }
      },
      {
        id: "ascon-variants",
        title: "ASCON Variants",
        icon: Layers,
        intro: "ASCON is a multi-tool. It has different variants for different jobs.",
        objective: "Learn the main ASCON functions.",
        explanation: "1. ASCON-AEAD: Used for encrypting and authenticating messages.\n2. ASCON-Hash: Used to create a unique fingerprint of a file.\n3. ASCON-XOF: Used to generate endless random numbers.",
        takeaway: "ASCON can encrypt, hash, and generate random data using the same core math.",
        quiz: {
          question: "Which ASCON variant is used for encryption?",
          options: ["ASCON-Hash", "ASCON-AEAD", "ASCON-XOF"],
          correctIndex: 1
        }
      },
      {
        id: "ascon-enc",
        title: "ASCON Encryption: Big Picture",
        icon: Lock,
        intro: "ASCON encryption happens in four simple stages.",
        objective: "Visualize the ASCON encryption flow.",
        explanation: "1. Initialization: The Key and Nonce are mixed in.\n2. Associated Data: The readable data is mixed in.\n3. Plaintext: The secret message is mixed in, and Ciphertext is squeezed out.\n4. Finalization: The Authentication Tag is produced.",
        interactiveType: 'encryption-flow',
        takeaway: "Encryption is a step-by-step process of mixing data and squeezing out ciphertext.",
        quiz: {
          question: "In which stage is the Authentication Tag produced?",
          options: ["Initialization", "Plaintext Processing", "Finalization"],
          correctIndex: 2
        }
      },
      {
        id: "ascon-dec",
        title: "ASCON Decryption: Big Picture",
        icon: Unlock,
        intro: "Decryption reverses the process, but checks the Tag first!",
        objective: "Understand how ASCON safely decrypts.",
        explanation: "During decryption, ASCON absorbs the Ciphertext and recalculates the Authentication Tag. Before handing over the Plaintext, it compares the recalculated Tag with the received Tag. If they don't match, the message is thrown away.",
        takeaway: "ASCON verifies the Tag before releasing the decrypted message.",
        quiz: {
          question: "What happens if the Tag verification fails during decryption?",
          options: ["The message is accepted anyway", "The message is rejected immediately", "It tries again with a different key"],
          correctIndex: 1
        }
      },
      {
        id: "ascon-state",
        title: "What is the ASCON State?",
        icon: Grid,
        intro: "The State is ASCON's internal memory where all the mixing happens.",
        objective: "Look inside ASCON's memory.",
        explanation: "ASCON uses a very small 320-bit state (just 40 bytes!). It is divided into five 64-bit blocks. This small size is exactly why it runs so well on tiny IoT microcontrollers without running out of RAM.",
        interactiveType: 'state',
        takeaway: "The 320-bit state is ASCON's highly efficient working memory.",
        quiz: {
          question: "How large is the ASCON state?",
          options: ["128 bits", "320 bits", "1024 bits"],
          correctIndex: 1
        }
      },
      {
        id: "ascon-perm",
        title: "What is an ASCON Permutation?",
        icon: RefreshCw,
        intro: "The Permutation is the engine that thoroughly scrambles the state.",
        objective: "Understand the core math operation of ASCON.",
        explanation: "At each step, ASCON applies a Permutation to its 320-bit state. This is like putting the state in a blender. It deterministically scrambles the bits so thoroughly that attackers cannot reverse the process to find the Key.",
        takeaway: "The permutation provides security by scrambling the state.",
        quiz: {
          question: "What is the main purpose of the ASCON permutation?",
          options: ["To format the text", "To scramble the state and provide security", "To compress the data"],
          correctIndex: 1
        }
      }
    ]
  },
  {
    level: "Intermediate",
    title: "The 320-Bit State Matrix",
    description: "Dive into how ASCON processes data structurally using 64-bit bounds and word limits.",
    status: "locked",
    modules: []
  },
  {
    level: "Advanced",
    title: "Substitution & Linear Diffusion",
    description: "Explore the core permutation layers mapping non-linear S-Boxes across bitslices.",
    status: "locked",
    modules: []
  }
];
