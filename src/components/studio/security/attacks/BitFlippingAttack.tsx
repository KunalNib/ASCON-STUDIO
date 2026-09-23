"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Terminal,
} from "lucide-react";

export function BitFlippingAttack() {
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  // Original Message Bytes: "VALVE:OFF" -> Attacker targets 'OFF' -> 'ON_'
  const originalPlaintext = "VALVE:OFF";
  const originalCiphertext = ["6C", "A3", "F4", "19", "E2", "0B", "71", "88", "C9"];
  const originalTag = "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09";

  const getModifiedCiphertext = () => {
    return originalCiphertext.map((byte, idx) => {
      if (tamperedIndex === idx) {
        const val = parseInt(byte, 16);
        return (val ^ 0x01).toString(16).toUpperCase().padStart(2, "0");
      }
      return byte;
    });
  };

  const modifiedCiphertext = getModifiedCiphertext();

  const handleExecuteAttack = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
    }, 600);
  };

  const handleReset = () => {
    setTamperedIndex(null);
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 gap-5 overflow-y-auto custom-scrollbar">
      {/* Attack Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              Active Threat Simulation
            </span>
            <span className="text-xs text-zinc-400 font-mono">CWE-327 / CWE-353</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            Ciphertext Malleability &amp; Bit-Flipping Attack
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTamperedIndex(6)} // Target byte 6 ('O' in OFF)
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              tamperedIndex !== null
                ? "bg-rose-600 hover:bg-rose-500 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            }`}
          >
            {tamperedIndex !== null ? "Bit Flip Injected" : "Inject Bit-Flip Attack"}
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Reset payload"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Adversary Injection Workbench */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Adversary In-Transit Payload Interceptor
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">
            Click any byte below to flip bit 0
          </span>
        </div>

        {/* Byte Buttons */}
        <div className="flex flex-wrap gap-2">
          {modifiedCiphertext.map((byte, idx) => {
            const isFlipped = tamperedIndex === idx;
            return (
              <button
                key={idx}
                onClick={() => setTamperedIndex(isFlipped ? null : idx)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                  isFlipped
                    ? "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 scale-105 shadow-md shadow-rose-500/20"
                    : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-rose-400"
                }`}
              >
                <span className="font-mono text-xs font-bold">0x{byte}</span>
                <span className="text-[9px] text-zinc-400 font-mono mt-0.5">[{idx}]</span>
              </button>
            );
          })}
        </div>

        {tamperedIndex !== null ? (
          <div className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Adversary flipped bit-0 on Byte [{tamperedIndex}]. In an unauthenticated stream cipher,
              this predictably corrupts plaintext byte [{tamperedIndex}] without detection.
            </span>
          </div>
        ) : (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Ciphertext is pristine. Click any byte or the &quot;Inject Bit-Flip Attack&quot; button above.
          </div>
        )}
      </div>

      {/* Side-by-Side Defense Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left: Vulnerable Legacy Stream Cipher */}
        <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Legacy Unauthenticated Cipher
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
              AES-CTR / No MAC
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs flex-1">
            <div className="p-3 bg-zinc-50 dark:bg-black/60 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase">Decryption Formula</div>
              <div className="text-zinc-700 dark:text-zinc-300">P&apos; = C&apos; ⊕ Keystream</div>
              <div className="text-rose-600 dark:text-rose-400">
                P&apos; = (P ⊕ Δ) ⊕ Keystream = P ⊕ Δ
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-black/60 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase">Received Action</div>
              <div
                className={`font-bold ${
                  tamperedIndex !== null ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-300"
                }`}
              >
                {tamperedIndex !== null ? 'EXECUTE: "VALVE:ON_"' : 'EXECUTE: "VALVE:OFF"'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/5 flex items-center gap-2 text-xs">
            {tamperedIndex !== null ? (
              <>
                <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-rose-600 dark:text-rose-400 font-bold">
                  Silent Breach: Corrupted command executed!
                </span>
              </>
            ) : (
              <span className="text-zinc-400">Awaiting attack trigger...</span>
            )}
          </div>
        </div>

        {/* Right: ASCON-128 AEAD Autonomous Defense */}
        <div className="bg-white dark:bg-[#0c0d10] border border-emerald-500/40 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> ASCON-128 AEAD Defense
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              NIST SP 800-232
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs flex-1">
            <div className="p-3 bg-zinc-50 dark:bg-black/60 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase">Sponge State Verification</div>
              <div className="text-zinc-700 dark:text-zinc-300">
                x0 ← C&apos; ⟹ Permutation p⁶ cascades Δ across all 320 bits
              </div>
              <div
                className={`text-[11px] truncate ${
                  tamperedIndex !== null ? "text-rose-500 font-bold" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {tamperedIndex !== null
                  ? "T* (Candidate Tag) diverges: E4 71 89 ... ≠ T"
                  : `T* == T (${originalTag.slice(0, 14)}...)`}
              </div>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-black/60 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
              <div className="text-[10px] text-zinc-400 uppercase">Release Gate Verdict</div>
              <div
                className={`font-bold ${
                  tamperedIndex !== null ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {tamperedIndex !== null
                  ? "[FORGERY DETECTED: PLAINTEXT WIPED]"
                  : 'VERIFIED: "VALVE:OFF" Released'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/5 flex items-center gap-2 text-xs">
            {tamperedIndex !== null ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                  Zero-Trust Gate Held: Tampering neutralized!
                </span>
              </>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                Sponge integrity verified.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
