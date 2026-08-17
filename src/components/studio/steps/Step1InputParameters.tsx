"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion } from "framer-motion";
import { Info, Edit2, ChevronRight, Lock, Key, Shuffle, Shield } from "lucide-react";
import { useState } from "react";

export function Step1InputParameters() {
  const { plaintext, key, nonce, associatedData, setPlaintext } = useAsconStore();
  const [isEditingPlaintext, setIsEditingPlaintext] = useState(false);
  const [tempPlaintext, setTempPlaintext] = useState(plaintext);

  const handlePlaintextChange = () => {
    setPlaintext(tempPlaintext);
    setIsEditingPlaintext(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col overflow-y-auto p-8 gap-8"
      >
        {/* Step Title & Description */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Step 1: Input & Parameters</h2>
          <p className="text-zinc-400 leading-relaxed">
            ASCON is about to protect your data. We need four things to get started:
          </p>
        </div>

        {/* Four Input Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Plaintext Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-900/20 to-blue-900/5 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white">Your Message</h3>
              </div>
              <button
                onClick={() => setIsEditingPlaintext(true)}
                className="p-1 hover:bg-white/10 rounded transition-all text-zinc-500 hover:text-white"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-blue-500/20">
              {isEditingPlaintext ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempPlaintext}
                    onChange={(e) => setTempPlaintext(e.target.value)}
                    className="flex-1 bg-blue-900/40 border border-blue-500/50 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-blue-400"
                    placeholder="Enter your message..."
                  />
                  <button
                    onClick={handlePlaintextChange}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded text-sm font-semibold transition-all"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <p className="text-zinc-300 font-mono text-sm break-words">{plaintext}</p>
              )}
            </div>

            <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
              <span className="font-semibold text-zinc-400">Why?</span> This is the data you want to keep secret. ASCON will transform it.
            </p>
          </motion.div>

          {/* Key Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-900/20 to-purple-900/5 border border-purple-500/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Key className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-white">Secret Key</h3>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-purple-500/20">
              <p className="text-zinc-400 font-mono text-xs break-words opacity-75">{key}</p>
            </div>

            <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
              <span className="font-semibold text-zinc-400">Why?</span> Only those with the key can decrypt. Keep it secret!
            </p>
          </motion.div>

          {/* Nonce Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-cyan-900/20 to-cyan-900/5 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shuffle className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white">Nonce</h3>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-cyan-500/20">
              <p className="text-zinc-400 font-mono text-xs break-words opacity-75">{nonce}</p>
            </div>

            <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
              <span className="font-semibold text-zinc-400">Why?</span> This unique value ensures the same message encrypts differently each time.
            </p>
          </motion.div>

          {/* Associated Data Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-emerald-900/20 to-emerald-900/5 border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white">Authenticated Data</h3>
            </div>

            <div className="bg-black/40 rounded-lg p-4 border border-emerald-500/20">
              <p className="text-zinc-400 font-mono text-xs break-words opacity-75">{associatedData}</p>
            </div>

            <p className="text-zinc-500 text-xs mt-3 leading-relaxed">
              <span className="font-semibold text-zinc-400">Why?</span> This optional data is authenticated but not encrypted (e.g., headers).
            </p>
          </motion.div>
        </div>

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-4 flex gap-3"
        >
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-300">
            <p className="font-semibold text-blue-300 mb-1">What's Happening?</p>
            <p>ASCON is gathering your secret key, unique nonce, and your message. All pieces are ready to build the encryption engine.</p>
          </div>
        </motion.div>

        {/* Challenge/Mission */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-xl p-4"
        >
          <p className="font-bold text-yellow-300 mb-2">Mission: Understand Your Inputs</p>
          <p className="text-sm text-zinc-300 mb-4">
            Each of these four values plays a critical role in keeping your data safe. Try editing the message above to see how it changes!
          </p>
          <div className="text-xs text-zinc-400">
            📝 <span className="font-mono">{plaintext.length}</span> characters ready for encryption
          </div>
        </motion.div>
      </motion.div>

      {/* Footer Action */}
      <div className="shrink-0 border-t border-white/10 px-8 py-4 flex justify-end">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-6 py-3 rounded-lg transition-all shadow-lg hover:shadow-blue-500/30"
        >
          Continue to State <ChevronRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
