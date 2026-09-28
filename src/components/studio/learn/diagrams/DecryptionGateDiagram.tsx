"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle, ArrowRight, Lock, Unlock, AlertTriangle, RefreshCw } from "lucide-react";

export function DecryptionGateDiagram() {
  const [isTampered, setIsTampered] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [gateStatus, setGateStatus] = useState<"idle" | "granted" | "denied">("idle");

  const runVerification = () => {
    setIsVerifying(true);
    setGateStatus("idle");
    setTimeout(() => {
      setIsVerifying(false);
      setGateStatus(isTampered ? "denied" : "granted");
    }, 1200);
  };

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Zero-Trust Quarantine &amp; Release
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Decryption Authentication Gate
          </h4>
        </div>

        {/* Tamper Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsTampered(!isTampered);
              setGateStatus("idle");
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isTampered
                ? "bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]"
                : "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {isTampered ? <ShieldAlert className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            {isTampered ? "Tampered Payload (Bit 0 Flipped)" : "Authentic Payload (Untampered)"}
          </button>
        </div>
      </div>

      {/* Main Gate Workflow Diagram */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row items-stretch justify-between gap-4">
        {/* Step 1: Ingestion & Quarantine Zone */}
        <div className="flex-1 bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              1. Ingestion Buffer
            </span>
            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
              Quarantined
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
              <span className="text-[10px] text-zinc-500 block">Received Ciphertext</span>
              <span className={`font-bold ${isTampered ? "text-rose-600 dark:text-rose-400" : "text-zinc-900 dark:text-white"}`}>
                {isTampered ? "9B A1 FF 04 22 19 88 DE" : "8A A1 FF 04 22 19 88 DE"}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
              <span className="text-[10px] text-zinc-500 block">Received Tag (T)</span>
              <span className="text-zinc-700 dark:text-zinc-300 font-bold">
                E4 8A 19 C0 ... 3B (128-bit)
              </span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 italic">
            Plaintext is never released until Tag is verified!
          </p>
        </div>

        {/* Step 2: Constant-Time Tag Verification Core */}
        <div className="flex-1 bg-white dark:bg-zinc-900/60 border-2 border-purple-400 dark:border-purple-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
              2. Squeeze &amp; Verify
            </span>
            <span className="text-[10px] bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-mono font-bold">
              p¹² Core
            </span>
          </div>

          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 text-center font-mono text-xs space-y-1">
            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">
              Candidate Tag (T*)
            </span>
            <div className={`font-bold text-sm ${isTampered ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
              {isTampered ? "01 F9 CC 72 ... 99" : "E4 8A 19 C0 ... 3B"}
            </div>
            <span className="text-[10px] text-zinc-500 block">
              Constant-Time: <code className="bg-purple-200 dark:bg-purple-900/50 px-1 rounded">crypto_verify_16(T*, T)</code>
            </span>
          </div>

          <button
            onClick={runVerification}
            disabled={isVerifying}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
          >
            {isVerifying ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                  <RefreshCw className="w-3.5 h-3.5" />
                </motion.div>
                Evaluating MAC...
              </>
            ) : (
              "Test Verification Gate"
            )}
          </button>
        </div>

        {/* Step 3: Zero-Trust Output Gate */}
        <div className={`flex-1 rounded-2xl p-4 flex flex-col justify-between space-y-3 border-2 transition-all ${
          gateStatus === "granted"
            ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200"
            : gateStatus === "denied"
            ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-200"
            : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider">
              3. Release Gate
            </span>
            {gateStatus === "granted" && <CheckCircle className="w-4 h-4 text-emerald-500" />}
            {gateStatus === "denied" && <XCircle className="w-4 h-4 text-rose-500" />}
            {gateStatus === "idle" && <Lock className="w-4 h-4 text-zinc-400" />}
          </div>

          <div className="flex flex-col items-center justify-center p-3 text-center">
            {gateStatus === "idle" && (
              <span className="text-xs text-zinc-500">
                Click "Test Verification Gate" to see the authentication outcome.
              </span>
            )}
            {gateStatus === "granted" && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 block">
                  AUTHENTICATION PASSED
                </span>
                <span className="text-xs font-mono font-bold bg-white dark:bg-black/60 px-2 py-1 rounded border border-emerald-300 dark:border-emerald-500/40 block">
                  "27.4 °C (Valid)"
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                  Plaintext safely delivered to user application.
                </span>
              </motion.div>
            )}
            {gateStatus === "denied" && (
              <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="space-y-1">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-300 block">
                  SECURITY ABORT (⊥)
                </span>
                <span className="text-xs font-mono font-bold bg-white dark:bg-black/60 px-2 py-1 rounded border border-rose-300 dark:border-rose-500/40 block text-rose-500 line-through">
                  SHREDDED (0x00)
                </span>
                <span className="text-[10px] text-rose-600 dark:text-rose-400">
                  Tampering detected! Candidate plaintext wiped immediately.
                </span>
              </motion.div>
            )}
          </div>

          <span className="text-[10px] text-zinc-500 text-center block">
            {gateStatus === "denied" ? "Protected against CCA2 plaintext leaks" : "AEAD guarantees authenticity"}
          </span>
        </div>
      </div>
    </div>
  );
}
