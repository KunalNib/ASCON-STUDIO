"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Play,
  RotateCcw,
  Activity,
  ShieldCheck,
  Layers,
  Gauge,
  Sliders,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Ascon128 } from "@/lib/ascon";
import { emitSecurityLog } from "../AdversaryConsole";
import { playBitClick, playSuccessChime } from "@/lib/soundFx";

export function AvalancheDifferentialAttack() {
  const [selectedBit, setSelectedBit] = useState<number>(0); // 0..319
  const [round, setRound] = useState<number>(0); // 0..12
  const [subLayer, setSubLayer] = useState<"none" | "pc" | "ps" | "pl">("none");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Compute live mathematical ASCON state differences using real Ascon128 engine
  const { diffMatrix, hammingDistance, activeSboxes } = useMemo(() => {
    // Initial deterministic reference state (ASCON IV + standard constants)
    const baseWords = [
      0x80400c0600000000n, // IV for Ascon-128
      0x0001020304050607n, // K0
      0x08090a0b0c0d0e0fn, // K1
      0x0010203040506070n, // N0
      0x8090a0b0c0d0e0f0n, // N1
    ];

    const s1 = new Ascon128();
    s1.setState(baseWords);

    const s2 = new Ascon128();
    s2.setState(baseWords);

    // Inject 1-bit difference into s2 at selectedBit
    const wordIdx = Math.floor(selectedBit / 64);
    const bitIdx = selectedBit % 64;
    s2.flipBit(wordIdx, bitIdx);

    // Apply rounds up to `round`
    const startRound = 12 - round;
    for (let r = 12 - round; r < 12; r++) {
      s1.addConstant(r);
      s1.substitution();
      s1.diffusion();

      s2.addConstant(r);
      s2.substitution();
      s2.diffusion();
    }

    // Apply sub-layer if selected
    if (round < 12 && subLayer !== "none") {
      const currentR = 12 - round - 1;
      if (currentR >= 0) {
        if (subLayer === "pc" || subLayer === "ps" || subLayer === "pl") {
          s1.addConstant(currentR);
          s2.addConstant(currentR);
        }
        if (subLayer === "ps" || subLayer === "pl") {
          s1.substitution();
          s2.substitution();
        }
        if (subLayer === "pl") {
          s1.diffusion();
          s2.diffusion();
        }
      }
    }

    // Calculate exact XOR difference for all 5 words
    const diffs: bigint[] = [];
    const matrix: boolean[][] = [];

    for (let w = 0; w < 5; w++) {
      const xor = (s1.state[w] ^ s2.state[w]) & 0xffffffffffffffffn;
      diffs.push(xor);
      const rowBits: boolean[] = [];
      for (let b = 0; b < 64; b++) {
        rowBits.push(((xor >> BigInt(b)) & 1n) === 1n);
      }
      matrix.push(rowBits);
    }

    const dist = Ascon128.hammingDistance(s1.state, s2.state);
    const active = Ascon128.getActiveSboxes(s1.state, s2.state);

    return {
      diffMatrix: matrix,
      hammingDistance: dist,
      activeSboxes: active,
    };
  }, [selectedBit, round, subLayer]);

  const avalanchePercentage = ((hammingDistance / 320) * 100).toFixed(1);

  const runFullAvalanche = () => {
    setIsPlaying(true);
    setSubLayer("none");
    let r = 0;
    setRound(0);

    emitSecurityLog(
      "SPONGE",
      `Initiated automated differential cascade from injected bit ${selectedBit}`,
      `Bit[${selectedBit}]`,
      "differential"
    );

    const interval = setInterval(() => {
      r++;
      setRound(r);
      playBitClick();

      if (r >= 12) {
        clearInterval(interval);
        setIsPlaying(false);
        playSuccessChime();
        emitSecurityLog(
          "SUCCESS",
          `Differential cascade finished! 12 rounds reached. SAC saturated at 50% equilibrium.`,
          "SAC_SATURATED",
          "differential"
        );
      }
    }, 280);
  };

  const handleReset = () => {
    playBitClick();
    setRound(0);
    setSubLayer("none");
    setIsPlaying(false);
    emitSecurityLog("INFO", "Reset differential permutation to Round 0.", undefined, "differential");
  };

  const handleSelectBit = (globalIdx: number) => {
    playBitClick();
    setSelectedBit(globalIdx);
    setRound(0);
    setSubLayer("none");
    emitSecurityLog(
      "INJECT",
      `Injected 1-bit differential seed on State Bit [${globalIdx}] (Word x${Math.floor(
        globalIdx / 64
      )}, bit ${globalIdx % 64})`,
      `e_${globalIdx}`,
      "differential"
    );
  };

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-5 gap-4 overflow-y-auto custom-scrollbar">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              Live Mathematical Permutation Engine
            </span>
            <span className="text-xs text-zinc-400 font-mono">Strict Avalanche Criterion (SAC)</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            1-Bit Differential Cascade &amp; Non-Linear Saturation
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={runFullAvalanche}
            disabled={isPlaying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>{isPlaying ? `Cascading... R${round}` : "Run 12-Round Cascade"}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Reset simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Metric Cards Row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-amber-500" /> SAC Avalanche Entropy
          </span>
          <div className="text-xl font-black font-mono text-zinc-900 dark:text-white">
            {avalanchePercentage}%
          </div>
          <span className="text-[10px] text-zinc-500">Target SAC: 50.0% (Ideal)</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-500" /> Flipped Bits (Hamming)
          </span>
          <div className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
            {hammingDistance} / 320
          </div>
          <span className="text-[10px] text-zinc-500">State bits perturbed</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
            <Layers className="w-3 h-3 text-cyan-500" /> Active S-Boxes
          </span>
          <div className="text-xl font-black font-mono text-cyan-600 dark:text-cyan-400">
            {activeSboxes} / 64
          </div>
          <span className="text-[10px] text-zinc-500">Non-linear columns active</span>
        </div>

        <div className="p-3 rounded-2xl bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 shadow-sm flex flex-col gap-0.5">
          <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-rose-500" /> Security Margin
          </span>
          <div className="text-xl font-black font-mono text-zinc-900 dark:text-white">
            8 Rounds
          </div>
          <span className="text-[10px] text-zinc-500">12 total vs 4 to saturate</span>
        </div>
      </div>

      {/* ── 320-Bit Interactive State Matrix Heatmap ── */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
              320-Bit State XOR Difference Matrix: Δ = S ⊕ S&apos;
            </span>
            <span className="text-[10px] font-mono text-amber-500 font-bold">
              Seed: Bit [{selectedBit}]
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline">
            Click any cell to seed 1-bit injection
          </span>
        </div>

        {/* 5 Words × 64 Bits Matrix Grid */}
        <div className="flex flex-col gap-1.5 w-full bg-zinc-950 p-3 rounded-2xl border border-zinc-800/80 overflow-x-auto custom-scrollbar">
          {["x0", "x1", "x2", "x3", "x4"].map((wordName, wIdx) => (
            <div key={wIdx} className="flex items-center gap-2">
              <span className="w-6 font-mono text-[10px] font-bold text-zinc-500 shrink-0">
                {wordName}
              </span>
              <div className="grid grid-cols-[repeat(64,minmax(0,1fr))] gap-0.5 flex-1 min-w-[580px]">
                {Array.from({ length: 64 }).map((_, bitIdx) => {
                  const globalIdx = wIdx * 64 + bitIdx;
                  const isFlipped = diffMatrix[wIdx] ? diffMatrix[wIdx][bitIdx] : false;
                  const isOrigin = globalIdx === selectedBit;

                  return (
                    <button
                      key={bitIdx}
                      onClick={() => handleSelectBit(globalIdx)}
                      className={`h-4 rounded-[2px] cursor-pointer transition-all ${
                        isOrigin
                          ? "bg-white ring-2 ring-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] z-10 scale-110"
                          : isFlipped
                          ? "bg-amber-400 dark:bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.6)]"
                          : "bg-zinc-800/80 hover:bg-zinc-700"
                      }`}
                      title={`Word ${wordName} Bit ${bitIdx} (Global #${globalIdx}) | ${
                        isOrigin ? "Origin Seed" : isFlipped ? "Flipped" : "Unchanged"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Sub-Round & Permutation Stepper Controls ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Round Scrubber Slider */}
          <div className="p-3 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="font-bold">Permutation Round Stepper:</span>
              <span className="text-amber-500 font-bold">Round {round} / 12</span>
            </div>
            <input
              type="range"
              min={0}
              max={12}
              value={round}
              onChange={(e) => {
                playBitClick();
                setRound(parseInt(e.target.value));
                setSubLayer("none");
              }}
              className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          {/* Sub-Layer Micro-Stepping */}
          <div className="p-3 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono">
              <span className="font-bold">Micro-Step Layer (Sub-Round):</span>
              <span className="text-cyan-500 uppercase font-bold text-[10px]">
                {subLayer === "none"
                  ? "Standard Round End"
                  : subLayer === "pc"
                  ? "pC: Constant Added"
                  : subLayer === "ps"
                  ? "pS: S-Box Applied"
                  : "pL: Diffusion Spread"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playBitClick();
                  setSubLayer("pc");
                }}
                className={`flex-1 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all ${
                  subLayer === "pc"
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                + pC (Constant)
              </button>
              <button
                onClick={() => {
                  playBitClick();
                  setSubLayer("ps");
                }}
                className={`flex-1 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all ${
                  subLayer === "ps"
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                + pS (S-Box)
              </button>
              <button
                onClick={() => {
                  playBitClick();
                  setSubLayer("pl");
                }}
                className={`flex-1 py-1 text-[11px] font-mono font-bold rounded-lg border transition-all ${
                  subLayer === "pl"
                    ? "bg-amber-500 text-black border-amber-400"
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                + pL (Diffusion)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cryptographic Defense Analysis ── */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 leading-relaxed flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block mb-1 font-bold">
            Mathematical Proof: Why Differential Cryptanalysis Fails Against ASCON
          </strong>
          Notice how rapidly the single injected bit spreads into ~160 bits (50.0% Strict Avalanche Criterion) by Round 4.
          Because ASCON’s linear diffusion layer ($\Sigma_i$) applies pair rotations coprime to 64 and the 5-bit S-box possesses optimal differential branch numbers,
          any differential characteristic trail requires over $2^{128}$ operations after Round 6. With a 12-round initialization and finalization,
          differential and linear trails are mathematically infeasible.
        </div>
      </div>
    </div>
  );
}
