"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore, DecryptionNarrativeStep } from "@/store/useAsconStore";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  HelpCircle,
  Calculator,
  Code,
  Bot,
  PanelRightClose,
  PanelRightOpen,
  Zap,
  CheckCircle2,
  Unlock,
  Lock,
  Trophy,
  RotateCcw,
  Star,
  Target,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { DecryptionInputPanel } from "@/components/studio/decryption/modules/DecryptionInputPanel";
import { DecryptionStateInit } from "@/components/studio/decryption/modules/DecryptionStateInit";
import { DecryptionADFlow } from "@/components/studio/decryption/modules/DecryptionADFlow";
import { DecryptionPlaintextRecovery } from "@/components/studio/decryption/modules/DecryptionPlaintextRecovery";
import { DecryptionFinalizationFlow } from "@/components/studio/decryption/modules/DecryptionFinalizationFlow";
import { DecryptionTagVerification } from "@/components/studio/decryption/modules/DecryptionTagVerification";
import {
  DecryptionStepChallenge,
  DECRYPTION_STEP_CHALLENGES,
} from "@/components/studio/decryption/DecryptionStepChallenge";
import { Modal } from "@/components/ui/Modal";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const MAX_DECRYPTION_XP = 900;

// ─── Decryption Summary / Celebration Screen ──────────────────────────────────
function DecryptionSummaryScreen() {
  const { decryptionXp, decryptionCompletedSteps, resetDecryption, decryptionSteps } =
    useAsconStore();
  const challengeableCount = Object.keys(DECRYPTION_STEP_CHALLENGES).length;
  const completedCount = decryptionCompletedSteps.length;
  const pct = Math.round((decryptionXp / MAX_DECRYPTION_XP) * 100);
  const stars =
    decryptionXp >= 850
      ? 5
      : decryptionXp >= 700
      ? 4
      : decryptionXp >= 500
      ? 3
      : decryptionXp >= 250
      ? 2
      : 1;

  const badge =
    stars === 5
      ? { emoji: "🛡️", label: "Zero-Trust Cryptographer", color: "from-emerald-400 to-teal-500" }
      : stars === 4
      ? { emoji: "⭐", label: "Integrity Specialist", color: "from-teal-400 to-cyan-500" }
      : stars === 3
      ? { emoji: "🥇", label: "AEAD Scholar", color: "from-green-400 to-emerald-500" }
      : stars === 2
      ? { emoji: "🥈", label: "Security Learner", color: "from-zinc-400 to-zinc-600" }
      : { emoji: "🥉", label: "Decryption Novice", color: "from-amber-600 to-amber-800" };

  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="mb-6 relative"
      >
        <div
          className={`w-28 h-28 mx-auto rounded-full bg-gradient-to-br ${badge.color} opacity-20 blur-2xl absolute inset-0`}
        />
        <div className="text-7xl mb-2 relative">{badge.emoji}</div>
        <div
          className={`text-sm font-black uppercase tracking-widest bg-gradient-to-r ${badge.color} bg-clip-text text-transparent`}
        >
          {badge.label}
        </div>
      </motion.div>

      <motion.h2
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-black text-zinc-900 dark:text-white mb-2"
      >
        Authenticated Decryption Mastered!
      </motion.h2>
      <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm max-w-md">
        You've traced the full ASCON-128 AEAD verified decryption pipeline from ciphertext absorption
        to constant-time tag verification.
      </p>

      {/* Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-4 w-full max-w-md mb-8"
      >
        <div className="bg-zinc-50 dark:bg-[#0d0d0d] border border-zinc-200 dark:border-white/10 rounded-2xl p-4">
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {decryptionXp}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
            / {MAX_DECRYPTION_XP} XP
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-[#0d0d0d] border border-zinc-200 dark:border-white/10 rounded-2xl p-4">
          <div className="text-2xl font-black text-teal-600 dark:text-teal-400">{completedCount}</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
            / {challengeableCount} Steps
          </div>
        </div>
        <div className="bg-zinc-50 dark:bg-[#0d0d0d] border border-zinc-200 dark:border-white/10 rounded-2xl p-4">
          <div className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{pct}%</div>
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">Score</div>
        </div>
      </motion.div>

      {/* Stars */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex gap-2 mb-8"
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-7 h-7 transition-all ${
              i < stars
                ? "text-yellow-400 fill-yellow-400 scale-110"
                : "text-zinc-300 dark:text-zinc-700"
            }`}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex gap-3"
      >
        <button
          onClick={resetDecryption}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-full transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
        >
          <RotateCcw className="w-4 h-4" /> Replay Decryption Lab
        </button>
      </motion.div>
    </div>
  );
}

// ─── Main Decryption Guided Laboratory ────────────────────────────────────────
export function DecryptionGuidedLaboratory() {
  const router = useRouter();
  const {
    currentDecryptionStepIndex,
    decryptionSteps,
    decryptionPlaybackState,
    setDecryptionPlaybackState,
    nextDecryptionStep,
    prevDecryptionStep,
    decryptionAnimationSpeed,
    setDecryptionAnimationSpeed,
    decryptionXp,
    decryptionCompletedSteps,
    decryptionTampered,
  } = useAsconStore();

  const progress =
    (currentDecryptionStepIndex / (decryptionSteps.length - 1)) * 100;
  const currentStage = decryptionSteps[currentDecryptionStepIndex];

  // UI state
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [showNarrative, setShowNarrative] = useState(true);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [xpKey, setXpKey] = useState(0);
  const prevXpRef = useRef(decryptionXp);

  // Pulse XP badge when XP changes
  useEffect(() => {
    if (decryptionXp !== prevXpRef.current) {
      prevXpRef.current = decryptionXp;
      setXpKey((k) => k + 1);
    }
  }, [decryptionXp]);

  // Close challenge panel when step changes
  useEffect(() => {
    setIsChallengeOpen(false);
  }, [currentDecryptionStepIndex]);

  // Playback timer
  useEffect(() => {
    if (decryptionPlaybackState !== "playing") return;
    const delay = Math.round(3500 / decryptionAnimationSpeed);
    const timer = setTimeout(() => {
      if (currentDecryptionStepIndex < decryptionSteps.length - 1) {
        nextDecryptionStep();
      } else {
        setDecryptionPlaybackState("paused");
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [
    decryptionPlaybackState,
    currentDecryptionStepIndex,
    decryptionAnimationSpeed,
    decryptionSteps.length,
    nextDecryptionStep,
    setDecryptionPlaybackState,
  ]);

  // Derived state
  const hasChallenge = !!DECRYPTION_STEP_CHALLENGES[currentStage];
  const isCurrentCompleted = decryptionCompletedSteps.includes(currentStage);
  const isNextLocked = hasChallenge && !isCurrentCompleted;
  const completedChallengeableCount = decryptionCompletedSteps.filter(
    (s) => DECRYPTION_STEP_CHALLENGES[s] !== undefined
  ).length;
  const totalChallengeableCount = Object.keys(DECRYPTION_STEP_CHALLENGES).length;

  const explanations: Record<
    DecryptionNarrativeStep,
    {
      title: string;
      what: string;
      how: string;
      why: string;
      input: string;
      output: string;
      security: string;
    }
  > = {
    DECRYPT_INPUT_PARAMETERS: {
      title: "Ciphertext & Tag Input",
      what: "Loading the encrypted payload and expected authentication signature.",
      how: "Parsing the 64-bit ciphertext block, 128-bit MAC tag, nonce, and shared secret key.",
      why: "AEAD requires both ciphertext and tag together to guarantee confidentiality and authenticity.",
      input: "Ciphertext (C) + Auth Tag (T) + Nonce (N)",
      output: "Loaded Memory Buffers",
      security: "Guarantees that bit-flipping attacks in transit will be caught at verification.",
    },
    DECRYPT_STATE_INITIALIZATION: {
      title: "State Initialization (S₀)",
      what: "Initializing the 320-bit state and executing 12 forward permutation rounds.",
      how: "Setting S = IV || K || N, executing p¹², and XORing Key into capacity words.",
      why: "Sponge permutations are symmetric: decryption uses the identical forward p¹² permutation!",
      input: "IV (64-bit) + Key (128-bit) + Nonce (128-bit)",
      output: "Permuted Internal State S",
      security: "Eliminates inverse permutation hardware in constrained IoT devices, saving ~40% silicon area.",
    },
    DECRYPT_AD_PROCESSING: {
      title: "Associated Data Re-absorption",
      what: "Absorbing cleartext packet headers into state word x0.",
      how: "XORing AD into x0, running round permutation p⁶, and adding a 1-bit domain separator into x4.",
      why: "Cryptographically binds message metadata so headers cannot be altered in transit.",
      input: "Cleartext Header ('ESP32-STATION-1')",
      output: "Updated State S",
      security: "If an attacker modifies routing headers, state permanently diverges and verification fails.",
    },
    DECRYPT_CIPHERTEXT_PROCESSING: {
      title: "Plaintext Recovery & Duplex Feedback",
      what: "Extracting plaintext and absorbing ciphertext into the internal state.",
      how: "Computing P₀ = C₀ ⊕ x0 to recover data, then replacing x0 with C₀ (x0 ← C₀).",
      why: "Duplex sponge mode requires absorbing the ciphertext to mirror the sender's state trajectory.",
      input: "Ciphertext Block (C₀) + State (x0)",
      output: "Tentative Plaintext (P₀)",
      security: "Recovered plaintext is held in provisional volatile memory until Tag Verification passes.",
    },
    DECRYPT_FINALIZATION: {
      title: "Finalization & Candidate Squeeze",
      what: "Re-injecting the key and squeezing candidate tag words.",
      how: "XORing Key into state, running final 12-round permutation p¹², and extracting (x3 || x4) ⊕ K.",
      why: "Generates the local Candidate Tag (T*) to test whether the message was tampered with.",
      input: "Current State + Secret Key",
      output: "Candidate Tag T* (128 bits)",
      security: "Ensures computing a valid tag strictly requires knowledge of the secret key.",
    },
    DECRYPT_TAG_VERIFICATION: {
      title: "Tag Verification & Release Gate",
      what: "Testing candidate tag against received tag in constant time.",
      how: "Performing constant-time byte equality check between T* and T.",
      why: "Constant-time checking stops timing side-channel attacks. Unverified plaintext must never be released.",
      input: "Candidate Tag (T*) vs Received Tag (T)",
      output: "Verified Plaintext OR Tamper Purge",
      security: "Enforces zero-trust: tampered payloads are immediately purged, preventing decryption oracle exploits.",
    },
  };

  const data =
    explanations[currentStage] || explanations["DECRYPT_INPUT_PARAMETERS"];

  const renderActiveVisual = () => {
    if (
      decryptionCompletedSteps.includes("DECRYPT_TAG_VERIFICATION") &&
      currentStage === "DECRYPT_TAG_VERIFICATION"
    ) {
      return <DecryptionSummaryScreen />;
    }

    switch (currentStage) {
      case "DECRYPT_INPUT_PARAMETERS":
        return <DecryptionInputPanel />;
      case "DECRYPT_STATE_INITIALIZATION":
        return <DecryptionStateInit />;
      case "DECRYPT_AD_PROCESSING":
        return <DecryptionADFlow />;
      case "DECRYPT_CIPHERTEXT_PROCESSING":
        return <DecryptionPlaintextRecovery />;
      case "DECRYPT_FINALIZATION":
        return <DecryptionFinalizationFlow />;
      case "DECRYPT_TAG_VERIFICATION":
        return <DecryptionTagVerification />;
      default:
        return <DecryptionInputPanel />;
    }
  };

  return (
    <div className="flex flex-col h-full relative p-2 md:p-3 w-full">
      <div className="flex-1 min-h-0 relative flex flex-col lg:flex-row gap-3 w-full overflow-hidden">
        {/* Visualization Canvas */}
        <div
          id="tour-decryption-visualizer"
          className="flex-1 relative bg-zinc-100 dark:bg-black/40 border border-zinc-200 dark:border-white/5 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStage + "-visual"}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.04 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full overflow-y-auto custom-scrollbar"
            >
              {renderActiveVisual()}
            </motion.div>
          </AnimatePresence>

          {/* XP HUD */}
          {!(
            decryptionCompletedSteps.includes("DECRYPT_TAG_VERIFICATION") &&
            currentStage === "DECRYPT_TAG_VERIFICATION"
          ) && (
            <motion.div
              id="decryption-xp-hud"
              key={`decryption-xp-hud-${xpKey}`}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="absolute top-3 right-3 z-20 flex items-center gap-2 bg-white/90 dark:bg-black/75 backdrop-blur-sm border border-emerald-500/30 rounded-xl px-3 py-1.5 shadow-sm dark:shadow-lg"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500" />
              <span className="text-emerald-700 dark:text-emerald-400 font-bold font-mono text-sm">
                {decryptionXp}
              </span>
              <span className="text-zinc-400 dark:text-zinc-600 text-xs">/ {MAX_DECRYPTION_XP} XP</span>
              <span className="text-zinc-300 dark:text-zinc-700 text-xs">·</span>
              <span className="text-zinc-600 dark:text-zinc-400 text-xs font-mono">
                {completedChallengeableCount}/{totalChallengeableCount}
              </span>
            </motion.div>
          )}

          {/* Challenge Modal Overlay */}
          <AnimatePresence>
            {isChallengeOpen && hasChallenge && !isCurrentCompleted && (
              <DecryptionStepChallenge
                step={currentStage}
                onClose={() => setIsChallengeOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Narrative Explainer Panel (Right) */}
        <AnimatePresence mode="sync">
          {showNarrative ? (
            <motion.div
              id="decryption-narrative"
              key="narrative-open"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "380px" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full lg:w-[380px] shrink-0 bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl"
            >
              {/* Panel Header */}
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4 mb-4 shrink-0">
                <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2.5 tracking-tight whitespace-nowrap">
                  <HelpCircle className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                  Stage Explainer
                </h2>
                <button
                  onClick={() => setShowNarrative(false)}
                  className="p-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                  title="Collapse stage guide"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* Explainer Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-5 relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStage + "-text"}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                        Active Step
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mt-0.5">
                        {data.title}
                      </h3>
                    </div>

                    <div className="bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 p-4 rounded-2xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
                      <h4 className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-bold mb-1 tracking-wider ml-1">
                        What is happening?
                      </h4>
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed ml-1">
                        {data.what}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[11px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">
                        How does it work?
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {data.how}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-[11px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">
                        Why is it necessary?
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {data.why}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-zinc-50 dark:bg-black/40 p-3.5 rounded-2xl border border-zinc-200 dark:border-white/5">
                      <div>
                        <h4 className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Input</h4>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 font-mono break-words">
                          {data.input}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-[10px] text-zinc-400 uppercase font-bold mb-1">Output</h4>
                        <p className="text-xs text-zinc-800 dark:text-zinc-200 font-mono break-words">
                          {data.output}
                        </p>
                      </div>
                    </div>

                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden">
                      <h4 className="text-[11px] text-emerald-700 dark:text-emerald-400 uppercase font-bold mb-1 tracking-wider">
                        Security Principle
                      </h4>
                      <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        {data.security}
                      </p>
                    </div>

                    {/* Challenge CTA */}
                    {!(
                      decryptionCompletedSteps.includes("DECRYPT_TAG_VERIFICATION") &&
                      currentStage === "DECRYPT_TAG_VERIFICATION"
                    ) && (
                      <div className="pt-2">
                        {isCurrentCompleted ? (
                          <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 rounded-2xl">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <div>
                              <div className="text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                                Checkpoint Complete!
                              </div>
                              <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                                XP claimed for this stage
                              </div>
                            </div>
                          </div>
                        ) : hasChallenge ? (
                          <motion.button
                            onClick={() => setIsChallengeOpen(true)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            animate={{
                              boxShadow: [
                                "0 0 0px rgba(16,185,129,0)",
                                "0 0 20px rgba(16,185,129,0.4)",
                                "0 0 0px rgba(16,185,129,0)",
                              ],
                            }}
                            transition={{ boxShadow: { repeat: Infinity, duration: 2.5 } }}
                            className="w-full flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/40 rounded-2xl hover:from-emerald-500/25 hover:to-teal-500/25 transition-all group"
                          >
                            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                              <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-left flex-1">
                              <div className="text-zinc-900 dark:text-white font-bold text-xs">
                                Take Checkpoint Challenge
                              </div>
                              <div className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                                +{DECRYPTION_STEP_CHALLENGES[currentStage]?.xpReward} XP ·{" "}
                                {DECRYPTION_STEP_CHALLENGES[currentStage]?.difficulty}
                              </div>
                            </div>
                            <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
                          </motion.button>
                        ) : null}
                      </div>
                    )}

                    {/* Secondary Action Buttons */}
                    <div className="pt-2 border-t border-zinc-200 dark:border-white/10 grid grid-cols-3 gap-2">
                      <button
                        onClick={() => setIsMathModalOpen(true)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs gap-1.5 font-medium"
                      >
                        <Calculator className="w-4 h-4" /> Math Spec
                      </button>
                      <button
                        onClick={() => setIsCodeModalOpen(true)}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors text-xs gap-1.5 font-medium"
                      >
                        <Code className="w-4 h-4" /> Code
                      </button>
                      <button
                        onClick={() => router.push("/studio/ai-tutor")}
                        className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 transition-colors text-xs gap-1.5 font-bold"
                      >
                        <Bot className="w-4 h-4" /> Ask AI
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="narrative-closed"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "40px" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="shrink-0 flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setShowNarrative(true)}
                className="flex flex-col items-center gap-2 h-full w-10 rounded-2xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 hover:bg-zinc-100 dark:hover:bg-white/[0.05] hover:border-emerald-500/30 transition-all group shadow-sm"
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <PanelRightOpen className="w-4 h-4 text-zinc-500 group-hover:text-emerald-500 transition-colors" />
                  <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] text-zinc-500 font-bold uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors select-none">
                    Stage Guide
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Bar */}
      <div
        id="tour-decryption-controls"
        className="mt-2 pt-2 border-t border-zinc-200 dark:border-white/10 flex items-center gap-3 shrink-0 overflow-x-auto custom-scrollbar pb-1"
      >
        <span className="text-[10px] text-zinc-500 font-mono shrink-0">
          {currentDecryptionStepIndex + 1}/{decryptionSteps.length}
        </span>

        <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-white/5 rounded-full overflow-hidden relative shadow-inner min-w-[60px]">
          <motion.div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#0c0d10] px-4 py-1.5 rounded-full border border-zinc-200 dark:border-white/10 shadow-sm shrink-0">
          <button
            onClick={prevDecryptionStep}
            disabled={currentDecryptionStepIndex === 0}
            className="p-1.5 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-20"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() =>
              setDecryptionPlaybackState(
                decryptionPlaybackState === "playing" ? "paused" : "playing"
              )
            }
            className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95"
          >
            {decryptionPlaybackState === "playing" ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>
          <div className="relative">
            <button
              onClick={nextDecryptionStep}
              disabled={
                currentDecryptionStepIndex === decryptionSteps.length - 1 ||
                isNextLocked
              }
              title={
                isNextLocked
                  ? "Solve the challenge checkpoint to unlock the next step"
                  : "Next stage"
              }
              className={`p-1.5 transition-colors ${
                isNextLocked
                  ? "text-zinc-400 dark:text-zinc-600 cursor-not-allowed"
                  : "text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
            {isNextLocked && (
              <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-500 ring-2 ring-white dark:ring-black" />
            )}
          </div>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setDecryptionAnimationSpeed(s)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                decryptionAnimationSpeed === s
                  ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Challenge Button in Footer */}
        {hasChallenge && !isCurrentCompleted && (
          <button
            onClick={() => setIsChallengeOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 rounded-xl text-xs font-bold transition-colors shrink-0"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Take Checkpoint</span>
          </button>
        )}
      </div>

      {/* Math Specification Modal */}
      <Modal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        title="ASCON-128 Decryption Mathematical Specification"
        icon={<Calculator className="w-5 h-5 text-emerald-500" />}
      >
        <div className="space-y-4 text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
          <p>
            ASCON is specified in <strong>NIST SP 800-232</strong>. Decryption operates across five
            64-bit words representing the 320-bit state:{" "}
            <code className="bg-zinc-100 dark:bg-white/10 px-1 py-0.5 rounded font-mono text-emerald-600 dark:text-emerald-400">
              S = x0 || x1 || x2 || x3 || x4
            </code>
            .
          </p>

          <div className="p-3 bg-zinc-100 dark:bg-white/5 rounded-xl font-mono text-[11px] space-y-1 text-zinc-900 dark:text-zinc-100">
            <div>1. S₀ = p¹²(IV || K || N) ⊕ (0¹⁹² || K)</div>
            <div>2. For each AD block: S = p⁶( (x0 ⊕ ADᵢ) || x1 || x2 || x3 || x4 )</div>
            <div>3. S = S ⊕ (0³¹⁹ || 1) [Domain Separation]</div>
            <div>4. For each Ciphertext block Cᵢ:</div>
            <div className="pl-4">Pᵢ = Cᵢ ⊕ x0</div>
            <div className="pl-4">x0 = Cᵢ</div>
            <div className="pl-4">S = p⁶(S)</div>
            <div>5. S = p¹²( S ⊕ (0⁶⁴ || K || 0¹²⁸) ) ⊕ (0¹⁹² || K)</div>
            <div>6. Candidate Tag T* = (x3 ⊕ K[0:63]) || (x4 ⊕ K[64:127])</div>
            <div>7. Verify T* == T in constant time. If false: purge P!</div>
          </div>
        </div>
      </Modal>

      {/* Code Reference Modal */}
      <Modal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
        title="ASCON Decryption Reference Implementation"
        icon={<Code className="w-5 h-5 text-emerald-500" />}
      >
        <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto leading-relaxed border border-white/10">
{`def ascon_decrypt(key, nonce, associateddata, ciphertext, expected_tag):
    assert len(key) == 16 and len(nonce) == 16 and len(expected_tag) == 16
    S = ascon_initialize(key, nonce)
    ascon_process_associated_data(S, associateddata)

    # Duplex plaintext recovery
    plaintext = bytearray()
    for block in get_blocks(ciphertext, rate=8):
        P_i = bytes_xor(block, S[0])
        plaintext += P_i
        S[0] = bytes_to_int(block)  # State absorbs ciphertext!
        ascon_permutation(S, rounds=6)

    # Finalization
    candidate_tag = ascon_finalize(S, key)

    # Constant-time tag check
    if not hmac.compare_digest(candidate_tag, expected_tag):
        # CRITICAL: Never release unverified plaintext!
        del plaintext
        raise AuthenticationError("Tag verification failed! Message tampered.")

    return bytes(plaintext)`}
        </pre>
      </Modal>
    </div>
  );
}
