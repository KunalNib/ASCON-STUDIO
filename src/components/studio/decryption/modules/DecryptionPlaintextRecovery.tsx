"use client";

import { useState, useEffect } from "react";
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
import {
  DECRYPT_X0_INITIAL,
  DECRYPT_CIPHERTEXT_BYTES,
  DECRYPT_RECOVERED_BYTES,
  DECRYPT_RECOVERED_ASCII,
} from "@/lib/asconDemoData";

export function DecryptionPlaintextRecovery() {
  const { decryptionCiphertext, decryptionTampered } = useAsconStore();
  const [step, setStep] = useState(0);
  const [revealedCount, setRevealedCount] = useState(0);

  // Auto-animate byte decoding when step 2 is active
  useEffect(() => {
    if (step < 2) {
      setRevealedCount(0);
      return;
    }
    const interval = setInterval(() => {
      setRevealedCount((c) => {
        if (c >= DECRYPT_CIPHERTEXT_BYTES.length) {
          clearInterval(interval);
          return c;
        }
        return c + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [step]);

  const hexXor = (a: string, b: string) => {
    const val = (parseInt(a, 16) ^ parseInt(b, 16))
      .toString(16)
      .toUpperCase()
      .padStart(2, "0");
    return val;
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Unlock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Duplex Plaintext Recovery &amp; State Feedback
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
          <span className="font-bold">Cryptographic Quarantine (NIST SP 800-232): </span>
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
          <div className="w-36 shrink-0 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              State Rate x0:
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DECRYPT_X0_INITIAL.map((b, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 flex items-center justify-center font-mono text-xs font-bold text-zinc-700 dark:text-zinc-300"
              >
                {b}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">(64-bit rate)</span>
        </div>

        {/* Row 2: Ciphertext */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <div className="w-36 shrink-0 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Ciphertext C₀:
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DECRYPT_CIPHERTEXT_BYTES.map((b, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300"
                  >
                    {b}
                  </div>
                ))}
              </div>
              <span className="text-[11px] text-zinc-500 font-mono">(64-bit block)</span>
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
                <div className="w-36 shrink-0 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Recovered (Hex):
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DECRYPT_RECOVERED_BYTES.map((b, i) => {
                    const isVisible = i < revealedCount;
                    return (
                      <motion.div
                        key={i}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0.2 }}
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold ${
                          isVisible
                            ? "bg-emerald-600 border-emerald-500 text-white shadow-sm"
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
                <div className="w-36 shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    ASCII Decoded:
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {DECRYPT_RECOVERED_ASCII.map((char, i) => {
                    const isVisible = i < revealedCount;
                    return (
                      <div
                        key={i}
                        className={`w-10 h-8 rounded-lg flex items-center justify-center font-mono text-sm font-bold border ${
                          isVisible
                            ? "bg-zinc-100 dark:bg-white/5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300"
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
            permutation <code className="font-mono font-bold">p⁶</code> runs. This synchronizes the receiver's state with the sender.
          </div>
        </div>
      </div>
    </div>
  );
}
