"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { Key, Hash, Fingerprint, ChevronRight, Binary, Wifi, WifiOff } from "lucide-react";

type Scene = "text" | "bytes" | "params";

// ─── Derive character breakdown from any live string ────────────────────────
function buildCharItems(text: string) {
  return Array.from(text).map((char) => {
    const cp = char.codePointAt(0) ?? 0;
    return {
      char: char === " " ? "·" : char,
      dec: cp,
      hex: cp.toString(16).toUpperCase().padStart(2, "0"),
      bin: cp.toString(2).padStart(8, "0").slice(0, 8), // show first 8 bits (1 byte)
    };
  });
}

// Build hex block string from plaintext
function toHexBlocks(text: string): string {
  const bytes = Array.from(text).map((c) =>
    (c.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(2, "0")
  );
  const block1 = bytes.slice(0, 8).join(" ");
  const block2 = bytes.slice(8, 16).join(" ") || "--";
  return `${block1} | ${block2 !== "--" ? block2 : "80 00 00 00 00 00 00 00"}`;
}

export function InputConfigurationPanel() {
  const { session, plaintext } = useAsconStore();

  // Live values from store — falls back to session values if plaintext state var is empty
  const livePlaintext    = (plaintext || session?.plaintext || "27.4 °C").trim();
  const liveKey          = session?.key          || "000102030405060708090A0B0C0D0E0F";
  const liveNonce        = session?.nonce         || "000102030405060708090A0B0C0D0E0F";
  const liveAssocData    = session?.associatedData || "ESP32-STATION-1";
  const liveDevice       = session?.deviceId       || "ESP32-01";

  // Derived character items — recomputed whenever plaintext changes
  const charItems = useMemo(() => buildCharItems(livePlaintext), [livePlaintext]);

  const [scene, setScene] = useState<Scene>("text");
  const [typedCount, setTypedCount] = useState(0);
  const [visibleByteCount, setVisibleByteCount] = useState(0);

  // Re-run typewriter whenever live plaintext changes (new ESP32 packet)
  useEffect(() => {
    if (scene !== "text") return;
    setTypedCount(0);
    const interval = setInterval(() => {
      setTypedCount((c) => {
        if (c >= charItems.length) { clearInterval(interval); return c; }
        return c + 1;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [scene, charItems]);

  // Staggered byte reveal
  useEffect(() => {
    if (scene !== "bytes") return;
    setVisibleByteCount(0);
    const interval = setInterval(() => {
      setVisibleByteCount((c) => {
        if (c >= charItems.length) { clearInterval(interval); return c; }
        return c + 1;
      });
    }, 130);
    return () => clearInterval(interval);
  }, [scene, charItems]);

  const isLive = !!(plaintext && plaintext !== "27.4 °C");

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 md:p-6 max-w-4xl mx-auto gap-4 overflow-y-auto custom-scrollbar">

      {/* Live source badge */}
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold shrink-0 ${
        isLive
          ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
          : "bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-500"
      }`}>
        {isLive
          ? <><Wifi className="w-3 h-3" /> Live ESP32 data — {liveDevice}</>
          : <><WifiOff className="w-3 h-3" /> Demo fallback — connect ESP32 for live data</>
        }
      </div>

      {/* Scene Tabs */}
      <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/60 border border-zinc-200 dark:border-white/10 p-1.5 rounded-2xl w-full max-w-lg shrink-0 shadow-sm dark:shadow-none">
        {(["text", "bytes", "params"] as Scene[]).map((s) => {
          const labels: Record<Scene, string> = {
            text:   "① Raw Input",
            bytes:  "② Byte Encoding",
            params: "③ Crypto Params",
          };
          return (
            <button
              key={s}
              onClick={() => setScene(s)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                scene === s
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              {labels[s]}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">

        {/* ─── Scene 1: Text Input ─────────────────────────────────── */}
        {scene === "text" && (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full gap-6"
          >
            <div className="text-center">
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-2">
                Sensor reading arriving from {liveDevice}
              </p>
              <div className="flex items-center justify-center gap-1 min-h-[72px]">
                <span className="text-5xl font-black text-zinc-900 dark:text-white font-mono tracking-widest drop-shadow-md dark:drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
                  {Array.from(livePlaintext).slice(0, typedCount).join("")}
                </span>
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className={`text-5xl font-black text-blue-600 dark:text-blue-500 ${typedCount >= charItems.length ? "opacity-0" : ""}`}
                >
                  |
                </motion.span>
              </div>
            </div>

            {/* Character breakdown strip */}
            <div className="flex gap-2 flex-wrap justify-center">
              {charItems.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={i < typedCount ? { opacity: 1, scale: 1, y: 0 } : { opacity: 0, scale: 0.5, y: 20 }}
                  transition={{ delay: 0.05 * i, type: "spring", stiffness: 300, damping: 20 }}
                  className="flex flex-col items-center gap-1 bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-none rounded-2xl p-2.5 min-w-[48px]"
                >
                  <span className="text-xl font-black text-zinc-900 dark:text-white font-mono">{c.char}</span>
                  <span className="text-[10px] text-zinc-500 font-mono">#{c.dec}</span>
                </motion.div>
              ))}
            </div>

            <button
              onClick={() => setScene("bytes")}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 text-sm"
            >
              See byte encoding <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ─── Scene 2: Byte Encoding ──────────────────────────────── */}
        {scene === "bytes" && (
          <motion.div
            key="bytes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center w-full gap-4"
          >
            <div className="text-center">
              <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold mb-1">
                ASCII / UTF-8 Encoding — each character → 1 byte
              </p>
              <p className="text-zinc-600 text-xs max-w-md">
                Cryptographic algorithms operate on <em>bytes</em>, not characters. Every character maps to a unique 8-bit pattern.
              </p>
            </div>

            {/* Byte Grid */}
            <div className="w-full space-y-1.5 overflow-y-auto max-h-[320px] custom-scrollbar pr-1">
              {charItems.map((item, i) => (
                <motion.div
                  key={`${i}-${item.char}`}
                  initial={{ opacity: 0, x: -30 }}
                  animate={i < visibleByteCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                  transition={{ type: "spring", stiffness: 200, damping: 22 }}
                  className="flex items-center gap-2.5 px-3 py-2.5 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none border border-zinc-200 dark:border-white/5 rounded-xl"
                >
                  {/* Char */}
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-300 font-black text-lg font-mono shrink-0">
                    {item.char}
                  </div>

                  <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-700 shrink-0" />

                  {/* Hex */}
                  <div className="w-12 text-center px-2 py-1 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 font-mono text-amber-600 dark:text-amber-300 font-bold text-xs shrink-0">
                    0x{item.hex}
                  </div>

                  <ChevronRight className="w-3 h-3 text-zinc-400 dark:text-zinc-700 shrink-0" />

                  {/* Binary */}
                  <div className="flex gap-0.5 flex-1">
                    {item.bin.split("").map((bit, bIdx) => (
                      <motion.span
                        key={bIdx}
                        initial={{ opacity: 0 }}
                        animate={i < visibleByteCount ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: bIdx * 0.04 }}
                        className={`flex-1 h-6 flex items-center justify-center rounded text-xs font-mono font-bold ${
                          bit === "1"
                            ? "bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30"
                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-600 border border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        {bit}
                      </motion.span>
                    ))}
                  </div>

                  {/* Dec */}
                  <div className="text-[10px] text-zinc-600 font-mono shrink-0 w-7 text-right">
                    {item.dec}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* 64-bit block assembly indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: visibleByteCount >= charItems.length ? 1 : 0 }}
              transition={{ delay: 0.3 }}
              className="w-full bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-3 text-center shadow-sm dark:shadow-none"
            >
              <div className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-bold mb-1.5">
                <Binary className="w-3 h-3 inline mr-1" /> Assembled into 64-bit Blocks
              </div>
              <div className="font-mono text-sm text-zinc-700 dark:text-zinc-300 tracking-widest break-all">
                {toHexBlocks(livePlaintext)}
              </div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-1">
                Block 1 (8 bytes) | Block 2 {charItems.length > 8 ? "(continued)" : "(padded with 0x80...)"}
              </div>
            </motion.div>

            <button
              onClick={() => setScene("params")}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 text-sm"
            >
              Load cryptographic params <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* ─── Scene 3: Crypto Params ──────────────────────────────── */}
        {scene === "params" && (
          <motion.div
            key="params"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col w-full gap-3"
          >
            <p className="text-zinc-500 text-xs uppercase tracking-widest font-bold text-center mb-1">
              Three values required for ASCON-128 encryption
            </p>

            {/* Key */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
              className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 relative overflow-hidden"
            >
              <div className="absolute right-3 top-3 opacity-10"><Key className="w-12 h-12 text-amber-600 dark:text-amber-400" /></div>
              <div className="flex items-center gap-2 mb-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-widest font-bold">128-bit Secret Key</span>
                <span className="ml-auto text-[10px] bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold border border-red-300 dark:border-red-500/20">NEVER share</span>
              </div>
              <div className="font-mono text-amber-800 dark:text-amber-200 tracking-[0.15em] text-sm break-all">{liveKey}</div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500 mt-1.5">Secret shared between sender and receiver. Core of cipher security.</p>
            </motion.div>

            {/* Nonce */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 relative overflow-hidden"
            >
              <div className="absolute right-3 top-3 opacity-10"><Hash className="w-12 h-12 text-rose-600 dark:text-rose-400" /></div>
              <div className="flex items-center gap-2 mb-1.5">
                <Hash className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span className="text-[10px] text-rose-600 dark:text-rose-400 uppercase tracking-widest font-bold">128-bit Nonce (used once)</span>
                <span className="ml-auto text-[10px] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full font-bold border border-rose-300 dark:border-rose-500/20">Never reuse!</span>
              </div>
              <div className="font-mono text-rose-800 dark:text-rose-200 tracking-[0.15em] text-sm break-all">{liveNonce}</div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500 mt-1.5">Ensures each message is unique even with the same key.</p>
            </motion.div>

            {/* Associated Data */}
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 relative overflow-hidden"
            >
              <div className="absolute right-3 top-3 opacity-10"><Fingerprint className="w-12 h-12 text-emerald-600 dark:text-emerald-400" /></div>
              <div className="flex items-center gap-2 mb-1.5">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">Associated Data (AD)</span>
                <span className="ml-auto text-[10px] bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-bold border border-emerald-300 dark:border-emerald-500/20">Public, Authenticated</span>
              </div>
              <div className="font-mono text-emerald-800 dark:text-emerald-200 text-base">{liveAssocData}</div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-500 mt-1.5">Travels publicly but is cryptographically bound. Tampering breaks tag verification.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
