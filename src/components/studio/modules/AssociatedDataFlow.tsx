import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { Fingerprint, ArrowRight, ShieldCheck, Database, Layers } from "lucide-react";

export function AssociatedDataFlow() {
  const { associatedData } = useAsconStore();
  const [showDifference, setShowDifference] = useState(false);

  // Group AD into 64-bit blocks
  const mockBlocks = associatedData.length > 0 
      ? [associatedData, "PADDING"] 
      : ["EMTPY_AD", "PADDING"];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8 max-w-5xl mx-auto p-4">
      
      <div className="text-center space-y-2 mb-4">
         <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-white">
           <Fingerprint className="w-8 h-8 text-emerald-500" />
           Associated Data (AD) Absorption
         </h2>
         <p className="text-zinc-400 max-w-2xl mx-auto">
           AD is information that must be authenticated but travels in plaintext (like packet headers or IP addresses). It modifies the internal state to change the final MAC tag, guaranteeing it cannot be tampered with.
         </p>
      </div>

      <div className="flex gap-4 mb-4">
         <button 
           onClick={() => setShowDifference(false)}
           className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!showDifference ? 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-white/5 text-zinc-500'}`}
         >
           With Associated Data
         </button>
         <button 
           onClick={() => setShowDifference(true)}
           className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${showDifference ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'bg-white/5 text-zinc-500'}`}
         >
           Without AD
         </button>
      </div>

      <div className="flex-1 w-full bg-black border border-white/5 rounded-2xl flex relative overflow-hidden items-center justify-center p-8">
        
        <AnimatePresence mode="wait">
          {!showDifference ? (
            <motion.div key="with-ad" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex w-full items-start justify-center gap-12">
               
               {/* AD Pipeline */}
               <div className="flex flex-col items-center gap-4">
                  <div className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-2">Input Blocks (Rate / 8 bytes)</div>
                  
                  {mockBlocks.map((block, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.2 }}
                      className="bg-emerald-900/20 border border-emerald-500/30 text-emerald-100 p-4 rounded-xl flex flex-col items-center min-w-[150px]"
                    >
                       <Fingerprint className="w-5 h-5 mb-2 text-emerald-400" />
                       <span className="font-mono text-sm">{block}</span>
                    </motion.div>
                  ))}
               </div>

               <div className="flex flex-col items-center justify-center pt-16 text-zinc-600 font-bold gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-xs mb-1">XOR</span>
                    <ArrowRight className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs mb-1">XOR</span>
                    <ArrowRight className="w-6 h-6 text-blue-500" />
                  </div>
               </div>

               {/* State Pipeline */}
               <div className="flex flex-col items-center gap-6">
                 <div className="text-blue-500 font-bold uppercase tracking-widest text-xs mb-2">320-bit internal state</div>
                 
                 <div className="bg-blue-900/10 border border-blue-500/30 p-4 rounded-xl w-64">
                    <div className="flex justify-between items-center bg-blue-950/50 p-2 rounded mb-2 border border-blue-900">
                      <span className="font-mono text-xs text-blue-400">x0: 0xE8F1...</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                 </div>

                 {/* Permutation block */}
                 <div className="flex flex-col items-center gap-1">
                   <ArrowRight className="w-4 h-4 text-zinc-500 rotate-90" />
                   <div className="bg-purple-900/20 border border-purple-500/30 text-purple-300 py-3 px-8 rounded-xl font-bold flex items-center gap-2">
                     <Layers className="w-4 h-4" /> p^8 Permutation
                   </div>
                   <ArrowRight className="w-4 h-4 text-zinc-500 rotate-90" />
                 </div>

                 <div className="bg-blue-900/10 border border-blue-500/30 p-4 rounded-xl w-64">
                    <div className="flex justify-between items-center bg-blue-950/50 p-2 rounded mb-2 border border-blue-900">
                      <span className="font-mono text-xs text-blue-400">x0: 0x3B2C...</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                 </div>

               </div>
               
            </motion.div>
          ) : (
            <motion.div key="no-ad" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex flex-col items-center text-center">
               <Database className="w-16 h-16 text-rose-500 mb-6 opacity-50" />
               <h3 className="text-2xl font-bold text-white mb-4">Domain Separation</h3>
               <p className="text-zinc-400 max-w-lg mb-8 leading-relaxed">
                 If there is no Associated Data, ASCON simply appends a single <span className="font-mono bg-white/10 px-2 py-0.5 rounded text-rose-300">1</span> bit 
                 (padding) to the state to domain-separate it from the upcoming plaintext phase, and completely skips the p^8 intermediate permutation layer to save CPU cycles!
               </p>
               <div className="bg-rose-900/20 border border-rose-500/30 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
                 <div className="font-mono text-zinc-400">STATE END OF INIT</div>
                 <ArrowRight className="w-5 h-5 text-zinc-500" />
                 <div className="bg-rose-950 font-mono text-rose-400 p-3 rounded">XOR 0x01 (Domain Separation)</div>
                 <ArrowRight className="w-5 h-5 text-zinc-500" />
                 <div className="font-mono text-emerald-400">READY FOR PLAINTEXT</div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
