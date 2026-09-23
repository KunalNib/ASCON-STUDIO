"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Play, RotateCcw, ShieldCheck, AlertTriangle, Activity, Bot } from "lucide-react";

export function PaddingOracleAttack() {
  const [isProbing, setIsProbing] = useState(false);
  const [probeCount, setProbeCount] = useState(0);
  const [leakyPoints, setLeakyPoints] = useState<number[]>([]);
  const [asconPoints, setAsconPoints] = useState<number[]>([]);

  const startOracleProbing = () => {
    setIsProbing(true);
    setProbeCount(0);
    setLeakyPoints([]);
    setAsconPoints([]);

    let count = 0;
    const lPoints: number[] = [];
    const aPoints: number[] = [];

    const interval = setInterval(() => {
      count += 5;
      setProbeCount(count);

      // Leaky cipher timing: varies widely based on byte match position (stair-step leak)
      const jitter = 15 + (count % 4) * 8 + Math.random() * 4;
      lPoints.push(jitter);
      setLeakyPoints([...lPoints]);

      // ASCON constant-time verification: flat clock cycle count O(1)
      const flat = 22 + (Math.random() - 0.5) * 0.4;
      aPoints.push(flat);
      setAsconPoints([...aPoints]);

      if (count >= 100) {
        clearInterval(interval);
        setIsProbing(false);
      }
    }, 120);
  };

  const handleReset = () => {
    setIsProbing(false);
    setProbeCount(0);
    setLeakyPoints([]);
    setAsconPoints([]);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              Side-Channel &amp; Oracle Threat
            </span>
            <span className="text-xs text-zinc-400 font-mono">Bleichenbacher / Vaudenay CCA2</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Decryption Oracle &amp; Constant-Time Verification
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={startOracleProbing}
            disabled={isProbing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isProbing ? `Probing... (${probeCount}/100)` : "Launch Probe Bot"}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Threat Description Banner */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-xs text-orange-900 dark:text-orange-200 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-0.5">The Decryption Oracle Mechanism:</strong>
          In naive cipher implementations, string comparisons like{" "}
          <code className="bg-orange-500/20 px-1 py-0.5 rounded font-mono font-bold">
            tag == expected_tag
          </code>{" "}
          terminate early at the first mismatching byte. Attackers measure response latency in microseconds to infer matching bytes one by one, fully decrypting secrets without knowing the key.
        </div>
      </div>

      {/* Virtual Oscilloscope / Timing Chart Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Leaky Variable-Time Comparison */}
        <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Vulnerable Baseline (Early-Exit String Match)
            </span>
            <span className="text-[10px] font-mono text-zinc-400">Δt ≈ 36.5 ms</span>
          </div>

          <div className="h-44 bg-zinc-950 rounded-xl border border-zinc-800 p-3 flex flex-col justify-end relative overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-4 opacity-10 pointer-events-none">
              <div className="border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-b border-white" />
            </div>

            {/* Timing Bars */}
            <div className="flex items-end gap-1 h-full z-10">
              {leakyPoints.map((val, i) => {
                const heightPct = Math.min(100, (val / 45) * 100);
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    className="flex-1 bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-[1px]"
                  />
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 leading-snug">
            ⚠️ <strong className="text-rose-600 dark:text-rose-400">Timing Side-Channel: </strong>
            Notice the jitter spikes. Latency increases systematically as more bytes match, exposing key bytes to statistical clustering.
          </div>
        </div>

        {/* Right: ASCON-128 Constant-Time Release Gate */}
        <div className="bg-white dark:bg-[#0c0d10] border border-emerald-500/30 rounded-2xl p-5 shadow-sm flex flex-col gap-3 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> ASCON Constant-Time Verification
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              Δt ≈ 0.00 ms (O(1))
            </span>
          </div>

          <div className="h-44 bg-zinc-950 rounded-xl border border-emerald-500/30 p-3 flex flex-col justify-end relative overflow-hidden">
            {/* Grid Lines */}
            <div className="absolute inset-0 grid grid-rows-4 opacity-10 pointer-events-none">
              <div className="border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-b border-white" />
            </div>

            {/* Timing Bars */}
            <div className="flex items-end gap-1 h-full z-10">
              {asconPoints.map((val, i) => {
                const heightPct = Math.min(100, (val / 45) * 100);
                return (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPct}%` }}
                    className="flex-1 bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-[1px]"
                  />
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 leading-snug">
            ✓ <strong className="text-emerald-600 dark:text-emerald-400">Oracle Blinded: </strong>
            Constant-time execution ensures clock cycle count is completely invariant to match position. Timing attacks yield zero intelligence.
          </div>
        </div>
      </div>
    </div>
  );
}
