"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { Key, CheckCircle, ShieldX, ShieldAlert, Lock } from "lucide-react";
import {
  AUTH_TAG_BYTES,
  FINAL_STATE_BEFORE_TAG,
  DEMO_AUTH_TAG,
  DEMO_KEY,
} from "@/lib/asconDemoData";

export function FinalizationAndTag() {
  const { session } = useAsconStore();
  const [tampered, setTampered] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<"match" | "mismatch" | null>(null);
  const [squeezeStep, setSqueezeStep] = useState(0);
  const [visibleTagBytes, setVisibleTagBytes] = useState(0);

  // Auto-animate tag squeeze on mount
  useEffect(() => {
    setSqueezeStep(0);
    setVisibleTagBytes(0);
    const t1 = setTimeout(() => setSqueezeStep(1), 500);
    const t2 = setTimeout(() => setSqueezeStep(2), 1200);
    const t3 = setTimeout(() => {
      setSqueezeStep(3);
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setVisibleTagBytes(count);
        if (count >= 16) clearInterval(interval);
      }, 100);
    }, 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const handleVerify = () => {
    setVerifying(true);
    setResult(null);
    setTimeout(() => {
      setVerifying(false);
      setResult(tampered ? "mismatch" : "match");
    }, 1500);
  };

  const displayTag = session?.authenticationTag || DEMO_AUTH_TAG;

  const stateWords = [
    { label: "x0", bytes: FINAL_STATE_BEFORE_TAG.x0, role: "Rate",     dim: true },
    { label: "x1", bytes: FINAL_STATE_BEFORE_TAG.x1, role: "Rate",     dim: true },
    { label: "x2", bytes: FINAL_STATE_BEFORE_TAG.x2, role: "Capacity", dim: true },
    { label: "x3", bytes: FINAL_STATE_BEFORE_TAG.x3, role: "Tag[0:7]", dim: false, color: "emerald" },
    { label: "x4", bytes: FINAL_STATE_BEFORE_TAG.x4, role: "Tag[8:15]",dim: false, color: "emerald" },
  ];

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar items-center">

      {/* Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          Finalization &amp; 128-bit Authentication Tag
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-xl text-sm leading-relaxed">
          After encrypting all plaintext, ASCON re-absorbs the secret key and runs one final p¹² permutation.
          The bottom two words (x3, x4) are XORed with the key to produce the 128-bit MAC tag.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 w-full">

        {/* Left — Tag Generation */}
        <div className="flex-1 bg-white dark:bg-black rounded-3xl border border-zinc-200 dark:border-white/5 p-5 flex flex-col gap-4 shadow-sm dark:shadow-xl relative overflow-hidden">
          <h3 className="text-blue-600 dark:text-blue-400 uppercase tracking-widest text-[10px] font-bold">Tag Extraction Phase</h3>

          {/* State matrix — mini view */}
          <div className="flex flex-col gap-1.5">
            {stateWords.map((w, i) => (
              <motion.div
                key={w.label}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`flex items-center gap-2 p-2.5 rounded-xl border ${
                  w.dim
                    ? "bg-zinc-100 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 opacity-40"
                    : squeezeStep >= 1
                    ? "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-xs border ${
                  w.dim ? "bg-zinc-200 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-500" : "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                }`}>
                  {w.label}
                </span>
                <div className="flex gap-0.5 flex-1">
                  {w.bytes.map((b, bi) => (
                    <div key={bi} className={`flex-1 h-6 text-[10px] font-mono flex items-center justify-center rounded ${
                      w.dim ? "text-zinc-500 dark:text-zinc-700" : squeezeStep >= 2 ? "text-emerald-600 dark:text-emerald-300 font-bold" : "text-zinc-500 dark:text-zinc-400"
                    }`}>
                      {b}
                    </div>
                  ))}
                </div>
                <span className={`text-[9px] font-bold shrink-0 ${w.dim ? "text-zinc-500 dark:text-zinc-700" : "text-emerald-600 dark:text-emerald-500"}`}>
                  {w.role}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Key XOR step */}
          <AnimatePresence>
            {squeezeStep >= 1 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/20 rounded-xl p-3 flex items-center gap-3 text-xs overflow-hidden"
              >
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-amber-700 dark:text-amber-300 font-bold">x3 ⊕ Key[0:7], x4 ⊕ Key[8:15]</span>
                <span className="text-zinc-500 dark:text-zinc-600 font-mono truncate ml-auto text-[10px]">{DEMO_KEY.slice(0, 16)}...</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* p^12 wheel */}
          <AnimatePresence>
            {squeezeStep >= 2 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex justify-center"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-full border-4 border-blue-500/30 border-t-blue-500 flex items-center justify-center text-zinc-900 dark:text-white font-bold text-xs"
                  >
                    p¹²
                  </motion.div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">Final permutation<br /><span className="text-zinc-500 dark:text-zinc-600">12 rounds running...</span></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tag bytes squeeze out */}
          <AnimatePresence>
            {squeezeStep >= 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-emerald-50 dark:bg-emerald-950/30 border-2 border-emerald-200 dark:border-emerald-500/40 rounded-2xl p-4 shadow-sm dark:shadow-[0_0_25px_rgba(16,185,129,0.15)]"
              >
                <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest mb-3 text-center">
                  128-bit Authentication Tag (squeezing out)
                </div>
                <div className="flex gap-1.5 flex-wrap justify-center">
                  {AUTH_TAG_BYTES.map((b, i) => (
                    <AnimatePresence key={i}>
                      {i < visibleTagBytes ? (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.4, y: -15 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                          className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-600/30 border border-emerald-300 dark:border-emerald-400/50 flex items-center justify-center font-mono text-xs text-emerald-700 dark:text-emerald-100 font-bold shadow-sm dark:shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                        >
                          {b}
                        </motion.div>
                      ) : (
                        <div className="w-9 h-9 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800" />
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right — Verification */}
        <div className="flex-1 bg-zinc-50 dark:bg-[#09090b] rounded-3xl border border-zinc-200 dark:border-white/5 p-5 flex flex-col gap-4 shadow-sm dark:shadow-xl">
          <h3 className="text-purple-600 dark:text-purple-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4" /> Interactive Tag Verification
          </h3>

          <p className="text-xs text-zinc-600 dark:text-zinc-500 leading-relaxed">
            On the receiver's side: they recompute the tag using the same key and compare it.
            Toggle a tampered bit to see how even 1 bit change causes total mismatch.
          </p>

          <div className="space-y-3">
            <div className="bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm dark:shadow-none">
              <span className="text-zinc-500 text-xs shrink-0">Received Ciphertext</span>
              <button
                onClick={() => { setTampered(!tampered); setResult(null); }}
                className={`px-3 py-1.5 text-xs rounded-full font-bold transition-all ${
                  !tampered
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                    : "bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.5)] animate-pulse"
                }`}
              >
                {tampered ? "⚠ Bit Flipped! (Tampered)" : "Original — Click to Tamper"}
              </button>
            </div>

            <div className="bg-white dark:bg-black/50 border border-zinc-200 dark:border-white/5 p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm dark:shadow-none">
              <span className="text-zinc-500 text-xs shrink-0">Received Tag</span>
              <span className={`font-mono text-xs transition-colors ${tampered ? "text-rose-500 dark:text-rose-400 line-through opacity-50" : "text-zinc-700 dark:text-zinc-300"}`}>
                {displayTag.slice(0, 23)}...
              </span>
            </div>
          </div>

          <button
            onClick={handleVerify}
            disabled={verifying}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]"
          >
            {verifying ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <Key className="w-4 h-4" />
                </motion.div>
                Recomputing tag...
              </>
            ) : "Authenticate Payload"}
          </button>

          {/* Result */}
          <div className="flex-1 flex items-center justify-center min-h-[100px]">
            <AnimatePresence mode="wait">
              {result === "match" && (
                <motion.div
                  key="match"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="flex flex-col items-center text-emerald-600 dark:text-emerald-500 gap-2"
                >
                  <CheckCircle className="w-12 h-12 shadow-[0_0_30px_rgba(16,185,129,0.4)] rounded-full" />
                  <span className="font-bold tracking-widest uppercase text-sm">Tag Match — Message Verified!</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 text-center max-w-xs">
                    The recomputed tag matches the received tag exactly. The data is authentic and unmodified.
                  </p>
                </motion.div>
              )}
              {result === "mismatch" && (
                <motion.div
                  key="mismatch"
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring" }}
                  className="flex flex-col items-center text-rose-600 dark:text-rose-500 gap-2"
                >
                  <ShieldX className="w-12 h-12 shadow-[0_0_30px_rgba(225,29,72,0.4)] rounded-full" />
                  <span className="font-bold tracking-widest uppercase text-sm">Avalanche! Tag Mismatch!</span>
                  <p className="text-xs text-zinc-600 dark:text-zinc-500 text-center max-w-xs">
                    Even 1 flipped bit in the ciphertext causes the entire 128-bit tag to differ completely.
                    This is the Strict Avalanche Effect in action.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
