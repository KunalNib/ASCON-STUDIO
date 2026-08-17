"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Unlock, ShieldCheck, Key, Play } from "lucide-react";
import { useAsconStore } from "@/store/useAsconStore";

export default function DecryptionModule() {
  const { session, key, nonce, associatedData } = useAsconStore();
  const ciphertext = session?.ciphertext;
  const tag = session?.authenticationTag;
  const [decryptionStage, setDecryptionStage] = useState<string | null>(null);
  
  const stages = [
    { id: "init", label: "State Initialization" },
    { id: "ad", label: "Absorbing AD" },
    { id: "ct", label: "Ciphertext Processing" },
    { id: "verify", label: "Tag Verification" },
    { id: "output", label: "Plaintext Restored" }
  ];

  const triggerCinematicDecryption = () => {
    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage >= stages.length) {
        clearInterval(interval);
        setTimeout(() => setDecryptionStage(null), 3000); 
        return;
      }
      setDecryptionStage(stages[currentStage].id);
      currentStage++;
    }, 1500);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
          <Unlock className="w-8 h-8 text-green-600 dark:text-green-500" /> Authenticated Decryption
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">Verifying the authentication tag and decrypting the cipher.</p>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
        
        {/* Input Parameters (Left) */}
        <div className="w-full md:w-1/3 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-sm dark:shadow-xl">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-2 flex items-center gap-2"><Key className="w-5 h-5 text-zinc-600 dark:text-zinc-400"/> Expected Payloads</h2>
          
          <div className="space-y-4 font-mono text-sm opacity-80 pointer-events-none">
            {/* Decryption reads from the global store, assuming we just encrypted it */ }
            <div>
              <label className="text-zinc-500 text-xs mb-1 block uppercase">Ciphertext</label>
              <div className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-3 text-zinc-900 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
                {ciphertext || "0x..."}
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1 block uppercase">Authentication Tag</label>
              <div className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-3 text-green-600 dark:text-green-400">
                {tag || "0x..."}
              </div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1 block uppercase">Key</label>
              <div className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-3 text-zinc-600 dark:text-zinc-400">{key}</div>
            </div>
            <div>
              <label className="text-zinc-500 text-xs mb-1 block uppercase">Nonce</label>
              <div className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-lg p-3 text-zinc-600 dark:text-zinc-400">{nonce}</div>
            </div>
          </div>

          <div className="mt-auto pt-4 pointer-events-auto">
             <button 
               onClick={triggerCinematicDecryption}
               disabled={decryptionStage !== null}
               className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 dark:hover:bg-green-500 disabled:opacity-50 text-white p-3 rounded-xl font-bold transition-all shadow-sm"
             >
               <Play className="w-5 h-5" /> Verify & Decrypt
             </button>
          </div>
        </div>

        {/* Cinematic Output (Right) */}
        <div className="w-full md:w-2/3 bg-white dark:bg-black border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden shadow-sm dark:shadow-2xl">
           <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-100/50 dark:from-green-900/10 via-transparent dark:via-black to-transparent dark:to-black opacity-50 pointer-events-none" />
           
           {!decryptionStage && (
             <div className="z-10 text-center relative">
                <ShieldCheck className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                <h3 className="text-zinc-500 font-medium">Awaiting Tag Verification</h3>
             </div>
           )}

           <AnimatePresence mode="wait">
              {decryptionStage && (
                 <motion.div 
                    key={decryptionStage}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.2 }}
                    transition={{ type: "spring" }}
                    className="z-10 text-center flex flex-col items-center relative"
                 >
                    <div className="w-24 h-24 mb-6 rounded-xl border border-green-500 flex items-center justify-center relative overflow-hidden bg-white dark:bg-transparent">
                       <motion.div className="absolute inset-0 bg-green-500/10 dark:bg-green-500/20" animate={{ y: ['100%', '0%'] }} transition={{ duration: 1.5 }} />
                       <Unlock className="w-10 h-10 text-green-600 dark:text-green-400 relative z-10" />
                    </div>
                    {stages.map(s => (
                       s.id === decryptionStage && (
                         <div key={s.id}>
                           <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white mb-2">{s.label}</h2>
                         </div>
                       )
                    ))}
                 </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
