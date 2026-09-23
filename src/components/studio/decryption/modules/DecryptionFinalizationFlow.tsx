"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { Key, Lock, ArrowDown, Cpu, Sparkles } from "lucide-react";
import {
  AUTH_TAG_BYTES,
  FINAL_STATE_BEFORE_TAG,
  DEMO_KEY,
  TAMPERED_CANDIDATE_TAG,
} from "@/lib/asconDemoData";

export function DecryptionFinalizationFlow() {
  const { decryptionTampered } = useAsconStore();
  const [squeezeStep, setSqueezeStep] = useState(0);
  const [visibleBytes, setVisibleBytes] = useState(0);

  const displayTagBytes = decryptionTampered ? TAMPERED_CANDIDATE_TAG : AUTH_TAG_BYTES;

  useEffect(() => {
    setSqueezeStep(0);
    setVisibleBytes(0);
    const t1 = setTimeout(() => setSqueezeStep(1), 500);
    const t2 = setTimeout(() => setSqueezeStep(2), 1200);
    const t3 = setTimeout(() => {
      setSqueezeStep(3);
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleBytes(count);
        if (count >= 16) clearInterval(interval);
      }, 90);
    }, 2000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [decryptionTampered]);

  const stateWords = [
    { label: "x0", bytes: FINAL_STATE_BEFORE_TAG.x0, role: "Rate", dim: true },
    { label: "x1", bytes: FINAL_STATE_BEFORE_TAG.x1, role: "Capacity", dim: true },
    { label: "x2", bytes: FINAL_STATE_BEFORE_TAG.x2, role: "Capacity", dim: true },
    { label: "x3", bytes: FINAL_STATE_BEFORE_TAG.x3, role: "Candidate Tag [0:7]", dim: false },
    { label: "x4", bytes: FINAL_STATE_BEFORE_TAG.x4, role: "Candidate Tag [8:15]", dim: false },
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar items-center">
      {/* Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Finalization &amp; Candidate Tag Squeeze
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">
          Before verifying authenticity, the decryptor computes its own{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">Candidate Tag (T*)</strong> by re-injecting the Key,
          running the 12-round permutation <code className="font-mono font-bold">p¹²</code>, and squeezing the capacity words.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 w-full">
        {/* Left: Final State Matrix */}
        <div className="flex-1 bg-white dark:bg-[#0c0d10] rounded-3xl border border-zinc-200 dark:border-white/10 p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              State Words After Final p¹²
            </span>
            <span className="text-[11px] font-mono text-zinc-400">320 bits total</span>
          </div>

          <div className="flex flex-col gap-2">
            {stateWords.map((w, i) => (
              <motion.div
                key={w.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  w.dim
                    ? "bg-zinc-50 dark:bg-zinc-950/40 border-zinc-200 dark:border-white/5 opacity-50"
                    : squeezeStep >= 1
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500/40 shadow-sm"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/5"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs border ${
                      w.dim
                        ? "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"
                        : "bg-emerald-600 text-white border-emerald-500"
                    }`}
                  >
                    {w.label}
                  </span>
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {w.role}
                  </span>
                </div>

                <div className="flex gap-1 font-mono text-xs">
                  {w.bytes.slice(0, 4).join(" ")} ...
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-[11px] text-zinc-500 leading-relaxed pt-2 border-t border-zinc-200 dark:border-white/5">
            Key is XORed with capacity words <code className="font-mono font-bold text-zinc-800 dark:text-zinc-200">x3</code> and{" "}
            <code className="font-mono font-bold text-zinc-800 dark:text-zinc-200">x4</code> to yield the candidate tag bytes.
          </div>
        </div>

        {/* Right: Squeezed Candidate Tag Display */}
        <div className="flex-1 bg-white dark:bg-[#0c0d10] rounded-3xl border border-zinc-200 dark:border-white/10 p-5 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Calculated Candidate Tag (T*)
            </span>
            <span className="text-[11px] font-mono text-zinc-400">128 bits</span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center gap-4 py-6">
            <div className="text-xs text-zinc-500 font-mono text-center">
              T* = (x3 ⊕ Key[0:63]) ‖ (x4 ⊕ Key[64:127])
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {displayTagBytes.map((byte, idx) => {
                const isRevealed = idx < visibleBytes;
                return (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.7, opacity: 0 }}
                    animate={{
                      scale: isRevealed ? 1 : 0.7,
                      opacity: isRevealed ? 1 : 0.2,
                    }}
                    className={`w-10 h-11 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold ${
                      isRevealed
                        ? decryptionTampered
                          ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-700 dark:text-rose-300"
                          : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-300"
                        : "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-400"
                    }`}
                  >
                    <span>{isRevealed ? byte : "--"}</span>
                    <span className="text-[8px] text-zinc-400">[{idx}]</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="text-center text-xs text-zinc-500 mt-2">
              {visibleBytes >= 16 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  ✓ Candidate Tag successfully generated from state trajectory.
                </span>
              ) : (
                <span>Squeezing bits from capacity layer...</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
