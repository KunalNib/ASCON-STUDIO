"use client";

import { motion } from "framer-motion";
import { ChevronRight, Bot, Compass, Play } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-white overflow-hidden relative selection:bg-purple-500/30 transition-colors duration-300">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/20 dark:bg-purple-600/30 rounded-full blur-[128px] mix-blend-multiply dark:mix-blend-screen animate-pulse duration-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/20 rounded-full blur-[128px] mix-blend-multiply dark:mix-blend-screen"></div>
        
        {/* Floating Binary Background */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.03] flex flex-wrap gap-4 p-8 overflow-hidden pointer-events-none">
          {Array.from({ length: 200 }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: Math.random() * 100 }}
              animate={{ 
                opacity: [0.1, 0.5, 0.1], 
                y: [Math.random() * 100, Math.random() * -100] 
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: "linear",
              }}
              className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400"
            >
              {Math.random() > 0.5 ? "1" : "0"}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 mb-8 text-sm font-medium border rounded-full bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 backdrop-blur-md text-zinc-800 dark:text-white"
        >
          <span className="flex items-center justify-center w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Revolutionizing Cryptography Education
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-zinc-900 via-zinc-700 to-zinc-500 dark:from-white dark:via-white dark:to-white/40"
        >
          ASCON Studio
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 max-w-3xl mb-12 font-medium"
        >
          Interactive Visualization & AI Learning Platform for Lightweight Cryptography
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl"
        >
          <Link href="/learn" className="group rounded-xl p-[1px] bg-gradient-to-br from-purple-500 to-blue-600 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center justify-center gap-2 px-8 py-4 bg-white/90 dark:bg-black/80 backdrop-blur-xl rounded-xl font-semibold w-full transition-colors group-hover:bg-white/70 dark:group-hover:bg-black/40 text-black dark:text-white">
              <Play className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Start Learning
            </div>
          </Link>

          <Link href="/studio" className="group rounded-xl p-[1px] bg-black/10 dark:bg-white/10 transition-all hover:bg-black/20 dark:hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center justify-center gap-2 px-8 py-4 bg-zinc-100/50 dark:bg-white/5 backdrop-blur-xl rounded-xl font-semibold w-full text-zinc-900 dark:text-white">
              <Compass className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
              Launch Studio
            </div>
          </Link>

          <Link href="/ai-tutor" className="group rounded-xl p-[1px] bg-black/5 dark:bg-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent backdrop-blur-xl rounded-xl font-semibold w-full text-zinc-700 dark:text-zinc-300">
              <Bot className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Talk to AI
            </div>
          </Link>
          
          <Link href="/algorithm" className="group rounded-xl p-[1px] bg-black/5 dark:bg-white/5 transition-all hover:bg-black/10 dark:hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex items-center justify-center gap-2 px-8 py-4 bg-transparent backdrop-blur-xl rounded-xl font-semibold w-full text-zinc-700 dark:text-zinc-300">
              <ChevronRight className="w-5 h-5 text-zinc-500 dark:text-zinc-400 group-hover:translate-x-1 transition-transform" />
              Explore Algorithm
            </div>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
