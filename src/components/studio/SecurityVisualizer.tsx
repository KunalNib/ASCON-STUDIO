"use client";

import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import React from "react";

export function SecurityVisualizer() {
  const nodes = Array.from({ length: 15 }, (_, i) => i);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-rose-50 dark:bg-[#050000] text-rose-900 dark:text-red-100 font-mono relative overflow-hidden">
      
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-200 dark:from-red-900/20 via-transparent dark:via-[#050000] to-transparent dark:to-[#050000]" />
      
      <div className="text-center z-10 mb-12">
        <ShieldAlert className="w-12 h-12 text-rose-600 dark:text-red-500 mx-auto mb-4 animate-pulse" />
        <h3 className="text-xl font-bold text-rose-700 dark:text-red-500 mb-2">Avalanche Effect</h3>
        <p className="text-xs text-rose-600 dark:text-red-400/60 max-w-sm">
          A single bit flip in the initialization vector propagates through the ASCON core, causing pseudo-random chaos.
        </p>
      </div>
      
      <div className="relative w-64 h-64 z-10">
        <motion.div 
          className="absolute top-1/2 left-1/2 w-4 h-4 bg-white rounded-full ml-[-8px] mt-[-8px] shadow-[0_0_15px_rgba(255,255,255,1)]" 
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.8, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
        
        {nodes.map((node) => {
          const angle = (node / nodes.length) * Math.PI * 2;
          const radius = 90;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <motion.div
              key={node}
              className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-full ml-[-6px] mt-[-6px]"
              initial={{ x: 0, y: 0, opacity: 0 }}
              animate={{ 
                x: [0, x], 
                y: [0, y],
                opacity: [0, 1, 0],
                backgroundColor: ["#ffffff", "#ef4444", "#7f1d1d"]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: node * 0.1,
                ease: "easeOut"
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
