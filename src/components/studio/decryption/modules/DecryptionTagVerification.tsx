"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Unlock,
  Lock,
  FileCheck,
  AlertTriangle,
} from "lucide-react";
import {
  AUTH_TAG_BYTES,
  TAMPERED_CANDIDATE_TAG,
  TAMPERED_AUTH_TAG,
} from "@/lib/asconDemoData";

export function DecryptionTagVerification() {
  const {
    decryptionTampered,
    setDecryptionTampered,
    decryptionRecoveredPlaintext,
    decryptionAuthTag,
    decryptionCiphertext,
  } = useAsconStore();

  const [verifying, setVerifying] = useState(false);
  const [checkedBytesCount, setCheckedBytesCount] = useState(0);
  const [verifiedResult, setVerifiedResult] = useState<"pass" | "fail" | null>(null);

  const candidateTag = decryptionTampered ? TAMPERED_CANDIDATE_TAG : AUTH_TAG_BYTES;
  const receivedTag = (decryptionAuthTag || AUTH_TAG_BYTES.join(" ")).trim().split(/\s+/);

  const startConstantTimeVerification = () => {
    setVerifying(true);
    setCheckedBytesCount(0);
    setVerifiedResult(null);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setCheckedBytesCount(count);
      if (count >= 16) {
        clearInterval(interval);
        setVerifying(false);
        setVerifiedResult(decryptionTampered ? "fail" : "pass");
      }
    }, 80);
  };

  useEffect(() => {
    startConstantTimeVerification();
  }, [decryptionTampered]);

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar items-center">
      {/* Header */}
      <div className="text-center shrink-0">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          {verifiedResult === "fail" ? (
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-500" />
          ) : (
            <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          )}
          Constant-Time Tag Verification &amp; Release Gate
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">
          The ultimate security frontier in AEAD. Candidate Tag <code className="font-mono font-bold text-emerald-600 dark:text-emerald-400">T*</code> is
          compared byte-for-byte in constant time against received Tag <code className="font-mono font-bold text-zinc-800 dark:text-zinc-200">T</code>.
          If any byte mismatches, tentative plaintext is obliterated.
        </p>
      </div>

      {/* Mode Toggle Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Test Scenarios:</span>
          <button
            onClick={() => setDecryptionTampered(false)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !decryptionTampered
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            Scenario 1: Legitimate Message (Pass)
          </button>
          <button
            onClick={() => setDecryptionTampered(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              decryptionTampered
                ? "bg-rose-600 text-white shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300"
            }`}
          >
            Scenario 2: Tampered Attack (Fail)
          </button>
        </div>

        <button
          onClick={startConstantTimeVerification}
          disabled={verifying}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-black rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Re-verify Tags</span>
        </button>
      </div>

      {/* Side-by-Side Tag Comparison Grid */}
      <div className="w-full bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Candidate Tag Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                1. Calculated Candidate Tag (T*)
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-mono">From Local State</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {candidateTag.map((byte, i) => {
                const isChecked = i < checkedBytesCount;
                const isMatch = isChecked && byte === receivedTag[i];
                return (
                  <div
                    key={i}
                    className={`h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      !isChecked
                        ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-400"
                        : isMatch
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {byte}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Received Tag Column */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                2. Received Authentication Tag (T)
              </span>
              <span className="text-[10px] text-zinc-400 uppercase font-mono">From Packet Header</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {receivedTag.map((byte, i) => {
                const isChecked = i < checkedBytesCount;
                const isMatch = isChecked && byte === candidateTag[i];
                return (
                  <div
                    key={i}
                    className={`h-10 rounded-xl border flex items-center justify-center font-mono text-xs font-bold transition-all ${
                      !isChecked
                        ? "bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-white/5 text-zinc-400"
                        : isMatch
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {byte}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Progress Bar of Constant-Time Check */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Constant-Time Comparison Progress:</span>
            <span>{checkedBytesCount} / 16 bytes</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                verifiedResult === "fail"
                  ? "bg-rose-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-400"
              }`}
              style={{ width: `${(checkedBytesCount / 16) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Final Release Outcome Card */}
      <AnimatePresence mode="wait">
        {verifiedResult === "pass" && (
          <motion.div
            key="outcome-pass"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
                <Unlock className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Authentication Passed
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                    Zero Tampering
                  </span>
                </div>
                <h3 className="text-lg font-bold text-emerald-950 dark:text-white">
                  Plaintext Safely Released to Application
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300">
                  Message integrity is cryptographically guaranteed by ASCON-128 AEAD.
                </p>
              </div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-black/60 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 font-mono text-base font-black shadow-inner">
              &quot;{decryptionRecoveredPlaintext}&quot;
            </div>
          </motion.div>
        )}

        {verifiedResult === "fail" && (
          <motion.div
            key="outcome-fail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 rounded-3xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-5"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 shrink-0">
                <Lock className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">
                    Tamper Detected: Verification Failed
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold">
                    Payload Rejected
                  </span>
                </div>
                <h3 className="text-lg font-bold text-rose-950 dark:text-white">
                  Tentative Plaintext Obliterated
                </h3>
                <p className="text-xs text-rose-800 dark:text-rose-300 max-w-xl">
                  NIST SP 800-232 rule enforced: Plaintext is purged to prevent decryption oracle attacks.
                  Never release unverified data!
                </p>
              </div>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-rose-950 text-rose-300 font-mono text-xs font-bold border border-rose-500/40 shadow-inner">
              [SUPPRESSED &amp; PURGED]
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
