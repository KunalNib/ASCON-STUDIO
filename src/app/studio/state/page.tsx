"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Database, Binary, Calculator, Activity } from "lucide-react";

export default function StateMatrix() {
  // ASCON 320-bit state is five 64-bit words (x0, x1, x2, x3, x4)
  // We represent them as 5 arrays of 64 booleans for interactive bit-flipping
  const [state, setState] = useState<boolean[][]>(
    Array(5).fill(Array(64).fill(false))
  );

  const flipBit = (row: number, col: number) => {
    setState(prev => {
      const newState = prev.map((r, i) => 
        i === row ? [...r] : r
      );
      newState[row][col] = !newState[row][col];
      return newState;
    });
  };

  const getHexFromBinary = (boolArray: boolean[]) => {
    let hex = "";
    // Process every 4 bits into a hex character
    for(let i=0; i<64; i+=4) {
      const chunk = boolArray.slice(i, i+4);
      const val = (chunk[0]?8:0) + (chunk[1]?4:0) + (chunk[2]?2:0) + (chunk[3]?1:0);
      hex += val.toString(16).toUpperCase();
    }
    return `0x${hex}`;
  };

  const wordLabels = [
    { label: "x0", desc: "Capacity / Nonce" },
    { label: "x1", desc: "Capacity / Nonce" },
    { label: "x2", desc: "Capacity / Nonce" },
    { label: "x3", desc: "Key / Nonce" },
    { label: "x4", desc: "Key / Nonce" }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col min-h-[calc(100vh-4rem)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" /> 320-Bit Internal State
        </h1>
        <p className="text-zinc-400">Interact with the core memory architecture of ASCON across 5x 64-bit bounds.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Mathematical Explainer */}
        <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
           <div>
             <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2"><Calculator className="w-5 h-5 text-blue-400"/> Mathematical Paradigm</h2>
             <p className="text-sm text-zinc-400 leading-relaxed mb-4">
               ASCON operates entirely on a 320-bit internal state `S`, formulated as five 64-bit words: <code className="bg-white/10 px-1 rounded text-blue-300">S = x0 || x1 || x2 || x3 || x4</code>. 
             </p>
             <p className="text-sm text-zinc-400 leading-relaxed">
               Because most IoT devices use 32-bit or 64-bit registers (like the ESP32), memory boundaries mapping precisely to 64-bit chunks allows the Sponge Construction to perform ultra-fast Bitsliced S-Box operations without complex padding constraints.
             </p>
           </div>
           
           <div className="mt-8 p-4 bg-blue-900/10 border border-blue-500/20 rounded-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><Binary className="w-16 h-16"/></div>
              <h4 className="text-blue-400 font-bold mb-1 text-sm">Bit-Slicing Efficiency</h4>
              <p className="text-zinc-400 text-xs text-balance">
                The highly efficient Substitution layer computes 64 5-bit S-boxes completely in parallel by mixing the columns vertically across these 5 rows utilizing simple XOR, AND, and NOT bitwise operators.
              </p>
           </div>
        </div>

        {/* Interactive Matrix Array */}
        <div className="md:col-span-2 bg-[#0d0d0d] border border-white/10 rounded-2xl p-6 shadow-2xl relative flex flex-col">
          <div className="flex justify-between items-end mb-6">
             <h2 className="text-xl font-bold text-white flex items-center gap-2"><Activity className="w-5 h-5 text-green-400"/> Active Register Map</h2>
             <span className="text-xs font-mono text-zinc-500 px-3 py-1 bg-black rounded-full border border-white/10">Interactive Mode</span>
          </div>

          <div className="flex-1 space-y-4">
            {state.map((row, rIdx) => (
              <div key={rIdx} className="flex gap-4 items-center">
                 {/* Row Header (x0, x1..) */}
                 <div className="w-12 shrink-0">
                   <div className="font-bold text-white font-mono">{wordLabels[rIdx].label}</div>
                   <div className="text-[9px] text-zinc-600 uppercase tracking-tighter hidden md:block">{wordLabels[rIdx].desc}</div>
                 </div>
                 
                 {/* 64-bit Binary Blocks */}
                 <div className="flex-1 flex flex-wrap gap-1 bg-black p-2 rounded-xl border border-white/5">
                   {row.map((bit, cIdx) => (
                     <div 
                       key={cIdx} 
                       onClick={() => flipBit(rIdx, cIdx)}
                       className={`w-3 h-4 sm:w-2.5 sm:h-3 rounded-[1px] cursor-pointer transition-all ${bit ? 'bg-blue-500 shadow-[0_0_5px_rgba(59,130,246,0.8)]' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                       title={`Bit ${cIdx}`}
                     />
                   ))}
                 </div>
                 
                 {/* Hexadecimal Translation */}
                 <div className="w-32 shrink-0 bg-black/50 border border-white/5 rounded-lg px-2 py-1.5 flex justify-end">
                    <span className={`font-mono text-xs ${row.some(b => b) ? 'text-green-400 font-bold' : 'text-zinc-600'}`}>
                      {getHexFromBinary(row)}
                    </span>
                 </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-zinc-500 font-mono">
            <span>Flip bits on the grid to observe real-time BigInt translation.</span>
            <span>Total State: 320 Bits</span>
          </div>
        </div>
      </div>
    </div>
  );
}
