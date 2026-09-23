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
} from "lucide-react";

export function NonceReuseAttack() {
  const [msg1, setMsg1] = useState("SENSOR_READ: 45°C");
  const [msg2, setMsg2] = useState("SENSOR_READ: 12°C");
  const nonce = "101112131415161718191A1B1C1D1E1F";

  const getBytes = (str: string) => {
    return Array.from(str).map((c) =>
      c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")
    );
  };

  const bytes1 = getBytes(msg1);
  const bytes2 = getBytes(msg2);
  const maxLen = Math.max(bytes1.length, bytes2.length);

  const xorDiff = Array.from({ length: maxLen }).map((_, i) => {
    const b1 = bytes1[i] ? parseInt(bytes1[i], 16) : 0;
    const b2 = bytes2[i] ? parseInt(bytes2[i], 16) : 0;
    return (b1 ^ b2).toString(16).toUpperCase().padStart(2, "0");
  });

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              Cryptographic Misuse Threat
            </span>
            <span className="text-xs text-zinc-400 font-mono">Two-Time Pad / Keystream Replay</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-500" />
            Nonce-Reuse &amp; Keystream Cancellation Analysis
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMsg1("COMMAND_ENGAGE");
              setMsg2("COMMAND_CANCEL");
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
          >
            Load Sample Packets
          </button>
        </div>
      </div>

      {/* Shared Nonce Callout */}
      <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-3.5 flex items-center justify-between text-xs text-rose-900 dark:text-rose-200">
        <div className="flex items-center gap-2 font-mono">
          <Binary className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="font-bold">Violated Nonce: </span>
          <span className="truncate">{nonce}</span>
        </div>
        <span className="text-[10px] font-bold uppercase bg-rose-500 text-white px-2 py-0.5 rounded-full">
          Reused Counter
        </span>
      </div>

      {/* Dual Message Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Packet 1 (Message A)
          </label>
          <input
            type="text"
            value={msg1}
            onChange={(e) => setMsg1(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl p-2.5 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
          <div className="flex flex-wrap gap-1 font-mono text-[10px] text-zinc-400">
            {bytes1.map((b, i) => (
              <span key={i} className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Packet 2 (Message B - Same Nonce!)
          </label>
          <input
            type="text"
            value={msg2}
            onChange={(e) => setMsg2(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-xl p-2.5 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
          <div className="flex flex-wrap gap-1 font-mono text-[10px] text-zinc-400">
            {bytes2.map((b, i) => (
              <span key={i} className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-900 rounded">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Keystream Cancellation Visualizer */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Adversary XOR Intercept: C₁ ⊕ C₂
          </span>
          <span className="text-[11px] font-mono text-zinc-400">
            (P₁ ⊕ KS) ⊕ (P₂ ⊕ KS) = P₁ ⊕ P₂
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-50 dark:bg-black/60 rounded-2xl border border-zinc-200 dark:border-white/5">
          {xorDiff.map((diffByte, i) => {
            const isZero = diffByte === "00";
            return (
              <div
                key={i}
                className={`w-10 h-10 rounded-xl border flex flex-col items-center justify-center font-mono text-xs font-bold transition-all ${
                  isZero
                    ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-400"
                    : "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-400 shadow-sm"
                }`}
              >
                <span>{diffByte}</span>
                <span className="text-[8px] text-zinc-400 font-normal">
                  {isZero ? "match" : "diff"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="text-xs text-zinc-500 leading-relaxed">
          Because the same Nonce generated identical keystream for both transmissions, the secret key{" "}
          <strong className="text-zinc-800 dark:text-zinc-200 font-bold">K completely vanished</strong> from the equation.
          An eavesdropper now possesses raw plaintext difference bytes.
        </div>
      </div>

      {/* Side-by-Side Impact Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 flex items-center gap-1.5">
            <AlertOctagon className="w-4 h-4" /> Standard Stream Ciphers (AES-CTR)
          </span>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Keystream is completely independent of plaintext. The attacker can cancel the keystream across{" "}
            <strong>the entire message length</strong> and forge valid packets trivially.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> ASCON-128 Sponge Resilience
          </span>
          <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
            ASCON absorbs plaintext into the rate register. Once messages differ, subsequent sponge states desynchronize immediately.
            Furthermore, <strong>Authentication Tag Forgery remains mathematically impossible</strong> under nonce reuse.
          </p>
        </div>
      </div>
    </div>
  );
}
