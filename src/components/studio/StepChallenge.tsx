"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Zap,
  RotateCcw,
  Eye,
  Target,
  ChevronRight,
  Star,
} from "lucide-react";
import { useAsconStore, NarrativeStep } from "@/store/useAsconStore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

// ─── Types ────────────────────────────────────────────────────────────────────

type ChallengeType = "MCQ" | "CLICK_CORRECT";
type ChallengePhase = "selecting" | "wrong" | "success" | "revealed";

interface Option {
  label: string;
  correct: boolean;
}

export interface StepChallengeData {
  type: ChallengeType;
  question: string;
  options: Option[];
  xpReward: number;
  hint: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// ─── Challenge definitions (12 steps, max 900 XP total) ───────────────────────

export const STEP_CHALLENGES: Partial<Record<NarrativeStep, StepChallengeData>> = {
  INPUT_PARAMETERS: {
    type: "MCQ",
    question:
      "What is the catastrophic consequence of encrypting two DIFFERENT messages with the exact same Key AND Nonce in ASCON-128?",
    options: [
      { label: "The output ciphertexts are identical and easily spotted", correct: false },
      { label: "Encryption fails and throws an error", correct: false },
      { label: "An attacker can XOR the two ciphertexts to recover plaintext — a complete break", correct: true },
      { label: "The authentication tag doubles in length for extra safety", correct: false },
    ],
    xpReward: 225,
    hint: "Nonce means 'Number used ONCE'. XORing two stream-cipher outputs with the same keystream cancels it out.",
    explanation:
      "Nonce reuse is catastrophic: C1 ⊕ C2 = (P1 ⊕ KS) ⊕ (P2 ⊕ KS) = P1 ⊕ P2. The keystream cancels, giving the attacker plaintext XOR plaintext — enough to recover both messages. Never reuse (Key, Nonce) pairs.",
    difficulty: "Medium",
  },
  STATE_INITIALIZATION: {
    type: "CLICK_CORRECT",
    question:
      "The 320-bit ASCON state has 5 words: x0–x4. Select ALL words that contain Nonce bits during initialization.",
    options: [
      { label: "x0 — Initialization Vector (IV)", correct: false },
      { label: "x1 — Key[0:63] (lower 64 bits)", correct: false },
      { label: "x2 — Key[64:127] (upper 64 bits)", correct: false },
      { label: "x3 — Nonce[0:63] (lower 64 bits)", correct: true },
      { label: "x4 — Nonce[64:127] (upper 64 bits)", correct: true },
    ],
    xpReward: 150,
    hint: "The 128-bit nonce is too large for a single 64-bit word.",
    explanation:
      "The 128-bit nonce is split across x3 (bits 0–63) and x4 (bits 64–127). x0 holds the IV, x1 and x2 hold the 128-bit key split similarly. The pa (12 rounds) permutation then heavily scrambles this state.",
    difficulty: "Medium",
  },
  AD_PROCESSING: {
    type: "MCQ",
    question:
      "Why is Associated Data (AD) absorbed into the internal state before plaintext encryption?",
    options: [
      { label: "To encrypt the AD alongside the plaintext", correct: false },
      { label: "To cryptographically bind the AD to the state, ensuring any tampering invalidates the final authentication tag", correct: true },
      { label: "To increase the length of the authentication tag", correct: false },
      { label: "To provide initial randomness to the state", correct: false },
    ],
    xpReward: 75,
    hint: "AD is never encrypted, but it still needs to be protected against modification.",
    explanation:
      "Associated Data is public (like routing headers) and remains unencrypted. Absorbing it into the state cryptographically binds it to the encryption process. If an attacker changes even one bit of the AD, the final authentication tag will completely fail to verify.",
    difficulty: "Medium",
  },
  PLAINTEXT_ENCRYPTION: {
    type: "MCQ",
    question:
      "During the core Permutation, ASCON's linear diffusion computes: xᵢ ← xᵢ ⊕ (xᵢ >>> a) ⊕ (xᵢ >>> b). What cryptographic property does this guarantee?",
    options: [
      { label: "Key independence — diffusion does not touch the secret key", correct: false },
      { label: "Avalanche effect — a single changed bit spreads across all 64 positions of the word", correct: true },
      { label: "Compression — two 64-bit words merge into one output", correct: false },
      { label: "Non-linearity — it thwarts linear cryptanalysis alone", correct: false },
    ],
    xpReward: 300,
    hint: "Think about what XORing a value with two different rotations of itself does to a single flipped bit.",
    explanation:
      "The rotate-XOR ensures any single changed bit influences every other bit position within that word. This is the Avalanche Effect. Combined with the S-box substitution across words, ASCON achieves full state diffusion rapidly.",
    difficulty: "Hard",
  },
  FINALIZATION: {
    type: "MCQ",
    question:
      "During Finalization, what prevents an attacker from computing the authentication tag without knowing the secret key?",
    options: [
      { label: "The state is AES-encrypted before tag extraction", correct: false },
      { label: "The Key is XORed into the state, pa runs (12 rounds), then the Key is XORed again", correct: true },
      { label: "The nonce is reversed and mixed with the final state words", correct: false },
      { label: "The ciphertext is SHA-256 hashed to form the tag", correct: false },
    ],
    xpReward: 75,
    hint: "The key is injected twice — sandwich-style around the final permutation.",
    explanation:
      "Finalization: ① Key ⊕ state (capacity words), ② pa permutation (12 rounds), ③ Key ⊕ final words → tag. This double key injection ensures that without the secret key, computing the state trajectory leading to the tag is computationally infeasible.",
    difficulty: "Medium",
  },
  AUTH_OUTPUT: {
    type: "CLICK_CORRECT",
    question:
      "The 128-bit Authentication Tag is extracted from specific state words. Select ALL words that form the tag.",
    options: [
      { label: "x0 — Rate word (public)", correct: false },
      { label: "x1 — Rate word (public)", correct: false },
      { label: "x2 — Capacity word", correct: false },
      { label: "x3 — Tag bits [0:63]", correct: true },
      { label: "x4 — Tag bits [64:127]", correct: true },
    ],
    xpReward: 75,
    hint: "The tag comes from the secret capacity portion — words never directly exposed to external data.",
    explanation:
      "Tag = (Key ⊕ x3) ‖ (Key ⊕ x4). The tag is extracted from x3 and x4 (the capacity words) XORed with the key. Because capacity words are never directly exposed to plaintext/ciphertext, they remain secret.",
    difficulty: "Medium",
  },
};

// ─── Difficulty badge colours ──────────────────────────────────────────────────

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy:   "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  Medium: "bg-amber-500/20   text-amber-400   border-amber-500/30",
  Hard:   "bg-red-500/20     text-red-400     border-red-500/30",
};

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  step: NarrativeStep;
  onClose: () => void;
}

export function StepChallenge({ step, onClose }: Props) {
  const challenge = STEP_CHALLENGES[step];
  const { addEncryptionXp, markStepComplete } = useAsconStore();
  const { width, height } = useWindowSize();

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [phase, setPhase] = useState<ChallengePhase>("selecting");
  const [attempts, setAttempts] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!challenge) return null;

  const isMultiSelect = challenge.type === "CLICK_CORRECT";
  const correctSet = new Set(
    challenge.options.map((o, i) => (o.correct ? i : -1)).filter((i) => i !== -1)
  );

  const toggleOption = (idx: number) => {
    if (phase !== "selecting") return;
    if (isMultiSelect) {
      const next = new Set(selected);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      setSelected(next);
    } else {
      setSelected(new Set([idx]));
    }
  };

  const checkAnswer = () => {
    if (selected.size === 0) return;
    const isCorrect =
      selected.size === correctSet.size &&
      [...selected].every((i) => correctSet.has(i));
    if (isCorrect) {
      addEncryptionXp(challenge.xpReward);
      markStepComplete(step);
      setPhase("success");
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3500);
    } else {
      setAttempts((a) => a + 1);
      setPhase("wrong");
    }
  };

  const revealAnswer = () => {
    setSelected(correctSet);
    markStepComplete(step);
    setPhase("revealed");
    // 0 XP for reveal
  };

  const retry = () => {
    setSelected(new Set());
    setPhase("selecting");
  };

  // option style resolution
  const getOptionStyle = (idx: number) => {
    const isSelected = selected.has(idx);
    const isCorrect = correctSet.has(idx);

    if (phase === "success" || phase === "revealed") {
      if (isCorrect)
        return "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
      return "bg-white/[0.03] border-white/10 text-zinc-600 opacity-50";
    }
    if (phase === "wrong") {
      if (isSelected && !isCorrect)
        return "bg-red-500/20 border-red-500 text-red-300";
      if (isSelected && isCorrect)
        return "bg-emerald-500/20 border-emerald-500 text-emerald-300";
      return "bg-white/[0.03] border-white/10 text-zinc-500";
    }
    // selecting phase
    return isSelected
      ? "bg-blue-500/20 border-blue-500 text-blue-200 shadow-[0_0_12px_rgba(59,130,246,0.25)]"
      : "bg-white/[0.04] border-white/10 text-zinc-300 hover:bg-white/[0.08] hover:border-white/20 cursor-pointer";
  };

  const optionLetters = ["A", "B", "C", "D", "E"];
  const maxXp = challenge.xpReward;

  return (
    // Overlay container
    <motion.div
      className="absolute inset-0 z-30 flex items-end justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop blur */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={phase === "success" || phase === "revealed" ? onClose : undefined}
      />

      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          colors={["#3b82f6", "#a855f7", "#10b981", "#f59e0b"]}
        />
      )}

      {/* Challenge Card */}
      <motion.div
        className="relative z-10 w-full max-w-2xl bg-[#0c0c10] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        transition={{ type: "spring", stiffness: 280, damping: 28 }}
      >
        {/* Top gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-500 to-blue-600" />

        <div className="p-6">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                <Target className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-500 uppercase tracking-widest font-bold">
                  Step Challenge
                </div>
                {isMultiSelect && (
                  <div className="text-[10px] text-blue-400 font-medium">
                    Select all correct answers
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border ${
                  DIFFICULTY_STYLE[challenge.difficulty]
                }`}
              >
                {challenge.difficulty}
              </span>
              <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-3 py-1">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-yellow-400 font-bold text-sm">
                  +{maxXp} XP
                </span>
              </div>
            </div>
          </div>

          {/* Question */}
          <h3 className="text-white font-semibold text-base leading-snug mb-5">
            {challenge.question}
          </h3>

          {/* Options */}
          <AnimatePresence mode="wait">
            {(phase === "selecting" || phase === "wrong") && (
              <motion.div
                key="options"
                className={`grid gap-2.5 mb-5 ${
                  isMultiSelect ? "grid-cols-1" : "grid-cols-2"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {challenge.options.map((opt, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => toggleOption(idx)}
                    disabled={phase === "wrong"}
                    whileHover={phase === "selecting" ? { scale: 1.01 } : {}}
                    whileTap={phase === "selecting" ? { scale: 0.99 } : {}}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${getOptionStyle(idx)}`}
                  >
                    <span
                      className={`shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold border ${
                        selected.has(idx)
                          ? "bg-blue-500 border-blue-400 text-white"
                          : "border-current text-current"
                      } ${phase === "wrong" ? "opacity-60" : ""}`}
                    >
                      {isMultiSelect ? (selected.has(idx) ? "✓" : "○") : optionLetters[idx]}
                    </span>
                    <span className="text-sm leading-snug">{opt.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Wrong state hint */}
            {phase === "wrong" && (
              <motion.div
                key="wrong-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 flex items-start gap-3 bg-red-900/20 border border-red-500/20 rounded-xl p-3.5"
              >
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-red-300 font-bold text-sm mb-1">
                    Not quite right
                    {attempts > 1 ? ` — ${attempts} attempts` : ""}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <span className="text-amber-400 font-medium">Hint:</span>{" "}
                      {challenge.hint}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Success Screen ── */}
          <AnimatePresence>
            {phase === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5"
              >
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-2xl p-5 text-center mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                  <div className="text-emerald-300 font-black text-xl mb-1">
                    Correct! +{challenge.xpReward} XP
                  </div>
                  <div className="text-zinc-400 text-sm leading-relaxed">
                    {challenge.explanation}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Revealed Screen ── */}
          <AnimatePresence>
            {phase === "revealed" && (
              <motion.div
                key="revealed"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-5"
              >
                <div className="grid gap-2 mb-4">
                  {challenge.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
                        opt.correct
                          ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                          : "bg-white/[0.03] border-white/5 text-zinc-600"
                      }`}
                    >
                      <span className="shrink-0">
                        {opt.correct ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-zinc-700" />
                        )}
                      </span>
                      {opt.label}
                    </div>
                  ))}
                </div>
                <div className="text-amber-400/80 text-xs text-center mb-1">
                  Challenge revealed — 0 XP awarded for this step.
                </div>
                <div className="text-zinc-500 text-xs leading-relaxed text-center">
                  {challenge.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Selecting state */}
            {phase === "selecting" && (
              <>
                <button
                  onClick={checkAnswer}
                  disabled={selected.size === 0}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Star className="w-4 h-4" /> Check Answer
                </button>
                <button
                  onClick={revealAnswer}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-medium px-3 py-3 rounded-xl hover:bg-white/5 whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" /> Reveal (0 XP)
                </button>
              </>
            )}

            {/* Wrong state */}
            {phase === "wrong" && (
              <>
                <button
                  onClick={retry}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
                >
                  <RotateCcw className="w-4 h-4" /> Try Again
                </button>
                <button
                  onClick={revealAnswer}
                  className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-medium px-3 py-3 rounded-xl hover:bg-white/5 whitespace-nowrap"
                >
                  <Eye className="w-3.5 h-3.5" /> Reveal (0 XP)
                </button>
              </>
            )}

            {/* Success / Revealed state */}
            {(phase === "success" || phase === "revealed") && (
              <button
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                Continue <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
