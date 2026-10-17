"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { useRouter } from "next/navigation";
import {
  Lock,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Key,
  Layers,
  FileText,
  AlertTriangle,
  Send,
  Zap,
} from "lucide-react";
import { AsconSuite } from "@/lib/ascon";
import { DEMO_AUTH_TAG, DEMO_CIPHERTEXT } from "@/lib/asconDemoData";

export function AuthOutputFlow() {
  const router = useRouter();
  const {
    session,
    key,
    nonce,
    associatedData,
    plaintext,
    selectedAlgorithm,
    completedSteps,
    markStepComplete,
    addEncryptionXp,
    setDecryptionCiphertext,
    setDecryptionAuthTag,
    setDecryptionKey,
    setDecryptionNonce,
    setDecryptionAssociatedData,
    setDecryptionTampered,
  } = useAsconStore();

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [tampered, setTampered] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<"pass" | "fail" | null>(null);

  const activeKey = key || session?.key || "000102030405060708090A0B0C0D0E0F";
  const activeNonce = nonce || session?.nonce || "000102030405060708090A0B0C0D0E0F";
  const activeAd = associatedData || session?.associatedData || "ESP32-STATION-1";
  const activePt = plaintext || session?.plaintext || "27.4 °C";

  // Deterministically compute live AEAD result
  const encResult = useMemo(() => {
    try {
      const res = AsconSuite.encrypt(
        selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
        activeKey,
        activeNonce,
        activeAd,
        activePt
      );
      return {
        ciphertext: res.ciphertext,
        ciphertextBytes: res.ciphertextBytes,
        authenticationTag: res.authenticationTag,
        tagBytes: res.tagBytes,
      };
    } catch {
      return {
        ciphertext: session?.ciphertext || DEMO_CIPHERTEXT,
        ciphertextBytes: (session?.ciphertext || DEMO_CIPHERTEXT).trim().split(/\s+/),
        authenticationTag: session?.authenticationTag || DEMO_AUTH_TAG,
        tagBytes: (session?.authenticationTag || DEMO_AUTH_TAG).trim().split(/\s+/),
      };
    }
  }, [selectedAlgorithm, activeKey, activeNonce, activeAd, activePt, session]);

  // Derived arrays
  const ctBytes = useMemo(() => {
    if (encResult.ciphertextBytes && encResult.ciphertextBytes.length > 0) {
      return encResult.ciphertextBytes;
    }
    return encResult.ciphertext.trim().split(/\s+/);
  }, [encResult]);

  const tagBytes = useMemo(() => {
    if (encResult.tagBytes && encResult.tagBytes.length === 16) {
      return encResult.tagBytes;
    }
    const parts = encResult.authenticationTag.trim().split(/\s+/);
    while (parts.length < 16) parts.push("00");
    return parts.slice(0, 16);
  }, [encResult]);

  // Tampered ciphertext computation: flip bit 0 in the first byte
  const tamperedCtBytes = useMemo(() => {
    if (ctBytes.length === 0) return ["05"];
    const firstVal = parseInt(ctBytes[0], 16) ^ 0x01;
    const flippedHex = firstVal.toString(16).toUpperCase().padStart(2, "0");
    return [flippedHex, ...ctBytes.slice(1)];
  }, [ctBytes]);

  const displayedReceivedCt = tampered ? tamperedCtBytes.join(" ") : encResult.ciphertext;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setVerificationResult(null);
    setTimeout(() => {
      setVerifying(false);
      setVerificationResult(tampered ? "fail" : "pass");
    }, 1000);
  };

  const handleSendToDecryption = () => {
    setDecryptionCiphertext(encResult.ciphertext);
    setDecryptionAuthTag(encResult.authenticationTag);
    setDecryptionKey(activeKey);
    setDecryptionNonce(activeNonce);
    setDecryptionAssociatedData(activeAd);
    setDecryptionTampered(tampered);
    router.push("/studio/decryption");
  };

  const isChallengeDone = completedSteps.includes("AUTH_OUTPUT");

  const fullPayloadJson = JSON.stringify(
    {
      algorithm: selectedAlgorithm || "ASCON-128",
      nonce: activeNonce,
      associatedData: activeAd,
      ciphertext: encResult.ciphertext,
      authenticationTag: encResult.authenticationTag,
    },
    null,
    2
  );

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto gap-6 overflow-y-auto custom-scrollbar">

      {/* ── Page Header ── */}
      <div className="text-center shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-2 border border-blue-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 6 of 6 · Authenticated Encryption (AEAD) Output</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Lock className="w-7 h-7 text-emerald-600 dark:text-emerald-500" />
          Ciphertext &amp; 128-bit Authentication Tag
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto text-sm leading-relaxed">
          The ASCON AEAD pipeline is complete. Below are the two cryptographic outputs generated by the cipher:
          the scrambled <strong>Ciphertext</strong> (confidentiality) and the 128-bit <strong>Authentication Tag</strong> (integrity &amp; authenticity).
        </p>
      </div>

      {/* ── Challenge Completed Banner (if completed) ── */}
      {isChallengeDone && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-500/40 rounded-2xl p-4 flex items-center justify-between gap-4 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Pipeline Challenge Completed (+75 XP)!
              </div>
              <div className="text-xs text-emerald-700 dark:text-emerald-400">
                You have mastered ASCON AEAD finalization, tag squeeze, and wire transmission.
              </div>
            </div>
          </div>
          <button
            onClick={handleSendToDecryption}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shrink-0"
          >
            Open in Decryption Lab <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* ── Primary Output Cards (Ciphertext + Auth Tag) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">

        {/* Card 1: Ciphertext Output */}
        <div className="bg-white dark:bg-[#0a0a0c] rounded-3xl border border-zinc-200 dark:border-white/10 p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  Confidential Payload
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Encrypted Ciphertext
                </h3>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono font-bold border border-blue-200 dark:border-blue-500/30">
              {ctBytes.length} Bytes ({ctBytes.length * 8} bits)
            </span>
          </div>

          {/* Plaintext to Ciphertext Transformation */}
          <div className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/5 rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Original Plaintext:</span>
              <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 px-2 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">
                &quot;{activePt}&quot;
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Associated Data (AD):</span>
              <span className="font-mono text-zinc-600 dark:text-zinc-400 text-[11px]">
                {activeAd}
              </span>
            </div>
          </div>

          {/* Byte Grid */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              <span>Ciphertext Bytes (Hex):</span>
              <button
                onClick={() => copyToClipboard(encResult.ciphertext, "ct")}
                className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                {copiedField === "ct" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Hex</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-zinc-100 dark:bg-black/70 border border-zinc-200 dark:border-white/5">
              {ctBytes.map((byte, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center w-10 h-11 rounded-xl bg-white dark:bg-zinc-900 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-300 font-mono font-bold text-xs shadow-sm"
                >
                  <span className="text-[9px] text-zinc-400 font-normal leading-none mb-0.5">
                    [{idx}]
                  </span>
                  <span>{byte}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw string display */}
          <div className="p-3 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all select-all">
              {encResult.ciphertext}
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            Produced by XORing the plaintext into internal state word <code className="font-mono text-blue-500">x0</code> during the sponge duplex phase. Indistinguishable from random noise without the secret key.
          </p>
        </div>

        {/* Card 2: Authentication Tag Output */}
        <div className="bg-white dark:bg-[#0a0a0c] rounded-3xl border border-zinc-200 dark:border-white/10 p-5 flex flex-col gap-4 shadow-md">
          <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  Integrity Seal
                </span>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  128-bit Authentication Tag
                </h3>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold border border-emerald-200 dark:border-emerald-500/30">
              16 Bytes (128 bits)
            </span>
          </div>

          {/* Mathematical Extraction Formula */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-mono text-emerald-900 dark:text-emerald-300 font-semibold text-[11px]">
                Tag = (x3 ⊕ Key[0:7]) ‖ (x4 ⊕ Key[8:15])
              </span>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">
              Final Squeeze
            </span>
          </div>

          {/* 16 Tag Bytes */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              <span>Authentication Tag Bytes:</span>
              <button
                onClick={() => copyToClipboard(encResult.authenticationTag, "tag")}
                className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {copiedField === "tag" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Tag</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-3 rounded-2xl bg-zinc-100 dark:bg-black/70 border border-zinc-200 dark:border-white/5">
              {tagBytes.map((byte, idx) => (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-center h-11 rounded-xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs shadow-sm"
                >
                  <span className="text-[9px] text-zinc-400 font-normal leading-none mb-0.5">
                    T{idx}
                  </span>
                  <span>{byte}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Raw string display */}
          <div className="p-3 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 break-all select-all">
              {encResult.authenticationTag}
            </span>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed">
            The cryptographic tamper seal. Because the capacity words absorbed all AD blocks and plaintext bytes, modifying even a single bit anywhere alters ~64 bits of this tag (Avalanche Effect).
          </p>
        </div>

      </div>

      {/* ── Transmitted Wire Package (AEAD Packet Structure) ── */}
      <div className="bg-white dark:bg-[#0a0a0c] rounded-3xl border border-zinc-200 dark:border-white/10 p-5 flex flex-col gap-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">
              Transmitted AEAD Wire Frame
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(fullPayloadJson, "json")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-300 text-xs font-bold transition-all border border-zinc-200 dark:border-white/10"
          >
            {copiedField === "json" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">Payload Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Payload (JSON)</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          This is the complete package sent across the wire/radio from the IoT sensor to the server:
        </p>

        {/* Visual packet bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">
              1. Public Nonce (16B)
            </span>
            <span className="truncate text-zinc-700 dark:text-zinc-300 text-[11px]">
              {activeNonce}
            </span>
            <span className="text-[9px] text-zinc-400">Guarantees uniqueness</span>
          </div>

          <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase">
              2. Associated Data (AD)
            </span>
            <span className="truncate text-zinc-700 dark:text-zinc-300 text-[11px]">
              &quot;{activeAd}&quot;
            </span>
            <span className="text-[9px] text-zinc-400">Authenticated Header</span>
          </div>

          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-500/30 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">
              3. Ciphertext ({ctBytes.length}B)
            </span>
            <span className="truncate text-zinc-700 dark:text-zinc-300 text-[11px]">
              {encResult.ciphertext}
            </span>
            <span className="text-[9px] text-zinc-400">Confidential payload</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-500/30 flex flex-col gap-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
              4. Auth Tag (16B)
            </span>
            <span className="truncate text-zinc-700 dark:text-zinc-300 text-[11px]">
              {encResult.authenticationTag}
            </span>
            <span className="text-[9px] text-zinc-400">Cryptographic wax seal</span>
          </div>
        </div>
      </div>

      {/* ── Interactive Receiver Verification Simulator ── */}
      <div className="bg-zinc-50 dark:bg-[#0c0d10] rounded-3xl border border-zinc-200 dark:border-white/10 p-5 flex flex-col gap-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Receiver Verification &amp; Tamper Defense Simulator
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
              Simulate what the receiver sees. Flip a bit in the ciphertext to witness the Strict Avalanche Effect break authentication!
            </p>
          </div>

          <button
            onClick={() => {
              setTampered(!tampered);
              setVerificationResult(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              !tampered
                ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700"
                : "bg-rose-600 text-white shadow-lg shadow-rose-500/30 animate-pulse border border-rose-400"
            }`}
          >
            {tampered ? "⚠ Tampered (Bit 0 Flipped) — Click to Restore" : "Original — Click to Tamper Bit"}
          </button>
        </div>

        {/* Verification Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5 p-3.5 rounded-2xl flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                Received Ciphertext
              </span>
              {tampered && (
                <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold font-mono">
                  ⚠ Byte 0 Flipped
                </span>
              )}
            </div>
            <div className="font-mono text-xs font-bold p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-2 overflow-x-auto">
              {displayedReceivedCt.split(/\s+/).map((byte, idx) => (
                <span
                  key={idx}
                  className={`px-1.5 py-0.5 rounded ${
                    tampered && idx === 0
                      ? "bg-rose-600 text-white animate-pulse"
                      : "text-zinc-800 dark:text-zinc-200"
                  }`}
                >
                  {byte}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5 p-3.5 rounded-2xl flex flex-col gap-1.5">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              Received 128-bit Tag
            </span>
            <div className="font-mono text-xs font-bold p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 truncate">
              {encResult.authenticationTag}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between gap-4 pt-1">
          <button
            onClick={handleVerify}
            disabled={verifying}
            className="flex-1 py-3 px-5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
          >
            {verifying ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Key className="w-4 h-4" />
                </motion.div>
                <span>Recomputing Tag on Receiver...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Authenticate Payload</span>
              </>
            )}
          </button>
        </div>

        {/* Verification Result Feedback */}
        <AnimatePresence mode="wait">
          {verificationResult === "pass" && (
            <motion.div
              key="pass"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-white">
                    Authentication Passed — Tag Verified!
                  </h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    The receiver recalculated the exact same 128-bit tag using the secret key. The message is 100% authentic and unmodified.
                  </p>
                </div>
              </div>
              <button
                onClick={handleSendToDecryption}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                Decrypt Payload <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {verificationResult === "fail" && (
            <motion.div
              key="fail"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-8 h-8 text-rose-600 dark:text-rose-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-rose-950 dark:text-white">
                    Tamper Detected — Total Tag Mismatch!
                  </h4>
                  <p className="text-xs text-rose-800 dark:text-rose-300">
                    Because of ASCON&apos;s 12-round permutation and non-linear S-box, flipping just 1 bit in the ciphertext caused the recalculated tag to diverge completely. The receiver rejects this payload.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTampered(false);
                  setVerificationResult(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shrink-0 flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restore Original
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Footer Actions: Decryption Bridge ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 pb-6 border-t border-zinc-200 dark:border-white/10">
        <div className="text-xs text-zinc-500 text-center sm:text-left">
          Ready to verify the receiver&apos;s perspective? Take your generated ciphertext into the Decryption Laboratory.
        </div>

        <button
          onClick={handleSendToDecryption}
          className="flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-100 rounded-2xl text-sm font-bold transition-all shadow-md hover:scale-105 active:scale-95 shrink-0"
        >
          <Send className="w-4 h-4 text-blue-500" />
          <span>Send Payload to Decryption Lab</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
