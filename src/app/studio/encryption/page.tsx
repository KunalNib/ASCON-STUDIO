"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { Lock, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveStateGrid } from "@/components/studio/InteractiveStateGrid";
import { MicroTimeline } from "@/components/studio/MicroTimeline";

export default function EncryptionModule() {
  const { 
    plaintext, key, nonce, associatedData, 
    ciphertext, tag, 
    setPlaintext, setKey, setNonce, setAssociatedData,
    steps, currentStepIndex
  } = useAsconStore();

  const activeStepLabel = steps[currentStepIndex];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <Lock className="w-8 h-8 text-blue-500" /> Cinematic Learning Laboratory
        </h1>
        <p className="text-zinc-400">Deep-dive into the 320-bit internal mechanisms of ASCON.</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
        
        {/* State Config (Left) */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          <div className="bg-[#09090b] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-xl">
             <h2 className="text-lg font-semibold text-white mb-2 flex flex-col">
               <span className="text-xs text-blue-500 uppercase tracking-widest font-bold">Input Vectors</span>
               Initialization Parameters
             </h2>
             
             <div className="space-y-4 font-mono text-xs flex-1">
               <div>
                 <label className="text-zinc-500 mb-1 block">Secret Key (128-bit)</label>
                 <input 
                    type="text" value={key} onChange={(e) => setKey(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="text-zinc-500 mb-1 block">Nonce (128-bit)</label>
                 <input 
                    type="text" value={nonce} onChange={(e) => setNonce(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="text-zinc-500 mb-1 block">Plaintext</label>
                 <input 
                    type="text" value={plaintext} onChange={(e) => setPlaintext(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
               <div>
                 <label className="text-zinc-500 mb-1 block">Associated Data</label>
                 <input 
                    type="text" value={associatedData} onChange={(e) => setAssociatedData(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-zinc-300 focus:outline-none focus:border-blue-500 transition-colors"
                 />
               </div>
             </div>
          </div>
          
          <MicroTimeline />
        </div>

        {/* Vis Engine (Right) */}
        <div className="w-full md:w-2/3 bg-black border border-white/10 rounded-3xl flex flex-col relative overflow-hidden shadow-2xl p-6">
            <InteractiveStateGrid />
            
            <div className="mt-8 flex-1 p-6 bg-blue-900/10 border border-blue-500/20 rounded-2xl">
              <h3 className="text-blue-400 font-bold mb-2 uppercase text-sm tracking-widest">{activeStepLabel.replace(/_/g, " ")}</h3>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {activeStepLabel === "INIT_IDLE" && "Waiting for execution to commence. In this state, the cipher is empty and allocating memory."}
                {activeStepLabel === "LOAD_KEY" && "Loading the 128-bit Secret Key into words X3 and X4 of the 320-bit internal state."}
                {activeStepLabel === "LOAD_NONCE" && "Injecting the unique 128-bit Nonce into words X1 and X2 to guarantee cryptographic uniqueness."}
                {activeStepLabel === "BUILD_STATE" && "Constructing the sponge state by combining the Initialization Vector (IV), Key, and Nonce."}
                {activeStepLabel === "INIT_PERMUTATION" && "Running the initialization permutation (p^12) - applying the S-Box and Linear Diffusion layers 12 times to rigorously mix the key and nonce!"}
                {activeStepLabel === "LOAD_AD" && "Pulling Associated Data chunks. This data is authenticated but NEVER encrypted."}
                {activeStepLabel === "AD_ABSORB" && "XORing the Associated Data directly into the state..."}
                {activeStepLabel === "AD_PERMUTATION" && "Running intermediate permutation (p^8) to absorb the AD securely."}
                {activeStepLabel === "LOAD_PT" && "Fetching the plaintext message payload."}
                {activeStepLabel === "PT_ENCRYPT" && "XORing the Plaintext against the chaotic internal state to generate the Ciphertext block by block, running p^8 permutations between each!"}
                {activeStepLabel === "FINAL_TAG" && "Squeezing out the final 128-bit MAC (Message Authentication Code) Tag. If a single bit changed in the inputs, this tag would completely avalanche!"}
              </p>
              
              <AnimatePresence>
                {activeStepLabel === "FINAL_TAG" && ciphertext && (
                  <motion.div initial={{opacity: 0, y: 10}} animate={{opacity:1, y:0}} className="mt-6 bg-black/60 p-4 rounded-xl border border-emerald-500/30">
                    <div className="text-emerald-400 text-xs font-bold mb-1">FINAL CIPHERTEXT</div>
                    <div className="font-mono text-zinc-300 text-sm break-all">{ciphertext}</div>
                    <div className="text-emerald-400 text-xs font-bold mb-1 mt-4">AUTHENTICATION TAG</div>
                    <div className="font-mono text-zinc-300 text-sm break-all">{tag || "Awaiting execution..."}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
        </div>
        
      </div>
    </div>
  );
}
