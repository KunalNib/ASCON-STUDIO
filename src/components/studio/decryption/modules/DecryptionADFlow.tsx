"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { Fingerprint, ArrowDown, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { DEMO_ASSOC_DATA } from "@/lib/asconDemoData";

export function DecryptionADFlow() {
  const { decryptionAssociatedData, decryptionTampered, setDecryptionTampered } = useAsconStore();
  const [activeStep, setActiveStep] = useState(0);

  const adText = decryptionTampered ? "ESP32-MALICIOUS-ROUTER" : decryptionAssociatedData || DEMO_ASSOC_DATA;
  const adBytes = Array.from(adText).map((c) =>
    c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0")
  );

  return (
    <div className="w-full h-full flex flex-col items-center p-4 md:p-6 max-w-4xl mx-auto gap-5 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Fingerprint className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          Associated Data (AD) Re-absorption &amp; Integrity Binding
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-xl text-sm leading-relaxed">
          The receiver re-absorbs cleartext header bytes into state word <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">x0</code>.
          Tampering with routing metadata alters the sponge trajectory before ciphertext is ever read.
        </p>
      </div>

      {/* Tamper Switch Banner */}
      <div className="flex items-center gap-3 bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 p-2 rounded-2xl shadow-sm">
        <button
          onClick={() => setDecryptionTampered(false)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            !decryptionTampered
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
          Authentic Header (ESP32-STATION-1)
        </button>
        <button
          onClick={() => setDecryptionTampered(true)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            decryptionTampered
              ? "bg-rose-600 text-white shadow-sm"
              : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 inline mr-1.5" />
          Tampered Header (Attacker Injected)
        </button>
      </div>

      {/* Main Flow Canvas */}
      <div className="w-full flex flex-col items-center gap-4 bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
        {/* Step 1: AD Bytes Incoming */}
        <div className="w-full flex flex-col items-center gap-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
            Received Cleartext Header: &quot;{adText}&quot;
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center max-w-xl">
            {adBytes.map((b, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`w-9 h-9 rounded-xl border flex items-center justify-center font-mono text-xs font-bold ${
                  decryptionTampered
                    ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400"
                    : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300"
                }`}
              >
                {b}
              </motion.div>
            ))}
          </div>
        </div>

        <ArrowDown className="w-5 h-5 text-zinc-400 animate-bounce my-1" />

        {/* Step 2: Rate Word XOR & Permutation */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Duplex Rate Word XOR</span>
            <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
              x0 ← x0 ⊕ AD_Block[0]
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Padded AD is XORed into the top 64-bit register (x0), folding unencrypted metadata into the sponge.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/5 flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-zinc-500">Domain Separation</span>
            <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200">
              x4 ← x4 ⊕ 0x0000000000000001
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              A 1-bit domain separator is XORed into x4 after AD absorption to prevent length extension attacks.
            </p>
          </div>
        </div>

        {/* State trajectory callout */}
        <div
          className={`w-full p-4 rounded-2xl border flex items-center gap-3 text-xs ${
            decryptionTampered
              ? "bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-200"
              : "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
          }`}
        >
          {decryptionTampered ? (
            <>
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <strong>Warning: State Divergence Detected! </strong>
                Because AD was tampered with, internal state register x0 is now completely desynchronized from the sender.
                While ciphertext can still be XORed in Step 4, the final authentication tag in Step 6 will fail.
              </div>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <strong>State Synchronized: </strong>
                The associated data matches the sender perfectly. The internal state trajectory remains identical
                to the encryption machine.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
