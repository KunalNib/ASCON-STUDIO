"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  ShieldCheck,
  AlertTriangle,
  Cpu,
  Zap,
  Sliders,
  RotateCcw,
  Sparkles,
  Layers,
} from "lucide-react";
import { emitSecurityLog } from "../AdversaryConsole";
import { playProbePing, playAlarmAlert } from "@/lib/soundFx";

export function SideChannelDPAAttack() {
  const [isMasked, setIsMasked] = useState(false);
  const [samplesCount, setSamplesCount] = useState(1500); // 100 to 5000 traces

  // Correlation calculation based on sample count and masking
  const signalToNoiseRatio = Math.min(1, Math.sqrt(samplesCount / 2500));
  const correlationVal = isMasked ? 0.02 * (1 - signalToNoiseRatio * 0.3) : 0.2 + signalToNoiseRatio * 0.72;

  // Generate 16 key candidate hypothesis curves (correlation r vs time across 32 time points)
  const timePoints = 32;
  const hypothesisCurves = useMemo(() => {
    const curves: { keyHex: string; isCorrect: boolean; points: number[] }[] = [];

    for (let k = 0; k < 16; k++) {
      const isCorrect = k === 7; // Correct key candidate is 0x07
      const points: number[] = [];

      for (let t = 0; t < timePoints; t++) {
        const isSboxWindow = t >= 12 && t <= 18;
        if (!isMasked && isCorrect && isSboxWindow) {
          // Sharp correlation peak for the correct key guess
          const peakShape = Math.sin(((t - 12) / 6) * Math.PI);
          const r = correlationVal * peakShape + (Math.random() - 0.5) * 0.05;
          points.push(r);
        } else {
          // False hypotheses or masked traces: Pure Gaussian noise centered at 0
          const noiseLevel = isMasked ? 0.04 : 0.08 / Math.max(1, Math.sqrt(samplesCount / 500));
          const r = (Math.random() - 0.5) * noiseLevel;
          points.push(r);
        }
      }

      curves.push({
        keyHex: k.toString(16).toUpperCase(),
        isCorrect,
        points,
      });
    }

    return curves;
  }, [isMasked, samplesCount, correlationVal]);

  const handleToggleMasking = () => {
    playProbePing();
    const nextMasked = !isMasked;
    setIsMasked(nextMasked);

    if (nextMasked) {
      emitSecurityLog(
        "BLOCKED",
        "Activated ASCON 3-Share Threshold Masking (TI). S-box algebraic degree of 2 flattens power correlation.",
        "TI_MASKING_3_SHARES",
        "dpa"
      );
    } else {
      playAlarmAlert();
      emitSecurityLog(
        "AUTH_FAIL",
        "Switched to Unmasked Hardware. Power consumption directly exposes secret key Hamming weight!",
        "UNMASKED_HARDWARE",
        "dpa"
      );
    }
  };

  const handleSampleChange = (val: number) => {
    setSamplesCount(val);
    if (val % 500 === 0) {
      playProbePing();
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-5 gap-4 overflow-y-auto custom-scrollbar">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              Hardware Physical Threat
            </span>
            <span className="text-xs text-zinc-400 font-mono">Differential Power Analysis (DPA)</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-500" />
            Side-Channel Power Analysis &amp; Degree-2 Threshold Masking
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleMasking}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
              isMasked
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isMasked ? "Masking: 3 Shares (TI Active)" : "Hardware: Unmasked (Vulnerable)"}</span>
          </button>
        </div>
      </div>

      {/* ── Metrics Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Peak Correlation (r)</span>
          <div
            className={`text-xl font-black font-mono ${
              isMasked ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            r = {correlationVal.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-500">
            {isMasked ? "Immune (Below noise floor)" : "High leak (Key compromised!)"}
          </span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400">S-Box Algebraic Degree</span>
          <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            Degree 2
          </div>
          <span className="text-[10px] text-zinc-500">AES requires Degree 7</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Masking Shares (TI)</span>
          <div className="text-xl font-black font-mono text-zinc-900 dark:text-white">
            {isMasked ? "3 Shares (TI)" : "1 Share (Raw)"}
          </div>
          <span className="text-[10px] text-zinc-500">Threshold Implementation</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400">Silicon / Energy Overhead</span>
          <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {isMasked ? "+28%" : "0%"}
          </div>
          <span className="text-[10px] text-zinc-500">AES adds &gt;250% overhead</span>
        </div>
      </div>

      {/* ── Phosphor-Glow CRT Digital Oscilloscope Canvas ── */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 font-mono">
            <Cpu className="w-4 h-4 text-cyan-500" />
            <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Virtual Digital Storage Oscilloscope: 16-Key Hypothesis Traces
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-zinc-400">
              Traces Averaged: <strong className="text-cyan-400 font-bold">{samplesCount}</strong>
            </span>
          </div>
        </div>

        {/* Phosphor Oscilloscope Screen */}
        <div className="h-48 bg-zinc-950 rounded-xl border border-zinc-800 p-3 relative overflow-hidden flex flex-col justify-center">
          {/* Phosphor Grid Lines */}
          <div className="absolute inset-0 grid grid-rows-4 grid-cols-8 opacity-15 pointer-events-none">
            {Array.from({ length: 32 }).map((_, i) => (
              <div key={i} className="border-b border-r border-cyan-400" />
            ))}
          </div>

          {/* S-box Window Highlight */}
          <div className="absolute left-[38%] right-[44%] top-0 bottom-0 bg-cyan-500/10 border-x border-cyan-500/30 pointer-events-none z-0">
            <span className="absolute top-2 left-2 text-[8px] font-mono text-cyan-400 uppercase tracking-widest">
              S-Box Phase (pS)
            </span>
          </div>

          {/* SVG Waveform Lines for all 16 Key Hypotheses */}
          <svg className="w-full h-full z-10 overflow-visible" preserveAspectRatio="none" viewBox="0 0 32 100">
            {hypothesisCurves.map((curve) => {
              const pathD = curve.points
                .map((val, tIdx) => {
                  // Map correlation r (-0.2 to +1.0) to SVG Y coordinate (100 to 0)
                  const y = 80 - val * 70;
                  return `${tIdx === 0 ? "M" : "L"} ${tIdx} ${y}`;
                })
                .join(" ");

              return (
                <path
                  key={curve.keyHex}
                  d={pathD}
                  fill="none"
                  stroke={
                    curve.isCorrect && !isMasked
                      ? "#f43f5e" // Glowing Rose for compromised key
                      : isMasked
                      ? "rgba(16, 185, 129, 0.4)" // Soft emerald for protected masked traces
                      : "rgba(113, 113, 122, 0.3)" // Gray noise for wrong guesses
                  }
                  strokeWidth={curve.isCorrect && !isMasked ? "2.5" : "1"}
                  strokeLinecap="round"
                  className={curve.isCorrect && !isMasked ? "filter drop-shadow-[0_0_6px_rgba(244,63,94,0.8)]" : ""}
                />
              );
            })}
          </svg>
        </div>

        {/* ── Trace Averaging Interactive Slider ── */}
        <div className="p-3 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <span className="text-zinc-600 dark:text-zinc-400">Power Trace Averaging Filter:</span>
            <span className="font-bold text-zinc-900 dark:text-white">{samplesCount} traces</span>
          </div>

          <div className="flex-1 max-w-sm">
            <input
              type="range"
              min={100}
              max={5000}
              step={100}
              value={samplesCount}
              onChange={(e) => handleSampleChange(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>
        </div>

        {/* ── Verdict Banner ── */}
        <div className="flex items-center justify-between text-xs pt-1">
          {isMasked ? (
            <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                3-Share Threshold Masking active: All 16 key candidate hypotheses remain submerged in white noise.
                DPA correlation coefficient flatlines at r &lt; 0.05.
              </span>
            </div>
          ) : (
            <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Vulnerable Hardware: Candidate 0x07 spikes to r = {correlationVal.toFixed(2)}. Secret key extracted via power rail!
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Architectural Context Banner ── */}
      <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-xs text-cyan-950 dark:text-cyan-200 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-1 font-bold">
            Why ASCON is the World Champion for IoT Side-Channel Defense
          </strong>
          Physical side-channel resistance is typically the #1 engineering hurdle for edge cryptography.
          Standard AES utilizes a complex degree-7 S-box requiring polynomial Galois inversions, multiplying microcontroller silicon area by &gt;250%.
          In contrast, ASCON’s 5-bit S-box was explicitly crafted with an <strong>algebraic degree of only 2</strong>.
          Consequently, first-order provable non-interference (NI/SNI) threshold masking requires merely 3 shares,
          imposing an ultra-low energy overhead of only ~28% on embedded Cortex-M0 and ESP32 nodes.
        </div>
      </div>
    </div>
  );
}
