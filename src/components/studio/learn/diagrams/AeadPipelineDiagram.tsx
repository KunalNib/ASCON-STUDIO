"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Layers, ArrowRight, ShieldCheck, Key, Hash, FileText, Lock } from "lucide-react";

export function AeadPipelineDiagram() {
  const [activeStage, setActiveStage] = useState<number>(0);

  const stages = [
    {
      index: 0,
      name: "Initialization",
      simpleTerm: "Mix Secret Setup",
      icon: Key,
      color: "blue",
      formula: "S₀ = p¹²(IV ∥ K ∥ N) ⊕ (0¹⁹² ∥ K)",
      inputs: ["IV (64b)", "Key (128b)", "Nonce (128b)"],
      output: "State initialized & key-hardened",
      desc: "Loads IV, Key, and Nonce into the 320-bit state, executes 12 rounds of permutation (p¹²), then XORs the Secret Key into the capacity to ensure domain separation.",
    },
    {
      index: 1,
      name: "Associated Data",
      simpleTerm: "Authenticate Headers",
      icon: FileText,
      color: "emerald",
      formula: "S = p⁶(S ⊕ (Aᵢ ∥ 0²⁵⁶)), S ⊕= 0³¹⁹ ∥ 1",
      inputs: ["Header / IP / Device ID"],
      output: "AD permanently bound to state",
      desc: "Each 64-bit block of Associated Data is XORed into Rate word x0, followed by a 6-round permutation (p⁶). A 1-bit domain separator is added at the end.",
    },
    {
      index: 2,
      name: "Plaintext Encryption",
      simpleTerm: "Encrypt Message Blocks",
      icon: Lock,
      color: "indigo",
      formula: "Cᵢ = x0 ⊕ Pᵢ, S = p⁶(S ⊕ (Pᵢ ∥ 0²⁵⁶))",
      inputs: ["Plaintext Message Blocks Pᵢ"],
      output: "Ciphertext Blocks Cᵢ",
      desc: "Duplex encryption: Plaintext is XORed with Rate x0 to produce Ciphertext. State is immediately updated with Plaintext and scrambled via p⁶ for the next block.",
    },
    {
      index: 3,
      name: "Finalization & Tag",
      simpleTerm: "Seal with 128-Bit MAC",
      icon: ShieldCheck,
      color: "purple",
      formula: "Tag = (x3 ∥ x4) ⊕ K after p¹²(S ⊕ (0⁶⁴ ∥ K ∥ 0¹²⁸))",
      inputs: ["State + Re-absorbed Key"],
      output: "128-bit Authentication Tag T",
      desc: "The Key is XORed into the capacity, a full 12-round permutation (p¹²) is applied, and the bottom two words (x3, x4) are XORed with the Key to generate the unforgeable Tag.",
    },
  ];

  const current = stages[activeStage];

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
            End-to-End Cryptographic Flow
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            The 4 Stages of ASCON-128 AEAD
          </h4>
        </div>

        <span className="text-xs text-zinc-500 bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-full font-mono">
          NIST SP 800-232 Standard
        </span>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-2">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isSelected = activeStage === idx;
          return (
            <button
              key={st.name}
              onClick={() => setActiveStage(idx)}
              className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? "bg-purple-100 dark:bg-purple-900/30 border-purple-500 shadow-md"
                  : "bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                  isSelected ? "bg-purple-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                }`}>
                  0{idx + 1}
                </span>
                <Icon className={`w-4 h-4 ${isSelected ? "text-purple-600 dark:text-purple-400" : "text-zinc-400"}`} />
              </div>
              <div className="font-bold text-xs text-zinc-900 dark:text-white">{st.name}</div>
              <div className="text-[10px] text-zinc-500 mt-0.5">{st.simpleTerm}</div>
            </button>
          );
        })}
      </div>

      {/* Detailed Stage Card */}
      <motion.div
        key={current.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-3xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4 shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div>
            <h5 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              Stage {activeStage + 1}: {current.name}
            </h5>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Simple Concept: {current.simpleTerm}
            </span>
          </div>

          <div className="font-mono text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 self-start sm:self-auto">
            {current.formula}
          </div>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          {current.desc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Inputs</span>
            <div className="flex flex-wrap gap-1.5">
              {current.inputs.map((inp, i) => (
                <span key={i} className="font-mono text-xs bg-white dark:bg-zinc-800 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300">
                  {inp}
                </span>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-zinc-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">Output Result</span>
            <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
              {current.output}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
