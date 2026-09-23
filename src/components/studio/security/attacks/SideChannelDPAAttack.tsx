"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, AlertTriangle, Cpu, Zap, Sliders } from "lucide-react";

export function SideChannelDPAAttack() {
  const [isMasked, setIsMasked] = useState(true);
  const [samplesCount, setSamplesCount] = useState(2500);

  // Correlation values
  const correlationVal = isMasked ? 0.02 : 0.89;
  const correlationPercent = (correlationVal * 100).toFixed(0);

  // Simulated oscilloscope trace points
  const pointsCount = 40;
  const tracePoints = Array.from({ length: pointsCount }).map((_, i) => {
    // S-box execution happens around index 18-22
    const isSboxPhase = i >= 16 && i <= 22;
    if (!isMasked && isSboxPhase) {
      // High leakage power spike
      return 60 + Math.sin(i * 0.5) * 20 + 45;
    }
    // Random Gaussian white noise (masked trace)
    return 40 + Math.sin(i * 0.8) * 12 + (Math.random() - 0.5) * 8;
  });

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Hardware Physical Threat
            </span>
            <span className="text-xs text-zinc-400 font-mono">Differential Power Analysis (DPA)</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Side-Channel Power Analysis &amp; Degree-2 Masking
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMasked(!isMasked)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
              isMasked
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isMasked ? "Masking Active (3 Shares)" : "Unmasked Hardware"}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">DPA Correlation (r)</span>
          <div
            className={`text-xl font-black font-mono ${
              isMasked ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            r = {correlationVal.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400">
            {isMasked ? "Immune (Below noise floor)" : "High leak (Key compromised)"}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">S-Box Algebraic Degree</span>
          <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            Degree 2
          </div>
          <span className="text-[10px] text-zinc-400">AES requires Degree 7</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Masking Shares</span>
          <div className="text-xl font-black font-mono text-zinc-900 dark:text-white">
            {isMasked ? "3 Shares (TI)" : "1 Share (Raw)"}
          </div>
          <span className="text-[10px] text-zinc-400">Threshold Implementation</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Power Overhead</span>
          <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {isMasked ? "+28%" : "0%"}
          </div>
          <span className="text-[10px] text-zinc-400">AES masking adds &gt;250%</span>
        </div>
      </div>

      {/* Simulated Oscilloscope Waveform */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-500" />
            Virtual Digital Oscilloscope: ESP32 VCC Power Rail (mV)
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {samplesCount} Power Traces Averaged
          </span>
        </div>

        <div className="h-44 bg-zinc-950 rounded-xl border border-zinc-800 p-3 flex flex-col justify-end relative overflow-hidden">
          {/* Oscilloscope Grid */}
          <div className="absolute inset-0 grid grid-rows-4 grid-cols-8 opacity-10 pointer-events-none">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="border-b border-r border-cyan-400" />
            ))}
          </div>

          {/* S-box window highlight */}
          <div className="absolute left-[40%] right-[45%] top-0 bottom-0 bg-cyan-500/5 border-x border-cyan-500/20 z-0 pointer-events-none">
            <span className="absolute top-2 left-2 text-[9px] font-mono text-cyan-400 uppercase">
              S-Box Phase
            </span>
          </div>

          {/* Waveform Line */}
          <div className="flex items-end gap-1 h-full z-10">
            {tracePoints.map((val, i) => {
              const heightPct = Math.min(100, (val / 130) * 100);
              const isPeak = !isMasked && i >= 16 && i <= 22;
              return (
                <motion.div
                  key={i}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ type: "spring", stiffness: 120 }}
                  className={`flex-1 rounded-t-[1px] transition-colors ${
                    isPeak
                      ? "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]"
                      : "bg-cyan-500/70"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-zinc-500">
            {isMasked ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Power spikes flattened into Gaussian white noise. DPA extraction impossible.
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Correlated power peak in S-box phase directly exposes secret key Hamming weight!
              </span>
            )}
          </span>
          <span className="text-[11px] font-mono text-zinc-400">500 MS/s Sample Rate</span>
        </div>
      </div>

      {/* NIST & Lightweight Masking Explanation */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-xs text-cyan-950 dark:text-cyan-200 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-1">Why ASCON is the World Champion for Side-Channel Defense:</strong>
          Physical side-channel countermeasures are often the #1 failure mode of IoT crypto.
          Traditional AES uses a degree-7 S-box requiring complex polynomial inversion masking that multiplies silicon area by 300%.
          ASCON’s 5-bit S-box was specifically designed with an **algebraic degree of only 2**.
          Because degree is 2, first-order non-linear terms require only 3 shares to achieve provable non-interference (NI/SNI) threshold masking,
          enabling ultra-low-cost physical DPA protection on battery-powered microcontrollers.
        </div>
      </div>
    </div>
  );
}
