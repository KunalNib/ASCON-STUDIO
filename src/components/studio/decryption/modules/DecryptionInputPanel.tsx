"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Key,
  Hash,
  Fingerprint,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Binary,
  Lock,
  Unlock,
} from "lucide-react";
import {
  DEMO_CIPHERTEXT,
  DEMO_AUTH_TAG,
  TAMPERED_CIPHERTEXT,
  TAMPERED_AUTH_TAG,
} from "@/lib/asconDemoData";

export function DecryptionInputPanel() {
  const {
    session,
    decryptionCiphertext,
    decryptionAuthTag,
    decryptionKey,
    decryptionNonce,
    decryptionAssociatedData,
    decryptionTampered,
    setDecryptionTampered,
    setDecryptionCiphertext,
    setDecryptionAuthTag,
    syncDecryptionFromEncryption,
  } = useAsconStore();

  const [activeTab, setActiveTab] = useState<"payloads" | "tamper" | "bytes">("payloads");

  const ctBytes = useMemo(() => {
    return (decryptionCiphertext || DEMO_CIPHERTEXT).trim().split(/\s+/);
  }, [decryptionCiphertext]);

  const tagBytes = useMemo(() => {
    return (decryptionAuthTag || DEMO_AUTH_TAG).trim().split(/\s+/);
  }, [decryptionAuthTag]);

  const handleToggleTamper = () => {
    const nextTamper = !decryptionTampered;
    setDecryptionTampered(nextTamper);
    if (nextTamper) {
      setDecryptionCiphertext(TAMPERED_CIPHERTEXT);
      setDecryptionAuthTag(TAMPERED_AUTH_TAG);
    } else {
      setDecryptionCiphertext(session.ciphertext || DEMO_CIPHERTEXT);
      setDecryptionAuthTag(session.authenticationTag || DEMO_AUTH_TAG);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-4 md:p-6 max-w-4xl mx-auto gap-4 overflow-y-auto custom-scrollbar">
      {/* Live status badge & sync button */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold ${
            decryptionTampered
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/40 text-rose-700 dark:text-rose-400"
              : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400"
          }`}
        >
          {decryptionTampered ? (
            <>
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Attacker Mode: Bit-Flipped Malicious Payload</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Authentic Payload: Valid Ciphertext &amp; Signature</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={syncDecryptionFromEncryption}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 hover:border-emerald-500/50 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
            title="Import current Ciphertext and Tag from Encryption Lab"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync from Encryption Lab</span>
          </button>

          <button
            onClick={handleToggleTamper}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
              decryptionTampered
                ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                : "bg-rose-600 hover:bg-rose-500 text-white"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{decryptionTampered ? "Restore Authentic Payload" : "Simulate Bit Tamper"}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 bg-white/80 dark:bg-black/60 border border-zinc-200 dark:border-white/10 p-1.5 rounded-2xl w-full max-w-lg shrink-0 shadow-sm">
        {(["payloads", "tamper", "bytes"] as const).map((tab) => {
          const labels = {
            payloads: "① Ciphertext & Tag",
            tamper: "② Tamper Attack Demo",
            bytes: "③ Byte Inspector",
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
              }`}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === "payloads" && (
          <motion.div
            key="tab-payloads"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full flex flex-col gap-4"
          >
            {/* Ciphertext Card */}
            <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Received Ciphertext (C)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">
                  {ctBytes.length} bytes (64-bit block)
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {ctBytes.map((b, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-xl font-mono text-xs font-bold border transition-colors ${
                      decryptionTampered && idx === 0
                        ? "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse"
                        : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-300"
                    }`}
                  >
                    {b}
                  </div>
                ))}
              </div>

              {decryptionTampered && (
                <div className="text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Byte 0 modified from A0 to B0 (Bit-4 flipped by adversary).</span>
                </div>
              )}
            </div>

            {/* Authentication Tag Card */}
            <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    Authentication Tag (T)
                  </span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">128 bits (16 bytes MAC)</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {tagBytes.map((b, idx) => (
                  <div
                    key={idx}
                    className={`px-2.5 py-1.5 rounded-lg font-mono text-xs font-bold border ${
                      decryptionTampered && idx === 0
                        ? "bg-rose-500/20 border-rose-500 text-rose-600 dark:text-rose-400"
                        : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {b}
                  </div>
                ))}
              </div>
            </div>

            {/* Key, Nonce, AD Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] uppercase font-bold">
                  <Key className="w-3.5 h-3.5 text-amber-500" /> Shared Key (128-bit)
                </div>
                <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {decryptionKey}
                </div>
              </div>

              <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] uppercase font-bold">
                  <Binary className="w-3.5 h-3.5 text-rose-500" /> Public Nonce (128-bit)
                </div>
                <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {decryptionNonce}
                </div>
              </div>

              <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-zinc-500 text-[11px] uppercase font-bold">
                  <Fingerprint className="w-3.5 h-3.5 text-blue-500" /> Associated Data
                </div>
                <div className="font-mono text-xs text-zinc-900 dark:text-zinc-100 truncate">
                  {decryptionAssociatedData}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "tamper" && (
          <motion.div
            key="tab-tamper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Adversary Simulation: Ciphertext &amp; Forgery Testing
              </h3>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              In traditional unauthenticated ciphers (e.g. standard CBC mode without HMAC or CTR mode),
              attackers can flip bits in the ciphertext to alter destination IP addresses, bank amounts,
              or commands. ASCON is an <strong>AEAD cipher</strong>; any bit changed in transit will cause
              the calculated candidate tag to catastrophically diverge, failing verification at Step 6.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div
                onClick={() => {
                  setDecryptionTampered(false);
                  setDecryptionCiphertext(session.ciphertext || DEMO_CIPHERTEXT);
                  setDecryptionAuthTag(session.authenticationTag || DEMO_AUTH_TAG);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  !decryptionTampered
                    ? "bg-emerald-500/10 border-emerald-500 shadow-sm"
                    : "bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Mode A: Legitimate Message
                  </span>
                  {!decryptionTampered && (
                    <span className="text-[10px] font-bold uppercase bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Transmits valid ciphertext matching the cryptographic tag. Decryption will pass verification
                  and unlock &quot;Hello IoT&quot;.
                </p>
              </div>

              <div
                onClick={() => {
                  setDecryptionTampered(true);
                  setDecryptionCiphertext(TAMPERED_CIPHERTEXT);
                  setDecryptionAuthTag(TAMPERED_AUTH_TAG);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  decryptionTampered
                    ? "bg-rose-500/10 border-rose-500 shadow-sm"
                    : "bg-zinc-50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/10 hover:border-zinc-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" /> Mode B: Tampered / Man-in-the-Middle
                  </span>
                  {decryptionTampered && (
                    <span className="text-[10px] font-bold uppercase bg-rose-600 text-white px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                  Simulates a 1-bit injection attack on byte 0. Step 6 will trigger an authentication alert
                  and safely wipe tentative plaintext.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "bytes" && (
          <motion.div
            key="tab-bytes"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Binary &amp; Hex Bit-Level Inspector
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {ctBytes.map((hexByte, i) => {
                const dec = parseInt(hexByte, 16) || 0;
                const bin = dec.toString(2).padStart(8, "0");
                return (
                  <div
                    key={i}
                    className="p-3 bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 rounded-xl flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                      <span>Byte {i}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">0x{hexByte}</span>
                    </div>
                    <div className="font-mono text-[11px] tracking-wider text-zinc-900 dark:text-zinc-100 font-bold">
                      {bin.slice(0, 4)} {bin.slice(4)}
                    </div>
                    <div className="text-[10px] text-zinc-400">Dec: {dec}</div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
