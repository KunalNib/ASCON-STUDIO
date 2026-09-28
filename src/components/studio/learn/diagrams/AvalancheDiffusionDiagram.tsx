"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

export function AvalancheDiffusionDiagram() {
  const [activeRound, setActiveRound] = useState<number>(3);

  // Progressive avalanche percentage across rounds
  const rounds = [
    { round: 0, flippedBits: 1, percent: "0.3%", status: "1 Bit Flipped at Input (x0 bit 0)" },
    { round: 1, flippedBits: 14, percent: "4.4%", status: "S-Box spreads bit vertically to 5 rows" },
    { round: 2, flippedBits: 68, percent: "21.3%", status: "Linear rotations disperse bits across word columns" },
    { round: 3, flippedBits: 142, percent: "44.4%", status: "Second S-Box layer multiplies differences" },
    { round: 4, flippedBits: 161, percent: "50.3%", status: "Full Strict Avalanche Criterion (SAC) reached: ~50% flipped" },
  ];

  const current = rounds[activeRound];

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-rose-600 dark:text-rose-400">
            Strict Avalanche Criterion (SAC)
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            The Avalanche Effect: 1 Bit Flip Diffusion
          </h4>
        </div>

        <span className="text-xs text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-full font-mono">
          Target SAC: 50.0% Bit Flips
        </span>
      </div>

      {/* Round Scrubber Buttons */}
      <div className="flex items-center gap-2 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
        {rounds.map((r, idx) => (
          <button
            key={r.round}
            onClick={() => setActiveRound(idx)}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeRound === idx
                ? "bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.4)]"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            Round {r.round}
          </button>
        ))}
      </div>

      {/* Visual Bit Grid (Representing 320 bits with 320 colored dots/squares) */}
      <div className="w-full max-w-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            320-Bit State Difference Map
          </span>
          <span className="font-mono text-rose-600 dark:text-rose-400 font-bold">
            {current.flippedBits} / 320 Bits Diverged ({current.percent})
          </span>
        </div>

        {/* 5 rows x 64 columns grid (rendered compactly) */}
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-32 gap-0.5">
              {Array.from({ length: 32 }).map((_, colIdx) => {
                // Deterministic pseudo-random threshold based on current active round
                const bitId = rowIdx * 32 + colIdx;
                const isFlipped =
                  activeRound === 0
                    ? bitId === 0
                    : activeRound === 1
                    ? (bitId * 7) % 320 < 14
                    : activeRound === 2
                    ? (bitId * 13) % 320 < 68
                    : activeRound === 3
                    ? (bitId * 19) % 320 < 142
                    : (bitId * 31) % 320 < 161;

                return (
                  <div
                    key={colIdx}
                    className={`h-2.5 rounded-sm transition-all duration-300 ${
                      isFlipped
                        ? "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.8)] scale-105"
                        : "bg-zinc-200 dark:bg-zinc-800"
                    }`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Flipped Bit (Diverged)
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-zinc-300 dark:bg-zinc-700" /> Unchanged Bit
          </div>
        </div>
      </div>

      {/* Explainer card */}
      <div className="w-full max-w-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-500/30 rounded-xl p-3.5 text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
        <strong>Round {current.round} Observation: </strong>
        {current.status}. By round 4, every output bit depends on every input bit with a probability of exactly 50%. An attacker cannot isolate any individual bit or guess secret keys!
      </div>
    </div>
  );
}
