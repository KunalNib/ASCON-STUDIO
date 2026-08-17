"use client";

import { motion } from "framer-motion";
import { Copyright } from "lucide-react";
import React, { useState } from "react";
import { useAsconStore } from "@/store/useAsconStore";

export function PermutationVisualizer() {
  const { currentStepIndex, steps, nextStep, prevStep } = useAsconStore();
  const [activeFlippedBit, setActiveFlippedBit] = useState<number | null>(null);
  
  // A 5x64 mock grid represented as smaller simplified visual blocks
  const layers = Array.from({ length: 5 }, (_, i) => i);
  const blocks = Array.from({ length: 8 }, (_, i) => i); // Visual simplification of 64 bits

  const toggleBit = (blockIndex: number) => {
    setActiveFlippedBit(activeFlippedBit === blockIndex ? null : blockIndex);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#040405] text-zinc-300 font-mono">
      <div className="text-center mb-6 flex flex-col items-center">
        <h3 className="text-xl font-bold text-blue-400 mb-2">ASCON Permutation Layer</h3>
        <p className="text-xs text-zinc-500 max-w-sm mb-4">
          Pipeline Step: {steps[currentStepIndex] || "IDLE"}
        </p>
        <div className="flex gap-2 mb-4">
           <button onClick={prevStep} className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20 transition">Previous Step</button>
           <button onClick={nextStep} className="px-3 py-1 bg-blue-600/50 rounded text-xs hover:bg-blue-600/80 transition text-white">Next Step</button>
        </div>
      </div>
      
      <div className="flex flex-col gap-4">
        {layers.map((layerId) => (
          <div key={layerId} className="flex gap-2 items-center">
            <span className="text-xs text-zinc-600 mr-4 w-12 text-right">x{layerId}</span>
            {blocks.map((blockId) => {
              const bitId = layerId * 8 + blockId;
              const isFlipped = activeFlippedBit === bitId;
              const isAvalanche = activeFlippedBit !== null && bitId > activeFlippedBit && (bitId % 3 === 0 || bitId % (layerId+1) === 0) && currentStepIndex > 4;

              return (
                <motion.button
                  key={blockId}
                  onClick={() => toggleBit(bitId)}
                  initial={{ backgroundColor: "#18181b", scale: 0.8 }}
                  animate={{ 
                    backgroundColor: isFlipped ? "#ef4444" : isAvalanche ? "#991b1b" : currentStepIndex > 3 ? "#3b82f6" : "#18181b",
                    scale: isFlipped || isAvalanche ? 1.1 : 1,
                    borderColor: isFlipped ? "#f87171" : isAvalanche ? "#ef4444" : "#27272a"
                  }}
                  transition={{ duration: 0.5 }}
                  className="w-10 h-10 border border-zinc-800 rounded flex items-center justify-center text-[10px] cursor-pointer"
                  title="Click to flip bit"
                >
                  {isFlipped ? "0" : "1"}
                </motion.button>
              )
            })}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex gap-4 text-xs text-blue-400">
        <span className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" /> {currentStepIndex > 3 ? "Active Permutation" : "Standby"}</span>
        {activeFlippedBit !== null && (
           <span className="flex items-center gap-1 text-red-400"><div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> Observing Avalanche Diffusion</span>
        )}
      </div>
    </div>
  );
}
