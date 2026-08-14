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
  INTRODUCTION: {
    type: "MCQ",
    question: "Before we begin — what category of cryptographic scheme is ASCON?",
    options: [
      { label: "A public-key encryption system like RSA", correct: false },
      { label: "An Authenticated Encryption with Associated Data (AEAD) cipher", correct: true },
      { label: "A one-way hash function like SHA-256", correct: false },
      { label: "A block cipher operating in ECB mode", correct: false },
    ],
    xpReward: 50,
    hint: "ASCON provides both confidentiality AND integrity in a single pass.",
    explanation:
      "ASCON is an AEAD (Authenticated Encryption with Associated Data) scheme — it simultaneously encrypts data for confidentiality AND generates an authentication tag for integrity. It was selected by NIST in 2023 as the lightweight cryptography standard.",
    difficulty: "Easy",
  },
  SENSOR_DATA: {
    type: "MCQ",
    question:
      "The sensor reading '27.4 °C' is displayed on screen right now. Is this data secure at this moment?",
    options: [
      { label: "Yes — the ESP32 encrypted it on the hardware bus", correct: false },
      { label: "No — this is raw plaintext, fully readable by anyone", correct: true },
      { label: "Partially — the temperature value is hidden but the unit is not", correct: false },
      { label: "Yes — ASCON already hashed it during transmission", correct: false },
    ],
    xpReward: 50,
    hint: "We haven't performed ANY cryptographic operation yet.",
    explanation:
      "Correct! This is raw, unprotected plaintext. Anyone intercepting this on the sensor bus or network can read it directly. This vulnerability is exactly why lightweight cryptography like ASCON exists.",
    difficulty: "Easy",
  },
  PREPARE_DATA: {
    type: "MCQ",
    question:
      "Why must '27.4 °C' be converted to bytes (hex: 32 37 2E 34...) before ASCON can encrypt it?",
    options: [
      { label: "To compress the data and reduce memory usage", correct: false },
      { label: "Because ASCON's mathematical operations require binary byte arrays, not text strings", correct: true },
      { label: "To make the plaintext harder to read visually", correct: false },
      { label: "To pre-apply the S-box substitution layer", correct: false },
    ],
    xpReward: 50,
    hint: "All cryptographic algorithms are, fundamentally, mathematical functions on numbers.",
    explanation:
      "Cryptographic algorithms work on binary data. The text '27.4 °C' must be encoded to its byte representation (UTF-8 / ASCII) so ASCON's permutation functions can apply their mathematical XOR and rotation operations.",
    difficulty: "Easy",
  },
  CRYPTO_PARAMS: {
    type: "MCQ",
    question:
      "What is the catastrophic consequence of encrypting two DIFFERENT messages with the exact same Key AND Nonce in ASCON-128?",
    options: [
      { label: "The output ciphertexts are identical and easily spotted", correct: false },
      { label: "Encryption fails and throws an error", correct: false },
      { label: "An attacker can XOR the two ciphertexts to recover plaintext — a complete break", correct: true },
      { label: "The authentication tag doubles in length for extra safety", correct: false },
    ],
    xpReward: 75,
    hint: "Nonce means 'Number used ONCE'. XORing two stream-cipher outputs with the same keystream cancels it out.",
    explanation:
      "Nonce reuse is catastrophic: C1 ⊕ C2 = (P1 ⊕ KS) ⊕ (P2 ⊕ KS) = P1 ⊕ P2. The keystream cancels, giving the attacker plaintext XOR plaintext — enough to recover both messages. Never reuse (Key, Nonce) pairs.",
    difficulty: "Medium",
  },
  INITIAL_STATE: {
    type: "CLICK_CORRECT",
    question:
      "The 320-bit ASCON state has 5 words: x0–x4. Select ALL words that contain Nonce bits.",
    options: [
      { label: "x0 — Initialization Vector (IV)", correct: false },
      { label: "x1 — Key[0:63] (lower 64 bits)", correct: false },
      { label: "x2 — Key[64:127] (upper 64 bits)", correct: false },
      { label: "x3 — Nonce[0:63] (lower 64 bits)", correct: true },
      { label: "x4 — Nonce[64:127] (upper 64 bits)", correct: true },
    ],
    xpReward: 75,
    hint: "The 128-bit nonce is too large for a single 64-bit word.",
    explanation:
      "The 128-bit nonce is split across x3 (bits 0–63) and x4 (bits 64–127). x0 holds the IV, x1 and x2 hold the 128-bit key split similarly. This layout is defined in the ASCON specification.",
    difficulty: "Medium",
  },
  INITIALIZATION: {
    type: "MCQ",
    question:
      "ASCON-128 uses two permutation strengths: pa and pb. Which is used during Initialization, and how many rounds?",
    options: [
      { label: "pb — 6 rounds (fast mode for data processing)", correct: false },
      { label: "pa — 12 rounds (maximum security for key setup)", correct: true },
      { label: "pa — 8 rounds (a balanced trade-off)", correct: false },
      { label: "Neither — Initialization uses a hardware AES core", correct: false },
    ],
    xpReward: 75,
    hint: "The initialization phase is the most security-critical step — it gets the strongest permutation.",
    explanation:
      "pa = 12 rounds is used for Initialization and Finalization because these handle secret key material and must provide maximum diffusion. pb = 6 rounds is used for data absorption (faster, but the state is already well-mixed).",
    difficulty: "Medium",
  },
  PERMUTATION: {
    type: "MCQ",
    question:
      "The ASCON permutation executes exactly 3 sub-layers every round. What is their correct ORDER?",
    options: [
      { label: "Linear Diffusion (pl) → S-box (ps) → Constant Addition (pc)", correct: false },
      { label: "Constant Addition (pc) → S-box Substitution (ps) → Linear Diffusion (pl)", correct: true },
      { label: "S-box (ps) → Constant Addition (pc) → Linear Diffusion (pl)", correct: false },
      { label: "Key Injection → S-box (ps) → Linear Shift (pl)", correct: false },
    ],
    xpReward: 100,
    hint: "Round constants break symmetry BEFORE the non-linear S-box — this ordering is deliberate.",
    explanation:
      "Every ASCON round follows: ① pc adds a round constant (breaks symmetry), ② ps applies the 5-bit S-box non-linearly (confusion), ③ pl performs rotate-XOR diffusion (avalanche). This fixed order is what makes the cipher analyzable and provably secure.",
    difficulty: "Hard",
  },
  SUBSTITUTION: {
    type: "MCQ",
    question:
      "The ASCON S-box operates on a 5-bit 'column' — one bit from each of the 5 state words. How many S-box calls occur per permutation round?",
    options: [
      { label: "5 — one call per word", correct: false },
      { label: "64 — one per bit-position column across all 5 words", correct: true },
      { label: "320 — one per bit in the state", correct: false },
      { label: "1 — the S-box takes the entire 320-bit state", correct: false },
    ],
    xpReward: 100,
    hint: "Each 64-bit word has 64 bit positions, each forming a vertical 5-bit column with the other words.",
    explanation:
      "64 S-box calls happen per round. Each of the 64 bit positions forms a 5-bit column (one bit from each word x0–x4). The S-box substitutes each 5-bit column independently — this bit-sliced structure is the key to ASCON's efficiency.",
    difficulty: "Hard",
  },
  DIFFUSION: {
    type: "MCQ",
    question:
      "ASCON's linear diffusion computes: xᵢ ← xᵢ ⊕ (xᵢ >>> a) ⊕ (xᵢ >>> b). What cryptographic property does this guarantee?",
    options: [
      { label: "Key independence — diffusion does not touch the secret key", correct: false },
      { label: "Avalanche effect — a single changed bit spreads across all 64 positions of the word", correct: true },
      { label: "Compression — two 64-bit words merge into one output", correct: false },
      { label: "Non-linearity — it thwarts linear cryptanalysis alone", correct: false },
    ],
    xpReward: 100,
    hint: "Think about what XORing a value with two different rotations of itself does to a single flipped bit.",
    explanation:
      "The rotate-XOR ensures any single changed bit influences every other bit position within that word. This is the Avalanche Effect — xᵢ ← xᵢ ⊕ (xᵢ >>> 19) ⊕ (xᵢ >>> 28) for x0, with different rotation constants per word to maximise mixing.",
    difficulty: "Hard",
  },
  PLAINTEXT_PROCESSING: {
    type: "MCQ",
    question:
      "ASCON XORs plaintext into the rate (x0) to produce ciphertext. What ALSO happens to provide message integrity?",
    options: [
      { label: "The state is reset to zero after each block", correct: false },
      { label: "The plaintext enters the state and future permutations mix it into the capacity (authentication)", correct: true },
      { label: "The ciphertext is separately hashed and appended", correct: false },
      { label: "Nothing extra — XOR alone provides integrity", correct: false },
    ],
    xpReward: 75,
    hint: "How does one XOR operation achieve both confidentiality AND integrity?",
    explanation:
      "XORing plaintext into x0 produces ciphertext (confidentiality). Simultaneously, the plaintext is now inside the state. Subsequent permutation rounds spread it into the capacity words, which ultimately feed into the authentication tag — binding both confidentiality and integrity in one operation.",
    difficulty: "Medium",
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
  AUTH_TAG: {
    type: "CLICK_CORRECT",
    question:
      "The 128-bit Authentication Tag is XOR-extracted from specific state words after the final key injection. Select ALL words that form the tag.",
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
      "Tag = (Key ⊕ x3) ‖ (Key ⊕ x4). The tag is extracted from x3 and x4 (the capacity words) XORed with the key. Because capacity words are never directly exposed to plaintext/ciphertext, they remain secret even to an observer who sees all inputs and outputs.",
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
