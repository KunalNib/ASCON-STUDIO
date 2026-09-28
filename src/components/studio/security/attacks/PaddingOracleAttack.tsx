"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Play,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  Bot,
  Sliders,
  CheckCircle2,
  XCircle,
  Activity,
  Zap,
} from "lucide-react";
import { emitSecurityLog } from "../AdversaryConsole";
import { playProbePing, playSuccessChime, playAlarmAlert } from "@/lib/soundFx";

export function PaddingOracleAttack() {
  const secretToken = "AUTH779B"; // 8 bytes to recover
  const [isProbing, setIsProbing] = useState(false);
  const [crackedBytes, setCrackedBytes] = useState<string[]>(["?", "?", "?", "?", "?", "?", "?", "?"]);
  const [currentByteIdx, setCurrentByteIdx] = useState<number>(0);
  const [testedCandidates, setTestedCandidates] = useState<{ byteHex: string; timeUs: number; isMatch: boolean }[]>([]);
  const [jitterLevel, setJitterLevel] = useState<number>(2); // 0..10 us jitter
  const [probeMode, setProbeMode] = useState<"vulnerable" | "ascon">("vulnerable");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startProbing = () => {
    setIsProbing(true);
    let byteIdx = 0;
    setCrackedBytes(["?", "?", "?", "?", "?", "?", "?", "?"]);
    setCurrentByteIdx(0);
    setTestedCandidates([]);

    emitSecurityLog(
      "PROBE",
      `Launched automated timing oracle probe bot against ${probeMode === "vulnerable" ? "Legacy strcmp" : "ASCON Constant-Time"} server.`,
      `Target: 8 Bytes`,
      "oracle"
    );

    const crackNextByte = () => {
      if (byteIdx >= secretToken.length) {
        setIsProbing(false);
        playSuccessChime();
        emitSecurityLog(
          "SUCCESS",
          `Timing attack completed! All 8 bytes recovered via microsecond side-channel.`,
          secretToken,
          "oracle"
        );
        return;
      }

      const targetChar = secretToken[byteIdx];
      const targetCharCode = targetChar.charCodeAt(0);

      // Generate 20 candidate probes, one of which is the target
      const batch: { byteHex: string; timeUs: number; isMatch: boolean }[] = [];
      for (let i = 0; i < 18; i++) {
        const randCode = (targetCharCode + i + 7) % 128;
        const noise = (Math.random() - 0.5) * jitterLevel;
        const timeUs = probeMode === "vulnerable" ? 10.2 + noise : 22.1 + (Math.random() - 0.5) * 0.4;
        batch.push({
          byteHex: randCode.toString(16).toUpperCase().padStart(2, "0"),
          timeUs: Math.max(2, timeUs),
          isMatch: false,
        });
      }

      // Add the true matching candidate
      const matchNoise = (Math.random() - 0.5) * jitterLevel;
      const matchTime = probeMode === "vulnerable" ? 24.8 + matchNoise : 22.1 + (Math.random() - 0.5) * 0.4;
      batch.push({
        byteHex: targetCharCode.toString(16).toUpperCase().padStart(2, "0"),
        timeUs: matchTime,
        isMatch: true,
      });

      // Sort or shuffle batch
      setTestedCandidates(batch);
      playProbePing();

      if (probeMode === "vulnerable") {
        // Vulnerable mode: Outlier detected!
        setCrackedBytes((prev) => {
          const updated = [...prev];
          updated[byteIdx] = targetChar;
          return updated;
        });

        emitSecurityLog(
          "INJECT",
          `Timing outlier detected at Byte[${byteIdx}]: Candidate '0x${targetCharCode
            .toString(16)
            .toUpperCase()}' took ${matchTime.toFixed(1)}μs (baseline: ~10.2μs). Key character cracked!`,
          `Byte[${byteIdx}]='${targetChar}'`,
          "oracle"
        );

        byteIdx++;
        setCurrentByteIdx(byteIdx);
        timerRef.current = setTimeout(crackNextByte, 400);
      } else {
        // ASCON constant-time mode: Flat line!
        emitSecurityLog(
          "BLOCKED",
          `ASCON Constant-Time verification held: All 256 candidate probes produced uniform latency (Δt ≈ 0.0μs). Oracle blinded.`,
          "O(1)_VERIFY",
          "oracle"
        );
        setIsProbing(false);
      }
    };

    timerRef.current = setTimeout(crackNextByte, 200);
  };

  const handleReset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsProbing(false);
    setCrackedBytes(["?", "?", "?", "?", "?", "?", "?", "?"]);
    setCurrentByteIdx(0);
    setTestedCandidates([]);
    emitSecurityLog("INFO", "Reset timing oracle probe bot.", undefined, "oracle");
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-5 gap-4 overflow-y-auto custom-scrollbar">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              Side-Channel &amp; Oracle Threat
            </span>
            <span className="text-xs text-zinc-400 font-mono">Microsecond Timing Correlation</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Decryption Oracle &amp; Constant-Time Verification
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Target Architecture Toggle */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl border border-zinc-200 dark:border-white/5 text-xs font-bold">
            <button
              onClick={() => {
                setProbeMode("vulnerable");
                handleReset();
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                probeMode === "vulnerable"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-white"
              }`}
            >
              Vulnerable Early-Exit
            </button>
            <button
              onClick={() => {
                setProbeMode("ascon");
                handleReset();
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                probeMode === "ascon"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-white"
              }`}
            >
              ASCON Constant-Time
            </button>
          </div>

          <button
            onClick={startProbing}
            disabled={isProbing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>{isProbing ? `Probing Byte [${currentByteIdx}]...` : "Launch Probe Bot"}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Reset probe simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Secret Token Cracking Feed ── */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono">
            Victim Secret Auth Token in RAM (8 Bytes)
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            Target Token: {probeMode === "vulnerable" ? "Cracking in progress..." : "Protected by O(1) comparison"}
          </span>
        </div>

        {/* 8 Token Characters Display */}
        <div className="flex items-center gap-2 overflow-x-auto p-2 bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-white/5">
          {crackedBytes.map((char, idx) => {
            const isCracked = char !== "?";
            const isCurrent = idx === currentByteIdx && isProbing;

            return (
              <div
                key={idx}
                className={`flex-1 min-w-[42px] h-14 rounded-xl border flex flex-col items-center justify-center font-mono transition-all ${
                  isCracked
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-md scale-105"
                    : isCurrent
                    ? "bg-orange-500/20 border-orange-500 text-orange-400 animate-pulse"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-400"
                }`}
              >
                <span className="text-lg font-black">{char}</span>
                <span className="text-[9px] text-zinc-500">[{idx}]</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Virtual Oscilloscope / Latency Scatter Plot ── */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 font-mono flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" />
            Candidate Timing Measurement Scatter Histogram (μs)
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            {testedCandidates.length} Probes Executed
          </span>
        </div>

        {/* Oscilloscope Graph Canvas Container */}
        <div className="h-44 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 flex flex-col justify-end relative overflow-hidden">
          {/* Horizontal Threshold Grid Lines */}
          <div className="absolute inset-0 grid grid-rows-4 opacity-25 dark:opacity-15 pointer-events-none">
            <div className="border-b border-cyan-500/30 dark:border-cyan-400" />
            <div className="border-b border-cyan-500/30 dark:border-cyan-400" />
            <div className="border-b border-cyan-500/30 dark:border-cyan-400" />
          </div>

          {/* Outlier Threshold Indicator */}
          {probeMode === "vulnerable" && (
            <div className="absolute top-[30%] left-0 right-0 border-b border-dashed border-rose-500/50 flex justify-end px-3">
              <span className="text-[9px] font-mono text-rose-600 dark:text-rose-400 uppercase tracking-widest">
                Statistical Outlier Trigger Level (~22μs)
              </span>
            </div>
          )}

          {/* Candidate Timing Bars */}
          <div className="flex items-end gap-1.5 h-full z-10">
            {testedCandidates.map((c, i) => {
              const heightPct = Math.min(100, (c.timeUs / 30) * 100);
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  className={`flex-1 rounded-t-[2px] transition-colors flex flex-col items-center justify-end pb-1 ${
                    c.isMatch && probeMode === "vulnerable"
                      ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.9)]"
                      : "bg-cyan-500/40 dark:bg-cyan-500/50"
                  }`}
                  title={`0x${c.byteHex}: ${c.timeUs.toFixed(2)}μs`}
                >
                  <span className="text-[7px] font-mono text-zinc-500 dark:text-zinc-400 select-none hidden md:block">
                    {c.byteHex}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Description & Verdict Banner */}
        <div className="flex items-center justify-between text-xs pt-1">
          {probeMode === "vulnerable" ? (
            <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Vulnerable baseline leaks microsecond spikes: when candidate byte matches, latency jumps by +14.6μs,
                revealing secret key bytes without knowing the master key!
              </span>
            </div>
          ) : (
            <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>
                ASCON Constant-Time Verification: Compares tag bits using constant-time bitwise operations.
                Response latency is invariant to mismatch position (Δt = 0.00μs). Timing attacks flatline.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
