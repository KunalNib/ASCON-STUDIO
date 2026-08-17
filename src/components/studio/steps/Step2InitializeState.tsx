"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion } from "framer-motion";
import { Info, ChevronRight, HelpCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function Step2InitializeState() {
  const { session } = useAsconStore();
  const [showHexDetails, setShowHexDetails] = useState(false);

  // Mock state words for visualization
  const stateWords = [
    { label: "x₀", value: "0x0000000000000000", color: "from-red-500 to-red-600" },
    { label: "x₁", value: "0x0000000000000000", color: "from-orange-500 to-orange-600" },
    { label: "x₂", value: "0x0000000000000000", color: "from-yellow-500 to-yellow-600" },
    { label: "x₃", value: "0x0000000000000000", color: "from-blue-500 to-blue-600" },
    { label: "x₄", value: "0x0000000000000000", color: "from-purple-500 to-purple-600" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col overflow-y-auto p-8 gap-6"
      >
        {/* Step Title & Description */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Step 2: Initialize the 320-bit State</h2>
          <p className="text-zinc-400 leading-relaxed">
            ASCON now creates its internal working memory by combining your key, nonce, and parameters into a single 320-bit state.
          </p>
        </div>

        {/* Visual: 5x64-bit words */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 border border-white/10 rounded-2xl p-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="text-center">
              <div className="text-sm font-semibold text-zinc-500 mb-2">ASCON Internal State</div>
              <div className="text-2xl font-black text-white">320 bits</div>
              <div className="text-xs text-zinc-500 mt-1">(5 × 64-bit words)</div>
            </div>
          </div>

          {/* Grid of 5 state words */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stateWords.map((word, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`bg-gradient-to-b ${word.color} bg-opacity-5 border border-white/10 rounded-lg p-4 text-center hover:border-white/20 transition-all`}
              >
                <div className="text-lg font-bold text-white mb-2">{word.label}</div>
                <div className="h-12 bg-black/30 rounded border border-white/5 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[10px] text-zinc-500 font-mono">64 bits</div>
                    <div className="text-xs text-zinc-400 font-mono mt-1">0000...0000</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Simple arrow showing flow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6 text-sm text-zinc-500 font-mono"
          >
            ↓
            <div className="mt-1 text-xs text-zinc-600">
              Input + Key + Nonce → 320-bit State
            </div>
          </motion.div>
        </motion.div>

        {/* What is Happening */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex gap-3"
        >
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-300">
            <p className="font-semibold text-blue-300 mb-1">What's Happening?</p>
            <p>
              Your key, nonce, and parameters are being mixed together into a 320-bit state. This becomes the main working area for all encryption operations.
            </p>
          </div>
        </motion.div>

        {/* Why This Matters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4 flex gap-3"
        >
          <div className="text-sm text-zinc-300">
            <p className="font-semibold text-emerald-300 mb-1">Why Does This Matter?</p>
            <p>
              Think of this 320-bit state like a mixing chamber. Everything—your secret key, the unique nonce, and your data—will be transformed within this state. Only someone with the exact same key and nonce could recreate this initial state.
            </p>
          </div>
        </motion.div>

        {/* Optional Technical Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => setShowHexDetails(!showHexDetails)}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-300 transition-all mb-3"
          >
            {showHexDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showHexDetails ? "Hide" : "Show"} Hexadecimal Details
          </button>

          {showHexDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/40 border border-white/10 rounded-lg p-4"
            >
              <div className="text-xs font-mono text-zinc-400 space-y-2">
                <div>x₀ = {session.initialState[0]}</div>
                <div>x₁ = {session.initialState[1]}</div>
                <div>x₂ = {session.initialState[2]}</div>
                <div>x₃ = {session.initialState[3]}</div>
                <div>x₄ = {session.initialState[4]}</div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Quick Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/20 rounded-xl p-4"
        >
          <p className="font-bold text-purple-300 mb-2">Quick Question:</p>
          <p className="text-sm text-zinc-300 mb-4">
            Which part of this state should never be shared with anyone?
          </p>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-zinc-300 rounded transition-all">
              x₀ (IV)
            </button>
            <button className="px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-zinc-300 rounded transition-all">
              x₁ & x₂ (Key)
            </button>
            <button className="px-3 py-2 text-xs font-semibold bg-white/10 hover:bg-white/20 text-zinc-300 rounded transition-all">
              All of it
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-3">
            💡 Hint: The entire state is derived from the secret key, so all of it must be kept secret!
          </p>
        </motion.div>

        {/* Mission Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-xl p-4"
        >
          <p className="font-bold text-yellow-300 mb-1">✓ Mission: Initialize State</p>
          <p className="text-xs text-zinc-400">
            The 320-bit state has been created and is ready for transformation.
          </p>
        </motion.div>
      </motion.div>

      {/* Footer Action */}
      <div className="shrink-0 border-t border-white/10 px-8 py-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-purple-500/30"
        >
          Continue to Permutation <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
