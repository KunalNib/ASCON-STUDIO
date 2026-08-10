"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { Lock } from "lucide-react";
import { GuidedLaboratory } from "@/components/studio/modules/GuidedLaboratory";
import { ProfessionalLearningPanel } from "@/components/studio/modules/ProfessionalLearningPanel";
import { LearningTimeline } from "@/components/studio/LearningTimeline";

export default function EncryptionModule() {
  return (
    <div className="p-4 md:p-6 w-full mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0 px-2 lg:px-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Lock className="w-8 h-8 text-blue-500" /> Interactive Execution Laboratory
          </h1>
          <p className="text-zinc-400">Deep-dive sequentially through the internal mechanisms of ASCON.</p>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6 w-full">
        
        {/* Timeline (Left) */}
        <div className="hidden md:flex w-64 shrink-0 bg-[#09090b] rounded-3xl border border-white/5 p-4 shadow-xl overflow-y-auto custom-scrollbar">
           <LearningTimeline />
        </div>
        
        {/* Main Vis Engine (Center) */}
        <div className="flex-1 min-w-0 bg-black border border-white/10 rounded-3xl flex flex-col relative overflow-hidden shadow-2xl p-4 md:p-6">
            <GuidedLaboratory />
        </div>

        {/* Educational Panel (Right) */}
        <div className="w-full md:w-80 shrink-0 flex flex-col gap-4 min-w-0">
          <ProfessionalLearningPanel />
        </div>
        
      </div>
    </div>
  );
}
