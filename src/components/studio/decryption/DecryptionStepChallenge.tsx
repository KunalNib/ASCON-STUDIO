"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  Lightbulb,
  Zap,
  RotateCcw,
  Target,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  X,
} from "lucide-react";
import { useAsconStore, DecryptionNarrativeStep } from "@/store/useAsconStore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type ChallengeType = "MCQ" | "CLICK_CORRECT";
type ChallengePhase = "selecting" | "wrong" | "success" | "revealed";

interface Option {
  label: string;
  correct: boolean;
}

export interface DecryptionStepChallengeData {
  type: ChallengeType;
  question: string;
  options: Option[];
  xpReward: number;
  hint: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const DECRYPTION_STEP_CHALLENGES: Record<DecryptionNarrativeStep, DecryptionStepChallengeData> = {
  DECRYPT_INPUT_PARAMETERS: {
    type: "MCQ",
    question:
      "Why does Authenticated Decryption in ASCON require BOTH the Ciphertext and the 128-bit Authentication Tag upfront?",
    options: [
      { label: "The tag is used to decrypt the first 16 bytes of ciphertext directly", correct: false },
      { label: "Without the tag, decryption is impossible because the key is derived from it", correct: false },
      { label: "To guarantee ciphertext integrity & authenticity, preventing attacker bit-flipping and padding oracles", correct: true },
      { label: "The tag contains the original uncompressed message length", correct: false },
    ],
    xpReward: 150,
    hint: "Think about what unauthenticated stream ciphers suffer from: malleability attacks where bits can be altered without detection.",
    explanation:
      "In modern AEAD (Authenticated Encryption with Associated Data), confidentiality without integrity is considered broken. Supplying the tag ensures that if any bit of ciphertext, nonce, or associated data is tampered with in transit, the receiver will detect it and reject the payload.",
    difficulty: "Medium",
  },
  DECRYPT_STATE_INITIALIZATION: {
    type: "CLICK_CORRECT",
    question:
      "ASCON-128 is a sponge-based lightweight cipher. Which statements are TRUE regarding its State Initialization in Decryption?",
    options: [
      { label: "It uses the EXACT SAME forward permutation p¹² as encryption (no inverse circuit needed)", correct: true },
      { label: "The 320-bit state is loaded with IV || Key || Nonce in the exact same format as encryption", correct: true },
      { label: "Decryption requires an inverted S-box and backward linear diffusion equations", correct: false },
      { label: "The key is XORed with the state after the 12 rounds just like in encryption", correct: true },
    ],
    xpReward: 150,
    hint: "One of the greatest hardware advantages of sponge permutations is that decryptors do not need inverse cryptographic components.",
    explanation:
      "Unlike block ciphers like AES that require separate circuits for Decryption (InvSubBytes, InvMixColumns), ASCON's sponge uses the identical forward permutation p¹² for both encryption and decryption! This saves massive silicon area and power in IoT sensors.",
    difficulty: "Medium",
  },
  DECRYPT_AD_PROCESSING: {
    type: "MCQ",
    question:
      "Suppose an attacker modifies a cleartext sensor packet header (Associated Data) from 'NODE-01' to 'NODE-99'. What happens during ASCON Decryption?",
    options: [
      { label: "Decryption aborts immediately with a network packet error before processing ciphertext", correct: false },
      { label: "The state diverges; ciphertext will still decrypt to tentative plaintext, but the final tag check will strictly fail", correct: true },
      { label: "Plaintext decryption fails immediately because the key is wiped", correct: false },
      { label: "The tag automatically updates to match the new header", correct: false },
    ],
    xpReward: 150,
    hint: "Associated Data is absorbed into the internal state before ciphertext, altering the sponge trajectory permanently.",
    explanation:
      "Because the altered AD is XORed into x0 and run through p⁶, the internal state completely diverges from the sender's state. When finalization runs, the locally calculated tag will not match the sender's tag, causing verification to fail.",
    difficulty: "Medium",
  },
  DECRYPT_CIPHERTEXT_PROCESSING: {
    type: "CLICK_CORRECT",
    question:
      "During Decryption of ciphertext block Cᵢ, select ALL mathematical operations that ASCON executes on the rate word x0:",
    options: [
      { label: "Pᵢ ← Cᵢ ⊕ x0 (Recovering the plaintext block)", correct: true },
      { label: "x0 ← Cᵢ (Absorbing the ciphertext into the state to synchronize with sender)", correct: true },
      { label: "x0 ← Pᵢ (Absorbing plaintext into the state)", correct: false },
      { label: "p⁶ permutation is applied to the 320-bit state after absorbing each block", correct: true },
    ],
    xpReward: 150,
    hint: "In encryption: Cᵢ = Pᵢ ⊕ x0 and x0 ← Cᵢ (or x0 ⊕ Pᵢ). In decryption, the sender's state had x0 = Cᵢ.",
    explanation:
      "In ASCON duplex decryption, the receiver computes Pᵢ = Cᵢ ⊕ x0 to recover the secret plaintext, and then replaces x0 with Cᵢ (x0 ← Cᵢ). This ensures the receiver's state matches the sender's state before the next permutation!",
    difficulty: "Hard",
  },
  DECRYPT_FINALIZATION: {
    type: "MCQ",
    question:
      "Why does ASCON inject the secret Key into the state right before the final 12-round permutation (p¹²)?",
    options: [
      { label: "To decrypt the remaining buffered bytes in capacity words", correct: false },
      { label: "To ensure that computing the valid tag requires knowledge of the secret key, preventing forgery", correct: true },
      { label: "To reset the state to all zeroes after transmission", correct: false },
      { label: "To double the effective block size from 64 to 128 bits", correct: false },
    ],
    xpReward: 150,
    hint: "If the final tag didn't depend on the secret key, anyone who observed the ciphertext could forge valid tags.",
    explanation:
      "Key injection in Finalization bounds the capacity words to the secret key: S ← S ⊕ (0⁶⁴ || K || 0¹²⁸), followed by p¹² and another key XOR. This ensures that no attacker without K can predict the state or forge a matching authentication tag.",
    difficulty: "Medium",
  },
  DECRYPT_TAG_VERIFICATION: {
    type: "MCQ",
    question:
      "What is the CRITICAL security rule regarding decrypted plaintext if Authentication Tag verification fails?",
    options: [
      { label: "Release the plaintext anyway with a warning log flag for the user application", correct: false },
      { label: "Re-run the permutation with 24 rounds to check if it was a bit error", correct: false },
      { label: "Plaintext MUST be immediately purged and suppressed; NEVER release unverified plaintext", correct: true },
      { label: "Invert the tag and attempt parity correction", correct: false },
    ],
    xpReward: 150,
    hint: "Releasing unverified plaintext creates a 'Plaintext Oracle' or 'Decryption Oracle' attack surface.",
    explanation:
      "NIST SP 800-232 and standard cryptographic guidelines mandate: UNVERIFIED PLAINTEXT MUST NEVER BE RELEASED! If an application processes unverified data, attackers can craft chosen ciphertexts to execute code or extract keys via oracle attacks.",
    difficulty: "Hard",
  },
};

interface DecryptionStepChallengeProps {
  step: DecryptionNarrativeStep;
  onClose: () => void;
}

export function DecryptionStepChallenge({ step, onClose }: DecryptionStepChallengeProps) {
  const challenge = DECRYPTION_STEP_CHALLENGES[step];
  const { width, height } = useWindowSize();
  const { addDecryptionXp, markDecryptionStepComplete, decryptionCompletedSteps } = useAsconStore();

  const [selectedIdxs, setSelectedIdxs] = useState<number[]>([]);
  const [phase, setPhase] = useState<ChallengePhase>("selecting");
  const [showHint, setShowHint] = useState(false);
  const isAlreadyCompleted = decryptionCompletedSteps.includes(step);

  useEffect(() => {
    setSelectedIdxs([]);
    setPhase("selecting");
    setShowHint(false);
  }, [step]);

  if (!challenge) return null;

  const handleSelect = (idx: number) => {
    if (phase === "success" || phase === "revealed") return;

    if (challenge.type === "MCQ") {
      setSelectedIdxs([idx]);
      const isCorrect = challenge.options[idx].correct;
      if (isCorrect) {
        setPhase("success");
        if (!isAlreadyCompleted) {
          addDecryptionXp(challenge.xpReward);
          markDecryptionStepComplete(step);
        }
      } else {
        setPhase("wrong");
      }
    } else {
      // CLICK_CORRECT (Multi-select)
      setSelectedIdxs((prev) =>
        prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
      );
    }
  };

  const handleSubmitMulti = () => {
    const correctIdxs = challenge.options
      .map((opt, i) => (opt.correct ? i : -1))
      .filter((i) => i !== -1);

    const isMatch =
      selectedIdxs.length === correctIdxs.length &&
      selectedIdxs.every((i) => correctIdxs.includes(i));

    if (isMatch) {
      setPhase("success");
      if (!isAlreadyCompleted) {
        addDecryptionXp(challenge.xpReward);
        markDecryptionStepComplete(step);
      }
    } else {
      setPhase("wrong");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
    >
      {phase === "success" && !isAlreadyCompleted && (
        <Confetti
          width={width || 800}
          height={height || 600}
          recycle={false}
          numberOfPieces={160}
          colors={["#10b981", "#34d399", "#059669", "#fbbf24", "#60a5fa"]}
        />
      )}

      <motion.div
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        className="w-full max-w-xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl relative flex flex-col gap-5 max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Decryption Checkpoint
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-white/5 text-zinc-500 font-semibold border border-zinc-200 dark:border-white/5">
                  {challenge.difficulty}
                </span>
              </div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                {challenge.type === "MCQ" ? "Single Answer" : "Select All That Apply"}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-600 dark:text-yellow-400 font-bold text-xs">
              <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              <span>+{challenge.xpReward} XP</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question */}
        <p className="text-zinc-900 dark:text-zinc-100 text-sm font-medium leading-relaxed">
          {challenge.question}
        </p>

        {/* Options */}
        <div className="flex flex-col gap-2.5">
          {challenge.options.map((opt, i) => {
            const isSelected = selectedIdxs.includes(i);
            const isCorrect = opt.correct;
            let optStyle =
              "bg-zinc-50 dark:bg-white/[0.03] border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-white/[0.06]";

            if (phase === "success") {
              if (isCorrect) {
                optStyle =
                  "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold";
              } else if (isSelected) {
                optStyle = "opacity-40 border-zinc-200 dark:border-white/5";
              }
            } else if (phase === "wrong") {
              if (isSelected && !isCorrect) {
                optStyle =
                  "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200";
              } else if (isSelected && isCorrect) {
                optStyle =
                  "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200";
              }
            } else if (isSelected) {
              optStyle =
                "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold";
            }

            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleSelect(i)}
                className={`w-full text-left p-3.5 rounded-2xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optStyle}`}
              >
                <div
                  className={`w-5 h-5 rounded-lg border mt-0.5 shrink-0 flex items-center justify-center text-xs font-bold ${
                    isSelected
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-zinc-300 dark:border-zinc-700 text-zinc-400"
                  }`}
                >
                  {challenge.type === "CLICK_CORRECT" ? (
                    isSelected ? "✓" : ""
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </div>
                <span className="flex-1 leading-relaxed">{opt.label}</span>
                {phase === "success" && isCorrect && (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                )}
                {phase === "wrong" && isSelected && !isCorrect && (
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Multi-select Submit Button */}
        {challenge.type === "CLICK_CORRECT" && phase === "selecting" && (
          <button
            onClick={handleSubmitMulti}
            disabled={selectedIdxs.length === 0}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs transition-all shadow-md"
          >
            Check Selection ({selectedIdxs.length} chosen)
          </button>
        )}

        {/* Feedback / Explanations */}
        <AnimatePresence>
          {phase === "wrong" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-500/30 text-rose-800 dark:text-rose-200 text-xs flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Incorrect Answer</span>
              </div>
              <p className="leading-relaxed">
                Check the hint below and reconsider the cryptographic requirements of AEAD decryption.
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => {
                    setSelectedIdxs([]);
                    setPhase("selecting");
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Try Again
                </button>
                <button
                  onClick={() => setShowHint(true)}
                  className="px-3 py-1.5 bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-700 dark:text-zinc-200 rounded-xl font-semibold flex items-center gap-1.5"
                >
                  <Lightbulb className="w-3.5 h-3.5 text-yellow-500" /> Need a Hint?
                </button>
              </div>
            </motion.div>
          )}

          {phase === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200 text-xs flex flex-col gap-2"
            >
              <div className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Cryptographic Concept Verified!</span>
              </div>
              <p className="leading-relaxed text-zinc-700 dark:text-zinc-300">
                {challenge.explanation}
              </p>
              <button
                onClick={onClose}
                className="mt-2 py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold self-end flex items-center gap-1.5 shadow-sm"
              >
                <span>Continue Decryption</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {showHint && phase !== "success" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-2xl bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-500/30 text-yellow-800 dark:text-yellow-200 text-xs flex items-start gap-2.5"
            >
              <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold">Cryptographer's Hint: </span>
                {challenge.hint}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-white/5">
          <span>Solving challenges unlocks the next stage in the pipeline.</span>
          {!showHint && phase !== "success" && (
            <button
              onClick={() => setShowHint(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <Lightbulb className="w-3 h-3 text-yellow-500" />
              Hint
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
