"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion } from "framer-motion";
import { Info, ChevronRight, Play, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function Step4EncryptData() {
  const { plaintext, session } = useAsconStore();
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionProgress, setEncryptionProgress] = useState(0);
  const [showCiphertext, setShowCiphertext] = useState(false);
  const [showHexDetails, setShowHexDetails] = useState(false);

  const startEncryption = async () => {
    setIsEncrypting(true);
    setEncryptionProgress(0);

    // Simulate encryption progress
    for (let i = 0; i <= 100; i += 20) {
      setEncryptionProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    setEncryptionProgress(100);
    setShowCiphertext(true);
    setIsEncrypting(false);
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
          <h2 className="text-3xl font-bold text-white mb-2">Step 4: Encrypt Data</h2>
          <p className="text-zinc-400 leading-relaxed">
            The transformed state now encrypts your plaintext. The message is XORed with the state and mixed back in, producing ciphertext.
          </p>
        </div>

        {/* Encryption Visualization */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 border border-white/10 rounded-2xl p-8"
        >
          {/* Transformation Flow */}
          <div className="space-y-6">
            {/* Plaintext Input */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex flex-col items-center">
                <div className="text-xs text-zinc-500 font-semibold mb-2">Plaintext (Human Readable)</div>
                <div className="w-full bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-sm font-mono text-blue-300 break-words text-center">{plaintext}</p>
                </div>
              </div>

              {/* Plus Sign */}
              <div className="flex items-center justify-center">
                <motion.div
                  animate={{ scale: encryptionProgress > 0 ? [1, 1.2, 1] : 1 }}
                  transition={{ repeat: isEncrypting ? Infinity : 0, duration: 0.6 }}
                  className="text-3xl font-bold text-purple-400"
                >
                  ⊕
                </motion.div>
              </div>

              {/* State */}
              <div className="flex flex-col items-center">
                <div className="text-xs text-zinc-500 font-semibold mb-2">Internal State (Secret)</div>
                <div className="w-full bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                  <p className="text-xs font-mono text-purple-300 text-center opacity-75">Transformed State</p>
                </div>
              </div>
            </div>

            {/* Equals Sign and Arrow Down */}
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ y: isEncrypting || encryptionProgress > 0 ? [0, 5, 0] : 0 }}
                transition={{ repeat: isEncrypting || encryptionProgress > 0 ? Infinity : 0, duration: 0.8 }}
                className="text-2xl text-emerald-400 font-bold"
              >
                ↓
              </motion.div>
            </div>

            {/* Progress Bar */}
            {(isEncrypting || encryptionProgress > 0) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/40 rounded-lg p-4 border border-white/5"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-zinc-400">Encryption Progress</span>
                  <span className="text-xs font-mono text-yellow-400">{encryptionProgress}%</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${encryptionProgress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                  />
                </div>
              </motion.div>
            )}

            {/* Ciphertext Output */}
            {showCiphertext && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center"
              >
                <div className="text-xs text-zinc-500 font-semibold mb-2">Ciphertext (Encrypted & Unreadable)</div>
                <div className="w-full bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4">
                  <p className="text-sm font-mono text-emerald-300 break-words text-center">
                    {session.ciphertext}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Encrypt Button */}
        {encryptionProgress === 0 && !isEncrypting && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={startEncryption}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-emerald-500/30 self-center"
          >
            <Play className="w-4 h-4" />
            Encrypt This Message
          </motion.button>
        )}

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
              Your plaintext is being XORed with the highest bits of the internal state (x₀). Each byte of plaintext combines with corresponding state bytes, producing ciphertext. The state is then updated with the plaintext for authentication.
            </p>
          </div>
        </motion.div>

        {/* Why This Matters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-4"
        >
          <p className="font-semibold text-emerald-300 mb-2">Why Encryption Works</p>
          <p className="text-sm text-zinc-300 mb-3">
            XOR is the core of symmetric encryption:
          </p>
          <ul className="text-sm text-zinc-300 space-y-2 ml-4">
            <li>✓ It's reversible — XOR the same value twice to get the original</li>
            <li>✓ Only someone with the key can recreate the state and decrypt</li>
            <li>✓ The same plaintext encrypts differently each time (thanks to the nonce)</li>
          </ul>
        </motion.div>

        {/* Ciphertext Analysis */}
        {showCiphertext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-4"
          >
            <p className="font-semibold text-cyan-300 mb-2">Ciphertext Analysis</p>
            <div className="grid grid-cols-2 gap-3 text-sm text-zinc-300">
              <div>
                <span className="text-zinc-500">Original Length:</span>
                <p className="font-mono text-cyan-300">{plaintext.length} characters</p>
              </div>
              <div>
                <span className="text-zinc-500">Encrypted Length:</span>
                <p className="font-mono text-cyan-300">{session.ciphertext.split(" ").length} bytes</p>
              </div>
              <div>
                <span className="text-zinc-500">Readable?</span>
                <p className="font-mono text-red-400">✗ No</p>
              </div>
              <div>
                <span className="text-zinc-500">Secure?</span>
                <p className="font-mono text-green-400">✓ Yes</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Technical Details */}
        {showCiphertext && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
                className="bg-black/40 border border-white/10 rounded-lg p-4 space-y-3"
              >
                <div>
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Plaintext Bytes:</p>
                  <p className="text-xs font-mono text-blue-300">{plaintext} (as ASCII)</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-400 mb-2">Ciphertext Bytes:</p>
                  <p className="text-xs font-mono text-emerald-300 break-words">{session.ciphertext}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Mission Status */}
        {showCiphertext && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-xl p-4"
          >
            <p className="font-bold text-yellow-300 mb-1">✓ Mission: Encryption Complete</p>
            <p className="text-xs text-zinc-400">
              Your plaintext has been successfully transformed into ciphertext!
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Footer Action */}
      <div className="shrink-0 border-t border-white/10 px-8 py-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-cyan-500/30"
        >
          Continue to Authentication <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
