"use client";

import React, { useState } from "react";
import { Ascon128 } from "@/lib/ascon";
import { Lock, Unlock, ShieldAlert, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";

export function AeadEnvelopeSandbox() {
  const [pt, setPt] = useState("Temp: 24.5C");
  const [ad, setAd] = useState("SENSOR-ROOM-1");
  const [tamperType, setTamperType] = useState<"none" | "ad" | "ciphertext" | "tag">("none");

  const key = "000102030405060708090A0B0C0D0E0F";
  const nonce = "000102030405060708090A0B0C0D0E0F";

  const encrypted = React.useMemo(() => {
    return Ascon128.encryptAEAD(pt, key, nonce, ad);
  }, [pt, ad]);

  // Compute decryption test based on tamper selection
  const decryptionResult = React.useMemo(() => {
    const testCiphertext =
      tamperType === "ciphertext" && encrypted.ciphertext.length >= 2
        ? (parseInt(encrypted.ciphertext.slice(0, 2), 16) ^ 0xff).toString(16).padStart(2, "0") + encrypted.ciphertext.slice(2)
        : encrypted.ciphertext;

    const testAD = tamperType === "ad" ? `${ad}-TAMPERED` : ad;

    const testTag =
      tamperType === "tag" && encrypted.authenticationTag.length >= 2
        ? (parseInt(encrypted.authenticationTag.slice(0, 2), 16) ^ 0x01).toString(16).padStart(2, "0") + encrypted.authenticationTag.slice(2)
        : encrypted.authenticationTag;

    return Ascon128.decryptAEAD(testCiphertext, key, nonce, testAD, testTag);
  }, [encrypted, tamperType, ad]);

  return (
    <div className="w-full bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-3">
        <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
          <Lock className="w-4 h-4" /> Live AEAD Postal Envelope Sandbox
        </span>
        <span className="text-xs font-mono text-zinc-500">
          Sender → Transmitter → Receiver
        </span>
      </div>

      {/* Input Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Plaintext (Secret Letter Inside Envelope):
          </label>
          <input
            type="text"
            value={pt}
            onChange={(e) => setPt(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
            Associated Data (Readable Address On Envelope):
          </label>
          <input
            type="text"
            value={ad}
            onChange={(e) => setAd(e.target.value)}
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-zinc-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tamper Selector */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block">
          Simulate Man-in-the-Middle Network Tampering:
        </span>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "none", label: "No Tampering (Deliver Safely)" },
            { id: "ad", label: "Modify Header (AD)" },
            { id: "ciphertext", label: "Flip Bit in Ciphertext" },
            { id: "tag", label: "Forge 1 Bit in Tag" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTamperType(t.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                tamperType === t.id
                  ? t.id === "none"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-rose-600 text-white shadow-sm"
                  : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Output / Decryption Inspection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs space-y-1.5">
          <span className="text-[10px] text-zinc-500 uppercase font-bold block">128-Bit Authentication Tag</span>
          <div className="font-bold text-purple-600 dark:text-purple-400 break-all">
            {encrypted.authenticationTag}
          </div>
          <span className="text-[10px] text-zinc-400 block">
            Protects integrity of BOTH the Plaintext and the Associated Data.
          </span>
        </div>

        <div className={`p-3.5 rounded-xl border font-mono text-xs space-y-1.5 transition-all ${
          decryptionResult.isValid
            ? "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-400 dark:border-emerald-500/40 text-emerald-900 dark:text-emerald-200"
            : "bg-rose-50/70 dark:bg-rose-950/20 border-rose-400 dark:border-rose-500/40 text-rose-900 dark:text-rose-200"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold">Receiver Verdict</span>
            {decryptionResult.isValid ? (
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400">
                <XCircle className="w-3.5 h-3.5" /> Tampering Rejected (⊥)
              </span>
            )}
          </div>
          <div className="font-bold text-sm">
            {decryptionResult.isValid ? `"${decryptionResult.recoveredPlaintext}"` : "REJECTED (Message Dropped)"}
          </div>
          <span className="text-[10px] opacity-80 block">
            {decryptionResult.isValid
              ? "All bits verified. Sender authenticity confirmed."
              : "MAC mismatch detected in constant-time. Zero plaintext leaked."}
          </span>
        </div>
      </div>
    </div>
  );
}
