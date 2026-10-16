"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  ExternalLink, 
  Play, 
  Check, 
  Copy, 
  ShieldCheck, 
  Zap, 
  Hash as HashIcon, 
  Key, 
  Layers, 
  Cpu, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { AsconAlgorithm, ALGORITHM_REGISTRY, AsconSuite } from "@/lib/ascon";
import { useAsconStore } from "@/store/useAsconStore";
import { useRouter } from "next/navigation";

interface AlgorithmModalProps {
  algorithm: AsconAlgorithm | null;
  onClose: () => void;
}

export function AlgorithmModal({ algorithm, onClose }: AlgorithmModalProps) {
  const router = useRouter();
  const { 
    selectedAlgorithm, 
    setSelectedAlgorithm,
    key: storeKey,
    nonce: storeNonce,
    associatedData: storeAD,
    plaintext: storePT
  } = useAsconStore();

  const [copied, setCopied] = useState<string | null>(null);

  // Playground state for AEAD
  const [testKey, setTestKey] = useState(storeKey || "000102030405060708090A0B0C0D0E0F");
  const [testNonce, setTestNonce] = useState(storeNonce || "000102030405060708090A0B0C0D0E0F");
  const [testAD, setTestAD] = useState(storeAD || "ESP32-STATION-1");
  const [testPT, setTestPT] = useState(storePT || "27.4 °C");
  const [aeadResult, setAeadResult] = useState<{
    ciphertext: string;
    authenticationTag: string;
    timeMs: number;
  } | null>(null);

  // Playground state for Hash
  const [testHashMsg, setTestHashMsg] = useState("ascon");
  const [hashResult, setHashResult] = useState<{
    digest: string;
    numBlocks: number;
    timeMs: number;
  } | null>(null);

  if (!algorithm) return null;

  const meta = ALGORITHM_REGISTRY[algorithm];
  const isHash = algorithm === "ASCON-Hash";
  const isCurrentActive = selectedAlgorithm === algorithm;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleRunPlayground = () => {
    const t0 = performance.now();
    if (isHash) {
      const res = AsconSuite.hash(testHashMsg);
      const t1 = performance.now();
      setHashResult({
        digest: res.digest,
        numBlocks: res.absorbingBlocks.length,
        timeMs: Number((t1 - t0).toFixed(3)),
      });
    } else {
      const res = AsconSuite.encrypt(algorithm, testKey, testNonce, testAD, testPT);
      const t1 = performance.now();
      setAeadResult({
        ciphertext: res.ciphertext,
        authenticationTag: res.authenticationTag,
        timeMs: Number((t1 - t0).toFixed(3)),
      });
    }
  };

  const handleActivateAndLaunch = () => {
    setSelectedAlgorithm(algorithm);
    onClose();
    if (isHash) {
      router.push("/studio/hash");
    } else {
      router.push("/studio/encryption");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
      >
        {/* Header Banner */}
        <div className="relative p-6 border-b border-zinc-200 dark:border-white/10 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-transparent">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                  {meta.name}
                </h2>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                  algorithm === "ASCON-128"
                    ? "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30"
                    : algorithm === "ASCON-128a"
                    ? "bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30"
                    : "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30"
                }`}>
                  {meta.badge}
                </span>

                {isCurrentActive && (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-500/30 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-yellow-500" /> Active in Studio
                  </span>
                )}
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
                {meta.description}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Specifications Table Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Rate (r)
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white font-mono">
                {meta.specs.rate}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {meta.rateBits === 128 ? "Words x0, x1 (2x speed)" : "Word x0 (64-bit block)"}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Capacity (c)
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white font-mono">
                {meta.specs.capacity}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                {meta.capacityBits === 256 ? "Words x1..x4 (high security)" : "Words x2..x4"}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Rounds (a, b)
              </div>
              <div className="text-base font-black text-zinc-900 dark:text-white font-mono">
                {meta.specs.rounds}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                Init/Final: {meta.roundsA}, Intermediate: {meta.roundsB}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
              <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">
                Standard IV
              </div>
              <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono text-xs break-all">
                {meta.ivHex}
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5">
                NIST SP 800-232 Specification
              </div>
            </div>
          </div>

          {/* Sponge Construction Visual Structure */}
          <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-500" />
                320-Bit Sponge State Allocation: {meta.name}
              </h4>
              <span className="text-[11px] text-zinc-500 font-mono">5 words × 64-bit = 320 bits</span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div className={`p-3 rounded-xl border text-center ${
                meta.rateBits >= 64 
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300"
                  : "bg-zinc-200/50 dark:bg-white/5 border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-zinc-400"
              }`}>
                <div className="text-xs font-mono font-bold">x0 (64b)</div>
                <div className="text-[10px] font-semibold mt-1">RATE (r)</div>
              </div>

              <div className={`p-3 rounded-xl border text-center ${
                meta.rateBits === 128 
                  ? "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300" 
                  : "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300"
              }`}>
                <div className="text-xs font-mono font-bold">x1 (64b)</div>
                <div className="text-[10px] font-semibold mt-1">
                  {meta.rateBits === 128 ? "RATE (r)" : "CAPACITY (c)"}
                </div>
              </div>

              <div className="p-3 rounded-xl border text-center bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                <div className="text-xs font-mono font-bold">x2 (64b)</div>
                <div className="text-[10px] font-semibold mt-1">CAPACITY (c)</div>
              </div>

              <div className="p-3 rounded-xl border text-center bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                <div className="text-xs font-mono font-bold">x3 (64b)</div>
                <div className="text-[10px] font-semibold mt-1">CAPACITY (c)</div>
              </div>

              <div className="p-3 rounded-xl border text-center bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300">
                <div className="text-xs font-mono font-bold">x4 (64b)</div>
                <div className="text-[10px] font-semibold mt-1">CAPACITY (c)</div>
              </div>
            </div>
            
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isHash
                ? "In ASCON-Hash, message blocks of 64 bits are absorbed sequentially into x0 using 12 permutation rounds, then 256 bits are squeezed across 4 iterations."
                : algorithm === "ASCON-128a"
                ? "In ASCON-128a, two 64-bit words (x0, x1) are absorbed per block permutation (16 bytes = 128 bits), delivering double the processing speed of ASCON-128."
                : "In standard ASCON-128, a 64-bit rate absorbs 8 bytes per block, preserving a massive 256-bit capacity for maximum resilience against state recovery attacks."}
            </p>
          </div>

          {/* Interactive Live Quick Runner */}
          <div className="p-5 rounded-2xl bg-zinc-100/60 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Play className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                Live Quick Runner: Test {meta.name}
              </h4>
              <button
                onClick={handleRunPlayground}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Play className="w-3 h-3 fill-white" /> Run {isHash ? "Hash" : "Encryption"}
              </button>
            </div>

            {isHash ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-500 block mb-1">
                    Message String to Hash
                  </label>
                  <input
                    type="text"
                    value={testHashMsg}
                    onChange={(e) => setTestHashMsg(e.target.value)}
                    placeholder="Enter string (e.g. ascon, sensor telemetry, passwords)..."
                    className="w-full px-3 py-2 text-sm font-mono rounded-xl bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {hashResult && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> 256-Bit Cryptographic Digest
                      </span>
                      <span className="font-mono text-[10px] opacity-80">{hashResult.timeMs} ms</span>
                    </div>
                    <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-emerald-500/30">
                      <span className="font-mono text-xs text-emerald-400 break-all select-all">
                        {hashResult.digest}
                      </span>
                      <button
                        onClick={() => handleCopy(hashResult.digest, "hash")}
                        className="ml-2 text-zinc-400 hover:text-white shrink-0"
                      >
                        {copied === "hash" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Plaintext</label>
                    <input
                      type="text"
                      value={testPT}
                      onChange={(e) => setTestPT(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-zinc-500 block mb-1">Associated Data (AD)</label>
                    <input
                      type="text"
                      value={testAD}
                      onChange={(e) => setTestAD(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                {aeadResult && (
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                    <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold">
                      <span className="flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> AEAD Encryption Result
                      </span>
                      <span className="font-mono text-[10px] opacity-80">{aeadResult.timeMs} ms</span>
                    </div>
                    <div className="space-y-1.5 text-xs font-mono">
                      <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-blue-500/20">
                        <span className="text-zinc-400 text-[11px]">Ciphertext:</span>
                        <span className="text-blue-300">{aeadResult.ciphertext}</span>
                      </div>
                      <div className="flex justify-between items-center bg-black/40 p-2 rounded border border-blue-500/20">
                        <span className="text-zinc-400 text-[11px]">Tag (128-bit):</span>
                        <span className="text-purple-300">{aeadResult.authenticationTag}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Key Features List */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Architectural Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meta.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 text-xs text-zinc-700 dark:text-zinc-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setSelectedAlgorithm(algorithm);
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
              isCurrentActive
                ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-300"
                : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/10"
            }`}
          >
            {isCurrentActive ? "Active Studio Algorithm ✓" : "Set as Active Studio Algorithm"}
          </button>

          <button
            onClick={handleActivateAndLaunch}
            className="px-5 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white transition-all shadow-md flex items-center gap-2"
          >
            Launch in Studio Laboratory <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
