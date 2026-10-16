"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Hash as HashIcon, 
  Copy, 
  Check, 
  Play, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Sliders, 
  ArrowRight,
  Database,
  Cpu,
  BookOpen
} from "lucide-react";
import { AsconHash, Ascon128 } from "@/lib/ascon";
import { useAsconStore } from "@/store/useAsconStore";
import Link from "next/link";

const TEST_PRESETS = [
  { label: "NIST Vector 'ascon'", value: "ascon" },
  { label: "Empty String ''", value: "" },
  { label: "IoT Telemetry", value: "{\"temp\":27.4,\"humidity\":64.2,\"device\":\"ESP32\"}" },
  { label: "The Quick Brown Fox", value: "The quick brown fox jumps over the lazy dog" },
];

export default function AsconHashLaboratory() {
  const { hashInput, setHashInput } = useAsconStore();
  const [activePreset, setActivePreset] = useState("ascon");
  const [copied, setCopied] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<"absorbing" | "squeezing">("absorbing");
  const [selectedBlockIdx, setSelectedBlockIdx] = useState(0);

  // Avalanche comparison
  const [avalancheCompare, setAvalancheCompare] = useState("ascon!");

  // Compute live hash
  const hashResult = useMemo(() => {
    return AsconHash.hash(hashInput);
  }, [hashInput]);

  // Compute avalanche hash
  const avalancheResult = useMemo(() => {
    return AsconHash.hash(avalancheCompare);
  }, [avalancheCompare]);

  // Compute Hamming Distance between primary hash and avalanche hash
  const bitDiffusion = useMemo(() => {
    const b1 = Ascon128.hexToBytes(hashResult.digest);
    const b2 = Ascon128.hexToBytes(avalancheResult.digest);
    let diffBits = 0;
    const totalBits = 256;
    for (let i = 0; i < 32; i++) {
      let xor = (b1[i] ?? 0) ^ (b2[i] ?? 0);
      while (xor > 0) {
        if (xor & 1) diffBits++;
        xor >>= 1;
      }
    }
    const pct = ((diffBits / totalBits) * 100).toFixed(1);
    return { diffBits, totalBits, pct };
  }, [hashResult.digest, avalancheResult.digest]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const selectPreset = (val: string, label: string) => {
    setHashInput(val);
    setActivePreset(label);
    if (val.length > 0) {
      setAvalancheCompare(val.slice(0, -1) + (val.slice(-1) === "!" ? "?" : "!"));
    } else {
      setAvalancheCompare("a");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto flex flex-col min-h-full space-y-6">
      {/* ── Top Header ── */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
              <HashIcon className="w-3 h-3" /> NIST SP 800-232 / ASCON v1.2 Standard
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono text-zinc-500 border border-zinc-200 dark:border-white/10 rounded-full">
              256-Bit Collision-Resistant Digest
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
            ASCON-Hash Laboratory
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-1">
            Interactive cryptographic sponge hashing: message absorbing, 12-round permutation, and 4-phase squeezing.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-2">
          <Link
            href="/studio/research"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" /> Research Library
          </Link>
          <Link
            href="/studio/encryption"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 shadow-sm"
          >
            Open AEAD Lab <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* ── Main Interactive Split Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Digest Display */}
        <div className="lg:col-span-5 space-y-6">
          {/* Message Input Card */}
          <div className="bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-blue-500" /> Message Input
              </label>
              <span className="text-[11px] font-mono text-zinc-500">
                {new TextEncoder().encode(hashInput).length} bytes
              </span>
            </div>

            {/* Preset Buttons */}
            <div className="flex flex-wrap gap-1.5">
              {TEST_PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => selectPreset(p.value, p.label)}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-all ${
                    activePreset === p.label
                      ? "bg-blue-50 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-500/40"
                      : "bg-zinc-50 dark:bg-white/[0.03] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/5 hover:bg-zinc-100 dark:hover:bg-white/10"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={hashInput}
              onChange={(e) => {
                setHashInput(e.target.value);
                setActivePreset("custom");
              }}
              placeholder="Type any message to hash in real-time..."
              className="w-full px-3.5 py-2.5 text-sm font-mono rounded-2xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none transition-all"
            />
          </div>

          {/* 256-Bit Cryptographic Digest Output */}
          <div className="bg-white dark:bg-[#0c0d12] border border-emerald-500/30 rounded-3xl p-5 shadow-md shadow-emerald-500/5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  256-Bit ASCON-Hash Digest
                </h3>
              </div>

              <button
                onClick={() => handleCopy(hashResult.digest.replace(/\s+/g, ""), "digest")}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-colors flex items-center gap-1.5"
              >
                {copied === "digest" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied === "digest" ? "Copied Hex" : "Copy Hex"}
              </button>
            </div>

            {/* Formatted Hex Box */}
            <div className="bg-black/80 rounded-2xl p-4 border border-emerald-500/20 font-mono space-y-2">
              <div className="text-emerald-400 text-sm font-bold tracking-wider break-all leading-relaxed select-all">
                {hashResult.digest}
              </div>
              <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-white/10">
                <span>32 Bytes / 256 Bits</span>
                <span>4 Squeezes × 64 Bits</span>
              </div>
            </div>

            {/* Byte Slices Grid (4 words squeezed) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                Squeezed Words ($S_0$ across 4 iterations)
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                {hashResult.squeezedBlocks.map((sq) => (
                  <div key={sq.squeezeIndex} className="p-2 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 flex flex-col">
                    <span className="text-[9px] text-emerald-500 font-bold uppercase">Squeeze #{sq.squeezeIndex}</span>
                    <span className="text-zinc-800 dark:text-zinc-200 font-bold text-xs mt-0.5">{sq.wordHex}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Avalanche Effect Playground */}
          <div className="bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                Avalanche Effect Analyzer
              </h3>
              <span className="text-xs font-bold text-yellow-600 dark:text-yellow-400 font-mono">
                {bitDiffusion.pct}% Diffusion
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Flip 1 character in the comparative input to witness the strict avalanche criterion (SAC): ~50% of the 256 output bits flip completely.
            </p>

            <input
              type="text"
              value={avalancheCompare}
              onChange={(e) => setAvalancheCompare(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white"
              placeholder="Compare with perturbed message..."
            />

            {/* Diffusion Gauge */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-mono text-zinc-500">
                <span>Flipped Bits: {bitDiffusion.diffBits} / {bitDiffusion.totalBits}</span>
                <span>Ideal Target: 128 bits (50%)</span>
              </div>
              <div className="h-2 w-full bg-zinc-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-500 to-emerald-500 transition-all duration-300"
                  style={{ width: `${bitDiffusion.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sponge Step-by-Step Visualization */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-500" />
                  Sponge Architecture Execution Trace
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Inspect internal 320-bit state (x0..x4) transformation at each sponge milestone.
                </p>
              </div>

              {/* Phase Switcher */}
              <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-semibold">
                <button
                  onClick={() => { setSelectedPhase("absorbing"); setSelectedBlockIdx(0); }}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedPhase === "absorbing"
                      ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Absorbing ({hashResult.absorbingBlocks.length} blocks)
                </button>
                <button
                  onClick={() => { setSelectedPhase("squeezing"); setSelectedBlockIdx(0); }}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    selectedPhase === "squeezing"
                      ? "bg-white dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm"
                      : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  Squeezing (4 words)
                </button>
              </div>
            </div>

            {/* Initialization Constants Box */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-zinc-700 dark:text-zinc-300">Phase 1: State Initialization</span>
                <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">p^12 Permutation</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5">
                  <span className="text-zinc-500 block text-[10px]">Initial Value (IV):</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">00400C0000000100</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-black/40 border border-zinc-200 dark:border-white/5">
                  <span className="text-zinc-500 block text-[10px]">Initial Capacity Words:</span>
                  <span className="text-zinc-600 dark:text-zinc-400">x1..x4 = 0x0000000000000000</span>
                </div>
              </div>
            </div>

            {/* Step Selection Tabs */}
            {selectedPhase === "absorbing" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {hashResult.absorbingBlocks.map((blk, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedBlockIdx(idx)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border shrink-0 transition-all ${
                        selectedBlockIdx === idx
                          ? "bg-purple-600 text-white border-purple-600 shadow-md"
                          : "bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:bg-zinc-100"
                      }`}
                    >
                      Block #{blk.blockIndex} {idx === hashResult.absorbingBlocks.length - 1 && "(Padded)"}
                    </button>
                  ))}
                </div>

                {/* Selected Block Breakdown */}
                {hashResult.absorbingBlocks[selectedBlockIdx] && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        Absorbing Block #{hashResult.absorbingBlocks[selectedBlockIdx].blockIndex}
                      </span>
                      <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">
                        {hashResult.absorbingBlocks[selectedBlockIdx].blockHex}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500">
                      Block data is XORed into rate register <code className="text-blue-500 font-mono">x0</code>, followed by the heavy 12-round permutation <code className="text-purple-500 font-mono">p^12</code>.
                    </div>

                    {/* 5 State Words View */}
                    <div className="space-y-1.5 font-mono text-xs">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        320-Bit State After Permutation
                      </span>
                      {hashResult.absorbingBlocks[selectedBlockIdx].stateWords.map((word, wIdx) => (
                        <div key={wIdx} className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/5">
                          <span className={`text-[11px] font-bold ${wIdx === 0 ? "text-blue-500" : "text-purple-500"}`}>
                            x{wIdx} ({wIdx === 0 ? "Rate" : "Capacity"}):
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-200">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {hashResult.squeezedBlocks.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedBlockIdx(idx)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border shrink-0 transition-all ${
                        selectedBlockIdx === idx
                          ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
                          : "bg-zinc-50 dark:bg-white/5 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/10 hover:bg-zinc-100"
                      }`}
                    >
                      Squeeze #{sq.squeezeIndex} (Bytes {idx * 8}-{(idx + 1) * 8 - 1})
                    </button>
                  ))}
                </div>

                {/* Selected Squeeze Breakdown */}
                {hashResult.squeezedBlocks[selectedBlockIdx] && (
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        Squeeze Extraction #{hashResult.squeezedBlocks[selectedBlockIdx].squeezeIndex}
                      </span>
                      <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        {hashResult.squeezedBlocks[selectedBlockIdx].wordHex}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-500">
                      Extracted 8 bytes from rate register <code className="text-emerald-500 font-mono">x0</code> into the final 256-bit digest, followed by intermediate <code className="text-purple-500 font-mono">p^12</code> permutation.
                    </div>

                    {/* 5 State Words View */}
                    <div className="space-y-1.5 font-mono text-xs">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Internal State At This Squeeze
                      </span>
                      {hashResult.squeezedBlocks[selectedBlockIdx].stateWords.map((word, wIdx) => (
                        <div key={wIdx} className="flex justify-between items-center p-2 rounded-lg bg-white dark:bg-black/60 border border-zinc-200 dark:border-white/5">
                          <span className={`text-[11px] font-bold ${wIdx === 0 ? "text-emerald-500" : "text-purple-500"}`}>
                            x{wIdx} ({wIdx === 0 ? "Extracted Rate" : "Capacity"}):
                          </span>
                          <span className="text-zinc-800 dark:text-zinc-200">{word}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
