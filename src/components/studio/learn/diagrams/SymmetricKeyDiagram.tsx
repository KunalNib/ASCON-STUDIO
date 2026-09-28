"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Key, KeyRound, Wifi, ArrowRight, ShieldCheck, ShieldAlert, Lock, Unlock } from "lucide-react";

export function SymmetricKeyDiagram() {
  const [isEncrypted, setIsEncrypted] = useState(false);

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">
            Shared Secret Architecture
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Symmetric Key Cryptography in IoT
          </h4>
        </div>

        <button
          onClick={() => setIsEncrypted(!isEncrypted)}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-all shadow-sm"
        >
          {isEncrypted ? "Reset Channel" : "Simulate Encryption & Transmission"}
        </button>
      </div>

      {/* Main Visual Endpoint-to-Endpoint Flow */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Endpoint 1: IoT Device (ESP32) */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5 text-blue-500" /> IoT Sensor (Sender)
            </span>
            <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded font-mono">
              ESP32-01
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 flex items-center gap-2 font-mono text-xs">
            <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-zinc-500 block">Pre-shared Secret Key (K)</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">000102...0E0F (128b)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
            <span className="text-[10px] text-zinc-500 block">Sensor Plaintext</span>
            <span className="font-bold text-zinc-800 dark:text-zinc-200">"27.4 °C (Living Room)"</span>
          </div>
        </div>

        {/* Public Insecure Network Channel */}
        <div className="flex flex-col items-center justify-center p-3 text-center space-y-2">
          <span className="text-[10px] uppercase font-bold text-rose-500 tracking-wider flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Public Airwaves (Wi-Fi)
          </span>

          <motion.div
            animate={{ x: isEncrypted ? [0, 8, 0] : 0 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
              isEncrypted
                ? "bg-purple-50 dark:bg-purple-950/30 border-purple-400 text-purple-600 dark:text-purple-300 shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-500"
            }`}
          >
            {isEncrypted ? "🔒 8A A1 FF 04 ... (Ciphertext)" : "⚠️ 27.4 °C (Plaintext In The Clear!)"}
          </motion.div>

          <span className="text-[10px] text-zinc-400 max-w-[140px]">
            Eavesdroppers on the router only see gibberish when encrypted.
          </span>
        </div>

        {/* Endpoint 2: Cloud / Gateway Server */}
        <div className="flex-1 w-full bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Cloud Gateway (Receiver)
            </span>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono">
              Server
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 flex items-center gap-2 font-mono text-xs">
            <KeyRound className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <div className="truncate">
              <span className="text-[10px] text-zinc-500 block">Identical Secret Key (K)</span>
              <span className="font-bold text-amber-700 dark:text-amber-300">000102...0E0F (128b)</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
            <span className="text-[10px] text-zinc-500 block">Decrypted Message</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {isEncrypted ? '"27.4 °C (Living Room)"' : "Awaiting transmission..."}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-3xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
        <strong>The Symmetric Advantage: </strong>
        Both devices share the <em>exact same key</em> beforehand. Because the algorithm uses simple bitwise operations rather than heavy asymmetric prime factorization (like RSA) or elliptic curves, it requires 100x fewer CPU cycles, making battery-powered microcontrollers secure without lag.
      </div>
    </div>
  );
}
