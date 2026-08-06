"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, ArrowRight, CheckCircle2, ChevronRight, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export function GuidedTour() {
  const [tourActive, setTourActive] = useState(false);
  const [step, setStep] = useState(0);
  const pathname = usePathname();
  const router = useRouter();

  // Check if it's the first time user logged in
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("ascon-tour-completed");
    if (!hasSeenTour) {
      setTimeout(() => setTourActive(true), 1500); // Delayed entry for cinematic effect
    }
  }, []);

  const tourSteps = [
    {
      title: "Welcome to ASCON Studio",
      text: "I am your Llama-3 AI Assistant. I will guide you through the mathematics of Authenticated AEAD Encryption. Let's begin the journey.",
      route: "/studio",
      highlight: null
    },
    {
      title: "The Sponge Construction",
      text: "Notice the Dashboard metrics. ASCON operates entirely by absorbing data into a 320-bit internal state before squeezing out the Ciphertext.",
      route: "/studio",
      highlight: ".dashboard-metrics"
    },
    {
      title: "Let's Encrypt",
      text: "To truly understand lightweight cryptography, you must see it happen. I am redirecting you to the Engine now.",
      route: "/studio/encryption",
      highlight: null
    },
    {
      title: "The AEAD Engine",
      text: "Here you can inject your Plaintext, Key, and Nonce. When you trigger the execution, you will see a detailed visual timeline mapping the actual Mathematical Permutations.",
      route: "/studio/encryption",
      highlight: ".encryption-inputs"
    }
  ];

  useEffect(() => {
    if (tourActive && tourSteps[step].route !== pathname) {
      router.push(tourSteps[step].route);
    }
  }, [step, tourActive]);

  const endTour = () => {
    setTourActive(false);
    localStorage.setItem("ascon-tour-completed", "true");
  };

  if (!tourActive) return null;

  const currentStep = tourSteps[step];

  return (
    <>
      {/* Global Dimming Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] pointer-events-auto flex items-end md:items-center justify-center p-6"
      >
        
        {/* Floating AI Avatar Window */}
        <motion.div
           layoutId="tour-window"
           initial={{ y: 50, opacity: 0, scale: 0.9 }}
           animate={{ y: 0, opacity: 1, scale: 1 }}
           transition={{ type: "spring", damping: 25, stiffness: 400, delay: 0.2 }}
           className="bg-[#09090b] border border-blue-500/30 rounded-3xl p-6 lg:p-8 max-w-lg w-full shadow-[0_0_100px_rgba(59,130,246,0.15)] relative"
        >
           {/* Dismiss Button */}
           <button onClick={endTour} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
              <X className="w-5 h-5"/>
           </button>

           <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-blue-900/30 border border-blue-500/50 flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-t-2 border-blue-400 animate-spin" style={{ animationDuration: '3s' }}/>
                 <Bot className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                 <div className="text-xs font-mono text-blue-400 mb-1 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"/>
                   AI ONBOARDING
                 </div>
                 <h2 className="text-2xl font-bold text-white leading-none">{currentStep.title}</h2>
              </div>
           </div>

           <p className="text-zinc-300 leading-relaxed text-lg mb-8 font-medium">
             {currentStep.text}
           </p>

           <div className="flex items-center justify-between border-t border-white/10 pt-6">
              <div className="flex gap-2">
                 {tourSteps.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-blue-500' : 'w-2 bg-white/20'}`} />
                 ))}
              </div>

              <button
                onClick={() => {
                  if (step < tourSteps.length - 1) setStep(step + 1);
                  else endTour();
                }}
                className="bg-white text-black px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
              >
                {step < tourSteps.length - 1 ? (
                   <>Next <ChevronRight className="w-4 h-4"/></>
                ) : (
                   <>Begin Exploration <CheckCircle2 className="w-4 h-4"/></>
                )}
              </button>
           </div>
        </motion.div>
      </motion.div>
    </>
  );
}
