"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle, Lock, Play, GraduationCap, ChevronRight, Binary, Fingerprint, Network, Shield, Key, KeyRound, ShieldCheck, ShieldPlus, Layers, Hash, FileText, Feather, Cpu, Trophy, Unlock, Grid, RefreshCw, ArrowRightLeft } from "lucide-react";
import { RoboExplainer } from "@/components/studio/RoboExplainer";

export default function LearnModule() {
  const [activeCourse, setActiveCourse] = useState(0);
  const [activeLessonContext, setActiveLessonContext] = useState<string | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  const courses = [
    {
      level: "Beginner",
      title: "Introduction to Lightweight Cryptography",
      description: "A complete journey from cryptography basics to understanding how ASCON secures IoT devices.",
      status: "completed",
      modules: [
        {
          title: "The IoT Problem",
          icon: Network,
          shortAnswer: "IoT devices (sensors, wearables, smart locks) have limited CPU, RAM, battery, and storage. Traditional algorithms like AES are too heavy. Lightweight cryptography provides strong security with minimal resources.",
          context: "The Internet of Things (IoT) connects billions of devices with severely limited resources: constrained CPU, tiny RAM, small storage, and battery power lasting months or years. Traditional cryptographic algorithms like AES demand substantial memory and many CPU cycles per byte. On a simple ESP32 microcontroller, running standard AES can drain a battery in days instead of months. Lightweight cryptography solves this by providing strong security with minimal resource requirements.\n\nLEARNING OBJECTIVE: Understand why IoT devices cannot use traditional cryptography.\n\nKEY TAKEAWAY: IoT devices have limited CPU, memory, battery, and storage, making traditional cryptographic algorithms too expensive. Lightweight cryptography is the solution."
        },
        {
          title: "What is ASCON?",
          icon: Fingerprint,
          shortAnswer: "ASCON is a lightweight authenticated encryption algorithm selected by NIST in 2023 as the global standard. It provides confidentiality and integrity using simple bitwise operations, requiring only ~64 bytes of RAM.",
          context: "ASCON is a family of lightweight cryptographic algorithms designed for resource-constrained environments. It provides both confidentiality (encryption) and integrity (authentication) in a single, efficient package. NIST selected it in 2023 as the global standard for lightweight cryptography. Its internal operations use simple bitwise instructions (AND, NOT, XOR) natively supported by even the simplest microprocessors.\n\nLEARNING OBJECTIVE: Understand what ASCON is and why it was standardized.\n\nKEY TAKEAWAY: ASCON is NIST's standardized lightweight AEAD algorithm, optimized for constrained devices while providing strong security."
        },
        {
          title: "Sponge Construction",
          icon: Binary,
          shortAnswer: "ASCON uses a sponge architecture that absorbs input data into a 320-bit state and squeezes output. The state acts like a mathematical mixing bowl with permutations scrambling it.",
          context: "ASCON uses a sponge construction inspired by how a kitchen sponge works. It maintains a 320-bit internal state. During the absorb phase, input data is mixed into the state through a permutation function. During the squeeze phase, output is extracted. The permutation repeatedly scrambles the state, making reversal practically impossible. The same structure works for encryption, hashing, and other operations.\n\nLEARNING OBJECTIVE: Understand how the sponge construction works conceptually.\n\nKEY TAKEAWAY: The sponge construction absorbs data into a 320-bit state and squeezes output, providing flexibility and security through repeated permutations."
        },
        {
          title: "What is Cryptography?",
          icon: Shield,
          shortAnswer: "Cryptography secures information by transforming plaintext into unreadable ciphertext using a key. It protects confidentiality, integrity, authentication, and non-repudiation.",
          context: "Cryptography is the science of securing information by transforming it into an unreadable format. Plaintext (readable) becomes ciphertext (scrambled) via encryption with a key. Decryption reverses this. Basic vocabulary: Plaintext, Ciphertext, Encryption, Decryption, Key. The fundamental process: Plaintext -> Encryption + Key -> Ciphertext -> Decryption + Key -> Plaintext.\n\nLEARNING OBJECTIVE: Understand the basic terminology and purpose of cryptography.\n\nKEY TAKEAWAY: Cryptography transforms readable data into unreadable form using a key, ensuring only authorized parties can access the information."
        },
        {
          title: "Why Do We Need Encryption?",
          icon: Lock,
          shortAnswer: "Without encryption, data traveling through networks can be intercepted. Online banking, messaging apps, emails, and IoT devices all need protection from unauthorized access.",
          context: "Encryption is essential because data travels through insecure channels where it can be intercepted. Without encryption, anyone can read your messages, steal your passwords, or access your financial information. Real-world scenarios: online banking, messaging apps, email, IoT devices, cloud storage. Without encryption, digital communication is like sending postcards through the mail.\n\nLEARNING OBJECTIVE: Understand why encryption is critical for digital security.\n\nKEY TAKEAWAY: Encryption protects data in transit and at rest, preventing unauthorized access and ensuring privacy."
        },
        {
          title: "Encryption vs Decryption",
          icon: ArrowRightLeft,
          shortAnswer: "Encryption converts plaintext to ciphertext using a key (locking). Decryption reverses this process (unlocking). They are inverse operations requiring the same key.",
          context: "Encryption and decryption are two halves of the same process. Encryption: Plaintext + Key -> Ciphertext. Decryption: Ciphertext + Key -> Plaintext. Without the correct key, decryption is practically impossible. Example: Plaintext 'HELLO' with key 'SECRET' becomes encrypted '7B#2x' and decrypts back to 'HELLO' with the same key.\n\nLEARNING OBJECTIVE: Understand the difference between encryption and decryption.\n\nKEY TAKEAWAY: Encryption converts plaintext to ciphertext; decryption reverses this process with the same key."
        },
        {
          title: "What is a Cryptographic Key?",
          icon: Key,
          shortAnswer: "A key is secret random data controlling encryption/decryption. Without it, encrypted data is unreadable. Security depends on the key, not the algorithm (Kerckhoffs's principle).",
          context: "A cryptographic key is secret information that controls the encryption and decryption process. Kerckhoffs's principle states security should depend only on the key, not on keeping the algorithm secret. Keys should be random, long (128+ bits), secret, and unique. Symmetric keys (same for both operations) are preferred for IoT because they require less computation.\n\nLEARNING OBJECTIVE: Understand what a cryptographic key is and why it's essential.\n\nKEY TAKEAWAY: A cryptographic key is a secret value that controls encryption/decryption; without it, encrypted data remains unreadable."
        },
        {
          title: "Symmetric Encryption",
          icon: KeyRound,
          shortAnswer: "Same key for both encryption and decryption. Fast, simple, and efficient - ideal for IoT sensors. ASCON is a lightweight symmetric algorithm.",
          context: "Symmetric encryption uses the SAME secret key for both encryption and decryption. Advantages: fast, simple, low resource usage. Limitations: key distribution is challenging, N users need N(N-1)/2 unique key pairs. Examples: AES (heavy for IoT), ASCON (lightweight for constrained devices). For IoT, symmetric encryption like ASCON is preferred.\n\nLEARNING OBJECTIVE: Understand symmetric encryption and its trade-offs.\n\nKEY TAKEAWAY: Symmetric encryption uses one shared key for both operations; it's fast but requires secure key distribution."
        },
        {
          title: "Authentication and Integrity",
          icon: ShieldCheck,
          shortAnswer: "Encryption alone is not enough. Secure communication needs confidentiality (encryption), integrity (no tampering), and authentication (verified sender).",
          context: "Even with encrypted communication, integrity attacks can modify messages and authentication attacks can impersonate senders. The three pillars of secure communication: Confidentiality (keeps data secret), Integrity (ensures no modification), Authentication (verifies sender). Authenticated Encryption (AE) provides all three simultaneously.\n\nLEARNING OBJECTIVE: Understand why encryption alone is insufficient for security.\n\nKEY TAKEAWAY: Secure communication requires confidentiality, integrity, and authentication - not just encryption alone."
        },
        {
          title: "What is Authenticated Encryption?",
          icon: ShieldPlus,
          shortAnswer: "AE combines encryption with authentication in one operation. It encrypts plaintext AND generates a tag proving the message was not modified and came from the correct key holder.",
          context: "Authenticated Encryption (AE) provides both confidentiality AND integrity in one operation. It encrypts the message AND generates an authentication tag. The tag proves: the message was encrypted with the correct key (authenticity) and hasn't been modified (integrity). If an attacker changes even one bit, tag verification fails.\n\nLEARNING OBJECTIVE: Understand how AE combines encryption with authentication.\n\nKEY TAKEAWAY: AE provides confidentiality, integrity, and authenticity in one operation using an authentication tag."
        },
        {
          title: "What is AEAD?",
          icon: Layers,
          shortAnswer: "AEAD encrypts plaintext while authenticating additional data that stays readable. Example: network headers (AD - readable) and payload (encrypted), both covered by one tag.",
          context: "AEAD (Authenticated Encryption with Associated Data) allows some data to be authenticated but NOT encrypted. Examples: network packet headers (must be readable for routing), device identifiers, timestamps. AEAD components: Plaintext (encrypted), Associated Data (authenticated only), Key, Nonce. Output: Ciphertext + Authentication Tag covering both.\n\nLEARNING OBJECTIVE: Understand AEAD and the role of associated data.\n\nKEY TAKEAWAY: AEAD encrypts plaintext while authenticating additional data that must remain readable."
        },
        {
          title: "What is a Nonce?",
          icon: Hash,
          shortAnswer: "A nonce (Number used ONCE) ensures unique ciphertext for identical plaintexts. Same message with different nonces produces completely different ciphertext. Never reuse nonces.",
          context: "A nonce is a unique value that must never be repeated for the same key. Without it, same plaintext + same key = same ciphertext, enabling pattern attacks. With different nonces, identical plaintexts produce completely different ciphertexts. Requirements: uniqueness, unpredictable, proper size. Never reuse nonces with the same key.\n\nLEARNING OBJECTIVE: Understand the purpose and importance of nonces.\n\nKEY TAKEAWAY: A nonce ensures identical plaintexts produce different ciphertexts, preventing pattern analysis attacks."
        },
        {
          title: "What is Associated Data?",
          icon: FileText,
          shortAnswer: "Associated Data needs integrity protection but NOT confidentiality. Examples: network headers, device IDs, timestamps. Both AD and ciphertext are covered by one authentication tag.",
          context: "Associated Data (AD) travels alongside encrypted data and is authenticated (verified for tampering) but remains readable. Why: network headers need addresses visible, device IDs must be identifiable. How it works: AD -> Authentication only, Plaintext -> Encryption + Authentication. The authentication tag covers both ciphertext AND associated data.\n\nLEARNING OBJECTIVE: Understand what associated data is and why it's used.\n\nKEY TAKEAWAY: Associated data provides integrity protection for information that must remain readable."
        },
        {
          title: "What is Lightweight Cryptography?",
          icon: Feather,
          shortAnswer: "Lightweight cryptography provides strong security with minimal resources. Unlike AES (~200 bytes RAM), algorithms like ASCON (~64 bytes RAM) use simple bitwise operations.",
          context: "Lightweight cryptography is designed for resource-constrained devices. Traditional algorithms need significant memory, CPU cycles, and energy. These requirements are impossible for tiny IoT devices. Lightweight solutions use smaller state sizes, simple operations (bitwise AND, XOR, NOT), fewer rounds, and minimal memory. AES: ~200 bytes RAM, ~1000 cycles/byte. ASCON: ~64 bytes RAM, ~100 cycles/byte.\n\nLEARNING OBJECTIVE: Understand what makes cryptography lightweight and why it's needed.\n\nKEY TAKEAWAY: Lightweight cryptography provides strong security with minimal resource usage."
        },
        {
          title: "Why Lightweight Cryptography for IoT?",
          icon: Cpu,
          shortAnswer: "IoT devices have 8-bit CPUs, kilobytes of RAM, and battery constraints. Traditional crypto fails - lightweight crypto provides security within hardware limitations.",
          context: "IoT devices include sensors, smart locks, wearables, medical devices, embedded systems, and smart home devices. They have severe constraints: CPU limitations (8-bit processors), memory constraints (2KB RAM cannot store AES tables), battery life (heavy computation drains batteries in days), storage limits (small flash memory). Lightweight crypto solves these by using simple bitwise operations, minimal RAM, minimal energy, and small code size.\n\nLEARNING OBJECTIVE: Understand why IoT specifically needs lightweight cryptography.\n\nKEY TAKEAWAY: IoT devices have severe resource constraints; lightweight cryptography provides security within these limitations."
        },
        {
          title: "Why Was ASCON Selected?",
          icon: Trophy,
          shortAnswer: "NIST chose ASCON in 2023 over 56 competitors for its exceptional balance: strong security, efficiency, minimal resources, and simplicity (bitwise operations only).",
          context: "NIST selected ASCON in 2023 over 56 candidates because it excels in every area: Security (resisted all attacks), Efficiency (100+ cycles/byte on ESP32), Minimal Resources (64 bytes RAM), Authenticated Encryption (AEAD built-in), Flexibility (AEAD, Hash, XOF from same permutation), and Simplicity (AND, NOT, XOR, rotation natively supported).\n\nLEARNING OBJECTIVE: Understand why ASCON was chosen as the lightweight cryptography standard.\n\nKEY TAKEAWAY: ASCON was selected for its exceptional balance of security, efficiency, and simplicity."
        },
        {
          title: "ASCON Variants",
          icon: Layers,
          shortAnswer: "ASCON-AEAD128 encrypts and authenticates. ASCON-Hash256 creates 256-bit fingerprints. ASCON-XOF128 generates arbitrary-length output. All share the same 320-bit permutation.",
          context: "ASCON is a family of functions built around the same core permutation. ASCON-AEAD128: Key + Nonce + AD + Plaintext -> Ciphertext + Tag (128 bits). ASCON-Hash256: Message -> 256-bit hash fingerprint. ASCON-XOF128: Seed -> variable-length output. All use the same 320-bit permutation for consistent security.\n\nLEARNING OBJECTIVE: Understand the different ASCON variants and their purposes.\n\nKEY TAKEAWAY: ASCON includes AEAD, Hash, and XOF, all built on the same secure permutation."
        },
        {
          title: "ASCON Encryption: Big Picture",
          icon: Lock,
          shortAnswer: "Four steps: (1) Initialize with Key+Nonce and p^12 permutation, (2) Process Associated Data, (3) Encrypt Plaintext, (4) Finalize to produce Ciphertext + Authentication Tag.",
          context: "ASCON encryption: (1) INITIALIZATION - Load Key+Nonce, apply p^12 permutation, XOR Key for domain separation. (2) AD PROCESSING - Absorb Associated Data with permutations between blocks. (3) PLAINTEXT PROCESSING - Absorb plaintext, extract ciphertext. (4) FINALIZATION - XOR Key, apply p^12, extract Authentication Tag. Output: Ciphertext + Tag.\n\nLEARNING OBJECTIVE: Understand the complete ASCON encryption process at a high level.\n\nKEY TAKEAWAY: ASCON encryption initializes with Key+Nonce, processes AD, encrypts plaintext, and finalizes to produce Ciphertext + Authentication Tag."
        },
        {
          title: "ASCON Decryption: Big Picture",
          icon: Unlock,
          shortAnswer: "Same as encryption, but the authentication tag is VERIFIED before accepting plaintext. If tags do not match, the message is rejected (tampering detected).",
          context: "ASCON decryption reverses encryption with one critical addition: it VERIFIES the authentication tag before accepting the decrypted message. Same initialization and AD processing. Ciphertext is absorbed to recover plaintext. If tags match: accept plaintext. If different: reject message (tampering detected). This ensures integrity and authenticity.\n\nLEARNING OBJECTIVE: Understand how ASCON decryption differs from encryption.\n\nKEY TAKEAWAY: ASCON decryption verifies the authentication tag before accepting plaintext, ensuring integrity and authenticity."
        },
        {
          title: "What is the ASCON State?",
          icon: Grid,
          shortAnswer: "The 320-bit internal memory (40 bytes) divided into five 64-bit words (S0-S4). It holds all data during cryptographic operations.",
          context: "The ASCON state is the internal memory for all cryptographic operations. Structure: 320 bits total (40 bytes), divided into five 64-bit words (S0, S1, S2, S3, S4). Why 320 bits: large enough for 128-bit security, small enough for minimal memory, efficient on 64-bit processors. The state is modified at each step: initialized with Key+Nonce, mixed with AD and plaintext, finalized to produce the tag.\n\nLEARNING OBJECTIVE: Understand what the ASCON state is and its basic structure.\n\nKEY TAKEAWAY: The ASCON state is a 320-bit working area divided into five 64-bit words."
        },
        {
          title: "What is an ASCON Permutation?",
          icon: RefreshCw,
          shortAnswer: "A deterministic function that completely scrambles the 320-bit state. Used with p^12 for heavy mixing and p^6 between blocks. Provides diffusion, confusion, and avalanche effect.",
          context: "The ASCON permutation is a mathematical function that completely scrambles the 320-bit state. It is deterministic (same input -> same output) and practically irreversible. Used with p^12 (12 rounds) for heavy mixing during initialization/finalization, and p^6 (6 rounds) between data blocks. Provides diffusion (output depends on many input bits), confusion (complex key-ciphertext relationship), and avalanche effect.\n\nLEARNING OBJECTIVE: Understand the role of the permutation in ASCON.\n\nKEY TAKEAWAY: The ASCON permutation scrambles the 320-bit state, providing the security foundation for all ASCON functions."
        }
      ]
    },
    {
      level: "Intermediate",
      title: "The 320-Bit State Matrix",
      description: "Dive into how ASCON processes data structurally using 64-bit bounds and word limits.",
      status: "completed",
      modules: [
        { title: "Matrix Structure", icon: Binary, shortAnswer: "The 320-bit state is five 64-bit integers allowing Bitsliced S-Boxes to operate.", context: "The 320-bit state is five standard 64-bit integers: x0, x1, x2, x3, x4. This specific vertical orientation allows Bitsliced S-Boxes to operate." },
        { title: "Nonce & Initialization", icon: Fingerprint, shortAnswer: "128-bit Key and Nonce absorbed into the state, followed by a 12-round permutation.", context: "During initialization, a 128-bit Key and 128-bit Nonce are absorbed into the state alongside an Initialization Vector, followed by a heavy 12-round permutation (p^12) to destroy all linearity." }
      ]
    },
    {
      level: "Advanced",
      title: "Substitution & Linear Diffusion",
      description: "Explore the core permutation layers mapping non-linear S-Boxes across bitslices.",
      status: "in-progress",
      modules: [
        { title: "Non-Linearity (S-Box)", icon: Network, shortAnswer: "The only non-linear component using algebraic degree 2 functions.", context: "The only non-linear component of ASCON. Bits are substituted vertically relying on Algebraic degree 2 functions. It provides confusion." },
        { title: "Right Rotations (ROTR)", icon: Network, shortAnswer: "Linear diffusion achieved by rotating 64-bit words by specific bounds.", context: "Linear diffusion is achieved by rotating the 64-bit words by specific asymmetrical integer bounds (e.g., x0 >>> 19 ^ x0 >>> 28). This forces bits to quickly bleed across the columns." }
      ]
    },
    {
      level: "Expert",
      title: "Attacking ASCON",
      description: "Analyze rotational cryptanalysis and evaluate the strict avalanche criterion bounds.",
      status: "locked",
      modules: [
        { title: "Bit-Flip Attacks", icon: Fingerprint, shortAnswer: "Locked until intermediate modules are completed.", context: "Locked until intermediate modules verify XP bounds." }
      ]
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
           <GraduationCap className="w-8 h-8 text-purple-400" />
           Interactive Learning Curriculum
        </h1>
        <p className="text-zinc-400">Deep, structural explanations governing ASCON cryptographic parameters.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Path Map */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {courses.map((course, idx) => (
            <div 
              key={idx}
              onClick={() => {
                if(course.status !== "locked") {
                  setActiveCourse(idx);
                  setActiveLessonContext(null);
                  setExpandedModule(null);
                }
              }}
              className={`p-5 rounded-2xl border transition-all ${activeCourse === idx ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.15)] overflow-hidden' : 'bg-[#09090b] border-white/10 hover:bg-white/5'} ${course.status === "locked" ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${activeCourse === idx ? 'text-purple-400' : 'text-zinc-500'}`}>
                  {course.level}
                </span>
                {course.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
                {course.status === "in-progress" && <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-purple-500"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" /></span>}
                {course.status === "locked" && <Lock className="w-4 h-4 text-zinc-600" />}
              </div>
              <h3 className="font-bold text-white mb-1">{course.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{course.description}</p>
            </div>
          ))}
        </div>

        {/* Active Course View */}
        <div className="w-full md:w-2/3 bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="mb-6">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">{courses[activeCourse].level} Reading</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">{courses[activeCourse].title}</h2>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {!activeLessonContext ? (
               <>
                 <h4 className="text-zinc-300 font-medium mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Select a specialized module</h4>
                 {courses[activeCourse].modules.map((mod, i) => (
                    <motion.div 
                      key={i}
                      className={`group flex flex-col justify-center p-5 rounded-xl bg-black border transition-all relative overflow-hidden ${expandedModule === i ? 'border-purple-500/50' : 'border-white/10 hover:border-white/20'}`}
                    >
                      <div 
                        className="flex items-center gap-4 relative z-10 cursor-pointer"
                        onClick={() => setExpandedModule(expandedModule === i ? null : i)}
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/20 text-purple-400 shrink-0">
                           <mod.icon className="w-5 h-5" />
                        </div>
                        <span className="text-lg text-zinc-200 font-bold group-hover:text-purple-300 transition-colors">{mod.title}</span>
                        <ChevronRight className={`w-5 h-5 text-zinc-600 ml-auto group-hover:text-purple-400 transition-all ${expandedModule === i ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                      </div>
                      <AnimatePresence>
                        {expandedModule === i && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-14 mt-4 text-base text-zinc-300 leading-relaxed border-t border-white/5 pt-4">
                              <p className="mb-4">{mod.shortAnswer}</p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveLessonContext(mod.context);
                                }}
                                className="flex items-center gap-2 text-base font-semibold text-purple-400 hover:text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors w-fit"
                              >
                                <Play className="w-4 h-4 fill-current" /> Deep Dive
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                 ))}
               </>
            ) : (
                  <RoboExplainer 
                    text={activeLessonContext} 
                    onBack={() => setActiveLessonContext(null)} 
                  />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
