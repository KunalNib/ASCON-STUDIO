"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Cpu, Zap, Layers, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { INITIAL_STATE_WORDS, INITIALIZED_STATE_BYTES } from "@/lib/asconDemoData";

export function DecryptionStateInit() {
  const [activeRound, setActiveRound] = useState(0);
  const [isPermuting, setIsPermuting] = useState(false);
  const [permuted, setPermuted] = useState(false);

  const runPermutationSimulation = () => {
    setIsPermuting(true);
    let r = 0;
    const interval = setInterval(() => {
      r++;
      setActiveRound(r);
      if (r >= 12) {
        clearInterval(interval);
        setIsPermuting(false);
        setPermuted(true);
      }
    }, 140);
  };

  const handleReset = () => {
    setActiveRound(0);
    setPermuted(false);
    setIsPermuting(false);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar items-center">
      {/* Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          State Initialization &amp; Sponge Symmetry
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">
          ASCON initializes the 320-bit state with the 64-bit IV, 128-bit Key, and 128-bit Nonce.
          Notice the key architectural marvel:{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">
            Decryption uses the exact same forward 12-round permutation (p¹²)
          </strong>
          — no inverse S-box or reverse linear layer circuits are needed!
        </p>
      </div>

      {/* Hardware highlight card */}
      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold">Lightweight IoT Architecture Win: </span>
          Traditional AES requires distinct encryption and decryption hardware (SubBytes vs InvSubBytes).
          ASCON sponge construction evaluates <code className="font-mono font-bold">p(S)</code> in the forward direction
          identically on both endpoints, reducing ASIC / FPGA gate count by ~40%.
        </div>
      </div>

      {/* 320-bit State Matrix Visual */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-3">
        {INITIAL_STATE_WORDS.map((w, idx) => {
          const displayBytes = permuted
            ? INITIALIZED_STATE_BYTES[w.label] || ["FF", "FF", "FF", "FF", "FF", "FF", "FF", "FF"]
            : [
                w.hex.slice(0, 2),
                w.hex.slice(2, 4),
                w.hex.slice(4, 6),
                w.hex.slice(6, 8),
                w.hex.slice(8, 10),
                w.hex.slice(10, 12),
                w.hex.slice(12, 14),
                w.hex.slice(14, 16),
              ];

          return (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {w.label}
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">{w.role}</span>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {displayBytes.map((byte, bIdx) => (
                  <motion.div
                    key={bIdx}
                    animate={
                      isPermuting
                        ? {
                            backgroundColor: ["rgba(16,185,129,0.1)", "rgba(16,185,129,0.4)", "rgba(16,185,129,0.1)"],
                            scale: [1, 1.05, 1],
                          }
                        : {}
                    }
                    transition={{ repeat: isPermuting ? Infinity : 0, duration: 0.3, delay: bIdx * 0.02 }}
                    className="p-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-center font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    {byte}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Permutation Controls & Round Progress */}
      <div className="w-full bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Forward Permutation p¹² Execution (12 Rounds: 0 → 11)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!permuted ? (
              <button
                onClick={runPermutationSimulation}
                disabled={isPermuting}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{isPermuting ? `Executing Round ${activeRound}/12...` : "Run Forward Permutation p¹²"}</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to S₀</span>
              </button>
            )}
          </div>
        </div>

        {/* 12-Round Progress Bar */}
        <div className="flex items-center gap-1.5 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-3 rounded-full border transition-all ${
                i < activeRound
                  ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : i === activeRound && isPermuting
                  ? "bg-yellow-400 border-yellow-300 animate-pulse"
                  : "bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-white/5"
              }`}
              title={`Round ${i}`}
            />
          ))}
        </div>

        {/* Round internals summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-200 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400">
          <div>
            <strong className="text-zinc-900 dark:text-white block mb-0.5">1. Constant Addition (pC)</strong>
            <span>x2 ⊕= cᵣ (round constant injects asymmetry).</span>
          </div>
          <div>
            <strong className="text-zinc-900 dark:text-white block mb-0.5">2. Substitution Layer (pS)</strong>
            <span>64 parallel 5-bit S-boxes provide high non-linearity.</span>
          </div>
          <div>
            <strong className="text-zinc-900 dark:text-white block mb-0.5">3. Linear Diffusion (pL)</strong>
            <span>xi ⊕= (xi ⋙ a) ⊕ (xi ⋙ b) spreads bits across words.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
