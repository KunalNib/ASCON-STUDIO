"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion } from "framer-motion";
import { Info, ChevronRight, Play, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function Step3Permutation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  // Mock rounds
  const rounds = Array.from({ length: 12 }, (_, i) => ({
    round: i,
    name: `Round ${i}`,
    input: "x₀, x₁, x₂, x₃, x₄",
    operations: ["Add Constant", "S-box Substitution", "Linear Diffusion"],
  }));

  const runPermutation = async () => {
    setIsPlaying(true);
    for (let i = 0; i < 12; i++) {
      setCurrentRound(i);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
    setIsPlaying(false);
  };

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
          <h2 className="text-3xl font-bold text-white mb-2">Step 3: ASCON Permutation</h2>
          <p className="text-zinc-400 leading-relaxed">
            The 320-bit state now undergoes 12 rounds of transformation. Each round scrambles the bits thoroughly, creating diffusion and confusion.
          </p>
        </div>

        {/* Permutation Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 border border-white/10 rounded-2xl p-8"
        >
          {/* Current State Visualization */}
          <div className="mb-8">
            <div className="text-center mb-4">
              <div className="inline-block px-4 py-2 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <span className="text-sm font-semibold text-blue-300">
                  {isPlaying ? `Round ${currentRound} / 12` : "Ready to Transform"}
                </span>
              </div>
            </div>

            {/* State Blocks Animation */}
            <div className="flex items-center justify-center gap-4 mb-6">
              {/* Input State */}
              <motion.div
                animate={{ scale: isPlaying && currentRound > 0 ? 0.9 : 1 }}
                className="flex flex-col items-center"
              >
                <div className="text-xs text-zinc-500 font-mono mb-2">Before</div>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500/30 to-blue-600/30 border border-blue-500/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[10px] font-mono text-zinc-400">State</div>
                  </div>
                </div>
              </motion.div>

              {/* Arrow with animation */}
              <motion.div
                animate={{ x: isPlaying ? [0, 5, 0] : 0 }}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.6 }}
                className="text-2xl text-purple-400"
              >
                →
              </motion.div>

              {/* Transformation Symbol */}
              <motion.div
                animate={{ scale: isPlaying ? [1, 1.1, 1] : 1, rotate: isPlaying ? [0, 10, -10, 0] : 0 }}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.8 }}
                className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/50 rounded-lg flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-xl font-black">⚡</div>
                  <div className="text-[8px] text-zinc-500">Transform</div>
                </div>
              </motion.div>

              {/* Arrow */}
              <motion.div
                animate={{ x: isPlaying ? [-5, 0] : 0 }}
                transition={{ repeat: isPlaying ? Infinity : 0, duration: 0.6 }}
                className="text-2xl text-purple-400"
              >
                →
              </motion.div>

              {/* Output State */}
              <motion.div
                animate={{ scale: isPlaying && currentRound > 0 ? 1.05 : 1 }}
                className="flex flex-col items-center"
              >
                <div className="text-xs text-zinc-500 font-mono mb-2">After</div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 to-emerald-600/30 border border-emerald-500/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-[10px] font-mono text-zinc-400">State</div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Round Progress */}
            <div className="bg-black/40 rounded-lg p-4 border border-white/5">
              <div className="grid grid-cols-12 gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      backgroundColor:
                        i < currentRound
                          ? "rgba(34, 197, 94, 0.3)"
                          : i === currentRound
                          ? "rgba(59, 130, 246, 0.5)"
                          : "rgba(39, 39, 42, 0.5)",
                      borderColor:
                        i < currentRound
                          ? "rgba(34, 197, 94, 0.5)"
                          : i === currentRound
                          ? "rgba(59, 130, 246, 0.8)"
                          : "rgba(113, 113, 122, 0.2)",
                    }}
                    className="h-8 rounded border transition-colors"
                  >
                    <div className="h-full flex items-center justify-center text-[10px] font-bold text-zinc-400">
                      {i + 1}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Control Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={runPermutation}
          disabled={isPlaying}
          whileHover={{ scale: isPlaying ? 1 : 1.02 }}
          whileTap={{ scale: isPlaying ? 1 : 0.98 }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-purple-500/30 self-center"
        >
          <Play className="w-4 h-4" />
          {isPlaying ? `Running Rounds... ${currentRound}/12` : "Run Permutation (12 Rounds)"}
        </motion.button>

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
              ASCON applies three sub-operations to each round: adding a constant, substituting 5-bit slices (S-box), and spreading bits across the state (diffusion). After 12 rounds, every input bit has affected every output bit.
            </p>
          </div>
        </motion.div>

        {/* Why Matters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4"
        >
          <p className="font-semibold text-emerald-300 mb-2">Why Permutation?</p>
          <p className="text-sm text-zinc-300">
            The permutation is the heart of ASCON's security. It mixes all 320 bits together repeatedly so that:
          </p>
          <ul className="text-sm text-zinc-300 mt-3 space-y-2 ml-4">
            <li>✓ One bit change cascades to many bits (avalanche effect)</li>
            <li>✓ No patterns or structure remain visible</li>
            <li>✓ Each round depends on the previous one</li>
          </ul>
        </motion.div>

        {/* Technical Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="flex items-center gap-2 text-sm font-semibold text-zinc-400 hover:text-zinc-300 transition-all mb-3"
          >
            {showTechnicalDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTechnicalDetails ? "Hide" : "Show"} Technical Details
          </button>

          {showTechnicalDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-3"
            >
              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">Each Round Contains:</p>
                <div className="text-xs font-mono text-zinc-400 space-y-1">
                  <div>1. <span className="text-blue-400">p_C:</span> Add constant to x₂</div>
                  <div>2. <span className="text-purple-400">p_S:</span> Bitsliced S-box substitution</div>
                  <div>3. <span className="text-pink-400">p_L:</span> XOR with rotated versions (linear diffusion)</div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">S-box (5-bit Substitution):</p>
                <div className="text-xs font-mono text-zinc-400">
                  The only non-linear operation. It replaces each 5-bit value with a pseudorandom value, preventing algebraic attacks.
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-zinc-400 mb-2">Linear Diffusion:</p>
                <div className="text-xs font-mono text-zinc-400">
                  x_i ⊕ (x_i ≫ a) ⊕ (x_i ≫ b) — where a and b are different for each word, ensuring bit spreading.
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Mission Status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-xl p-4"
        >
          <p className="font-bold text-yellow-300 mb-1">
            {currentRound === 12 ? "✓ Mission Complete" : "Mission: Run Permutation"}
          </p>
          <p className="text-xs text-zinc-400">
            {currentRound === 12
              ? "The state has been thoroughly mixed through all 12 rounds!"
              : "Click 'Run Permutation' to see all 12 rounds execute."}
          </p>
        </motion.div>
      </motion.div>

      {/* Footer Action */}
      <div className="shrink-0 border-t border-white/10 px-8 py-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-pink-500/30"
        >
          Continue to Encryption <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
