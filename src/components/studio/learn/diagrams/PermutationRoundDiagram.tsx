"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, ArrowRight, ShieldCheck, Cpu, ChevronRight, Binary, Zap } from "lucide-react";

export function PermutationRoundDiagram() {
  const [activeLayer, setActiveLayer] = useState<"constant" | "sbox" | "diffusion">("constant");
  const [selectedRound, setSelectedRound] = useState(0);

  // ASCON round constants for 12 rounds
  const roundConstants = [
    { round: 0, hex: "0xf0", val: "11110000" },
    { round: 1, hex: "0xe1", val: "11100001" },
    { round: 2, hex: "0xd2", val: "11010010" },
    { round: 3, hex: "0xc3", val: "11000011" },
    { round: 4, hex: "0xb4", val: "10110100" },
    { round: 5, hex: "0xa5", val: "10100101" },
    { round: 6, hex: "0x96", val: "10010110" },
    { round: 7, hex: "0x87", val: "10000111" },
    { round: 8, hex: "0x78", val: "01111000" },
    { round: 9, hex: "0x69", val: "01101001" },
    { round: 10, hex: "0x5a", val: "01011010" },
    { round: 11, hex: "0x4b", val: "01001011" },
  ];

  // Rotation parameters for Linear Diffusion (p_L)
  const linearRotations = [
    { word: "x0", r1: 19, r2: 28, formula: "x0 ⊕ (x0 >>> 19) ⊕ (x0 >>> 28)" },
    { word: "x1", r1: 61, r2: 39, formula: "x1 ⊕ (x1 >>> 61) ⊕ (x1 >>> 39)" },
    { word: "x2", r1: 1,  r2: 6,  formula: "x2 ⊕ (x2 >>> 1) ⊕ (x2 >>> 6)" },
    { word: "x3", r1: 10, r2: 17, formula: "x3 ⊕ (x3 >>> 10) ⊕ (x3 >>> 17)" },
    { word: "x4", r1: 7,  r2: 41, formula: "x4 ⊕ (x4 >>> 7) ⊕ (x4 >>> 41)" },
  ];

  // S-Box 5-bit lookup table sample mappings
  const sboxSample = [
    { in: "00000", out: "00100" },
    { in: "00001", out: "01011" },
    { in: "00010", out: "10011" },
    { in: "00011", out: "01100" },
    { in: "00100", out: "11001" },
    { in: "11111", out: "00001" },
  ];

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            The Mathematical Permutation Engine
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Inside Round Permutation: <code className="text-purple-600 dark:text-purple-400 font-mono">p = p_L ∘ p_S ∘ p_C</code>
          </h4>
        </div>

        {/* Round Selector Pill */}
        <div className="flex items-center gap-1.5 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
          <span className="text-zinc-500 px-2">Round:</span>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(Number(e.target.value))}
            className="bg-white dark:bg-black border border-zinc-300 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200"
          >
            {roundConstants.map((r) => (
              <option key={r.round} value={r.round}>
                Round {r.round} ({r.hex})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Layer Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 w-full max-w-2xl">
        {[
          { id: "constant", title: "1. Constant Addition (p_C)", subtitle: "Breaks Symmetry" },
          { id: "sbox", title: "2. S-Box Substitution (p_S)", subtitle: "Non-Linear Confusion" },
          { id: "diffusion", title: "3. Linear Diffusion (p_L)", subtitle: "Bit Rotation Dispersion" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveLayer(tab.id as any)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeLayer === tab.id
                ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500 shadow-sm"
                : "bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
            }`}
          >
            <div className={`text-xs font-bold ${activeLayer === tab.id ? "text-purple-700 dark:text-purple-300" : "text-zinc-800 dark:text-zinc-200"}`}>
              {tab.title}
            </div>
            <div className="text-[10px] text-zinc-500 mt-0.5">{tab.subtitle}</div>
          </button>
        ))}
      </div>

      {/* Interactive Layer Visual Display */}
      <div className="w-full max-w-2xl min-h-[260px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* Layer 1: Constant Addition */}
          {activeLayer === "constant" && (
            <motion.div
              key="constant"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Zap className="w-4 h-4" /> Layer 1: Round Constant Addition (p_C)
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  Operates only on Word x2
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 p-4 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl">
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono">Word x2</span>
                  <div className="font-mono text-sm font-bold text-zinc-900 dark:text-white px-3 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800">
                    x2[63:0]
                  </div>
                </div>

                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">⊕</span>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase font-mono">Round {selectedRound} Constant</span>
                  <div className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-500/30">
                    {roundConstants[selectedRound].hex} ({roundConstants[selectedRound].val})
                  </div>
                </div>

                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">→</span>

                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-mono">Updated x2</span>
                  <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30">
                    x2 ⊕ c_r
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <strong>Why is this needed?</strong> If every round used the exact same math with no changes, the algorithm would have rotational symmetry, allowing attackers to perform slide attacks. XORing a unique 8-bit constant into the low byte of x2 in every round makes each round mathematically distinct.
              </p>
            </motion.div>
          )}

          {/* Layer 2: S-Box Substitution */}
          {activeLayer === "sbox" && (
            <motion.div
              key="sbox"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Layer 2: 5-Bit Non-Linear S-Box (p_S)
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  Applied vertically to all 64 columns
                </span>
              </div>

              {/* S-Box Flow Visualizer */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {sboxSample.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center font-mono text-xs"
                  >
                    <span className="text-[10px] text-zinc-400">In</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{s.in}</span>
                    <span className="text-purple-500 my-0.5">↓</span>
                    <span className="text-[10px] text-rose-500">Out</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">{s.out}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <strong>Algebraic Non-Linearity:</strong> ASCON's 5-bit S-Box has algebraic degree 2. It is the ONLY non-linear component in the entire cipher, preventing linear and differential cryptanalysis attacks while running natively on microcontrollers using simple <code className="bg-zinc-100 dark:bg-zinc-800 px-1 rounded">x = x ⊕ (~a & b)</code> bitwise logic.
              </p>
            </motion.div>
          )}

          {/* Layer 3: Linear Diffusion */}
          {activeLayer === "diffusion" && (
            <motion.div
              key="diffusion"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4" /> Layer 3: Linear Diffusion Layer (p_L)
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  Right Rotation (ROTR)
                </span>
              </div>

              {/* 5 Word Equations */}
              <div className="space-y-1.5 font-mono text-xs">
                {linearRotations.map((lr) => (
                  <div
                    key={lr.word}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800"
                  >
                    <span className="font-bold text-purple-600 dark:text-purple-400">{lr.word}</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">{lr.formula}</span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      Rotations: ≫{lr.r1}, ≫{lr.r2}
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <strong>Spreading the Ripple:</strong> While the S-box mixes bits vertically within the same column, the linear diffusion layer rotates words horizontally by asymmetrical prime amounts. In just 2 to 3 rounds, a change to a single bit diffuses across the entire 320-bit state (Strict Avalanche Effect).
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
