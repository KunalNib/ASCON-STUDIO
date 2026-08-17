import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ChevronRight, Play } from "lucide-react";
import { RoboExplainer } from "./RoboExplainer";
import { EncryptionFlowDemo, StateVisualDemo, AeadDemo, KeysDemo } from "./visuals/InteractiveDemos";
import type { ModuleItem } from "@/data/learningModules";

export function InteractiveModule({ 
  module, 
  onBack,
  onComplete
}: { 
  module: ModuleItem;
  onBack: () => void;
  onComplete: () => void;
}) {
  const [showFull, setShowFull] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);

  // Once the bot finishes the intro, the user can click to reveal the rest, or maybe we show it automatically?
  // We'll let the user click a button to proceed or we show it automatically when they skip the bot.
  
  const handleQuizAnswer = (index: number) => {
    if (!module.quiz) return;
    setSelectedAnswer(index);
    setIsAnswerCorrect(index === module.quiz.correctIndex);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto space-y-6 pb-20 pr-2">
      {/* Introduction from the Bot */}
      <div className="min-h-[250px]">
        <RoboExplainer 
          text={module.intro} 
          onBack={onBack} 
        />
      </div>

      <AnimatePresence>
        {!showFull ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-4"
          >
            <button 
              onClick={() => setShowFull(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-full flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)]"
            >
              Read Full Explanation <ChevronRight className="w-5 h-5" />
            </button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Explanation Card */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-white mb-2">{module.objective}</h3>
              <p className="text-zinc-300 leading-relaxed mb-4">{module.explanation}</p>
              
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-4 mt-4">
                <strong className="text-purple-400 text-sm tracking-wider uppercase block mb-1">Key Takeaway</strong>
                <p className="text-zinc-200">{module.takeaway}</p>
              </div>
            </div>

            {/* Interactive Component Placeholder (we can expand this later) */}
            {module.interactiveType && (
              <div className="bg-[#09090b] border border-white/10 rounded-2xl flex flex-col items-center justify-center min-h-[200px] overflow-hidden">
                {module.interactiveType === 'encryption-flow' && <EncryptionFlowDemo />}
                {module.interactiveType === 'state' && <StateVisualDemo />}
                {module.interactiveType === 'aead' && <AeadDemo />}
                {module.interactiveType === 'keys' && <KeysDemo />}
              </div>
            )}

            {/* Quiz Section */}
            {module.quiz && (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Check Your Understanding</h3>
                <p className="text-zinc-300 mb-4">{module.quiz.question}</p>
                
                <div className="space-y-3">
                  {module.quiz.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === idx;
                    const isCorrect = idx === module.quiz!.correctIndex;
                    
                    let btnClass = "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300";
                    if (isSelected) {
                      btnClass = isCorrect 
                        ? "bg-green-900/40 border-green-500 text-green-300"
                        : "bg-red-900/40 border-red-500 text-red-300";
                    } else if (selectedAnswer !== null && isCorrect) {
                      btnClass = "bg-green-900/20 border-green-500/50 text-green-400";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleQuizAnswer(idx)}
                        disabled={selectedAnswer !== null}
                        className={`w-full text-left p-4 rounded-xl border transition-all ${btnClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {isAnswerCorrect !== null && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mt-4 p-4 rounded-xl flex items-center gap-3 ${isAnswerCorrect ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}
                  >
                    {isAnswerCorrect ? (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-bold">Correct! Great job.</span>
                      </>
                    ) : (
                      <>
                        <span className="font-bold">Not quite. Try reviewing the explanation again.</span>
                      </>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Mark as Complete */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={onComplete}
                disabled={module.quiz && !isAnswerCorrect}
                className={`py-3 px-6 rounded-full font-bold flex items-center gap-2 transition-all ${
                  (!module.quiz || isAnswerCorrect) 
                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="w-5 h-5" /> Mark as Complete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
