"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Grid, Eye, Cpu, Layers, Sparkles } from "lucide-react";

export function StateMatrixDiagram() {
  const [selectedWord, setSelectedWord] = useState<number | null>(0);
  const [selectedBitCol, setSelectedBitCol] = useState<number | null>(15);
  const [viewMode, setViewMode] = useState<"words" | "bitslice">("words");

  const words = [
    {
      index: 0,
      name: "x0",
      role: "Rate (Public)",
      color: "emerald",
      bgClass: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-200",
      pillClass: "bg-emerald-500 text-white",
      description: "Rate word (64-bit). Used for absorbing Plaintext & Associated Data, and squeezing Ciphertext blocks. The only word directly exposed in data operations.",
    },
    {
      index: 1,
      name: "x1",
      role: "Capacity (Secret)",
      color: "blue",
      bgClass: "bg-blue-50 dark:bg-blue-950/30 border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-blue-200",
      pillClass: "bg-blue-500 text-white",
      description: "Capacity word 1 (64-bit). Stores upper half of Key during init. Absorbs secret key again during finalization.",
    },
    {
      index: 2,
      name: "x2",
      role: "Capacity + Round Constant",
      color: "indigo",
      bgClass: "bg-indigo-50 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-500/40 text-indigo-800 dark:text-indigo-200",
      pillClass: "bg-indigo-500 text-white",
      description: "Capacity word 2 (64-bit). Receives round constants c_r during constant addition (p_C) to break cryptographic symmetry between rounds.",
    },
    {
      index: 3,
      name: "x3",
      role: "Capacity + Tag MSB",
      color: "purple",
      bgClass: "bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-200",
      pillClass: "bg-purple-500 text-white",
      description: "Capacity word 3 (64-bit). Absorbs upper half of Nonce during init. During finalization, XORed with Key to produce the first 64 bits of the Authentication Tag.",
    },
    {
      index: 4,
      name: "x4",
      role: "Capacity + Tag LSB",
      color: "rose",
      bgClass: "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200",
      pillClass: "bg-rose-500 text-white",
      description: "Capacity word 4 (64-bit). Absorbs lower half of Nonce. During finalization, XORed with Key to produce the lower 64 bits of the Authentication Tag.",
    },
  ];

  // Sample hex representations for illustrative state
  const sampleHex = [
    "80400c0600000000", // x0 (IV)
    "0001020304050607", // x1 (Key upper)
    "08090a0b0c0d0e0f", // x2 (Key lower)
    "0001020304050607", // x3 (Nonce upper)
    "08090a0b0c0d0e0f", // x4 (Nonce lower)
  ];

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-5">
      {/* Header & Mode Switch */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Internal Memory Architecture
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            The 320-Bit State Register Matrix
          </h4>
        </div>

        {/* View Toggle */}
        <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode("words")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "words" ? "bg-white dark:bg-black text-blue-600 dark:text-blue-400 shadow-sm" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Word Lanes (5 × 64b)
          </button>
          <button
            onClick={() => setViewMode("bitslice")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === "bitslice" ? "bg-white dark:bg-black text-purple-600 dark:text-purple-400 shadow-sm" : "text-zinc-600 dark:text-zinc-400"
            }`}
          >
            Vertical Bitslices (64 × 5b)
          </button>
        </div>
      </div>

      {/* Main Matrix Visual */}
      <div className="w-full max-w-3xl space-y-2">
        {words.map((w, idx) => {
          const isSelected = selectedWord === idx;
          return (
            <motion.div
              key={w.name}
              onClick={() => setSelectedWord(idx)}
              whileHover={{ scale: 1.01 }}
              className={`p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                isSelected
                  ? `${w.bgClass} shadow-md`
                  : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className={`w-8 h-8 rounded-xl font-mono font-bold text-xs flex items-center justify-center ${w.pillClass}`}>
                    {w.name}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white mr-2">
                      Word {idx} (Lane {idx})
                    </span>
                    <span className="text-[11px] text-zinc-500 font-medium">
                      {w.role}
                    </span>
                  </div>
                </div>

                <span className="font-mono text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-lg self-start sm:self-auto">
                  0x{sampleHex[idx]}
                </span>
              </div>

              {/* Bit visualization cells (mocking 64 bits with 32 visual segments) */}
              <div className="grid grid-cols-32 gap-0.5 mt-2">
                {Array.from({ length: 32 }).map((_, bitIdx) => {
                  const isHighlightedCol = selectedBitCol !== null && Math.floor(selectedBitCol / 2) === bitIdx;
                  return (
                    <div
                      key={bitIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBitCol(bitIdx * 2);
                        setSelectedWord(idx);
                      }}
                      className={`h-4 rounded-sm transition-all cursor-pointer ${
                        viewMode === "bitslice" && isHighlightedCol
                          ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)] scale-110 z-10"
                          : idx === 0
                          ? "bg-emerald-300 dark:bg-emerald-600/50 hover:bg-emerald-400"
                          : "bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400"
                      }`}
                      title={`Bit ${bitIdx * 2} of Word ${w.name}`}
                    />
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Dynamic Detail Card */}
      {selectedWord !== null && (
        <motion.div
          key={selectedWord}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 font-mono font-bold">
              {words[selectedWord].name}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-sm text-zinc-900 dark:text-white">
                  Word {words[selectedWord].name}: {words[selectedWord].role}
                </h5>
                <span className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded">
                  Bits {selectedWord * 64} to {(selectedWord + 1) * 64 - 1}
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {words[selectedWord].description}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bitslice Explainer Callout */}
      <div className="w-full max-w-3xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 rounded-xl p-3.5 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
        <div>
          <strong className="font-bold">What is a Bitslice? </strong>
          Instead of running 64 separate S-boxes one after another in a loop, ASCON aligns the five 64-bit words vertically so that bit <em>i</em> from each word forms a 5-bit vector <code className="bg-purple-200 dark:bg-purple-900/50 px-1 rounded">(x0[i], x1[i], x2[i], x3[i], x4[i])</code>. Standard 64-bit CPU instructions (AND, XOR, NOT) transform all 64 S-Boxes simultaneously in parallel!
        </div>
      </div>
    </div>
  );
}
