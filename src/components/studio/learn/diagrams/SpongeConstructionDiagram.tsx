"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, Play, Pause, RotateCcw, Info, Shield, CheckCircle2 } from "lucide-react";

export function SpongeConstructionDiagram() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      id: "init",
      title: "1. Initial State Setup",
      simpleTitle: "Mixing Bowl Initialization",
      desc: "The 320-bit internal state is loaded with the standard Initialization Vector (IV), Secret Key (K), and Nonce (N).",
      rateText: "IV (64-bit)",
      capText: "Key (128-bit) + Nonce (128-bit)",
      permRounds: "p¹² (12 Rounds)",
      action: "Permutation scrambles the initial setup",
    },
    {
      id: "ad",
      title: "2. Absorb Associated Data",
      simpleTitle: "Stamp Public Header Info",
      desc: "Associated data (like packet headers or device ID) is XORed into the 64-bit Rate register x0, then scrambled with p⁶.",
      rateText: "x0 ⊕ AD Block",
      capText: "Protected Internal Capacity",
      permRounds: "p⁶ (6 Rounds)",
      action: "Entangles metadata so headers cannot be altered",
    },
    {
      id: "pt",
      title: "3. Duplex Plaintext Encryption",
      simpleTitle: "Scramble Message & Extract Ciphertext",
      desc: "Each 64-bit plaintext block is XORed with the Rate register x0 to immediately produce a ciphertext block, then scrambled with p⁶.",
      rateText: "x0 ⊕ Pᵢ → Cᵢ",
      capText: "Secret Capacity keeps cipher state unguessable",
      permRounds: "p⁶ (6 Rounds)",
      action: "Squeezes out encrypted ciphertext block by block",
    },
    {
      id: "final",
      title: "4. Finalization & Squeeze Tag",
      simpleTitle: "Create Tamper-Proof Security Seal",
      desc: "The secret Key is XORed again, a heavy 12-round permutation runs, and the 128-bit Authentication Tag is squeezed out from x3 and x4.",
      rateText: "Key Absorbed (x1, x2)",
      capText: "x3 ⊕ Key₁ | x4 ⊕ Key₂ → 128-bit Tag",
      permRounds: "p¹² (12 Rounds)",
      action: "Produces final unforgeable 128-bit seal",
    },
  ];

  // Auto-play timer
  React.useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const active = steps[currentStep];

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      {/* Top Header & Step Indicators */}
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            Interactive Sponge Duplex Model
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            {active.title}
            <span className="text-xs font-normal text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
              {active.simpleTitle}
            </span>
          </h4>
        </div>

        {/* Step Scrubber Buttons */}
        <div className="flex items-center gap-1.5 self-end md:self-auto">
          {steps.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setCurrentStep(idx);
                setIsPlaying(false);
              }}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${currentStep === idx
                  ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
            >
              Step {idx + 1}
            </button>
          ))}
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause autoplay" : "Start autoplay"}
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 border border-zinc-200 dark:border-zinc-800"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              setCurrentStep(0);
              setIsPlaying(false);
            }}
            title="Reset to step 1"
            className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 border border-zinc-200 dark:border-zinc-800"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Diagram Area */}
      <div className="w-full flex flex-col items-center justify-center py-2">
        {/* Input Arrow / Ingestion indicator */}
        <motion.div
          key={`input-${currentStep}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-3"
        >
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/30 px-3 py-1 rounded-full shadow-sm">
            {currentStep === 0 && "Load IV (64b) + Key (128b) + Nonce (128b)"}
            {currentStep === 1 && "Absorb Associated Data: x0 ⊕ AD"}
            {currentStep === 2 && "Absorb Plaintext: x0 ⊕ Pᵢ"}
            {currentStep === 3 && "Re-absorb Secret Key into State (x1, x2)"}
          </span>
          <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            <ArrowDown className="w-5 h-5 text-emerald-500 mt-1" />
          </motion.div>
        </motion.div>

        {/* The 320-bit Sponge State Container */}
        <div className="w-full max-w-2xl bg-white dark:bg-[#0c0d12] border-2 border-zinc-300 dark:border-zinc-800 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-40 h-40 bg-purple-500/10 blur-[50px] pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-emerald-500/10 blur-[50px] pointer-events-none rounded-full" />

          <div className="flex items-center justify-between mb-3 text-xs font-bold">
            <span className="text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500" /> Total 320-Bit Internal Memory
            </span>
            <span className="text-purple-600 dark:text-purple-400 font-mono text-[11px]">
              {active.permRounds}
            </span>
          </div>

          {/* Rate vs Capacity Split Container */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {/* Rate Register (x0) - 64 bits */}
            <div className="md:col-span-2 flex flex-col bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-500/50 rounded-2xl p-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
                  Rate (r = 64 bits)
                </span>
                <span className="text-[10px] font-mono bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
                  Word x0
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-3">
                The public interaction window. Only this word absorbs inputs and squeezes outputs.
              </p>
              <div className="mt-auto bg-white/80 dark:bg-black/60 border border-emerald-300 dark:border-emerald-500/30 rounded-xl p-2.5 font-mono text-xs text-center font-bold text-emerald-600 dark:text-emerald-300">
                {active.rateText}
              </div>
            </div>

            {/* Capacity Registers (x1, x2, x3, x4) - 256 bits */}
            <div className="md:col-span-3 flex flex-col bg-purple-50/70 dark:bg-purple-950/20 border-2 border-purple-400 dark:border-purple-500/50 rounded-2xl p-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" /> Capacity (c = 256 bits)
                </span>
                <span className="text-[10px] font-mono bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 px-2 py-0.5 rounded font-bold">
                  Words x1, x2, x3, x4
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 mb-3">
                Hidden internal core. Never exposed to outsiders; prevents state reconstruction attacks.
              </p>
              <div className="mt-auto bg-white/80 dark:bg-black/60 border border-purple-300 dark:border-purple-500/30 rounded-xl p-2.5 font-mono text-xs text-center font-bold text-purple-600 dark:text-purple-300">
                {active.capText}
              </div>
            </div>
          </div>

          {/* Permutation Blender Layer */}
          <div className="mt-4 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-300 dark:border-zinc-700/60 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-7 h-7 rounded-full border-2 border-purple-500 border-t-transparent flex items-center justify-center text-[10px] font-bold text-purple-500"
              >
                p
              </motion.div>
              <div>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 block">
                  Permutation Engine ({active.permRounds})
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                  Constant Addition (p_C) → S-Box (p_S) → Linear Diffusion (p_L)
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
              Deterministic Diffusion
            </span>
          </div>
        </div>

        {/* Output Arrow / Squeeze indicator */}
        <motion.div
          key={`output-${currentStep}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mt-3"
        >
          <motion.div animate={{ y: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.2 }}>
            <ArrowDown className="w-5 h-5 text-blue-500" />
          </motion.div>
          <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-500/30 px-3 py-1 rounded-full shadow-sm mt-1">
            {currentStep === 0 && "Ready for Associated Data / Plaintext"}
            {currentStep === 1 && "AD Entangled into Internal State"}
            {currentStep === 2 && "Squeeze: Ciphertext Block Cᵢ (64 bits)"}
            {currentStep === 3 && "Squeeze: 128-bit Authentication Tag (x3 ⊕ K₁, x4 ⊕ K₂)"}
          </span>
        </motion.div>
      </div>

      {/* Plain-English Explanation Footer */}
      <div className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-900 dark:text-white font-semibold">How to think of this: </strong>
          {currentStep === 0 && "Think of initialization as preparing a secret blender with your unique password (Key) and timestamp (Nonce) so no two encryption sessions ever start identically."}
          {currentStep === 1 && "Think of Associated Data as writing the destination address on an envelope: it's not hidden, but ASCON guarantees nobody can secretly replace the address with their own."}
          {currentStep === 2 && "Rate is like a small kitchen window: plaintext comes in, gets scrambled with the current window contents to produce ciphertext, and the rest of the 256-bit safe (Capacity) remains hidden inside."}
          {currentStep === 3 && "Finalization is like stamping an indelible wax seal on the message. If anyone tampers with even 1 single bit during transmission, the wax seal will not match on the receiver's end."}
        </div>
      </div>
    </div>
  );
}
