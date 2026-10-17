"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import {
  Lock,
  Key,
  Layers,
  ArrowRight,
  ShieldAlert,
  Cpu,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  FINAL_STATE_BEFORE_TAG,
  DEMO_KEY,
  ROUND_CONSTANTS,
} from "@/lib/asconDemoData";

export function FinalizationAndTag() {
  const { session, nextStep, key } = useAsconStore();
  const [activeStage, setActiveStage] = useState<1 | 2 | 3>(1);
  const [animatingRounds, setAnimatingRounds] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);

  const activeKey = key || session?.key || DEMO_KEY;
  const keyHi = activeKey.slice(0, 16);
  const keyLo = activeKey.slice(16, 32);

  // Auto-progress animation on mount
  useEffect(() => {
    setActiveStage(1);
    const t1 = setTimeout(() => {
      setActiveStage(2);
      setAnimatingRounds(true);
      let r = 0;
      const interval = setInterval(() => {
        r++;
        setCurrentRound(r);
        if (r >= 12) {
          clearInterval(interval);
          setAnimatingRounds(false);
          setActiveStage(3);
        }
      }, 120);
    }, 1200);

    return () => clearTimeout(t1);
  }, []);

  const stateWords = [
    {
      label: "x0",
      bytes: FINAL_STATE_BEFORE_TAG.x0,
      role: "Rate Word",
      dim: true,
      desc: "Contains mixed rate data; discarded before tag extraction.",
    },
    {
      label: "x1",
      bytes: FINAL_STATE_BEFORE_TAG.x1,
      role: "Capacity Word",
      dim: true,
      desc: "Absorbs Key[0:7] in finalization sandwich.",
    },
    {
      label: "x2",
      bytes: FINAL_STATE_BEFORE_TAG.x2,
      role: "Capacity Word",
      dim: true,
      desc: "Absorbs Key[8:15] in finalization sandwich.",
    },
    {
      label: "x3",
      bytes: FINAL_STATE_BEFORE_TAG.x3,
      role: "Tag Reservoir [0:7]",
      dim: false,
      color: "emerald",
      desc: "Secret capacity word that will form the first 64 bits of the tag.",
    },
    {
      label: "x4",
      bytes: FINAL_STATE_BEFORE_TAG.x4,
      role: "Tag Reservoir [8:15]",
      dim: false,
      color: "emerald",
      desc: "Secret capacity word that will form the last 64 bits of the tag.",
    },
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar">

      {/* ── Step 5 Header ── */}
      <div className="text-center shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold mb-2 border border-rose-500/20">
          <Layers className="w-3.5 h-3.5" />
          <span>Step 5 of 6 · State Finalization &amp; Permutation</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Lock className="w-7 h-7 text-rose-600 dark:text-rose-500" />
          State Finalization &amp; The Key Sandwich
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed">
          Before releasing the authentication tag, ASCON executes the <strong>Key Sandwich</strong>:
          the secret key is absorbed into capacity words, permuted through 12 rounds of <code className="font-mono font-bold text-rose-500">p¹²</code>,
          and re-injected a second time to prevent length-extension and state-recovery attacks.
        </p>
      </div>

      {/* ── Key Sandwich Three-Step Visual Pipeline ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">

        {/* Step 1: Key Ingestion */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
            activeStage >= 1
              ? "bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-500/30 shadow-sm"
              : "bg-zinc-50 dark:bg-[#0c0d10] border-zinc-200 dark:border-white/5 opacity-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> 1. Key Ingestion
            </span>
            <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              1
            </span>
          </div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
            XOR Key into Capacity Words
          </h4>
          <div className="font-mono text-[11px] p-2 bg-white dark:bg-black/40 rounded-xl border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300">
            x1 ⊕ Key[0:7]<br />
            x2 ⊕ Key[8:15]
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
            Re-binds the internal memory to the secret key after absorbing all plaintext data.
          </p>
        </div>

        {/* Step 2: Full 12-Round Permutation */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
            activeStage >= 2
              ? "bg-blue-50/70 dark:bg-blue-950/20 border-blue-300 dark:border-blue-500/30 shadow-sm"
              : "bg-zinc-50 dark:bg-[#0c0d10] border-zinc-200 dark:border-white/5 opacity-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${animatingRounds ? "animate-spin" : ""}`} /> 2. p¹² Permutation
            </span>
            <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
              2
            </span>
          </div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
            12 Full Rounds (Rounds 0–11)
          </h4>
          <div className="flex items-center justify-between font-mono text-[11px] p-2 bg-white dark:bg-black/40 rounded-xl border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300">
            <span>Rounds: {currentRound}/12 complete</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">pC → pS → pL</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
            Diffuses the secret key and all processed history across all 320 bits of memory.
          </p>
        </div>

        {/* Step 3: Second Key Injection */}
        <div
          className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
            activeStage >= 3
              ? "bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-500/30 shadow-sm"
              : "bg-zinc-50 dark:bg-[#0c0d10] border-zinc-200 dark:border-white/5 opacity-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> 3. Double Key Locking
            </span>
            <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-xs">
              3
            </span>
          </div>
          <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
            XOR Key into x3 and x4
          </h4>
          <div className="font-mono text-[11px] p-2 bg-white dark:bg-black/40 rounded-xl border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300">
            x3 ⊕ Key[0:7]<br />
            x4 ⊕ Key[8:15]
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug">
            Binds the final state directly to the secret key, ready for tag extraction in Step 6.
          </p>
        </div>

      </div>

      {/* ── Internal State Matrix After Finalization ── */}
      <div className="bg-white dark:bg-[#0a0a0c] rounded-3xl border border-zinc-200 dark:border-white/10 p-5 flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              320-Bit State Structure After Finalization
            </h3>
          </div>
          <span className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono font-bold">
            5 × 64-bit Words
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {stateWords.map((w, i) => (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl border transition-all ${
                !w.dim
                  ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-500/40 shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/5 opacity-60"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold font-mono text-xs border ${
                    !w.dim
                      ? "bg-emerald-600 text-white border-emerald-500 shadow-sm"
                      : "bg-zinc-200 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400"
                  }`}
                >
                  {w.label}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      {w.role}
                    </span>
                    {!w.dim && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold uppercase">
                        Tag Source
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                    {w.desc}
                  </span>
                </div>
              </div>

              <div className="flex gap-1 font-mono text-xs overflow-x-auto">
                {w.bytes.map((byte, bi) => (
                  <span
                    key={bi}
                    className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                      !w.dim
                        ? "bg-white dark:bg-zinc-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                        : "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800/60"
                    }`}
                  >
                    {byte}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Security Takeaway Banner */}
        <div className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/5 rounded-2xl p-4 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            <strong className="text-zinc-900 dark:text-white">Why Double Key Injection Matters:</strong> In sponge ciphers, if the final tag were produced without the key re-injected at the end, an attacker knowing the internal permutation could invert the function and recover the internal state. The double key sandwich mathematically prevents backwards reconstruction.
          </div>
        </div>
      </div>

      {/* ── Transition to Step 6 CTA ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-6 border-t border-zinc-200 dark:border-white/10">
        <div className="text-xs text-zinc-500 text-center sm:text-left">
          State finalization complete. Lower words <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">x3</code> and <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">x4</code> are primed to yield the 128-bit authentication tag.
        </div>

        <button
          onClick={nextStep}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-2xl text-sm font-bold transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
        >
          <span>Proceed to Step 6: Auth &amp; Output</span>
          <ArrowRight className="w-4 h-4 text-emerald-500" />
        </button>
      </div>

    </div>
  );
}
