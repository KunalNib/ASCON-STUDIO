"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { Ascon128 } from "@/lib/ascon";
import { CryptoTerm } from "@/components/ui/CryptoTerm";
import { FileText, Cpu, Lock } from "lucide-react";

export function PlaintextProcessingFlow() {
  const { session, plaintext, key, nonce, associatedData } = useAsconStore();
  const [step, setStep] = useState(0);
  const [visibleCols, setVisibleCols] = useState(0);

  const livePt = (plaintext || session?.plaintext || "27.4 °C").trim();
  const liveKey = key || session?.key || "000102030405060708090A0B0C0D0E0F";
  const liveNonce = nonce || session?.nonce || "000102030405060708090A0B0C0D0E0F";
  const liveAd = associatedData || session?.associatedData || "ESP32-STATION-1";

  // Compute live ASCON encryption
  const encResult = useMemo(() => {
    return Ascon128.encryptAEAD(liveKey, liveNonce, liveAd, livePt);
  }, [liveKey, liveNonce, liveAd, livePt]);

  // Plaintext bytes (first 8 bytes for Block 1)
  const ptBlockBytes = useMemo(() => {
    const raw = Array.from(new TextEncoder().encode(livePt)).map((b) =>
      b.toString(16).toUpperCase().padStart(2, "0")
    );
    const padded = [...raw];
    if (padded.length < 8) {
      padded.push("80");
      while (padded.length < 8) padded.push("00");
    }
    return padded.slice(0, 8);
  }, [livePt]);

  // State x0 bytes (after AD processing, before PT XOR)
  const stateX0Bytes = useMemo(() => {
    if (encResult.initializedStateWords && encResult.initializedStateWords[0]) {
      const hex = encResult.initializedStateWords[0];
      const bytes: string[] = [];
      for (let i = 0; i < 16; i += 2) {
        bytes.push(hex.slice(i, i + 2));
      }
      return bytes;
    }
    return ["E8", "F1", "23", "A7", "4C", "9B", "D2", "51"];
  }, [encResult]);

  // Ciphertext bytes: P XOR x0
  const ctBlockBytes = useMemo(() => {
    return ptBlockBytes.map((p, i) => {
      const val = (parseInt(p, 16) ^ parseInt(stateX0Bytes[i] || "00", 16))
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");
      return val;
    });
  }, [ptBlockBytes, stateX0Bytes]);

  const displayCiphertext = encResult.ciphertext || ctBlockBytes.join(" ");

  // Auto-animate columns when step 2 hits
  useEffect(() => {
    if (step < 2) {
      setVisibleCols(0);
      return;
    }
    const interval = setInterval(() => {
      setVisibleCols((c) => {
        if (c >= ptBlockBytes.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [step, ptBlockBytes.length]);

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2 border border-blue-500/20">
          <span>Plain English: Scrambling Your Message into Ciphertext</span>
        </div>
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <FileText className="w-6 h-6 text-blue-600 dark:text-blue-500" />
          <CryptoTerm term="Duplex" display="Plaintext Absorption" /> &amp; Encryption
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">
          ASCON operates in <CryptoTerm term="Duplex" display="duplex sponge mode" />.
          The plaintext is XORed with the top 64-bits of the state (<CryptoTerm term="Rate" display="x0" />) to produce ciphertext.
          The same x0 is then fed back into the state, entangling the message with all future operations.
        </p>
      </div>

      {/* Step Controls */}
      <div className="flex gap-2 shrink-0">
        {["1. Show Plaintext", "2. Show State x0", "3. XOR → Ciphertext"].map((label, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              step === i
                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                : step > i
                ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400"
                : "bg-white dark:bg-black/40 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 shadow-sm dark:shadow-none"
            }`}
          >
            {step > i ? "✓ " : ""}{label}
          </button>
        ))}
      </div>

      {/* Main XOR Grid */}
      <div className="w-full flex flex-col items-center gap-2 shrink-0">
        {/* Plaintext Row */}
        <AnimatePresence>
          {step >= 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 w-full justify-center"
            >
              <div className="flex items-center gap-2 w-32 shrink-0 justify-end">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                  Plaintext P₀
                </span>
              </div>
              <div className="flex gap-1.5">
                {ptBlockBytes.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/30 flex items-center justify-center font-mono text-sm text-blue-700 dark:text-blue-200 font-bold"
                  >
                    {b}
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">(8 bytes)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* XOR symbol row */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="flex items-center gap-2 w-full justify-center"
            >
              <div className="w-32 shrink-0" />
              <div className="flex gap-1.5">
                {ptBlockBytes.map((_, i) => (
                  <div key={i} className="w-10 flex items-center justify-center text-zinc-400 dark:text-zinc-600 font-black text-lg">
                    ⊕
                  </div>
                ))}
              </div>
              <span className="text-xs text-transparent font-mono">(8 bytes)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State x0 Row */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 w-full justify-center"
            >
              <div className="flex items-center gap-2 w-32 shrink-0 justify-end">
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider">
                  <CryptoTerm term="Rate" display="State x0" />
                </span>
              </div>
              <div className="flex gap-1.5">
                {stateX0Bytes.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-500/15 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center font-mono text-sm text-purple-700 dark:text-purple-200 font-bold"
                  >
                    {b}
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">(Rate doorway)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Separator line */}
        {step >= 2 && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="w-full max-w-sm h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full my-1"
          />
        )}

        {/* Ciphertext row — animated column by column */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 w-full justify-center"
            >
              <div className="flex items-center gap-2 w-32 shrink-0 justify-end">
                <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">
                  Ciphertext C₀
                </span>
              </div>
              <div className="flex gap-1.5">
                {ctBlockBytes.map((b, i) => (
                  <AnimatePresence key={i}>
                    {i < visibleCols ? (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center font-mono text-sm text-emerald-700 dark:text-emerald-100 font-black shadow-sm dark:shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      >
                        {b}
                      </motion.div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-700 text-xs">
                        ?
                      </div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">(Encrypted)</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Explanation cards */}
      <AnimatePresence>
        {step >= 2 && visibleCols >= ptBlockBytes.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
          >
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-4 text-center shadow-sm dark:shadow-none">
              <div className="text-xl font-black text-blue-900 dark:text-white font-mono mb-1">P ⊕ x0 = C</div>
              <div className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest">
                The Core XOR Operation
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-2">
                Plain English: Each plaintext byte is XORed with the corresponding memory state byte to produce encrypted ciphertext.
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-4 text-center shadow-sm dark:shadow-none">
              <div className="text-xl font-black text-purple-700 dark:text-purple-300 font-mono mb-1">x0 ← x0 ⊕ P</div>
              <div className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest">
                State Absorption
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-2">
                Plain English: The plaintext is absorbed into internal memory so all future steps cryptographically depend on this message.
              </p>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-4 text-center shadow-sm dark:shadow-none">
              <div className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono mb-1">
                p⁶ Rounds →
              </div>
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">
                Next Block Permutation
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-500 mt-2">
                Plain English: 6 rounds of non-linear mathematical bit-mixing thoroughly scramble memory before the next block is processed.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final ciphertext */}
      <AnimatePresence>
        {step >= 2 && visibleCols >= ptBlockBytes.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-500/30 rounded-2xl p-5 text-center shadow-sm dark:shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold mb-2">
              Live Generated Ciphertext (Block 1)
            </div>
            <div className="font-mono text-2xl text-emerald-800 dark:text-emerald-100 tracking-widest font-black">
              {displayCiphertext}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-600 mt-2 font-mono">
              &quot;{ptBlockBytes.join(" ")}&quot; (PT) XOR &quot;{stateX0Bytes.join(" ")}&quot; (x0)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

