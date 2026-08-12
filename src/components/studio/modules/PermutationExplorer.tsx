"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import {
  ROUND_CONSTANTS,
  SBOX_INPUT_WORDS,
  SBOX_OUTPUT_WORDS,
  DIFFUSION_WORDS,
  PERM_X2_BITS_BEFORE,
  PERM_X2_BITS_AFTER,
} from "@/lib/asconDemoData";
import { ChevronRight, Play, RotateCcw } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

type Layer = "constant" | "sbox" | "diffusion";

const LAYER_ORDER: Layer[] = ["constant", "sbox", "diffusion"];

const LAYER_META: Record<Layer, {
  label: string; subtitle: string; color: string;
  borderClass: string; glowClass: string; textClass: string; bgClass: string;
}> = {
  constant: {
    label: "① Constant Addition",
    subtitle: "x2 ⊕ round constant",
    color: "blue",
    borderClass: "border-blue-500/50", glowClass: "shadow-[0_0_30px_rgba(59,130,246,0.25)]",
    textClass: "text-blue-300", bgClass: "bg-blue-500/10",
  },
  sbox: {
    label: "② S-Box Substitution",
    subtitle: "5-bit non-linear LUT",
    color: "rose",
    borderClass: "border-rose-500/50", glowClass: "shadow-[0_0_30px_rgba(244,63,94,0.25)]",
    textClass: "text-rose-300", bgClass: "bg-rose-500/10",
  },
  diffusion: {
    label: "③ Linear Diffusion",
    subtitle: "Xi ⊕ ROTR(Xi,a) ⊕ ROTR(Xi,b)",
    color: "emerald",
    borderClass: "border-emerald-500/50", glowClass: "shadow-[0_0_30px_rgba(16,185,129,0.25)]",
    textClass: "text-emerald-300", bgClass: "bg-emerald-500/10",
  },
};

// ─── Sub-Components ─────────────────────────────────────────────────────────

function XorBit({ a, b, result, delay = 0 }: { a: string; b: string; result: string; delay?: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const t1 = setTimeout(() => setStep(1), delay + 300);
    const t2 = setTimeout(() => setStep(2), delay + 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [delay, a, b]);

  const isFlipped = a !== b;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* A bit */}
      <motion.div
        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono font-black text-base ${
          a === "1" ? "bg-blue-500/20 border-blue-500/40 text-blue-300" : "bg-zinc-900 border-zinc-700 text-zinc-500"
        }`}
        animate={{ scale: step >= 1 ? [1, 1.15, 1] : 1 }}
        transition={{ duration: 0.3 }}
      >
        {a}
      </motion.div>
      <div className="text-zinc-600 text-[10px] font-bold">⊕</div>
      {/* B bit */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: step >= 1 ? 1 : 0, y: step >= 1 ? 0 : -8 }}
        transition={{ duration: 0.3 }}
        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono font-black text-base ${
          b === "1" ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-zinc-900 border-zinc-700 text-zinc-500"
        }`}
      >
        {b}
      </motion.div>
      <div className="w-8 h-[1px] bg-zinc-700" />
      {/* Result bit */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: step >= 2 ? 1 : 0, scale: step >= 2 ? 1 : 0.5 }}
        transition={{ duration: 0.4, type: "spring" }}
        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-mono font-black text-base ${
          isFlipped
            ? "bg-blue-600/40 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            : "bg-zinc-900 border-zinc-700 text-zinc-400"
        }`}
      >
        {result}
      </motion.div>
      {isFlipped && step >= 2 && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-[8px] text-blue-400 font-bold"
        >
          FLIP
        </motion.div>
      )}
    </div>
  );
}

// ─── Constant Addition Layer ─────────────────────────────────────────────────

function ConstantLayer({ round }: { round: number }) {
  const rc = ROUND_CONSTANTS[round];
  const beforeBits = PERM_X2_BITS_BEFORE.slice(0, 8);
  const rcBits     = rc.binary;
  const afterBits  = PERM_X2_BITS_AFTER.slice(0, 8);

  return (
    <div className="flex flex-col items-center w-full gap-5 py-4">
      <p className="text-xs text-zinc-400 max-w-lg text-center leading-relaxed">
        Each round XORs a unique constant into word <span className="text-blue-400 font-bold font-mono">x2</span>.
        This breaks symmetry so each round is mathematically distinct.
      </p>

      {/* Labels */}
      <div className="flex gap-4 items-end justify-center">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">x2 (before)</span>
          <div className="flex gap-1">
            {beforeBits.split("").map((b, i) => (
              <div key={i} className={`w-8 h-8 rounded-lg border flex items-center justify-center font-mono font-black text-sm ${
                b === "1" ? "bg-blue-500/20 border-blue-500/30 text-blue-300" : "bg-zinc-900 border-zinc-700 text-zinc-500"
              }`}>{b}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-amber-900/20 border border-amber-500/30 rounded-xl px-4 py-2">
        <span className="text-amber-400 font-bold text-lg">⊕</span>
        <span className="text-xs text-amber-300 font-bold uppercase tracking-widest">Round {round + 1} Constant</span>
        <span className="font-mono text-amber-200 text-sm ml-2">0x{rc.constant}</span>
      </div>

      {/* XOR grid — show first 8 bits */}
      <div className="flex gap-3">
        {beforeBits.split("").map((a, i) => (
          <XorBit
            key={`${round}-${i}`}
            a={a}
            b={rcBits[i] ?? "0"}
            result={afterBits[i] ?? "0"}
            delay={i * 80}
          />
        ))}
        <div className="flex flex-col items-end justify-center ml-2">
          <span className="text-zinc-600 text-xs font-mono">...56 more bits</span>
        </div>
      </div>

      {/* After result */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-[10px] text-blue-400 uppercase tracking-widest font-bold">x2 (after XOR)</span>
        <div className="flex gap-1">
          {afterBits.split("").map((b, i) => (
            <motion.div
              key={i}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.9 + i * 0.08, duration: 0.4 }}
              className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-mono font-black text-sm ${
                b === "1"
                  ? "bg-blue-600/40 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)]"
                  : "bg-zinc-900 border-zinc-700 text-zinc-400"
              }`}
            >
              {b}
            </motion.div>
          ))}
          <span className="text-zinc-600 text-xs font-mono self-end ml-1">...</span>
        </div>
      </div>

      <div className="text-[11px] text-zinc-500 text-center max-w-sm">
        Bits that differ between x2 and the constant get <span className="text-blue-400 font-bold">flipped</span>.
        This is how ASCON makes every round compute a different function.
      </div>
    </div>
  );
}

// ─── S-Box Substitution Layer ─────────────────────────────────────────────────

function SBoxLayer() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 600);
    const t2 = setTimeout(() => setStep(2), 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const wordColors: Record<string, string> = {
    blue:   "bg-blue-500/20 border-blue-400/50 text-blue-200",
    purple: "bg-purple-500/20 border-purple-400/50 text-purple-200",
    teal:   "bg-teal-500/20 border-teal-400/50 text-teal-200",
    rose:   "bg-rose-500/20 border-rose-400/50 text-rose-200",
    amber:  "bg-amber-500/20 border-amber-400/50 text-amber-200",
  };

  return (
    <div className="flex flex-col items-center gap-6 py-4 w-full">
      <p className="text-xs text-zinc-400 max-w-lg text-center leading-relaxed">
        The S-Box takes one vertical <span className="text-rose-400 font-bold">column</span> — 1 bit from each of the 5 words
        — and applies a non-linear 5-bit substitution. This is the <em>only non-linear operation</em> in ASCON.
      </p>

      {/* Input bits from x0..x4 */}
      <motion.div className="flex gap-5 items-end">
        {SBOX_INPUT_WORDS.map((w, i) => (
          <motion.div
            key={w.label}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring" }}
            className="flex flex-col items-center gap-2"
          >
            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-3xl ${wordColors[w.color]}`}>
              {w.bit}
            </div>
            <div className="text-xs font-bold text-zinc-400">{w.label}</div>
            {/* Flowing particle line */}
            {step >= 1 && (
              <motion.div
                className="w-[2px] rounded-full overflow-hidden"
                style={{ height: 48 }}
              >
                <motion.div
                  className={`w-full ${w.color === "blue" ? "bg-blue-500" : w.color === "rose" ? "bg-rose-500" : w.color === "amber" ? "bg-amber-500" : w.color === "purple" ? "bg-purple-500" : "bg-teal-500"} rounded-full`}
                  initial={{ height: 0, y: 0 }}
                  animate={{ height: ["0%", "100%", "100%"], y: [0, 0, 48] }}
                  transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15, ease: "easeInOut" }}
                  style={{ height: "100%" }}
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* S-Box */}
      <AnimatePresence>
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="bg-black border-2 border-rose-600 rounded-3xl py-5 px-12 flex items-center gap-4 shadow-[0_0_60px_rgba(244,63,94,0.35)] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(244,63,94,0.08),_transparent)]" />
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-2xl"
              >
                🔀
              </motion.div>
              <div className="text-rose-300 font-bold text-lg relative z-10">5-Bit S-Box LUT</div>
              <div className="bg-rose-900/40 px-3 py-1 rounded-lg font-mono text-rose-300 text-sm border border-rose-500/30">
                {SBOX_INPUT_WORDS.map(w => w.bit).join("")} → {SBOX_OUTPUT_WORDS.map(w => w.bit).join("")}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Output bits y0..y4 */}
      <AnimatePresence>
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-5 items-start"
          >
            {SBOX_OUTPUT_WORDS.map((w, i) => (
              <motion.div
                key={w.label}
                initial={{ scale: 0, rotateX: 90 }}
                animate={{ scale: 1, rotateX: 0 }}
                transition={{ delay: i * 0.12, type: "spring", stiffness: 300 }}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-xs font-bold text-zinc-400">{w.label}</div>
                <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center font-mono font-black text-3xl shadow-[0_0_20px_rgba(244,63,94,0.4)] ${wordColors[w.color]}`}>
                  {w.bit}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-[11px] text-zinc-500 text-center max-w-sm mt-2">
        This operation is repeated for all <span className="text-rose-400 font-bold">64 columns</span> of the state simultaneously.
        The output is non-linearly scrambled — no algebra can reverse this cheaply.
      </div>
    </div>
  );
}

// ─── Linear Diffusion Layer ──────────────────────────────────────────────────

function DiffusionLayer() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    setStep(0);
    const t1 = setTimeout(() => setStep(1), 500);
    const t2 = setTimeout(() => setStep(2), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const wordColorMap: Record<string, string> = {
    blue:   "border-blue-500/40 text-blue-300 bg-blue-500/10",
    purple: "border-purple-500/40 text-purple-300 bg-purple-500/10",
    teal:   "border-teal-500/40 text-teal-300 bg-teal-500/10",
    rose:   "border-rose-500/40 text-rose-300 bg-rose-500/10",
    amber:  "border-amber-500/40 text-amber-300 bg-amber-500/10",
  };
  const resultColorMap: Record<string, string> = {
    blue:   "border-blue-400 text-white bg-blue-600/40 shadow-[0_0_15px_rgba(59,130,246,0.5)]",
    purple: "border-purple-400 text-white bg-purple-600/40 shadow-[0_0_15px_rgba(168,85,247,0.5)]",
    teal:   "border-teal-400 text-white bg-teal-600/40 shadow-[0_0_15px_rgba(20,184,166,0.5)]",
    rose:   "border-rose-400 text-white bg-rose-600/40 shadow-[0_0_15px_rgba(244,63,94,0.5)]",
    amber:  "border-amber-400 text-white bg-amber-600/40 shadow-[0_0_15px_rgba(245,158,11,0.5)]",
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4 w-full">
      <p className="text-xs text-zinc-400 max-w-lg text-center leading-relaxed">
        Each 64-bit word is XORed with two rotated copies of <em>itself</em>.
        This spreads one bit change to many positions — the <span className="text-emerald-400 font-bold">Avalanche Effect</span>.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-3xl">
        {DIFFUSION_WORDS.map((w, i) => (
          <motion.div
            key={w.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, type: "spring" }}
            className="bg-black/60 border border-white/5 rounded-2xl p-4 font-mono text-sm relative overflow-hidden"
          >
            {/* Base word */}
            <div className="flex items-center gap-4">
              <span className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold text-xs shrink-0 ${wordColorMap[w.color]}`}>
                {w.label}
              </span>
              <span className="tracking-[0.4em] text-zinc-300 font-bold">{w.original}...</span>
            </div>

            {/* Rotations */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex flex-col gap-1 border-l-2 border-emerald-800/50 ml-10 pl-4 mt-2 overflow-hidden"
                >
                  <div className="flex items-center gap-3 text-emerald-600">
                    <span className="text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded font-bold w-14 text-center">›› {w.rot1val}</span>
                    <span className="tracking-[0.4em] text-emerald-700">{w.rot1bits}...</span>
                  </div>
                  <div className="flex items-center gap-3 text-emerald-500">
                    <span className="text-[10px] bg-emerald-950/60 px-2 py-0.5 rounded font-bold w-14 text-center">›› {w.rot2val}</span>
                    <span className="tracking-[0.4em] text-emerald-600">{w.rot2bits}...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Result */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 + 0.15, type: "spring" }}
                  className="flex items-center gap-4 mt-3 border-t border-white/5 pt-3"
                >
                  <span className={`px-3 py-1 rounded-lg border text-[10px] font-bold shrink-0 ${resultColorMap[w.color]}`}>
                    ⊕ new {w.label}
                  </span>
                  <span className={`tracking-[0.4em] font-black ${resultColorMap[w.color].split(" ")[2]}`}>
                    {w.result}...
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] text-zinc-500 text-center max-w-sm"
        >
          A single bit flip in any word now affects many others.
          This is called the <span className="text-emerald-400 font-bold">Strict Avalanche Criterion</span>.
        </motion.div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function PermutationExplorer() {
  const { session } = useAsconStore();
  const [activeRound, setActiveRound] = useState(0);
  const [activeLayer, setActiveLayer] = useState<Layer>("constant");
  const [layerKey, setLayerKey] = useState(0); // forces re-mount and replay

  // Sync layer with narrative stage
  useEffect(() => {
    if (session?.currentStage === "SUBSTITUTION")   setActiveLayer("sbox");
    else if (session?.currentStage === "DIFFUSION") setActiveLayer("diffusion");
    else                                            setActiveLayer("constant");
    setLayerKey((k) => k + 1);
  }, [session?.currentStage]);

  const handleLayerChange = (l: Layer) => {
    setActiveLayer(l);
    setLayerKey((k) => k + 1);
  };

  const handleRoundChange = (r: number) => {
    setActiveRound(r);
    setLayerKey((k) => k + 1);
  };

  const handleNext = () => {
    const idx = LAYER_ORDER.indexOf(activeLayer);
    if (idx < LAYER_ORDER.length - 1) {
      handleLayerChange(LAYER_ORDER[idx + 1]);
    }
  };

  const handleReplay = useCallback(() => {
    setLayerKey((k) => k + 1);
  }, []);

  const meta = LAYER_META[activeLayer];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ── Round Selector ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 pt-4 pb-4 border-b border-white/5 overflow-x-auto custom-scrollbar shrink-0">
        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mr-3 shrink-0 whitespace-nowrap">
          Round
        </span>
        {ROUND_CONSTANTS.map((rc) => (
          <button
            key={rc.round}
            onClick={() => handleRoundChange(rc.round)}
            className={`flex-shrink-0 w-9 h-9 rounded-xl text-xs font-bold border transition-all ${
              activeRound === rc.round
                ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.5)]"
                : "bg-black/60 border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20"
            }`}
          >
            {rc.round + 1}
          </button>
        ))}
        <span className="ml-2 text-[10px] text-zinc-600 shrink-0 whitespace-nowrap">
          Constant: <span className="text-zinc-400 font-mono">0x{ROUND_CONSTANTS[activeRound].constant}</span>
        </span>
      </div>

      {/* ── Layer Selector ──────────────────────────────────────────── */}
      <div className="flex gap-2 px-4 py-3 border-b border-white/5 shrink-0 overflow-x-auto custom-scrollbar">
        {LAYER_ORDER.map((layer) => {
          const m = LAYER_META[layer];
          const isActive = activeLayer === layer;
          return (
            <button
              key={layer}
              onClick={() => handleLayerChange(layer)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? `${m.bgClass} ${m.borderClass} ${m.textClass} ${m.glowClass}`
                  : "bg-black/40 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10"
              }`}
            >
              {m.label}
              <span className={`text-[10px] font-normal hidden md:inline ${isActive ? "opacity-100" : "opacity-50"}`}>
                — {m.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Stage Context Banner ──────────────────────────────────────── */}
      <div className={`mx-4 mt-4 px-4 py-3 rounded-2xl border ${meta.bgClass} ${meta.borderClass} shrink-0`}>
        <div className={`text-[10px] font-bold uppercase tracking-widest ${meta.textClass} mb-0.5`}>
          Current Stage → {meta.label}
        </div>
        <div className="text-xs text-zinc-400 leading-relaxed">
          {activeLayer === "constant" && `Round ${activeRound + 1} — a unique constant 0x${ROUND_CONSTANTS[activeRound].constant} is XORed into word x2, making every round of the permutation compute a distinct function. This prevents slide attacks.`}
          {activeLayer === "sbox"     && "A single 5-bit column (one bit from each of x0–x4) passes through the S-Box look-up table. The output is guaranteed to be non-linearly different — no polynomial can model this substitution over a simple field."}
          {activeLayer === "diffusion" && "After S-Box, each 64-bit word is linearly mixed by XORing it with two rotated copies of itself. One changed bit spreads changes to ~32 bit positions (the Avalanche Effect)."}
        </div>
      </div>

      {/* ── Main Visualization Area ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${activeLayer}-${activeRound}-${layerKey}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="pt-4"
          >
            {activeLayer === "constant" && <ConstantLayer key={`c-${activeRound}-${layerKey}`} round={activeRound} />}
            {activeLayer === "sbox"     && <SBoxLayer key={`s-${layerKey}`} />}
            {activeLayer === "diffusion" && <DiffusionLayer key={`d-${layerKey}`} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Bottom Controls ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-white/5 shrink-0">
        <button
          onClick={handleReplay}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors text-xs font-bold"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Replay
        </button>

        {/* Layer progress dots */}
        <div className="flex items-center gap-2">
          {LAYER_ORDER.map((l) => {
            const m = LAYER_META[l];
            return (
              <button
                key={l}
                onClick={() => handleLayerChange(l)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  activeLayer === l
                    ? l === "constant" ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"
                    : l === "sbox"     ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
                    :                    "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    : "bg-zinc-800 hover:bg-zinc-600"
                }`}
              />
            );
          })}
        </div>

        {activeLayer !== "diffusion" ? (
          <button
            onClick={handleNext}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${meta.bgClass} ${meta.borderClass} ${meta.textClass} hover:opacity-80`}
          >
            Next Layer <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={() => { setActiveRound((r) => (r + 1) % 12); handleLayerChange("constant"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 transition-all"
          >
            <Play className="w-3.5 h-3.5" /> Next Round
          </button>
        )}
      </div>
    </div>
  );
}
