"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

export interface TourStep {
  targetId: string;
  title: string;
  content: string;
  position: "top" | "bottom" | "left" | "right";
}

export function GuidedTour({ steps, onClose }: { steps: TourStep[], onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [windowSize, setWindowSize] = useState({ w: 1000, h: 1000 });

  const step = steps[currentStep];

  useEffect(() => {
    const updateRect = () => {
      const el = document.getElementById(step.targetId);
      if (el) {
        setTargetRect(el.getBoundingClientRect());
        // Bring element slightly above overlay if it has a clean background
        el.classList.add("ring-2", "ring-blue-500", "ring-offset-2", "ring-offset-black", "outline-none", "z-[9999]");
        el.style.position = window.getComputedStyle(el).position === 'static' ? 'relative' : el.style.position;
      }
    };

    updateRect();
    
    // Slight delay to ensure DOM is settled
    const t = setTimeout(updateRect, 100);

    const handleResize = () => {
      setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      updateRect();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateRect, true);
      const el = document.getElementById(step.targetId);
      if (el) {
        el.classList.remove("ring-2", "ring-blue-500", "ring-offset-2", "ring-offset-black", "outline-none", "z-[9999]");
        // Optional: revert position if we set it, but removing z-index usually fixes it.
      }
    };
  }, [currentStep, step]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(c => c + 1);
    else onClose();
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(c => c - 1);
  };

  let top = (window?.innerHeight || 1000) / 2 - 90;
  let left = (window?.innerWidth || 1000) / 2 - 160;
  const popoverWidth = 320;
  const popoverHeight = 180;

  // Calculate positions ensuring it stays on screen if we have a target
  if (targetRect && targetRect.width > 0) {
    if (step.position === "top") {
      top = targetRect.top - popoverHeight - 16;
      left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
    } else if (step.position === "bottom") {
      top = targetRect.bottom + 16;
      left = targetRect.left + (targetRect.width / 2) - (popoverWidth / 2);
    } else if (step.position === "left") {
      top = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
      left = targetRect.left - popoverWidth - 16;
    } else if (step.position === "right") {
      top = targetRect.top + (targetRect.height / 2) - (popoverHeight / 2);
      left = targetRect.right + 16;
    }
  }

  // Clamping to screen boundaries
  top = Math.max(16, Math.min(top, (window?.innerHeight || 1000) - popoverHeight - 16));
  left = Math.max(16, Math.min(left, (window?.innerWidth || 1000) - popoverWidth - 16));

  return (
    <>
      {/* Dimmed Overlay */}
      <div className="fixed inset-0 bg-black/70 z-[9998] pointer-events-auto backdrop-blur-sm" />
      
      {/* Popover */}
      <motion.div
        key={currentStep} // Animate on change
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed z-[10000] w-[320px] bg-[#09090b] border border-blue-500/50 rounded-2xl shadow-[0_0_60px_rgba(37,99,235,0.3)] p-5 text-white"
        style={{ top: `${top}px`, left: `${left}px` }}
      >
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-blue-400 text-lg">{step.title}</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors bg-white/5 p-1 rounded-full"><X className="w-4 h-4" /></button>
        </div>
        
        <p className="text-sm text-zinc-300 mb-6 leading-relaxed min-h-[60px]">{step.content}</p>
        
        <div className="flex justify-between items-center text-xs">
          <span className="text-zinc-500 font-mono font-bold tracking-widest">{currentStep + 1} / {steps.length}</span>
          <div className="flex gap-2">
            {currentStep > 0 && <button onClick={handlePrev} className="px-4 py-2 bg-white/5 rounded-xl hover:bg-white/10 font-bold transition-colors">Prev</button>}
            <button onClick={handleNext} className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 font-bold shadow-[0_0_15px_rgba(37,99,235,0.4)] transition-all">
              {currentStep === steps.length - 1 ? "Finish Tour" : "Next Step"}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
