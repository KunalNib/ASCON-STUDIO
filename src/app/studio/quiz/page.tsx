"use client";

import { useState } from "react";
import { Gamepad2, BrainCircuit, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

export default function QuizGamification() {
  const { xp, addXp } = useAsconStore();
  const { width, height } = useWindowSize();
  
  const [activeQuiz, setActiveQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const fetchQuiz = async () => {
    setIsLoading(true);
    setSelectedValue(null);
    setShowResult(false);
    
    try {
      const res = await fetch("http://localhost:8000/quiz/generate");
      const data = await res.json();
      setActiveQuiz(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = async (idx: number) => {
    if (showResult) return;
    setSelectedValue(idx);
    setShowResult(true);
    
    if (idx === activeQuiz.correct_index) {
      setIsCorrect(true);
      addXp(150);
      
      // Dispatch XP to backend
      await fetch("http://localhost:8000/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ earned_xp: 150 })
      });
    } else {
      setIsCorrect(false);
    }
  };

  const level = Math.floor(xp / 500) + 1;
  const progressToNextLevel = (xp % 500) / 500 * 100;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {isCorrect && showResult && <Confetti width={width} height={height} recycle={false} numberOfPieces={200} colors={['#3b82f6', '#a855f7', '#10b981']} />}
      
      <header className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-yellow-500" /> Cryptography Arena
          </h1>
          <p className="text-zinc-400">Put your ASCON knowledge to the test against the Llama 3 LLM.</p>
        </div>
        
        <div className="bg-[#09090b] border border-white/10 rounded-2xl p-4 flex items-center gap-6 min-w-[250px] shadow-lg">
           <div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Rank</div>
              <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">Scholar Lv.{level}</div>
           </div>
           <div className="flex-1">
              <div className="flex justify-between text-xs mb-2">
                 <span className="text-zinc-400">XP Progress</span>
                 <span className="text-yellow-500 font-mono">{xp} XP</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                 <motion.div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" initial={{ width: 0 }} animate={{ width: `${progressToNextLevel}%` }} transition={{ type: "spring" }} />
              </div>
           </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex items-center justify-center">
        {!activeQuiz && !isLoading ? (
          <div className="text-center">
             <BrainCircuit className="w-24 h-24 text-zinc-700 mx-auto mb-6" />
             <h2 className="text-2xl font-bold text-white mb-4">Ready to test your limits?</h2>
             <button 
               onClick={fetchQuiz}
               className="bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
             >
               Generate AI Challenge
             </button>
          </div>
        ) : isLoading ? (
          <div className="text-center flex flex-col items-center">
             <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
             <p className="text-zinc-400 font-mono animate-pulse">Llama 3 is constructing a complex cryptographic challenge...</p>
          </div>
        ) : (
          <div className="w-full max-w-3xl bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl shadow-2xl relative">
             <div className="mb-8">
                <span className="inline-block px-3 py-1 rounded bg-blue-500/10 text-blue-400 font-mono text-xs mb-4 border border-blue-500/20">Challenge Active</span>
                <h2 className="text-2xl font-semibold text-white leading-relaxed">{activeQuiz.question}</h2>
             </div>
             
             <div className="space-y-3">
                {activeQuiz.options.map((opt: string, idx: number) => {
                   const isSelected = selectedValue === idx;
                   const isWinningKey = showResult && idx === activeQuiz.correct_index;
                   const isLosingKey = showResult && isSelected && !isCorrect;
                   
                   let styles = "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300";
                   if (isWinningKey) styles = "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                   else if (isLosingKey) styles = "bg-red-500/20 border-red-500 text-red-300";
                   
                   return (
                     <button
                       key={idx}
                       onClick={() => handleSelect(idx)}
                       disabled={showResult}
                       className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${styles}`}
                     >
                       <span>{opt}</span>
                       {showResult && isWinningKey && <CheckCircle className="w-5 h-5" />}
                       {showResult && isLosingKey && <XCircle className="w-5 h-5" />}
                     </button>
                   );
                })}
             </div>
             
             <AnimatePresence>
               {showResult && (
                 <motion.div 
                   initial={{ opacity: 0, height: 0, marginTop: 0 }}
                   animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                   className="overflow-hidden"
                 >
                   <div className={`p-4 rounded-xl border ${isCorrect ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                      <h4 className="font-bold mb-2">{isCorrect ? "+150 XP Awarded!" : "Incorrect"}</h4>
                      <p className="text-sm leading-relaxed">{activeQuiz.explanation}</p>
                   </div>
                   <button 
                     onClick={fetchQuiz}
                     className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold transition-all"
                   >
                     Next Challenge <ArrowRight className="w-5 h-5" />
                   </button>
                 </motion.div>
               )}
             </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
