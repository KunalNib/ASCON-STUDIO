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
  INPUT_PARAMETERS: {
    seeing:   "The initial setup: sensor data, 128-bit Key, 128-bit Nonce, and Associated Data.",
    insight:  "ASCON operates on binary data. Nonce reuse with the same Key is catastrophic. AD is authenticated but not encrypted.",
    watchFor: "The XP badge top-right of the canvas! Answer each step's challenge to earn up to 900 XP total.",
    color: "blue",
  },
  STATE_INITIALIZATION: {
    seeing:   "The 320-bit state (x0–x4) being formed from IV, Key, and Nonce, then scrambled by the 12-round pa permutation.",
    insight:  "After 12 rounds, the key and nonce are mathematically inseparable — fused into every bit of the state.",
    watchFor: "How drastically all 5 words change. Before: structured IV/Key/Nonce layout. After: completely indistinguishable scramble.",
    color: "emerald",
  },
  AD_PROCESSING: {
    seeing:   "Associated Data being absorbed into the state and processed with pb permutations.",
    insight:  "This binds the context (like device IDs) cryptographically to the ciphertext without hiding them.",
    watchFor: "Any change to AD will invalidate the final authentication tag, ensuring integrity.",
    color: "amber",
  },
  PLAINTEXT_ENCRYPTION: {
    seeing:   "Plaintext XORing into x0 to create ciphertext, followed by the core permutation (pc → ps → pl).",
    insight:  "This is the heart of ASCON. Plaintext is encrypted, while simultaneously being absorbed into the state for authentication.",
    watchFor: "The Avalanche Effect in linear diffusion (pl) and non-linearity in substitution (ps).",
    color: "cyan",
  },
  FINALIZATION: {
    seeing:   "Key injected into the capacity words, pa runs 12 rounds, then the Key is injected a second time.",
    insight:  "This 'key sandwich' (Key ⊕ → pa → ⊕ Key) prevents length-extension attacks.",
    watchFor: "The state transformation before and after pa. The final state's lower words (x3, x4) will become the authentication tag.",
    color: "rose",
  },
  AUTH_OUTPUT: {
    seeing:   "State words x3 and x4 XORed with the secret key to produce the 128-bit Authentication Tag, alongside ciphertext.",
    insight:  "Change ANY bit of plaintext or Associated Data at any point — the tag changes completely and unpredictably.",
    watchFor: "Tag = (Key ⊕ x3) || (Key ⊕ x4). This 16-byte value travels alongside the ciphertext and is verified at decryption.",
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

  const content = GUIDE_CONTENT[step];
  if (isDismissed || !content) return null;

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
                {(["INPUT_PARAMETERS","STATE_INITIALIZATION","AD_PROCESSING","PLAINTEXT_ENCRYPTION","FINALIZATION","AUTH_OUTPUT"] as NarrativeStep[]).map((s) => (
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
