"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { Play, Pause, SkipBack, SkipForward, ArrowRight } from "lucide-react";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function MicroTimeline() {
  const { currentStepIndex, steps, nextStep, prevStep } = useAsconStore();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentStepIndex < steps.length - 1) {
          nextStep();
        } else {
          setIsPlaying(false);
        }
      }, 2500); // 2.5s per micro-step automatically
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentStepIndex, steps.length, nextStep]);

  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  return (
    <div className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-zinc-300 font-bold text-sm tracking-wide flex items-center gap-2">
            SIMULATION TIMELINE
            <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded uppercase">{steps[currentStepIndex].replace(/_/g, " ")}</span>
          </h4>
        </div>
        <div className="flex gap-2">
          <button onClick={prevStep} disabled={currentStepIndex === 0} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 transition-colors">
            <SkipBack className="w-3 h-3" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-colors">
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          </button>
          <button onClick={nextStep} disabled={currentStepIndex === steps.length - 1} className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 text-zinc-400 transition-colors">
            <SkipForward className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {/* Scrub Track */}
      <div className="relative w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ ease: "easeInOut" }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-[10px] text-zinc-600 uppercase font-mono tracking-wider">
        <span>Init</span>
        <span>Permutation</span>
        <span>Tag</span>
      </div>
    </div>
  );
}
