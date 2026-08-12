"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PLAINTEXT_BLOCK_BYTES,
  STATE_X0_BYTES,
  CIPHERTEXT_BLOCK_BYTES,
  DEMO_CIPHERTEXT,
} from "@/lib/asconDemoData";
import { FileText, Cpu, Lock } from "lucide-react";

export function PlaintextProcessingFlow() {
  const [step, setStep] = useState(0);
  const [visibleCols, setVisibleCols] = useState(0);

  // Auto-animate columns when step 2 hits
  useEffect(() => {
    if (step < 2) { setVisibleCols(0); return; }
    const interval = setInterval(() => {
      setVisibleCols((c) => {
        if (c >= PLAINTEXT_BLOCK_BYTES.length) { clearInterval(interval); return c; }
        return c + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [step]);

  const hexXor = (a: string, b: string) => {
    const result = (parseInt(a, 16) ^ parseInt(b, 16)).toString(16).toUpperCase().padStart(2, "0");
    return result;
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar">

      {/* Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-white mb-2">
          <FileText className="w-6 h-6 text-blue-500" />
          Plaintext Absorption &amp; Encryption
        </h2>
        <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">
          ASCON operates in <span className="text-blue-400 font-bold">duplex / sponge mode</span>.
          The plaintext is XORed with the top 64-bits of the state (x0) to produce ciphertext.
          The same x0 is then fed back into the state, entangling the message with all future operations.
        </p>
      </div>

      {/* Step Controls */}
      <div className="flex gap-2 shrink-0">
        {["Show Plaintext", "Show State x0", "XOR → Ciphertext"].map((label, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
              step === i
                ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                : step > i
                ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                : "bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300"
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
              className="flex items-center gap-2 w-full"
            >
              <div className="flex items-center gap-2 w-28 shrink-0 justify-end">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Plaintext</span>
              </div>
              <div className="flex gap-1.5">
                {PLAINTEXT_BLOCK_BYTES.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center font-mono text-sm text-blue-200 font-bold"
                  >
                    {b}
                  </motion.div>
                ))}
              </div>
              <span className="text-xs text-zinc-600 font-mono">(8 bytes)</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* XOR symbol row */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              className="flex items-center gap-2 w-full"
            >
              <div className="w-28 shrink-0" />
              <div className="flex gap-1.5">
                {PLAINTEXT_BLOCK_BYTES.map((_, i) => (
                  <div key={i} className="w-10 flex items-center justify-center text-zinc-600 font-black text-lg">
                    ⊕
                  </div>
                ))}
              </div>
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
              className="flex items-center gap-2 w-full"
            >
              <div className="flex items-center gap-2 w-28 shrink-0 justify-end">
                <Cpu className="w-4 h-4 text-purple-400" />
                <span className="text-xs text-purple-400 font-bold uppercase tracking-wider">State x0</span>
              </div>
              <div className="flex gap-1.5">
                {STATE_X0_BYTES.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, type: "spring" }}
                    className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center font-mono text-sm text-purple-200 font-bold"
                  >
                    {b}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Separator line */}
        {step >= 2 && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="w-full max-w-sm ml-28 h-[2px] bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full"
          />
        )}

        {/* Ciphertext row — animated column by column */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 w-full"
            >
              <div className="flex items-center gap-2 w-28 shrink-0 justify-end">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Ciphertext</span>
              </div>
              <div className="flex gap-1.5">
                {CIPHERTEXT_BLOCK_BYTES.map((b, i) => (
                  <AnimatePresence key={i}>
                    {i < visibleCols ? (
                      <motion.div
                        initial={{ opacity: 0, y: -20, scale: 0.5 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        className="w-10 h-10 rounded-xl bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center font-mono text-sm text-emerald-100 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                      >
                        {b}
                      </motion.div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-zinc-700 text-xs">
                        ?
                      </div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Explanation cards */}
      <AnimatePresence>
        {step >= 2 && visibleCols >= PLAINTEXT_BLOCK_BYTES.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full"
          >
            <div className="bg-blue-950/20 border border-blue-500/20 rounded-2xl p-4 text-center">
              <div className="text-xl font-black text-white font-mono mb-1">P ⊕ x0 = C</div>
              <div className="text-xs text-blue-400 font-bold uppercase tracking-widest">The core operation</div>
              <p className="text-xs text-zinc-500 mt-2">Each plaintext byte is XORed with the corresponding state byte to produce ciphertext.</p>
            </div>
            <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 text-center">
              <div className="text-xl font-black text-purple-300 font-mono mb-1">x0 ← x0||P</div>
              <div className="text-xs text-purple-400 font-bold uppercase tracking-widest">State Absorption</div>
              <p className="text-xs text-zinc-500 mt-2">The plaintext is absorbed back into the rate — entangling the message with authentication.</p>
            </div>
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 text-center">
              <div className="text-xl font-black text-emerald-300 font-mono mb-1">p⁸ →</div>
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Next Block</div>
              <p className="text-xs text-zinc-500 mt-2">Between blocks, an 8-round permutation scrambles the state before absorbing the next block.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Final ciphertext */}
      <AnimatePresence>
        {step >= 2 && visibleCols >= PLAINTEXT_BLOCK_BYTES.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-emerald-950/20 border-2 border-emerald-500/30 rounded-2xl p-5 text-center shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <div className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold mb-2">
              Generated Ciphertext (Block 1)
            </div>
            <div className="font-mono text-2xl text-emerald-100 tracking-widest font-black">
              {DEMO_CIPHERTEXT}
            </div>
            <div className="text-xs text-zinc-600 mt-2 font-mono">
              "{PLAINTEXT_BLOCK_BYTES.join(" ")}" (PT) XOR "{STATE_X0_BYTES.join(" ")}" (x0)
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
