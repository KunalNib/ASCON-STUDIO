"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { Lock, PanelLeftClose, PanelLeft, Zap, Trophy } from "lucide-react";
import { GuidedLaboratory } from "@/components/studio/modules/GuidedLaboratory";
import { LearningTimeline } from "@/components/studio/LearningTimeline";
import { STEP_CHALLENGES } from "@/components/studio/StepChallenge";
import { useState } from "react";
import { motion } from "framer-motion";

const MAX_ENCRYPTION_XP = 900;

export default function EncryptionModule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { encryptionXp, completedSteps } = useAsconStore();

  const completedCount = completedSteps.filter(
    (s) => STEP_CHALLENGES[s] !== undefined
  ).length;
  const totalChallenges = Object.keys(STEP_CHALLENGES).length;
  const progressPct = (completedCount / totalChallenges) * 100;
  const xpPct = (encryptionXp / MAX_ENCRYPTION_XP) * 100;

  return (
    <div className="px-3 pt-3 pb-2 w-full mx-auto flex flex-col h-[calc(100vh-3.5rem)] gap-2">

      {/* ── Mission Banner ── */}
      <div
        id="guide-mission-banner"
        className="shrink-0 bg-[#09090b] border border-white/8 rounded-2xl px-4 py-2.5 flex items-center gap-4 shadow-lg"
      >
        {/* Title */}
        <div className="flex items-center gap-2 shrink-0">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
            Encryption Mission
          </span>
        </div>

        {/* Step progress bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
            {completedCount}/{totalChallenges} Steps
          </span>
          <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
        </div>

        {/* XP bar */}
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
              animate={{ width: `${xpPct}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
          <span className="text-[11px] font-bold text-yellow-400 font-mono">
            {encryptionXp}
            <span className="text-zinc-600 font-normal"> / {MAX_ENCRYPTION_XP} XP</span>
          </span>
        </div>
      </div>

      {/* ── Compact header ── */}
      <header className="flex items-center gap-3 shrink-0 px-1">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-all hidden md:flex items-center justify-center"
          title={isSidebarOpen ? "Collapse Timeline" : "Expand Timeline"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
        <Lock className="w-4 h-4 text-blue-500 shrink-0" />
        <h1 className="text-sm font-bold tracking-tight text-white">Interactive Execution Laboratory</h1>
        <span className="text-zinc-600 text-xs hidden lg:inline">— ASCON step-by-step walkthrough</span>
      </header>

      {/* ── Main layout ── */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 w-full relative">

        {/* Timeline sidebar */}
        {isSidebarOpen && (
          <div className="hidden md:flex w-56 shrink-0 bg-[#09090b] rounded-2xl border border-white/5 p-3 shadow-xl overflow-y-auto custom-scrollbar transition-all duration-300">
            <LearningTimeline />
          </div>
        )}

        {/* Main visualization engine */}
        <div className="flex-1 min-w-0 bg-black border border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-2xl p-0 transition-all duration-300">
          <GuidedLaboratory />
        </div>

      </div>
    </div>
  );
}
