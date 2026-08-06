"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, Code2, Database } from "lucide-react";

export default function PermutationExplorer() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      name: "Addition of Constants (p_C)",
      code: `// C Implementation (ASCON Round Constant)\nx2 ^= constants[round];`,
      explanation: "A round-specific asymmetric constant is XORed entirely into the x2 word. Without this step, ASCON would be vulnerable to slide attacks and rotational cryptanalysis because every round would be mathematically identical.",
      memory: "Target: Word x2 (64 Bits)"
    },
    {
      name: "Bitsliced S-Box (p_S)",
      code: `// C Implementation (Bitsliced)\nx0 ^= x4;    x4 ^= x3;    x2 ^= x1;
T0 = ~x0;    T1 = ~x1;    T2 = ~x2;
T3 = ~x3;    T4 = ~x4;
T0 &= x1;    T1 &= x2;    T2 &= x3;...`,
      explanation: "The Substitution Layer provides confusion. Instead of slow memory lookups, ASCON uses Algebraic degree 2 Bitslicing. It vertically computes 64 distinct 5-bit S-Boxes in parallel using core bitwise gates (XOR, AND, NOT).",
      memory: "Target: x0, x1, x2, x3, x4"
    },
    {
      name: "Linear Diffusion (p_L)",
      code: `// C Implementation (ROTR Diffuser)\nx0 ^= ROTR(x0, 19) ^ ROTR(x0, 28);
x1 ^= ROTR(x1, 61) ^ ROTR(x1, 39);
x2 ^= ROTR(x2, 1)  ^ ROTR(x2, 6);
x3 ^= ROTR(x3, 10) ^ ROTR(x3, 17);
x4 ^= ROTR(x4, 7)  ^ ROTR(x4, 41);`,
      explanation: "The Diffusion layer forces a single flipped bit to rapidly spread across the 320-bit state (The Avalanche Effect). By rotating each 64-bit word by two distinct asymmetrical prime integer limits and XORing them back upon themselves, bits completely bleed into adjacent columns.",
      memory: "Target: All Words Independently"
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-[calc(100vh-4rem)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <RefreshCcw className="w-8 h-8 text-orange-500" /> Permutation Explorer
        </h1>
        <p className="text-zinc-400">Deep structural breakdown behind `p_C`, `p_S`, and `p_L` layers.</p>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        
        {/* Visualized Explanation Panel */}
        <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 flex flex-col relative shadow-xl overflow-y-auto">
          <div className="flex items-center gap-2 text-sm font-semibold text-orange-500 uppercase tracking-widest mb-6">
            <Database className="w-4 h-4" /> Architectural Theory
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{steps[activeStep].name}</h2>
          <span className="inline-block bg-white/10 text-zinc-300 font-mono text-xs px-2 py-1 rounded w-max mb-6">
            {steps[activeStep].memory}
          </span>
          <p className="text-zinc-400 leading-loose flex-1 mb-8">
            {steps[activeStep].explanation}
          </p>

          <div className="relative mt-auto">
             <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent z-10" />
             <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div className="flex gap-2">
                  {steps.map((_, i) => (
                    <div key={i} className={`h-2 rounded-full transition-all ${i === activeStep ? 'w-8 bg-orange-500' : 'w-2 bg-white/20'}`} />
                  ))}
                </div>
                <div className="text-xs font-mono text-zinc-500">Mathematical Layer {activeStep + 1}/3</div>
             </div>
          </div>
        </div>

        {/* Code Interaction Panel */}
        <div className="bg-[#000] border border-white/10 rounded-2xl flex flex-col relative overflow-hidden">
          <div className="h-12 border-b border-white/10 flex items-center px-4 bg-zinc-900/50">
             <Code2 className="w-4 h-4 text-zinc-400 mr-2" />
             <span className="text-xs font-mono text-zinc-300">ascon_core_permutation.c</span>
          </div>
          
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: activeStep === idx ? 1 : 0.4 }}
                className={`p-4 rounded-xl cursor-pointer transition-all border ${activeStep === idx ? 'bg-orange-900/20 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                onClick={() => setActiveStep(idx)}
              >
                <div className="flex items-center justify-between mb-2">
                   <h3 className={`font-bold text-sm ${activeStep === idx ? 'text-orange-400' : 'text-zinc-500'}`}>{idx+1}. {step.name}</h3>
                   {activeStep === idx && <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                </div>
                <pre className={`text-xs font-mono whitespace-pre-wrap ${activeStep === idx ? 'text-white' : 'text-zinc-600'}`}>
                  {step.code}
                </pre>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
