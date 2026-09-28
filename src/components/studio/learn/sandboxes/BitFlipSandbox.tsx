"use client";

import React, { useState } from "react";
import { Ascon128 } from "@/lib/ascon";
import { Sparkles, RefreshCw, Key, ShieldCheck, AlertTriangle } from "lucide-react";

export function BitFlipSandbox() {
  const [inputText, setInputText] = useState("PASS1234");
  const [flippedBit, setFlippedBit] = useState<number | null>(null);

  const defaultKey = "000102030405060708090A0B0C0D0E0F";
  const defaultNonce = "000102030405060708090A0B0C0D0E0F";
  const defaultAD = "DEVICE-01";

  // Compute original encryption
  const original = React.useMemo(() => {
    return Ascon128.encryptAEAD(inputText, defaultKey, defaultNonce, defaultAD);
  }, [inputText]);

  // Compute tampered encryption with 1 flipped bit
  const tampered = React.useMemo(() => {
    if (flippedBit === null) return original;
    const bytes = Array.from(new TextEncoder().encode(inputText));
    if (bytes.length === 0) return original;
    const byteIndex = Math.floor(flippedBit / 8) % bytes.length;
    const bitInByte = flippedBit % 8;
    bytes[byteIndex] ^= (1 << bitInByte);
    const tamperedText = new TextDecoder().decode(new Uint8Array(bytes));
    return Ascon128.encryptAEAD(tamperedText, defaultKey, defaultNonce, defaultAD);
  }, [inputText, flippedBit, original]);

  // Count bit differences between original and tampered tags
  const tagDiffBits = React.useMemo(() => {
    if (flippedBit === null) return 0;
    let diff = 0;
    for (let i = 0; i < 32; i += 2) {
      const b1 = parseInt(original.authenticationTag.slice(i, i + 2), 16) || 0;
      const b2 = parseInt(tampered.authenticationTag.slice(i, i + 2), 16) || 0;
      let xor = b1 ^ b2;
      while (xor > 0) {
        diff += xor & 1;
        xor >>= 1;
      }
    }
    return diff;
  }, [original.authenticationTag, tampered.authenticationTag, flippedBit]);

  return (
    <div className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Live Interactive Bit-Flip Playground
        </span>
        <button
          onClick={() => setFlippedBit(null)}
          className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline"
        >
          Reset Bit Flip
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
          Enter Plaintext Message:
        </label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value || "A")}
          maxLength={16}
          className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-zinc-900 dark:text-white"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-zinc-700 dark:text-zinc-300">
            Click any bit below to flip it (XOR with 1):
          </span>
          <span className="font-mono text-[11px] text-purple-600 dark:text-purple-400 font-bold">
            {flippedBit === null ? "No bit flipped" : `Bit ${flippedBit} flipped!`}
          </span>
        </div>

        {/* 64 Bit Buttons */}
        <div className="grid grid-cols-16 sm:grid-cols-32 gap-1 p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
          {Array.from({ length: 32 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setFlippedBit(flippedBit === i ? null : i)}
              className={`h-6 rounded text-[10px] font-mono font-bold transition-all ${
                flippedBit === i
                  ? "bg-rose-600 text-white shadow-md scale-110"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Results */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">Original Tag</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold break-all">
            {original.authenticationTag}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Resulting Tag</span>
            {flippedBit !== null && (
              <span className="text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 px-1.5 py-0.2 rounded font-bold">
                {tagDiffBits} / 128 Bits Diverged ({((tagDiffBits / 128) * 100).toFixed(1)}%)
              </span>
            )}
          </div>
          <span className={`font-bold break-all ${flippedBit !== null ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {tampered.authenticationTag}
          </span>
        </div>
      </div>
    </div>
  );
}
