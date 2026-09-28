"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import {
  Unlock,
  Cpu,
  FileText,
  ShieldAlert,
  ArrowRight,
  AlertOctagon,
  Sparkles,
} from "lucide-react";
import { Ascon128 } from "@/lib/ascon";
import { CryptoTerm } from "@/components/ui/CryptoTerm";

export function DecryptionPlaintextRecovery() {
  const {
    decryptionCiphertext,
    decryptionTampered,
    decryptionKey,
    decryptionNonce,
    decryptionAssociatedData,
    decryptionAuthTag,
  } = useAsconStore();

  const [step, setStep] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  // Dynamically compute real ASCON-128 decryption state
  const decResult = useMemo(() => {
    return Ascon128.decryptAEAD(
      decryptionKey || "000102030405060708090A0B0C0D0E0F",
      decryptionNonce || "000102030405060708090A0B0C0D0E0F",
      decryptionAssociatedData || "ESP32-STATION-1",
      decryptionCiphertext || "04 C4 2F 82 A8 7B EF A3",
      decryptionAuthTag || "FC 6F BB FA DF F5 56 79 7C 62 51 71 F5 67 71 88"
    );
  }, [
    decryptionKey,
    decryptionNonce,
    decryptionAssociatedData,
    decryptionCiphertext,
    decryptionAuthTag,
  ]);

  const x0Bytes = useMemo(() => {
    if (decResult.rateWordX0AfterInit && decResult.rateWordX0AfterInit.length >= 8) {
      return decResult.rateWordX0AfterInit.slice(0, 8);
    }
    return ["E8", "F1", "23", "A7", "4C", "9B", "D2", "51"];
  }, [decResult]);

  const ctBytes = useMemo(() => {
    const raw = (decryptionCiphertext || "04 C4 2F 82 A8 7B EF A3").trim().split(/\s+/);
    const padded = [...raw];
    while (padded.length < 8) padded.push("00");
    return padded.slice(0, 8);
  }, [decryptionCiphertext]);

  const recoveredBytes = useMemo(() => {
    if (decResult.recoveredBytes && decResult.recoveredBytes.length >= 8) {
      return decResult.recoveredBytes.slice(0, 8);
    }
    // Dynamic fallback XOR byte by byte: P = C ^ x0
    return ctBytes.map((c, i) => {
      const val = (parseInt(c, 16) ^ parseInt(x0Bytes[i] || "00", 16))
        .toString(16)
        .toUpperCase()
        .padStart(2, "0");
      return val;
    });
  }, [decResult, ctBytes, x0Bytes]);

  const recoveredAscii = useMemo(() => {
    return recoveredBytes.map((hex) => {
      const code = parseInt(hex, 16);
      if (code >= 32 && code <= 126) {
        return code === 32 ? "·" : String.fromCharCode(code);
      }
      return "·";
    });
  }, [recoveredBytes]);

  // Auto-animate byte decoding when step 2 is active
  useEffect(() => {
    if (step < 2) {
      setRevealedCount(0);
      return;
    }
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        if (c >= ctBytes.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [step, ctBytes.length]);

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
          <span>Plain English: Unscrambling Your Message Block-by-Block</span>
        </div>
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Unlock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          <CryptoTerm term="Duplex" display="Duplex Plaintext Recovery" /> &amp; State Feedback
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">
          In ASCON decryption, plaintext is recovered by computing{" "}
          <strong className="text-emerald-600 dark:text-emerald-400 font-mono">Pᵢ = Cᵢ ⊕ x0</strong>.
          Then, state word <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">x0</code> is
          replaced with the incoming ciphertext:{" "}
          <strong className="text-emerald-600 dark:text-emerald-400 font-mono">x0 ← Cᵢ</strong>.
        </p>
      </div>

      {/* Security Quarantine Banner */}
      <div className="w-full bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
        <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <div>
          <span className="font-bold">
            <CryptoTerm term="Zero-Trust Gate" display="Cryptographic Quarantine" showBadge /> (NIST SP 800-232):{" "}
          </span>
          The recovered plaintext is held in provisional volatile memory. It{" "}
          <strong>MUST NOT be released</strong> to the application until Tag Verification passes in Step 6.
        </div>
      </div>

      {/* Step Selector */}
      <div className="flex gap-2 shrink-0">
        {[
          "1. Inspect Rate Word (x0)",
          "2. Align Ciphertext (C₀)",
          "3. Execute XOR: P₀ = C₀ ⊕ x0",
        ].map((label, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              step === i
                ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                : step > i
                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-white dark:bg-black border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 shadow-sm"
            }`}
          >
            {step > i ? "✓ " : ""}
            {label}
          </button>
        ))}
      </div>

      {/* Interactive XOR Recovery Grid */}
      <div className="w-full bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
        {/* Row 1: State Word x0 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-44 shrink-0 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              <CryptoTerm term="Rate" display="State Rate x0" />:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {x0Bytes.map((b, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                {b}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">(64-bit rate doorway)</span>
        </div>

        {/* Row 2: Ciphertext */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <div className="w-44 shrink-0 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  <CryptoTerm term="Bit-Flipping" display="Ciphertext C₀" />:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ctBytes.map((b, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold ${
                      decryptionTampered && i === 0
                        ? "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 animate-pulse"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                    }`}
                  >
                    {b}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">
                {decryptionTampered ? "(Tampered Byte 0)" : "(64-bit block)"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Row 3: Recovered Plaintext Result */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col gap-3 pt-3 border-t border-zinc-200 dark:border-white/10"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-44 shrink-0 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Recovered (Hex):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recoveredBytes.map((b, i) => {
                    const isVisible = i < revealedCount;
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0.2 }}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold ${
                          isVisible
                            ? decryptionTampered && i === 0
                              ? "bg-rose-600 border-rose-500 text-white shadow-sm"
                              : "bg-emerald-600 border-emerald-500 text-white shadow-sm"
                            : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-white/5 text-zinc-400"
                        }`}
                      >
                        {isVisible ? b : "??"}
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* ASCII Translation Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <div className="w-44 shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Plain English Text:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recoveredAscii.map((char, i) => {
                    const isVisible = i < revealedCount;
                    return (
                      <div
                        key={i}
                        className={`w-10 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold border ${
                          isVisible
                            ? decryptionTampered && i === 0
                              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-500/40 text-rose-700 dark:text-rose-300"
                              : "bg-zinc-100 dark:bg-white/5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
                            : "bg-transparent border-transparent text-transparent"
                        }`}
                      >
                        {isVisible ? char : ""}
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State update feedback rule */}
        <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
          <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div>
            <strong>Duplex Feedback Law: </strong>
            Immediately after extracting Plaintext, state register <code className="font-mono font-bold text-zinc-900 dark:text-white">x0</code> is
            overwritten with <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">C₀</code>, and
            permutation <CryptoTerm term="p6" display="p⁶" /> runs. This synchronizes the receiver's state with the sender.
          </div>
        </div>
      </div>
    </div>
  );
}

