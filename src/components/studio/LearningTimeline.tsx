import { useAsconStore, NarrativeStep } from "@/store/useAsconStore";
import { CheckCircle2, Circle, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { STEP_CHALLENGES } from "@/components/studio/StepChallenge";

export function LearningTimeline() {
  const { currentStepIndex, steps, setStep, completedSteps } = useAsconStore();

  const getStepDisplayName = (step: NarrativeStep) => {
    const titles: Record<NarrativeStep, string> = {
      "INPUT_PARAMETERS":      "1. Input & Parameters",
      "STATE_INITIALIZATION":  "2. State Initialization",
      "AD_PROCESSING":         "3. AD Processing",
      "PLAINTEXT_ENCRYPTION":  "4. Plaintext Encryption",
      "FINALIZATION":          "5. Finalization",
      "AUTH_OUTPUT":           "6. Auth & Output",
    };
    return titles[step] || step;
  };

  return (
    <div id="tour-timeline" className="flex flex-col gap-1 select-none relative h-full w-full">
      {/* Vertical connector line */}
      <div className="absolute left-[13px] top-6 bottom-6 w-[2px] bg-white/10 z-0" />

      {steps.map((stepStr, sIdx) => {
        const isPast      = sIdx < currentStepIndex;
        const isCurrent   = sIdx === currentStepIndex;
        const isFuture    = sIdx > currentStepIndex;
        const isCompleted = completedSteps.includes(stepStr);
        const hasChallenge = !!STEP_CHALLENGES[stepStr];

        return (
          <div
            key={stepStr}
            onClick={() => setStep(sIdx)}
            className={`relative z-10 flex items-center gap-2.5 py-1.5 px-1 rounded-lg cursor-pointer transition-all ${
              isCurrent
                ? "bg-blue-900/40 border border-blue-500/20"
                : "hover:bg-white/5"
            }`}
          >
            {/* Step indicator */}
            <div className="relative flex items-center justify-center bg-[#09090b] z-10 rounded-full shrink-0">
              {isCompleted && hasChallenge ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : isPast ? (
                <CheckCircle2 className="w-5 h-5 text-blue-500/60" />
              ) : isCurrent ? (
                <div className="w-5 h-5 flex items-center justify-center bg-[#09090b]">
                  <motion.div
                    className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                </div>
              ) : (
                <Circle className="w-5 h-5 text-zinc-700 hover:text-zinc-500 transition-colors" />
              )}
            </div>

            {/* Label */}
            <span
              className={`text-xs font-semibold transition-colors truncate flex-1 ${
                isCompleted && hasChallenge
                  ? "text-emerald-400"
                  : isPast
                  ? "text-zinc-500"
                  : isCurrent
                  ? "text-blue-100 font-bold"
                  : "text-zinc-600"
              }`}
            >
              {getStepDisplayName(stepStr)}
            </span>

            {/* XP chip for challengeable steps */}
            {hasChallenge && !isCompleted && (
              <div className="shrink-0 flex items-center gap-0.5 text-[9px] font-bold text-zinc-600">
                <Zap className="w-2.5 h-2.5" />
                <span>{STEP_CHALLENGES[stepStr]?.xpReward}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
