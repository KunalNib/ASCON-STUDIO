import { useAsconStore, NarrativeStep } from "@/store/useAsconStore";
import { CheckCircle2, Circle } from "lucide-react";
import { motion } from "framer-motion";

export function LearningTimeline() {
  const { currentStepIndex, steps, setStep } = useAsconStore();

  const getStepDisplayName = (step: NarrativeStep) => {
    const titles: Record<NarrativeStep, string> = {
      "INTRODUCTION": "Introduction",
      "SENSOR_DATA": "1. Sensor Data",
      "PREPARE_DATA": "2. Preparing the Data",
      "CRYPTO_PARAMS": "3. Cryptographic Params",
      "INITIAL_STATE": "4. Initial 320-bit State",
      "INITIALIZATION": "5. Initialization",
      "PERMUTATION": "6. Permutation",
      "SUBSTITUTION": "7. Substitution Layer",
      "DIFFUSION": "8. Linear Diffusion",
      "PLAINTEXT_PROCESSING": "9. Plaintext Processing",
      "FINALIZATION": "10. Finalization",
      "AUTH_TAG": "11. Authentication Tag",
      "FINAL_RESULT": "12. Final Result"
    };
    return titles[step] || step;
  };

  return (
    <div className="flex flex-col gap-2 select-none relative h-full">
      <div className="absolute left-[13px] top-6 bottom-6 w-[2px] bg-white/10 z-0"></div>
      
      {steps.map((stepStr, sIdx) => {
        const isPast = sIdx < currentStepIndex;
        const isCurrent = sIdx === currentStepIndex;
        const isFuture = sIdx > currentStepIndex;
        
        return (
          <div 
            key={stepStr}
            onClick={() => setStep(sIdx)}
            className={`relative z-10 flex items-center gap-3 py-2 px-1 rounded-lg cursor-pointer transition-all ${isCurrent ? 'bg-blue-900/40 border border-blue-500/20' : 'hover:bg-white/5'}`}
          >
              <div className="relative flex items-center justify-center bg-[#09090b] z-10 rounded-full">
                {isPast && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                {isCurrent && (
                  <div className="w-5 h-5 flex items-center justify-center bg-[#09090b]">
                    <motion.div 
                      className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.8)]"
                      animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }} 
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  </div>
                )}
                {isFuture && <Circle className="w-5 h-5 text-zinc-700 hover:text-zinc-500 transition-colors" />}
              </div>
              
              <span className={`text-sm font-semibold transition-colors truncate ${
                isPast ? 'text-zinc-400' : isCurrent ? 'text-blue-100 font-bold' : 'text-zinc-600'
              }`}>
                {getStepDisplayName(stepStr)}
              </span>
          </div>
        );
      })}
    </div>
  );
}
