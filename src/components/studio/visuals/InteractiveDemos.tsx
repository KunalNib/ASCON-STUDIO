import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Lock, Unlock, Shield, Grid, Layers, Key, Zap } from 'lucide-react';

export function EncryptionFlowDemo() {
  const [step, setStep] = useState(0);
  const steps = ["Plaintext", "Encryption", "Ciphertext"];

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full space-y-6">
      <div className="flex items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <span className={step >= i ? "text-purple-400" : ""}>{s}</span>
            {i < steps.length - 1 && <ArrowRight className="w-4 h-4" />}
          </React.Fragment>
        ))}
      </div>
      
      <div className="flex items-center justify-center gap-8 w-full max-w-md bg-black/40 border border-white/5 rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent pointer-events-none" />
        
        <motion.div 
          animate={{ x: step > 0 ? 100 : 0, opacity: step === 2 ? 0 : 1 }}
          className="text-white text-lg font-mono bg-zinc-800 p-3 rounded"
        >
          HELLO
        </motion.div>

        {step > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: step === 2 ? 360 : 0 }}
            className="text-purple-500 flex flex-col items-center absolute z-10"
          >
            {step === 1 ? <Lock className="w-12 h-12" /> : <Lock className="w-12 h-12 text-zinc-500" />}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-purple-300 text-lg font-mono bg-purple-900/30 border border-purple-500/50 p-3 rounded"
          >
            #x9B!4
          </motion.div>
        )}
      </div>

      <button 
        onClick={() => setStep((s) => (s + 1) % 3)}
        className="px-6 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500 text-purple-300 rounded-full font-bold text-sm transition-all"
      >
        {step === 2 ? 'Reset' : 'Next Step'}
      </button>
    </div>
  );
}

export function StateVisualDemo() {
  const words = ["x0", "x1", "x2", "x3", "x4"];
  const [active, setActive] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full space-y-6">
      <div className="flex gap-2">
        {words.map((w, i) => (
          <motion.div
            key={i}
            onHoverStart={() => setActive(i)}
            onHoverEnd={() => setActive(null)}
            animate={{ y: active === i ? -10 : 0 }}
            className={`w-16 h-24 rounded-lg flex items-center justify-center font-mono font-bold text-lg border transition-all ${active === i ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'bg-black border-white/10 text-zinc-500'}`}
          >
            {w}
          </motion.div>
        ))}
      </div>
      <p className="text-zinc-400 text-sm max-w-sm text-center">
        The 320-bit state is divided into five 64-bit words. Hover over each block to visualize the structure.
      </p>
    </div>
  );
}

export function AeadDemo() {
  const [scramble, setScramble] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full space-y-6">
      <div className="flex flex-col gap-4 w-full max-w-md">
        
        {/* Associated Data */}
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-xl p-4">
          <Layers className="w-6 h-6 text-blue-400" />
          <div className="flex-1">
            <span className="text-xs font-bold text-blue-400 uppercase">Associated Data</span>
            <div className="text-zinc-200 font-mono text-sm mt-1">IP: 192.168.1.5 (Readable)</div>
          </div>
          {scramble && <Shield className="w-5 h-5 text-green-500" />}
        </div>

        {/* Plaintext / Ciphertext */}
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-xl p-4">
          {scramble ? <Lock className="w-6 h-6 text-purple-400" /> : <Unlock className="w-6 h-6 text-zinc-500" />}
          <div className="flex-1">
            <span className={`text-xs font-bold uppercase ${scramble ? 'text-purple-400' : 'text-zinc-500'}`}>
              {scramble ? 'Ciphertext' : 'Plaintext'}
            </span>
            <div className="text-zinc-200 font-mono text-sm mt-1 transition-all">
              {scramble ? '7$b*9qP!2z' : 'Transfer $500'}
            </div>
          </div>
          {scramble && <Shield className="w-5 h-5 text-green-500" />}
        </div>
      </div>

      <button 
        onClick={() => setScramble(!scramble)}
        className="px-6 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500 text-purple-300 rounded-full font-bold text-sm transition-all"
      >
        {scramble ? 'Decrypt' : 'Encrypt Data'}
      </button>
    </div>
  );
}

export function KeysDemo() {
  const [unlocked, setUnlocked] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center p-6 w-full space-y-6">
      <motion.div 
        animate={{ rotateY: unlocked ? 180 : 0 }}
        className="w-32 h-32 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center"
      >
        {unlocked ? <Unlock className="w-12 h-12 text-green-500" /> : <Lock className="w-12 h-12 text-purple-500" />}
      </motion.div>

      <button 
        onClick={() => setUnlocked(!unlocked)}
        className={`px-6 py-3 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${unlocked ? 'bg-green-600/20 border border-green-500 text-green-400' : 'bg-purple-600/20 border border-purple-500 text-purple-400'}`}
      >
        <Key className="w-4 h-4" /> {unlocked ? 'Remove Key' : 'Insert Secret Key'}
      </button>
    </div>
  );
}
