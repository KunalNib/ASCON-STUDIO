"use client";

import { useAsconStore, DecryptionNarrativeStep } from "@/store/useAsconStore";
import { CheckCircle2, Circle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { DECRYPTION_STEP_CHALLENGES } from "@/components/studio/decryption/DecryptionStepChallenge";

export function DecryptionTimeline() {
  const {
    currentDecryptionStepIndex,
    decryptionSteps,
    setDecryptionStep,
    decryptionCompletedSteps,
  } = useAsconStore();

  const getStepDisplayName = (step: DecryptionNarrativeStep) => {
    const titles: Record<DecryptionNarrativeStep, string> = {
      DECRYPT_INPUT_PARAMETERS: "1. Ciphertext & Tag Input",
      DECRYPT_STATE_INITIALIZATION: "2. State Initialization",
      DECRYPT_AD_PROCESSING: "3. AD Re-absorption",
      DECRYPT_CIPHERTEXT_PROCESSING: "4. Plaintext Recovery",
      DECRYPT_FINALIZATION: "5. Finalization & Squeeze",
      DECRYPT_TAG_VERIFICATION: "6. Tag Verification & Release",
    };
    return titles[step] || step;
  };

  return (
    <div id="tour-decryption-timeline" className="flex flex-col gap-1 select-none relative h-full w-full">
      {/* Vertical connector line */}
      <div className="absolute left-[13px] top-6 bottom-6 w-[2px] bg-zinc-200 dark:bg-white/10 z-0" />

      {decryptionSteps.map((stepStr, sIdx) => {
        const isPast = sIdx < currentDecryptionStepIndex;
        const isCurrent = sIdx === currentDecryptionStepIndex;
        const isCompleted = decryptionCompletedSteps.includes(stepStr);
        const hasChallenge = !!DECRYPTION_STEP_CHALLENGES[stepStr];

        return (
          <div
            key={stepStr}
            onClick={() => setDecryptionStep(sIdx)}
            className={`relative z-10 flex items-center gap-2.5 py-2 px-1.5 rounded-xl cursor-pointer transition-all ${
              isCurrent
                ? "bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 dark:border-emerald-500/30 shadow-sm"
                : "hover:bg-zinc-100 dark:hover:bg-white/5"
            }`}
          >
            {/* Step indicator */}
            <div className="relative flex items-center justify-center bg-white dark:bg-[#09090b] z-10 rounded-full shrink-0">
              {isCompleted && hasChallenge ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : isPast ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500/60 dark:text-emerald-500/50" />
              ) : isCurrent ? (
                <div className="w-5 h-5 flex items-center justify-center bg-white dark:bg-[#09090b]">
                  <motion.div
                    className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.9)]"
                    animate={{ scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-700 hover:text-zinc-600 dark:hover:text-zinc-500 transition-colors" />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-xs font-semibold transition-colors truncate flex-1 ${
                isCompleted && hasChallenge
                  ? "text-emerald-700 dark:text-emerald-400"
                  : isPast
                  ? "text-zinc-500 dark:text-zinc-400"
                  : isCurrent
                  ? "text-emerald-900 dark:text-emerald-200 font-bold"
                  : "text-zinc-600 dark:text-zinc-500"
              }`}
            >
              {getStepDisplayName(stepStr)}
            </span>

            {/* XP chip for challengeable steps */}
            {hasChallenge && !isCompleted && (
              <div className="shrink-0 flex items-center gap-0.5 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-1.5 py-0.5 rounded-full border border-zinc-200 dark:border-white/5">
                <Zap className="w-2.5 h-2.5 text-yellow-500" />
                <span>{DECRYPTION_STEP_CHALLENGES[stepStr]?.xpReward}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
