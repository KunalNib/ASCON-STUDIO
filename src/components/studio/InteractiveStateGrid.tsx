"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { Search } from "lucide-react";

export function InteractiveStateGrid() {
  const { currentStepIndex, steps } = useAsconStore();
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const [hoveredByte, setHoveredByte] = useState<string | null>(null);
  
  const words = [
    { label: "x0", role: "Rate / Capacity", desc: "64-bit (Holds Nonce/IV initially). Used for absorbing data." },
    { label: "x1", role: "Rate / Capacity", desc: "64-bit (Holds Nonce/IV initially). Absorbs associated data." },
    { label: "x2", role: "Capacity", desc: "64-bit (Entropy/Domain separation). Never directly outputs." },
    { label: "x3", role: "Capacity / Key", desc: "64-bit (Holds Key Material). Protects against extraction." },
    { label: "x4", role: "Capacity / Key", desc: "64-bit (Holds Key Material). Secret state." },
  ];

  // Helper to generate a random 8-bit hex chunk for mock visualization
  const getRandByte = () => Math.floor(Math.random()*256).toString(16).padStart(2, '0').toUpperCase();

  return (
    <div className="w-full bg-[#030303] border border-zinc-900 rounded-2xl p-6 relative overflow-hidden flex flex-col h-full">
      <div className="flex justify-between items-center mb-6 z-10">
        <div>
          <h3 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
            320-Bit Internal State Matrix 
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">Sponge Construction</span>
          </h3>
          <p className="text-zinc-500 text-xs max-w-lg">Hover over specific bytes (8-bits) across the 5 registers ($x_0 - x_4$) to inspect the mathematical breakdown of capacity vs rate boundaries.</p>
        </div>
        <div className="bg-zinc-900 p-2 rounded-lg flex items-center gap-2 border border-white/5">
           <Search className="w-4 h-4 text-zinc-500" />
           <span className="text-blue-400 text-xs font-mono uppercase tracking-widest">{steps[currentStepIndex] || "IDLE"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 z-10 flex-1 overflow-y-auto pr-2">
        {words.map((word, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col p-4 rounded-xl border transition-all duration-300 ${hoveredWord === idx ? "bg-blue-900/10 border-blue-500/30" : "bg-black/80 border-white/5"}`}
            onMouseEnter={() => setHoveredWord(idx)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            <div className="flex justify-between items-end mb-3 border-b border-white/5 pb-2">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-zinc-900 border border-white/10 flex items-center justify-center font-bold text-zinc-200 font-mono">
                    {word.label}
                  </div>
                  <div>
                    <div className="text-zinc-300 text-sm font-semibold">{word.role}</div>
                    <div className="text-zinc-500 text-[10px]">{word.desc}</div>
                  </div>
               </div>
               <div className="text-[10px] text-zinc-600 font-mono">
                  Bytes 0-7
               </div>
            </div>
            
            {/* 64-bit row represented as 8 distinct Byte blocks */}
            <div className="grid grid-cols-8 gap-1 w-full">
              {Array.from({ length: 8 }, (_, byteIdx) => {
                 const id = `${idx}-${byteIdx}`;
                 const isHovered = hoveredByte === id;
                 return (
                   <motion.div 
                     key={byteIdx}
                     onMouseEnter={() => setHoveredByte(id)}
                     onMouseLeave={() => setHoveredByte(null)}
                     className={`aspect-square flex items-center justify-center rounded border transition-colors cursor-crosshair font-mono text-xs
                       ${isHovered ? "bg-blue-600 text-white border-blue-400" : currentStepIndex > 3 && idx > 2 ? "bg-[#1a0f14] text-red-400/80 border-red-900/30" : currentStepIndex > 3 && idx < 2 ? "bg-[#0f172a] text-blue-400/80 border-blue-900/50" : "bg-zinc-900/50 text-zinc-600 border-zinc-800"}`}
                     animate={{
                        scale: isHovered ? 1.05 : 1,
                        rotateX: currentStepIndex > 4 && Math.random() > 0.8 ? 180 : 0
                     }}
                     transition={{ duration: 0.2 }}
                   >
                     {isHovered ? "1101" : getRandByte()}
                   </motion.div>
                 )
              })}
            </div>
            {/* Context Tooltip injected below the bytes if this specific word is hovered */}
            <AnimatePresence>
              {hoveredWord === idx && hoveredByte && (
                 <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 text-[10px] text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-500/20 text-center font-mono"
                 >
                    Inspecting Byte {hoveredByte.split('-')[1]} of word {word.label} // Base Addr: 0x{(idx * 8).toString(16).toUpperCase()}
                 </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
      
      <motion.div
         className="absolute w-[300px] h-[300px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"
         animate={{
            top: hoveredWord !== null ? hoveredWord * 80 : -100,
            left: '50%',
            opacity: hoveredWord !== null ? 1 : 0
         }}
         transition={{ type: "spring", stiffness: 40 }}
      />
    </div>
  );
}
