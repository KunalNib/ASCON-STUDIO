"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { Unlock, PanelLeftClose, PanelLeft, Zap, Trophy, ShieldCheck } from "lucide-react";
import { DecryptionGuidedLaboratory } from "@/components/studio/decryption/DecryptionGuidedLaboratory";
import { DecryptionTimeline } from "@/components/studio/decryption/DecryptionTimeline";
import { DECRYPTION_STEP_CHALLENGES } from "@/components/studio/decryption/DecryptionStepChallenge";
import { useState } from "react";
import { motion } from "framer-motion";

const MAX_DECRYPTION_XP = 900;

export default function DecryptionModule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { decryptionXp, decryptionCompletedSteps } = useAsconStore();

  const completedCount = decryptionCompletedSteps.filter(
    (s) => DECRYPTION_STEP_CHALLENGES[s] !== undefined
  ).length;
  const totalChallenges = Object.keys(DECRYPTION_STEP_CHALLENGES).length;
  const progressPct = (completedCount / totalChallenges) * 100;
  const xpPct = (decryptionXp / MAX_DECRYPTION_XP) * 100;

  return (
    <div className="px-3 pt-3 pb-2 w-full mx-auto flex flex-col h-[calc(100vh-3.5rem)] gap-2">
      {/* ── Mission Banner ── */}
      <div
        id="decryption-mission-banner"
        className="shrink-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-2.5 flex items-center gap-4 shadow-sm dark:shadow-lg transition-colors"
      >
        {/* Title */}
        <div className="flex items-center gap-2 shrink-0">
          <Trophy className="w-4 h-4 text-emerald-500" />
          <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Decryption &amp; Integrity Mission
          </span>
        </div>

        {/* Step progress bar */}
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <span className="text-[10px] text-zinc-500 font-mono shrink-0">
            {completedCount}/{totalChallenges} Steps
          </span>
          <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
        </div>

        {/* XP bar */}
        <div className="flex items-center gap-2 shrink-0">
          <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
          <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-500 to-emerald-500 rounded-full"
              animate={{ width: `${xpPct}%` }}
              transition={{ type: "spring", stiffness: 80 }}
            />
          </div>
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {decryptionXp}
            <span className="text-zinc-500 dark:text-zinc-600 font-normal"> / {MAX_DECRYPTION_XP} XP</span>
          </span>
        </div>
      </div>

      {/* ── Compact header ── */}
      <header className="flex items-center gap-3 shrink-0 px-1">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all hidden md:flex items-center justify-center"
          title={isSidebarOpen ? "Collapse Timeline" : "Expand Timeline"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
        <Unlock className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
        <h1 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
          Authenticated Decryption Laboratory
        </h1>
        <span className="text-zinc-500 dark:text-zinc-600 text-xs hidden lg:inline">
          — Verified ASCON duplex recovery &amp; constant-time MAC gating
        </span>
      </header>

      {/* ── Main layout ── */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 w-full relative">
        {/* Timeline sidebar */}
        {isSidebarOpen && (
          <div className="hidden md:flex w-60 shrink-0 bg-white dark:bg-[#09090b] rounded-2xl border border-zinc-200 dark:border-white/5 p-3 shadow-sm dark:shadow-xl overflow-y-auto custom-scrollbar transition-all duration-300">
            <DecryptionTimeline />
          </div>
        )}

        {/* Main visualization engine */}
        <div className="flex-1 min-w-0 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-sm dark:shadow-2xl p-0 transition-all duration-300">
          <DecryptionGuidedLaboratory />
        </div>
      </div>
    </div>
  );
}
