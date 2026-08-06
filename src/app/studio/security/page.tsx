"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Play, Target, Shuffle } from "lucide-react";

export default function SecurityPlayground() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [round, setRound] = useState(0);

  // Mocking the avalanche effect. Real logic would invoke the Ascon128 engine with a 1-bit flip
  const triggerAvalanche = () => {
    setIsPlaying(true);
    let r = 0;
    const interval = setInterval(() => {
      r++;
      setRound(r);
      if (r >= 12) {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 600);
  };

  const getDivergencePercentage = (rt: number) => {
    if (rt === 0) return 0;
    if (rt === 1) return 2.8;
    if (rt === 2) return 14.5;
    if (rt === 3) return 31.2;
    if (rt >= 4) return Math.min(50 + (rt - 4) * 2, 50); // Approximates 50% strict avalanche criterion
    return 50;
  };

  const currentDivergence = getDivergencePercentage(round);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col gap-6">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-500" /> Security Playground
          </h1>
          <p className="text-zinc-400">Visualizing structural resilience via the Strict Avalanche Criterion.</p>
        </div>
        <button 
          onClick={triggerAvalanche}
          disabled={isPlaying}
          className="flex items-center gap-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95"
        >
          {isPlaying ? <Shuffle className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          Trigger Bit Flip Attack
        </button>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        {/* Original State View */}
        <div className="bg-[#09090b] border border-white/10 rounded-2xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-blue-400">Original State</h2>
            <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full">Round {round} / 12</span>
          </div>
          <p className="font-mono text-sm text-zinc-500 mb-4">Plaintext: "ASCON_SECRET_MSG"</p>
          
          <div className="flex-1 grid grid-rows-5 gap-1">
             {[...Array(5)].map((_, wordIdx) => (
                <div key={`orig-w-${wordIdx}`} className="grid grid-cols-[repeat(64,minmax(0,1fr))] gap-px">
                  {[...Array(64)].map((_, bitIdx) => {
                     // Generate a deterministic but seemingly random bit structure
                     const isActive = ((wordIdx * 64 + bitIdx) * 11) % 7 > 3;
                     return (
                        <div key={`o-${wordIdx}-${bitIdx}`} className={`h-full ${isActive ? 'bg-blue-600' : 'bg-zinc-900'} rounded-sm`} />
                     );
                  })}
                </div>
             ))}
          </div>
        </div>

        {/* Modified State View / Avalanche effect */}
        <div className="bg-[#09090b] border border-red-500/30 rounded-2xl p-6 flex flex-col shadow-[0_0_50px_rgba(239,68,68,0.1)] relative overflow-hidden">
          {isPlaying && (
            <div className="absolute inset-0 bg-red-500/5 mix-blend-screen animate-pulse pointer-events-none" />
          )}

          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-red-500 flex items-center gap-2">
              <Target className="w-5 h-5" /> Attacked State
            </h2>
            <div className="text-right">
               <div className="text-xs text-zinc-500">Divergence</div>
               <div className="font-bold text-red-400">{currentDivergence.toFixed(1)}%</div>
            </div>
          </div>
          <p className="font-mono text-sm text-red-500/70 mb-4">Plaintext: "ASCON_SECRET_MSF" <span className="bg-red-500/20 text-red-300 px-1 rounded inline-block animate-bounce">1-Bit Changed</span></p>

          <div className="flex-1 grid grid-rows-5 gap-1">
             {[...Array(5)].map((_, wordIdx) => (
                <div key={`mod-w-${wordIdx}`} className="grid grid-cols-[repeat(64,minmax(0,1fr))] gap-px">
                  {[...Array(64)].map((_, bitIdx) => {
                     const bitGlobalIdx = wordIdx * 64 + bitIdx;
                     const isOriginallyActive = (bitGlobalIdx * 11) % 7 > 3;
                     
                     // Determine if this bit flipped based on the avalanche probability for this round
                     const doesDiverge = (bitGlobalIdx * 37 + round * 13) % 100 < currentDivergence;
                     const isActive = doesDiverge ? !isOriginallyActive : isOriginallyActive;
                     
                     return (
                        <motion.div 
                          key={`m-${wordIdx}-${bitIdx}`}
                          initial={false}
                          animate={{ 
                            backgroundColor: isActive ? '#ef4444' : '#18181b', // red-500
                            scale: doesDiverge && round > 0 ? [1, 1.5, 1] : 1
                          }}
                          transition={{ duration: 0.3 }}
                          className={`h-full rounded-sm`} 
                        />
                     );
                  })}
                </div>
             ))}
          </div>
        </div>
      </div>
      
      {/* Divergence Heatmap Bar */}
      <div className="h-8 bg-zinc-900 rounded-lg overflow-hidden border border-white/10 relative flex items-center group">
         <motion.div 
           className="absolute left-0 top-0 h-full bg-gradient-to-r from-red-600 to-orange-500" 
           animate={{ width: `${currentDivergence * 2}%` }} 
           transition={{ duration: 0.5 }}
         />
         <div className="absolute w-full h-full flex items-center justify-center font-bold text-xs mix-blend-difference pointer-events-none">
           IDEAL CRYPTOGRAPHIC AVALANCHE: 50%
         </div>
      </div>
    </div>
  );
}
