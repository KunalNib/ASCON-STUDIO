"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { Fingerprint, ArrowDown, ArrowRight } from "lucide-react";
import { DEMO_ASSOC_DATA } from "@/lib/asconDemoData";

// Split AD into 8-byte blocks for demo
const AD_BLOCKS = ["ESP32-ST", "ATION-1\x80"]; // padded
const BLOCK_COLORS = ["bg-emerald-900/20 border-emerald-500/30 text-emerald-100", "bg-zinc-900 border-zinc-700 text-zinc-400"];

export function AssociatedDataFlow() {
  const [showAlt, setShowAlt] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 400);
    const t2 = setTimeout(() => setStep(2), 1000);
    const t3 = setTimeout(() => setStep(3), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [showAlt]);

  const AD_BYTES = DEMO_ASSOC_DATA.split("").map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0"));

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-8 max-w-4xl mx-auto gap-6 overflow-y-auto custom-scrollbar">

      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Fingerprint className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          Associated Data Authentication
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-xl text-sm leading-relaxed">
          AD (like packet headers or device IDs) is publicly known but must be <em>cryptographically bound</em> to the
          ciphertext. ASCON absorbs it into the state before encryption — tampering with AD
          completely invalidates the authentication tag.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex gap-2 bg-white/80 dark:bg-black/60 border border-zinc-200 dark:border-white/10 p-1.5 rounded-2xl shrink-0 shadow-sm dark:shadow-none">
        <button
          onClick={() => setShowAlt(false)}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${!showAlt ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
        >
          With Associated Data
        </button>
        <button
          onClick={() => setShowAlt(true)}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${showAlt ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"}`}
        >
          Without AD (Empty)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showAlt ? (
          <motion.div
            key="with-ad"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-5 w-full"
          >
            {/* Step 1: AD string */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: step >= 1 ? 1 : 0, x: step >= 1 ? 0 : -20 }}
              className="flex flex-col items-center gap-3 w-full"
            >
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-bold">
                Associated Data String
              </div>
              <div className="flex gap-1.5 flex-wrap justify-center">
                {AD_BYTES.map((b, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : -12 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className="text-xs text-zinc-500 dark:text-zinc-600 font-mono">{DEMO_ASSOC_DATA[i] ?? "·"}</div>
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center font-mono text-emerald-700 dark:text-emerald-200 text-xs font-bold">
                      {b}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Arrow + XOR action */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: 1, scaleY: 1 }}
                  className="flex flex-col items-center gap-1"
                >
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="text-emerald-600 dark:text-emerald-500"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </motion.div>
                  <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-500/30 shadow-sm dark:shadow-none rounded-2xl px-5 py-2.5">
                    <span className="text-emerald-600 dark:text-emerald-400 text-xl font-bold">⊕</span>
                    <div className="text-xs text-emerald-700 dark:text-emerald-300 font-bold uppercase tracking-widest">
                      XOR into State x0 (Rate)
                    </div>
                  </div>
                  <motion.div
                    animate={{ y: [0, 6, 0] }}
                    transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}
                    className="text-emerald-600 dark:text-emerald-500"
                  >
                    <ArrowDown className="w-5 h-5" />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step 3: State update */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring" }}
                  className="flex flex-col items-center gap-4 w-full"
                >
                  <div className="grid grid-cols-5 gap-2 w-full max-w-lg">
                    {["x0", "x1", "x2", "x3", "x4"].map((label, i) => (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, type: "spring" }}
                        className={`flex flex-col items-center py-3 rounded-xl border text-xs font-bold text-center ${
                          i === 0
                            ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                            : "bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-500"
                        }`}
                      >
                        <span className="font-mono">{label}</span>
                        {i === 0 && (
                          <span className="text-[9px] text-emerald-600 dark:text-emerald-500 mt-1">AD absorbed</span>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-none rounded-2xl px-5 py-2.5">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">→</span>
                    <span className="text-xs text-purple-700 dark:text-purple-300 font-bold uppercase tracking-widest">p⁸ Permutation applied</span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-500 text-center max-w-md">
                    The AD is now permanently entangled into the state. Any change to it — even 1 bit —
                    will produce a completely different authentication tag at the end.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        ) : (
          <motion.div
            key="no-ad"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-6 w-full max-w-xl text-center"
          >
            <div className="text-5xl text-zinc-400 dark:text-zinc-600">∅</div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">No Associated Data</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
              When AD is empty, ASCON does NOT run the p⁸ intermediate permutation.
              Instead, it sets a <span className="text-rose-600 dark:text-rose-400 font-bold">domain separation</span> bit
              to signal "no AD" before moving to plaintext absorption.
            </p>

            <div className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-white/10 rounded-2xl p-5 font-mono flex items-center gap-3 justify-center flex-wrap">
              <div className="text-zinc-700 dark:text-zinc-400 text-sm">STATE_END_OF_INIT</div>
              <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 px-3 py-2 rounded-lg text-rose-700 dark:text-rose-300 text-sm font-bold"
              >
                x4 ⊕= 0x01
              </motion.div>
              <ArrowRight className="w-4 h-4 text-zinc-400 dark:text-zinc-600" />
              <div className="text-emerald-600 dark:text-emerald-400 text-sm font-bold">PLAINTEXT_READY</div>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-600">
              This ensures the domain of the AD phase and plaintext phase are
              always mathematically separate, even when AD is empty.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
