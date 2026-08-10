import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Plus, ArrowRight, Dna, Box } from "lucide-react";

export function PermutationExplorer() {
  const [activeRound, setActiveRound] = useState(0);
  const [activeLayer, setActiveLayer] = useState<"constant" | "sbox" | "diffusion">("constant");

  const rounds = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="w-full h-full flex flex-col pt-4">
      {/* Round Scrubber */}
      <div className="flex border-b border-white/5 pb-6 px-6 gap-2 overflow-x-auto custom-scrollbar items-center mask-gradient-right">
         <div className="text-xs text-zinc-500 font-bold uppercase mr-4 whitespace-nowrap"><Activity className="w-4 h-4 inline mr-1" /> Permutation Rounds</div>
         {rounds.map(r => (
            <button 
              key={r}
              onClick={() => setActiveRound(r)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${activeRound === r ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'bg-[#09090b] border-white/10 text-zinc-500 hover:text-zinc-300'}`}
            >
              R{r + 1}
            </button>
         ))}
      </div>

      <div className="flex flex-1 min-h-0">
        
        {/* Layer Selector Pipeline */}
        <div className="w-1/4 border-r border-white/5 p-6 flex flex-col gap-4">
           <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-2">Round Sub-Operations</h3>
           
           <button 
             onClick={() => setActiveLayer("constant")}
             className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${activeLayer === 'constant' ? 'bg-blue-900/20 border-blue-500 text-blue-100 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}
           >
             <Plus className={`w-5 h-5 mb-2 ${activeLayer === 'constant' ? 'text-blue-400' : 'text-zinc-600'}`} />
             <span className="font-bold">Add Round Constant</span>
             <span className="text-xs opacity-70 mt-1">XOR $C_r$ into state word $x_2$ to destroy symmetry.</span>
           </button>

           <div className="flex justify-center -my-2 z-10"><ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" /></div>

           <button 
             onClick={() => setActiveLayer("sbox")}
             className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${activeLayer === 'sbox' ? 'bg-rose-900/20 border-rose-500 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}
           >
             <Box className={`w-5 h-5 mb-2 ${activeLayer === 'sbox' ? 'text-rose-400' : 'text-zinc-600'}`} />
             <span className="font-bold">Substitution (S-Box)</span>
             <span className="text-xs opacity-70 mt-1">5-bit non-linear mapping providing confusion.</span>
           </button>

           <div className="flex justify-center -my-2 z-10"><ArrowRight className="w-4 h-4 text-zinc-700 rotate-90" /></div>

           <button 
             onClick={() => setActiveLayer("diffusion")}
             className={`flex flex-col items-start p-4 rounded-xl border text-left transition-all ${activeLayer === 'diffusion' ? 'bg-emerald-900/20 border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}
           >
             <Dna className={`w-5 h-5 mb-2 ${activeLayer === 'diffusion' ? 'text-emerald-400' : 'text-zinc-600'}`} />
             <span className="font-bold">Linear Diffusion</span>
             <span className="text-xs opacity-70 mt-1">Bitwise rotations mixing bits across columns.</span>
           </button>
        </div>

        {/* Detailed Visualization Area */}
        <div className="flex-1 p-8 relative flex items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/20 via-black to-black">
          <AnimatePresence mode="wait">
            
            {activeLayer === "constant" && (
              <motion.div key="const" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} className="flex flex-col items-center">
                 <div className="text-4xl font-mono text-blue-400 mb-8 font-bold text-center">
                   <div className="text-xs text-zinc-500 mb-2 uppercase tracking-widest">Constant $c_{activeRound}$</div>
                   {/* Mock constant display */}
                   0x{((0xf0 - activeRound * 0x10) | activeRound).toString(16).padStart(2,'0').toUpperCase()}
                 </div>
                 <div className="flex items-center gap-4 text-zinc-400 font-mono bg-black p-4 rounded-xl border border-white/10">
                   <div className="text-right">
                     <div className="text-[10px] text-zinc-600 uppercase">State $x_2$ (Before)</div>
                     <div>0xE453F0...</div>
                   </div>
                   <div className="text-blue-500 text-2xl font-bold flex flex-col items-center justify-center">
                     <span className="text-[10px] uppercase">XOR</span>
                     ⊕
                   </div>
                   <div className="text-center bg-blue-900/30 px-3 py-1 rounded text-blue-300">
                     <div className="text-[10px] text-blue-500/50 uppercase">Constant</div>
                     0x{((0xf0 - activeRound * 0x10) | activeRound).toString(16).padStart(2,'0').toUpperCase()}
                   </div>
                   <div className="text-zinc-600"><ArrowRight className="w-5 h-5" /></div>
                   <div className="text-left text-blue-300 font-bold border-b border-blue-500/50">
                     <div className="text-[10px] text-blue-400/50 uppercase">State $x_2$ (After)</div>
                     <div>0xE4532B...</div>
                   </div>
                 </div>
              </motion.div>
            )}

            {activeLayer === "sbox" && (
              <motion.div key="sbox" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} className="w-full flex-col flex items-center justify-center gap-12">
                 <div className="grid grid-cols-5 gap-4">
                   {['x0', 'x1', 'x2', 'x3', 'x4'].map((x, i) => (
                      <div key={x} className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded flex items-center justify-center font-mono text-zinc-500 font-bold">{x} bits</div>
                        <ArrowRight className="w-4 h-4 text-rose-500 rotate-90" />
                      </div>
                   ))}
                 </div>
                 
                 <div className="bg-rose-900/20 border border-rose-500/50 text-rose-400 font-bold py-6 px-24 rounded-2xl flex items-center gap-4 text-xl shadow-[0_0_30px_rgba(244,63,94,0.15)] relative overflow-hidden">
                   <Box className="w-8 h-8 opacity-50" />
                   5-bit S-Box Mapping
                   <motion.div 
                     className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" 
                     animate={{ x: ['-100%', '100%'] }} 
                     transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
                   />
                 </div>

                 <div className="grid grid-cols-5 gap-4">
                   {['x0', 'x1', 'x2', 'x3', 'x4'].map((x, i) => (
                      <div key={x} className="flex flex-col items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-rose-500 rotate-90" />
                        <div className="w-12 h-12 bg-black border border-rose-500/30 rounded flex items-center justify-center font-mono text-rose-300 font-bold shadow-[0_0_10px_rgba(244,63,94,0.2)] blur-[0.5px]">y{i}</div>
                      </div>
                   ))}
                 </div>
              </motion.div>
            )}

            {activeLayer === "diffusion" && (
              <motion.div key="diff" initial={{opacity:0, scale:0.9}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:1.1}} className="flex flex-col gap-8 w-full max-w-xl">
                 {[
                   { label: "x0", rot1: 19, rot2: 28 },
                   { label: "x1", rot1: 61, rot2: 39 },
                   { label: "x2", rot1: 1, rot2: 6 },
                 ].map((r, i) => (
                   <div key={r.label} className="bg-[#09090b] p-4 rounded-xl border border-white/5 flex items-center justify-between font-mono text-sm">
                      <div className="text-zinc-400 font-bold">{r.label}</div>
                      <ArrowRight className="w-4 h-4 text-emerald-500/50" />
                      <div className="flex items-center gap-3 text-emerald-400">
                        <div className="bg-emerald-950 px-3 py-1 rounded border border-emerald-900">{r.label}</div>
                        <span className="text-xs">⊕</span>
                        <div className="bg-emerald-950 px-3 py-1 rounded border border-emerald-900">({r.label} ≫ {r.rot1})</div>
                        <span className="text-xs">⊕</span>
                        <div className="bg-emerald-950 px-3 py-1 rounded border border-emerald-900">({r.label} ≫ {r.rot2})</div>
                      </div>
                   </div>
                 ))}
                 <div className="text-center text-xs text-zinc-500 italic mt-4">Rows 3 and 4 follow similar rotational diffusion mappings.</div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
