"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Bot, Eye, Lightbulb, Search, ChevronDown, ChevronUp, X, Crosshair } from "lucide-react";
import { NarrativeStep } from "@/store/useAsconStore";
import { SpotlightGuide, ANNOTATIONS } from "@/components/studio/SpotlightGuide";

// ─── Per-step guide content ───────────────────────────────────────────────────

interface GuideContent {
  seeing: string;
  insight: string;
  watchFor: string;
  color: "blue" | "emerald" | "amber" | "rose" | "purple" | "cyan" | "orange" | "violet" | "yellow";
}

const COLOR_MAP: Record<GuideContent["color"], { border: string; glow: string; dot: string; badge: string }> = {
  blue:   { border: "border-blue-500/30",   glow: "shadow-[0_0_20px_rgba(59,130,246,0.15)]",   dot: "bg-blue-500",   badge: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  emerald:{ border: "border-emerald-500/30", glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",   dot: "bg-emerald-500",badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  amber:  { border: "border-amber-500/30",   glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",   dot: "bg-amber-500",  badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  rose:   { border: "border-rose-500/30",    glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]",    dot: "bg-rose-500",   badge: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
  purple: { border: "border-purple-500/30",  glow: "shadow-[0_0_20px_rgba(168,85,247,0.15)]",   dot: "bg-purple-500", badge: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  cyan:   { border: "border-cyan-500/30",    glow: "shadow-[0_0_20px_rgba(6,182,212,0.15)]",    dot: "bg-cyan-500",   badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
  orange: { border: "border-orange-500/30",  glow: "shadow-[0_0_20px_rgba(249,115,22,0.15)]",   dot: "bg-orange-500", badge: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
  violet: { border: "border-violet-500/30",  glow: "shadow-[0_0_20px_rgba(139,92,246,0.15)]",   dot: "bg-violet-500", badge: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  yellow: { border: "border-yellow-500/30",  glow: "shadow-[0_0_20px_rgba(234,179,8,0.15)]",    dot: "bg-yellow-500", badge: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
};

const GUIDE_CONTENT: Record<NarrativeStep, GuideContent> = {
  INTRODUCTION: {
    seeing:   "The launch screen — no cryptographic operation has happened yet.",
    insight:  "ASCON is an AEAD cipher: one single pass simultaneously encrypts data AND produces a tamper-proof authentication tag.",
    watchFor: "The XP badge top-right of the canvas! Answer each step's challenge to earn up to 900 XP total.",
    color: "blue",
  },
  SENSOR_DATA: {
    seeing:   "Real-time temperature data from the ESP32 IoT sensor node, displayed as raw plaintext.",
    insight:  "'Plaintext' means anyone on the same network can read it. A passive attacker intercepts exactly what you see here.",
    watchFor: "The 'Unencrypted — Vulnerable' badge. After encryption, the ciphertext bears no resemblance to this value.",
    color: "rose",
  },
  PREPARE_DATA: {
    seeing:   "The ASCII string being tokenized byte-by-byte into hex pairs (e.g., '2' → 0x32, '7' → 0x37).",
    insight:  "Cryptographic operations are pure math — they need binary numbers, not characters. This step bridges the gap.",
    watchFor: "The degree symbol (°) encodes as TWO bytes: 0xC2 0xB0 — UTF-8 uses variable-length encoding for non-ASCII.",
    color: "amber",
  },
  CRYPTO_PARAMS: {
    seeing:   "Three cryptographic parameters loading: the 128-bit Secret Key, the 128-bit Nonce, and the Associated Data string.",
    insight:  "The Nonce (Number used ONCE) can be public — it only prevents ciphertext re-use. Reusing it with the same Key is catastrophic.",
    watchFor: "Associated Data is authenticated but NOT encrypted. It binds context (like device IDs) to the ciphertext without hiding them.",
    color: "purple",
  },
  INITIAL_STATE: {
    seeing:   "Five 64-bit words (x0–x4) forming the complete 320-bit ASCON internal state matrix, colour-coded by role.",
    insight:  "This is the blank canvas. Hover any word to inspect its exact content and purpose. All mixing happens from this starting point.",
    watchFor: "x0 (blue) = IV, x1–x2 (amber) = Key halves, x3–x4 (rose) = Nonce halves. The layout is fixed by the ASCON specification.",
    color: "blue",
  },
  INITIALIZATION: {
    seeing:   "The pa permutation (12 full rounds of pc + ps + pl) scrambling all 320 bits completely.",
    insight:  "After 12 rounds, the key and nonce are mathematically inseparable — fused into every bit of the state.",
    watchFor: "How drastically all 5 words change. Before: structured IV/Key/Nonce layout. After: completely indistinguishable scramble.",
    color: "emerald",
  },
  PERMUTATION: {
    seeing:   "One complete permutation round executing all three sub-layers in sequence: pc → ps → pl.",
    insight:  "This exact triplet repeats 6 or 12 times per call. The fixed order and round-specific constants are defined in the ASCON spec.",
    watchFor: "Round Constant Addition (pc) happens FIRST — it breaks any rotational symmetry before the non-linear S-box sees the state.",
    color: "cyan",
  },
  SUBSTITUTION: {
    seeing:   "The 5-bit S-box being applied 64 times — once per vertical column across the five 64-bit words.",
    insight:  "This is the ONLY non-linear operation in ASCON. Non-linearity is essential — linear ciphers can be broken with linear algebra.",
    watchFor: "Each 5-bit input maps to a unique 5-bit output (bijective). No two distinct inputs produce the same output.",
    color: "orange",
  },
  DIFFUSION: {
    seeing:   "Each of the five words being XORed with two rotated copies of itself to spread bit influence across all positions.",
    insight:  "Rotation constants differ per word: x0 uses (19, 28), x1 uses (61, 39), x2 uses (1, 6), x3 uses (10, 17), x4 uses (7, 41).",
    watchFor: "The Avalanche Effect — changing one bit would affect ~32 of 64 positions after this layer. That's rapid diffusion.",
    color: "violet",
  },
  PLAINTEXT_PROCESSING: {
    seeing:   "Plaintext bytes being XORed into the rate word x0, yielding ciphertext. Then pb permutation updates the state.",
    insight:  "XOR is its own inverse — decryption uses the identical operation. The same keystream that encrypts also decrypts.",
    watchFor: "ONLY the rate word (x0) participates. The capacity words (x1–x4) never touch plaintext — they're the secret integrity engine.",
    color: "blue",
  },
  FINALIZATION: {
    seeing:   "Key injected into the capacity words, pa runs 12 rounds, then the Key is injected a second time.",
    insight:  "This 'key sandwich' (Key ⊕ → pa → ⊕ Key) prevents length-extension attacks — a known vulnerability in simpler hash constructions.",
    watchFor: "The state transformation before and after pa. The final state's lower words (x3, x4) will become the authentication tag.",
    color: "rose",
  },
  AUTH_TAG: {
    seeing:   "State words x3 and x4 XORed with the secret key to produce the 128-bit Authentication Tag.",
    insight:  "Change ANY bit of plaintext or Associated Data at any point — the tag changes completely and unpredictably.",
    watchFor: "Tag = (Key ⊕ x3) || (Key ⊕ x4). This 16-byte value travels alongside the ciphertext and is verified at decryption.",
    color: "emerald",
  },
  FINAL_RESULT: {
    seeing:   "Your fully encrypted and authenticated result — ciphertext plus a 128-bit authentication tag — ready for transmission.",
    insight:  "You've just walked through the full ASCON-128 AEAD pipeline exactly as standardised by NIST in 2023!",
    watchFor: "Your mission score. Higher XP means you engaged deeply with each concept. Perfect score = ASCON Master. 🏆",
    color: "yellow",
  },
};

// ─── Row component ─────────────────────────────────────────────────────────────

interface RowProps {
  icon: React.ReactNode;
  label: string;
  text: string;
  delay: number;
}

function GuideRow({ icon, label, text, delay }: RowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex gap-2.5"
    >
      <div className="w-5 h-5 shrink-0 mt-0.5 text-zinc-400">{icon}</div>
      <div>
        <div className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-0.5">{label}</div>
        <p className="text-[11px] text-zinc-300 leading-snug">{text}</p>
      </div>
    </motion.div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface ProcessGuideProps {
  step: NarrativeStep;
}

export function ProcessGuide({ step }: ProcessGuideProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);

  if (isDismissed) return null;

  const content = GUIDE_CONTENT[step];
  const { border, glow, dot, badge } = COLOR_MAP[content.color];
  const hasSpotlight = !!(ANNOTATIONS as any)[step];

  const stepLabel = step.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="absolute bottom-3 left-3 z-10 w-[280px]">
      <AnimatePresence mode="wait">
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className={`bg-[#0a0a0e]/90 backdrop-blur-xl border ${border} rounded-2xl overflow-hidden ${glow}`}
          >
            {/* Thin color bar */}
            <div className={`h-0.5 w-full ${dot.replace("bg-", "bg-")}`} />

            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-2">
                {/* Animated bot icon */}
                <div className="relative">
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                    className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 border border-blue-500/30 flex items-center justify-center"
                  >
                    <Bot className="w-3.5 h-3.5 text-blue-400" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400"
                  />
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold leading-none">Visual Guide</div>
                  <div className={`text-[9px] font-bold mt-0.5 ${badge.split(" ")[1]}`}>
                    {stepLabel}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Content rows — animate on step change */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3"
              >
                <GuideRow
                  icon={<Eye className="w-full h-full" />}
                  label="What you're seeing"
                  text={content.seeing}
                  delay={0.05}
                />
                <GuideRow
                  icon={<Lightbulb className="w-full h-full text-amber-400" />}
                  label="Key insight"
                  text={content.insight}
                  delay={0.12}
                />
                <GuideRow
                  icon={<Search className="w-full h-full text-cyan-400" />}
                  label="Watch for"
                  text={content.watchFor}
                  delay={0.19}
                />
              </motion.div>
            </AnimatePresence>

            {/* Step indicator dots */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-1">
                {(["INTRODUCTION","SENSOR_DATA","PREPARE_DATA","CRYPTO_PARAMS","INITIAL_STATE",
                   "INITIALIZATION","PERMUTATION","SUBSTITUTION","DIFFUSION","PLAINTEXT_PROCESSING",
                   "FINALIZATION","AUTH_TAG","FINAL_RESULT"] as NarrativeStep[]).map((s) => (
                  <div
                    key={s}
                    className={`rounded-full transition-all duration-300 ${
                      s === step
                        ? `w-4 h-1.5 ${dot}`
                        : "w-1.5 h-1.5 bg-zinc-700"
                    }`}
                  />
                ))}
              </div>

              {/* Spotlight trigger button */}
              {hasSpotlight && (
                <motion.button
                  onClick={() => setIsSpotlightOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all text-[10px] font-bold"
                >
                  <Crosshair className="w-3 h-3" />
                  Point at it
                </motion.button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Collapsed pill */
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className={`flex items-center gap-2 px-3 py-2 bg-[#0a0a0e]/90 backdrop-blur-xl border ${border} rounded-xl ${glow} hover:bg-white/5 transition-all group`}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-5 h-5 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center"
            >
              <Bot className="w-3 h-3 text-blue-400" />
            </motion.div>
            <span className="text-[11px] text-zinc-400 font-bold group-hover:text-white transition-colors">
              Visual Guide
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Spotlight portal — rendered when "Point at it" is clicked */}
      {isSpotlightOpen && (
        <SpotlightGuide step={step} onClose={() => setIsSpotlightOpen(false)} />
      )}
    </div>
  );
}
