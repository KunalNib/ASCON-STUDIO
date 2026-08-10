import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { FileText, ArrowRight, ArrowDown, Layers, Box, Cpu } from "lucide-react";

export function PlaintextProcessingFlow() {
  const { plaintext, ciphertext } = useAsconStore();
  const [activeBlock, setActiveBlock] = useState(0);

  // Quick mock parsing - chunk plaintext into blocks of 8 bytes (64-bits)
  const blocks = plaintext ? plaintext.match(/.{1,8}/g) || [] : ["EMPTY"];
  const cipherblocks = ciphertext ? ciphertext.split(' ') : ["WAITING"];

  return (
    <div className="w-full h-full flex flex-col pt-8 p-4 max-w-6xl mx-auto items-center overflow-y-auto custom-scrollbar">
      <div className="text-center mb-8">
         <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-white mb-2">
           <FileText className="w-8 h-8 text-blue-500" />
           Plaintext Absorption & Encryption
         </h2>
         <p className="text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed">
           ASCON operates in duplex mode. Data is absorbed into the 'rate' portion of the state ($x_0$), XORed with the internal chaotic state, and then immediately squeezed out as Ciphertext block-by-block.
         </p>
      </div>

      {/* Block Selector */}
      {blocks.length > 1 && (
        <div className="flex gap-2 mb-8 bg-black p-2 rounded-xl border border-white/5">
          {blocks.map((_, i) => (
             <button 
               key={i}
               onClick={() => setActiveBlock(i)}
               className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${activeBlock === i ? 'bg-blue-600 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
             >
               Block {i + 1}
             </button>
          ))}
        </div>
      )}

      {/* Detailed View */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeBlock}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="w-full max-w-4xl"
        >
           <div className="grid grid-cols-3 gap-6 items-center">
             
             {/* Plaintext Block */}
             <div className="flex flex-col items-center p-6 bg-black rounded-2xl border border-white/5 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 w-full h-1 bg-blue-500" />
               <FileText className="w-8 h-8 text-blue-500 mb-4" />
               <div className="text-xs text-zinc-500 font-bold tracking-widest uppercase mb-1">Plaintext Block</div>
               <div className="font-mono text-xl text-white break-all text-center">{blocks[activeBlock]}</div>
             </div>

             <div className="flex flex-col items-center justify-center text-zinc-600 gap-2 font-bold uppercase text-xs">
               <span>XOR Absorb</span>
               <ArrowRight className="w-8 h-8 text-blue-500" />
             </div>

             {/* Internal State */}
             <div className="flex flex-col items-center p-6 bg-[#09090b] rounded-2xl border-2 border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)] relative">
               <Cpu className="w-8 h-8 text-purple-400 mb-4" />
               <div className="text-xs text-purple-500 font-bold tracking-widest uppercase mb-1">Sponge State</div>
               <div className="w-full flex flex-col gap-1">
                 <div className="bg-purple-900/20 py-2 border border-purple-500/30 rounded text-center font-mono text-purple-200 text-sm">
                   x0 (Rate)
                 </div>
                 <div className="bg-black py-1 border border-white/5 rounded text-center font-mono text-zinc-600 text-xs line-through">
                   x1 .. x4 (Capacity)
                 </div>
               </div>
             </div>

           </div>

           <div className="flex mt-6 w-[80%] mx-auto relative justify-end">
             <div className="flex flex-col justify-center items-center text-zinc-600 font-bold gap-2 text-xs absolute right-[10%] top-[-20px]">
               <span>Squeeze</span>
               <ArrowDown className="w-8 h-8 text-emerald-500" />
             </div>
           </div>

           {/* Ciphertext Gen */}
           <div className="flex justify-end mt-12 mb-8">
             <div className="w-1/3 flex flex-col items-center p-6 bg-emerald-900/10 rounded-2xl border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative">
               <Box className="w-8 h-8 text-emerald-500 mb-4" />
               <div className="text-[10px] text-emerald-500 font-bold tracking-widest uppercase mb-1">Generated Ciphertext</div>
               <div className="font-mono text-lg text-emerald-100 break-all text-center">
                 {cipherblocks[activeBlock] || "0x..."}
               </div>
             </div>
           </div>

           {/* Trigger Round */}
           {(activeBlock < blocks.length - 1 || true) && (
             <div className="bg-gradient-to-r from-transparent via-purple-900/40 to-transparent p-[1px] w-full mt-4">
                <div className="bg-black py-4 flex flex-col items-center border-t border-b border-purple-500/20">
                  <span className="text-xs text-purple-400 uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" /> Intermediate Transformation
                  </span>
                  <div className="text-zinc-300 font-bold">p^8 Permutation executed to mix state for next block!</div>
                </div>
             </div>
           )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
