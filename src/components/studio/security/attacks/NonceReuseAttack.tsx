"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  RotateCcw,
  AlertOctagon,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Key,
  Binary,
  Search,
  Sliders,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { emitSecurityLog } from "../AdversaryConsole";
import { playBitClick, playSuccessChime } from "@/lib/soundFx";

export function NonceReuseAttack() {
  const [msg1, setMsg1] = useState("COMMAND:VALVE_SHUT");
  const [msg2, setMsg2] = useState("COMMAND:VALVE_OPEN");
  const [selectedCrib, setSelectedCrib] = useState("COMMAND:VALVE_");
  const [cribOffset, setCribOffset] = useState<number>(0);
  const nonce = "101112131415161718191A1B1C1D1E1F";

  const getBytes = (str: string) => {
    return Array.from(str).map((c) =>
      c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")
    );
  };

  const bytes1 = getBytes(msg1);
  const bytes2 = getBytes(msg2);
  const maxLen = Math.max(bytes1.length, bytes2.length);

  // XOR Difference: (C1 ^ C2) = (P1 ^ P2)
  const xorDiff = Array.from({ length: maxLen }).map((_, i) => {
    const b1 = bytes1[i] ? parseInt(bytes1[i], 16) : 0;
    const b2 = bytes2[i] ? parseInt(bytes2[i], 16) : 0;
    return (b1 ^ b2).toString(16).toUpperCase().padStart(2, "0");
  });

  // Crib dragging calculation: Candidate = (C1 ^ C2) ^ Crib
  const getCribDecodedText = () => {
    const cribBytes = Array.from(selectedCrib).map((c) => c.charCodeAt(0));
    const result: { char: string; isPrintable: boolean; isMatch: boolean }[] = [];

    cribBytes.forEach((cByte, idx) => {
      const streamIdx = cribOffset + idx;
      if (streamIdx < xorDiff.length) {
        const xorVal = parseInt(xorDiff[streamIdx], 16);
        const decodedCode = xorVal ^ cByte;
        const isPrintable = decodedCode >= 32 && decodedCode <= 126;
        const char = isPrintable ? String.fromCharCode(decodedCode) : "·";

        // Check if it matches corresponding char in msg1 or msg2
        const expected1 = msg1[streamIdx] || "";
        const expected2 = msg2[streamIdx] || "";
        const isMatch = char === expected1 || char === expected2;

        result.push({ char, isPrintable, isMatch });
      }
    });

    return result;
  };

  const cribResults = getCribDecodedText();
  const successfulMatches = cribResults.filter((r) => r.isMatch).length;

  const handleDragCrib = (newOffset: number) => {
    playBitClick();
    setCribOffset(newOffset);
    emitSecurityLog(
      "PROBE",
      `Adversary dragged crib '${selectedCrib}' to offset [${newOffset}]. Recovered ${successfulMatches} matching character(s).`,
      `Offset=${newOffset}`,
      "nonce"
    );
  };

  const loadSamplePackets = () => {
    playBitClick();
    setMsg1("COMMAND:VALVE_SHUT");
    setMsg2("COMMAND:VALVE_OPEN");
    setSelectedCrib("COMMAND:VALVE_");
    setCribOffset(0);
    emitSecurityLog("INFO", "Loaded sample industrial IoT command packets.", undefined, "nonce");
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-5 gap-4 overflow-y-auto custom-scrollbar">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              Cryptographic Misuse Threat
            </span>
            <span className="text-xs text-zinc-400 font-mono">Two-Time Pad / Keystream Replay</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-500" />
            Nonce-Reuse &amp; Interactive Crib-Dragging Analysis
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSamplePackets}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Load Sample Packets
          </button>
        </div>
      </div>

      {/* ── Shared Nonce Alert Callout ── */}
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
        <div className="flex items-center gap-2 font-mono">
          <Binary className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-bold">Violated Nonce:</span>
          <span className="truncate max-w-[200px] sm:max-w-none">{nonce}</span>
        </div>
        <span className="text-[10px] font-bold uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full shrink-0">
          Reused Counter (Catastrophic)
        </span>
      </div>

      {/* ── Dual Message Inputs ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-3.5 shadow-sm flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono">
            Packet 1 (Plaintext A)
          </label>
          <input
            type="text"
            value={msg1}
            onChange={(e) => setMsg1(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl p-2 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
          <div className="flex flex-wrap gap-1 font-mono text-[9px] text-zinc-400 pt-0.5">
            {bytes1.map((b, i) => (
              <span key={i} className="px-1 py-0.2 bg-zinc-100 dark:bg-zinc-900 rounded">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-3.5 shadow-sm flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 font-mono">
            Packet 2 (Plaintext B - Same Nonce!)
          </label>
          <input
            type="text"
            value={msg2}
            onChange={(e) => setMsg2(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl p-2 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
          <div className="flex flex-wrap gap-1 font-mono text-[9px] text-zinc-400 pt-0.5">
            {bytes2.map((b, i) => (
              <span key={i} className="px-1 py-0.2 bg-zinc-100 dark:bg-zinc-900 rounded">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Keystream Cancellation Visualizer ── */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-mono">
            Adversary XOR Intercept: C₁ ⊕ C₂ = P₁ ⊕ P₂
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            (P₁ ⊕ KS) ⊕ (P₂ ⊕ KS) = P₁ ⊕ P₂
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-50 dark:bg-black/60 rounded-2xl border border-zinc-200 dark:border-white/5 overflow-x-auto">
          {xorDiff.map((diffByte, i) => {
            const isZero = diffByte === "00";
            const isCribCovered = i >= cribOffset && i < cribOffset + selectedCrib.length;

            return (
              <div
                key={i}
                className={`w-11 h-12 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all relative ${
                  isCribCovered
                    ? "bg-amber-500/20 border-amber-500 text-amber-500 shadow-md ring-1 ring-amber-500/40"
                    : isZero
                    ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-400"
                    : "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400"
                }`}
              >
                <span>{diffByte}</span>
                <span className="text-[8px] text-zinc-400 font-normal">[{i}]</span>
                {isCribCovered && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Interactive Crib Dragging Workbench ── */}
        <div className="p-3 bg-zinc-100 dark:bg-black/60 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 font-mono text-zinc-800 dark:text-zinc-200">
              <Search className="w-4 h-4 text-amber-500" />
              <span className="font-bold">Interactive Crib Dragging Tool</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">Sample Cribs:</span>
              {["COMMAND:", "VALVE_", "STATUS:"].map((crib) => (
                <button
                  key={crib}
                  onClick={() => {
                    playBitClick();
                    setSelectedCrib(crib);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                    selectedCrib === crib
                      ? "bg-amber-500 text-black font-bold"
                      : "bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  }`}
                >
                  &quot;{crib}&quot;
                </button>
              ))}
            </div>
          </div>

          {/* Crib Input & Offset Slider */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-1">
              <input
                type="text"
                value={selectedCrib}
                onChange={(e) => setSelectedCrib(e.target.value)}
                placeholder="Enter known word (crib)..."
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-1.5 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2 flex items-center gap-3">
              <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 shrink-0">
                Offset: [{cribOffset}]
              </span>
              <input
                type="range"
                min={0}
                max={Math.max(0, xorDiff.length - selectedCrib.length)}
                value={cribOffset}
                onChange={(e) => handleDragCrib(parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>

          {/* Real-time Decoded Output from Crib Dragging */}
          <div className="p-2.5 bg-white dark:bg-black/60 rounded-lg border border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-[11px]">Decoded Plaintext Stream:</span>
              <div className="flex items-center gap-1">
                {cribResults.map((res, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded font-bold text-xs ${
                      res.isMatch
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40"
                        : res.isPrintable
                        ? "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "text-zinc-400 dark:text-zinc-600"
                    }`}
                  >
                    {res.char}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{successfulMatches} matching characters</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Side-by-Side Impact Comparison ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" /> Standard Stream Ciphers (AES-CTR)
          </span>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            In AES-CTR, the keystream is independent of message content. Nonce reuse completely dissolves the key,
            allowing eavesdroppers to recover all future packets via crib-dragging and craft valid forged packets trivially.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> ASCON-128 Sponge Duplex Resilience
          </span>
          <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
            ASCON absorbs plaintext into the rate register during encryption. The moment two messages differ,
            their sponge state trajectories desynchronize immediately. <strong>Authentication Tag Forgery remains mathematically impossible</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
