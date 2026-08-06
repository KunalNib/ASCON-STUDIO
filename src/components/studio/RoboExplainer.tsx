import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, FastForward } from "lucide-react";

interface RoboExplainerProps {
  text: string;
  onBack: () => void;
}

export function RoboExplainer({ text, onBack }: RoboExplainerProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);

  // Typewriter effect logic
  useEffect(() => {
    setDisplayedText("");
    setIsTyping(true);
    let index = 0;
    
    // Very fast typewriter rate (~15ms per character) for good UX
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        if (index >= text.length) {
          clearInterval(intervalId);
          setIsTyping(false);
          return prev;
        }
        const nextChar = text[index];
        index++;
        return prev + nextChar;
      });
    }, 15);

    return () => clearInterval(intervalId);
  }, [text]);

  const handleSkipDelay = () => {
    if (isTyping) {
      setDisplayedText(text);
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-end md:items-start gap-6 h-full p-6">
      
      {/* Robot Mascot Container */}
      <motion.div 
         className="relative shrink-0 hidden md:flex flex-col items-center gap-2 cursor-pointer mt-4"
         initial={{ y: 20, opacity: 0 }}
         animate={{ y: [0, -10, 0], opacity: 1 }}
         transition={{ 
           y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
           opacity: { duration: 0.5 }
         }}
         onClick={handleSkipDelay}
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-purple-900/30 border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.3)] flex items-center justify-center overflow-hidden">
             <Bot className="w-12 h-12 text-zinc-100 relative z-10" />
             
             {/* Simulates "thinking" / scanning while typing */}
             <AnimatePresence>
               {isTyping && (
                 <motion.div 
                   className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent h-[50%]"
                   initial={{ top: "-50%" }}
                   animate={{ top: "150%" }}
                   transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                 />
               )}
             </AnimatePresence>
          </div>
          
          {/* Animated floating ring */}
          <motion.div 
            className="absolute -inset-3 border border-purple-500/20 rounded-full"
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <span className="text-[10px] uppercase font-bold text-purple-400 tracking-widest mt-2">
           ASCON Bot
        </span>
      </motion.div>

      {/* Speech Bubble Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        className="flex-1 w-full relative bg-purple-900/10 border border-purple-500/30 rounded-3xl p-6 shadow-2xl min-h-[200px] flex flex-col"
        onClick={handleSkipDelay}
      >
        {/* Tail for speech bubble */}
        <div className="hidden md:block absolute w-4 h-4 bg-purple-900/10 border-l border-b border-purple-500/30 transform object-fill rotate-45 -left-[9px] top-12" />
        
        <div className="flex-1 text-zinc-200 leading-loose text-base font-medium tracking-wide">
          {displayedText}
          {isTyping && <span className="inline-block w-2 bg-purple-400 animate-pulse ml-1 align-middle h-5" />}
        </div>
        
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-white/5">
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }}
            className="flex items-center gap-2 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            ← Back to curriculum
          </button>
          
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1 text-[10px] text-purple-400 uppercase font-bold tracking-widest bg-purple-500/10 px-2 py-1 rounded cursor-pointer hover:bg-purple-500/20"
              >
                <FastForward className="w-3 h-3" /> Skip Animation
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
