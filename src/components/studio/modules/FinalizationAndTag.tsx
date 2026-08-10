import { useState } from "react";
import { motion } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { Lock, Fingerprint, ShieldAlert, Key, CheckCircle, ShieldX } from "lucide-react";

export function FinalizationAndTag() {
  const { key, tag } = useAsconStore();
  const [tampered, setTampered] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<"match" | "mismatch" | null>(null);

  const handleVerify = () => {
    setVerifying(true);
    setResult(null);
    setTimeout(() => {
      setVerifying(false);
      setResult(tampered ? "mismatch" : "match");
    }, 1500);
  };

  return (
    <div className="w-full h-full flex flex-col pt-8 p-4 max-w-5xl mx-auto items-center">
       
       <div className="text-center mb-8">
         <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-white mb-2">
           <Code2 className="w-8 h-8 text-emerald-500" />
           Finalization & 128-bit Tag
         </h2>
         <p className="text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed">
           ASCON squeezes the final authentication tag out of the capacity bounds ($x_3, x_4$) after re-absorbing the key. A single altered bit in the ciphertext or AD completely avalanches this tag!
         </p>
       </div>

       <div className="flex gap-8 w-full max-w-4xl">
         
         {/* Generation Side */}
         <div className="flex-1 bg-black rounded-3xl border border-white/5 p-6 flex flex-col items-center shadow-xl relative overflow-hidden">
            <h3 className="text-blue-400 uppercase tracking-widest text-xs font-bold mb-6">Extraction Phase</h3>
            
            <div className="flex flex-col items-center gap-2 mb-6 w-full">
               <div className="w-full flex justify-between bg-zinc-900 border border-white/10 rounded overflow-hidden">
                  <div className="bg-zinc-800 text-zinc-400 px-3 py-2 text-xs font-bold border-r border-white/5 w-24">State x3</div>
                  <div className="font-mono text-zinc-300 p-2 text-sm tracking-wider flex-1 text-center bg-blue-900/10">0xE8... (64-bit)</div>
               </div>
               <div className="text-blue-500 text-xs">⊕ XOR KEY (Half 1)</div>
               <div className="w-full flex justify-between bg-zinc-900 border border-white/10 rounded overflow-hidden">
                  <div className="bg-zinc-800 text-zinc-400 px-3 py-2 text-xs font-bold border-r border-white/5 w-24">State x4</div>
                  <div className="font-mono text-zinc-300 p-2 text-sm tracking-wider flex-1 text-center bg-blue-900/10">0x3B... (64-bit)</div>
               </div>
               <div className="text-blue-500 text-xs">⊕ XOR KEY (Half 2)</div>
            </div>

            <motion.div 
               animate={{ scale: [1, 1.05, 1], rotate: [0, 180, 360] }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-16 h-16 rounded-full bg-[conic-gradient(var(--tw-gradient-stops))] from-blue-500/20 via-purple-500/50 to-blue-500/20 border-4 border-black/50 mb-6 flex items-center justify-center font-bold text-xs"
            >
               p^12
            </motion.div>

            <div className="bg-emerald-900/20 border-2 border-emerald-500/50 p-4 rounded-xl text-center shadow-[0_0_20px_rgba(16,185,129,0.2)] w-full">
               <div className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Generated MAC Tag (128-bit)</div>
               <div className="font-mono text-xl text-white tracking-widest">{tag || "B8 D4 9F ..."}</div>
            </div>
         </div>

         {/* Verification Side */}
         <div className="flex-1 bg-[#09090b] rounded-3xl border border-white/5 p-6 flex flex-col items-center shadow-xl">
            <h3 className="text-purple-400 uppercase tracking-widest text-xs font-bold mb-6 flex items-center gap-2">
               <ShieldAlert className="w-4 h-4" /> Tag Verification
            </h3>

            <div className="w-full space-y-4 mb-8">
               <div className="bg-black/50 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                 <span className="text-zinc-500 text-xs">Received Ciphertext</span>
                 <button 
                   onClick={() => setTampered(!tampered)}
                   className={`px-3 py-1 text-xs rounded-full font-bold transition-colors ${!tampered ? 'bg-zinc-800 text-zinc-400' : 'bg-rose-500 text-white shadow-[0_0_10px_rgba(225,29,72,0.5)]'}`}
                 >
                   {tampered ? "Tampered Bit Flipped!" : "Original (Toggle Tamper)"}
                 </button>
               </div>
               <div className="bg-black/50 border border-white/5 p-3 rounded-xl flex items-center justify-between">
                 <span className="text-zinc-500 text-xs">Received Tag</span>
                 <span className="font-mono text-sm text-zinc-300">{tag || "B8 D4 9F ..."}</span>
               </div>
            </div>

            <button 
              onClick={handleVerify}
              disabled={verifying}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {verifying ? (
                 <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Key className="w-5 h-5" /></motion.div>
              ) : "Authenticate Payload"}
            </button>

            {/* Results */}
            <div className="mt-8 h-24 flex items-center justify-center w-full">
               {result === "match" && (
                 <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-emerald-500">
                    <CheckCircle className="w-12 h-12 mb-2 shadow-[0_0_30px_rgba(16,185,129,0.3)] rounded-full" />
                    <span className="font-bold tracking-widest uppercase">Tag Match - Verified!</span>
                 </motion.div>
               )}
               {result === "mismatch" && (
                 <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center text-rose-500">
                    <ShieldX className="w-12 h-12 mb-2 shadow-[0_0_30px_rgba(225,29,72,0.3)] rounded-full" />
                    <span className="font-bold tracking-widest uppercase">Avalanche! Mismatch!</span>
                 </motion.div>
               )}
            </div>
         </div>

       </div>
    </div>
  );
}

import { Code2 } from "lucide-react";
