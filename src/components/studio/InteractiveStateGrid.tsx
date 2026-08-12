"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { INITIAL_STATE_BYTES, INITIAL_STATE_WORDS, INITIALIZED_STATE_BYTES } from "@/lib/asconDemoData";

const WORD_COLORS: Record<string, {
  bg: string; border: string; text: string; label: string; glow: string; dot: string;
}> = {
  blue: {
    bg: "bg-blue-900/20", border: "border-blue-500/30", text: "text-blue-300",
    label: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    glow: "shadow-[0_0_25px_rgba(59,130,246,0.2)]",
    dot: "bg-blue-500",
  },
  amber: {
    bg: "bg-amber-900/20", border: "border-amber-500/30", text: "text-amber-300",
    label: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    glow: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
    dot: "bg-amber-500",
  },
  rose: {
    bg: "bg-rose-900/20", border: "border-rose-500/30", text: "text-rose-300",
    label: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.2)]",
    dot: "bg-rose-500",
  },
};

const BYTE_COLORS: Record<string, string> = {
  blue:  "bg-blue-500/20 border-blue-500/40 text-blue-200",
  amber: "bg-amber-500/20 border-amber-500/40 text-amber-200",
  rose:  "bg-rose-500/20 border-rose-500/40 text-rose-200",
};

export function InteractiveStateGrid() {
  const { currentStepIndex, steps } = useAsconStore();
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const [hoveredByteIdx, setHoveredByteIdx] = useState<string | null>(null);

  const currentStage = steps[currentStepIndex];
  const isAfterInit = currentStepIndex >= steps.indexOf("INITIALIZATION");

  // Pick deterministic byte source — no Math.random() ever
  const byteSource = isAfterInit ? INITIALIZED_STATE_BYTES : INITIAL_STATE_BYTES;

  const tooltips: Record<string, Record<string, string>> = {
    INITIAL_STATE: {
      x0: "Initialization Vector (IV) — encodes algorithm variant, key size, rate, and capacity.",
      x1: "First 64 bits of the 128-bit Secret Key.",
      x2: "Last 64 bits of the 128-bit Secret Key.",
      x3: "First 64 bits of the Nonce — ensures this message is unique.",
      x4: "Last 64 bits of the Nonce — completes the 128-bit uniqueness guarantee.",
    },
    INITIALIZATION: {
      x0: "Word x0 is being scrambled in the p¹² permutation — all 12 rounds run now.",
      x1: "x1 is mixing key material throughout all 320 bits via S-Box + diffusion.",
      x2: "x2 absorbs round constants each round before the S-Box stage.",
      x3: "x3 holds Nonce — after p¹² it is inseparable from key material.",
      x4: "x4 completes the internal state — fully diffused after initialization.",
    },
    PLAINTEXT_PROCESSING: {
      x0: "⊕ XOR happening here: Plaintext block XORed into x0 → produces ciphertext.",
      x1: "Capacity word — never accessible to attacker. Hidden mixing zone.",
      x2: "Capacity word — deep state. No direct data leaks from here.",
      x3: "Capacity — feeds into authentication tag computation later.",
      x4: "Capacity — another secret reservoir for tag generation.",
    },
    AUTH_TAG: {
      x0: "Rate word — discarded at tag generation.",
      x1: "Rate word — discarded at tag generation.",
      x2: "Capacity — discarded at tag phase.",
      x3: "⬇ Tag[0:7] — these 64 bits form the FIRST half of the Authentication Tag.",
      x4: "⬇ Tag[8:15] — these 64 bits form the SECOND half of the Authentication Tag.",
    },
  };

  const getTooltip = (wordLabel: string) => {
    const stageTooltips = tooltips[currentStage];
    if (stageTooltips) return stageTooltips[wordLabel];
    return `Word ${wordLabel} — continuous cryptographic transformation in progress.`;
  };

  return (
    <div className="w-full bg-[#030303] border border-zinc-900 rounded-2xl p-5 relative overflow-hidden flex flex-col h-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-5 shrink-0">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            320-Bit Internal State Matrix
            <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold">
              Sponge Construction
            </span>
          </h3>
          <p className="text-zinc-500 text-xs mt-0.5">5 × 64-bit words. Hover any word to inspect its role at this stage.</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-bold shrink-0">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-zinc-500">IV</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-zinc-500">Key</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-zinc-500">Nonce</span>
          </div>
        </div>
      </div>

      {/* State Rows */}
      <div className="flex flex-col gap-2.5 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {INITIAL_STATE_WORDS.map((word, idx) => {
          const c = WORD_COLORS[word.color];
          const bytes = byteSource[word.label] ?? [];
          const isHovered = hoveredWord === idx;

          return (
            <motion.div
              key={word.label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 22 }}
              className={`flex flex-col p-3.5 rounded-xl border transition-all duration-300 relative ${
                isHovered ? `${c.bg} ${c.border} ${c.glow}` : "bg-black/80 border-white/5"
              }`}
              onMouseEnter={() => setHoveredWord(idx)}
              onMouseLeave={() => { setHoveredWord(null); setHoveredByteIdx(null); }}
            >
              {/* Row header */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold font-mono text-sm border ${c.label}`}>
                  {word.label}
                </div>
                <div>
                  <div className="text-zinc-300 text-xs font-bold">{word.role}</div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${WORD_COLORS[word.color].dot}`} />
                  <span className="text-[10px] text-zinc-600 font-mono">{word.hex}</span>
                </div>
              </div>

              {/* Byte cells */}
              <div className="grid grid-cols-8 gap-1">
                {bytes.map((byteVal, bIdx) => {
                  const id = `${idx}-${bIdx}`;
                  const isByteHovered = hoveredByteIdx === id;
                  return (
                    <motion.div
                      key={bIdx}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.08 + bIdx * 0.03 }}
                      onMouseEnter={() => setHoveredByteIdx(id)}
                      onMouseLeave={() => setHoveredByteIdx(null)}
                      className={`aspect-square flex items-center justify-center rounded-lg border font-mono text-xs font-bold cursor-crosshair transition-all ${
                        isByteHovered
                          ? "bg-white text-black border-white scale-110 z-10"
                          : BYTE_COLORS[word.color] ?? "bg-zinc-900 text-zinc-500 border-zinc-800"
                      }`}
                    >
                      {byteVal}
                    </motion.div>
                  );
                })}
              </div>

              {/* Contextual tooltip on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className={`absolute -top-14 left-1/2 -translate-x-1/2 w-72 px-4 py-2.5 rounded-xl bg-[#0a0a0e] border ${c.border} shadow-2xl z-50 pointer-events-none`}
                  >
                    <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${c.text}`}>
                      {word.label} — {word.role}
                    </div>
                    <div className="text-xs text-zinc-300 leading-snug">{getTooltip(word.label)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Ambient glow follows hovered word */}
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full blur-[80px] pointer-events-none"
        animate={{
          top: hoveredWord !== null ? hoveredWord * 72 : -200,
          left: "40%",
          opacity: hoveredWord !== null ? 0.15 : 0,
          background:
            hoveredWord !== null
              ? INITIAL_STATE_WORDS[hoveredWord].color === "blue"   ? "radial-gradient(circle, rgba(59,130,246,1), transparent)"
              : INITIAL_STATE_WORDS[hoveredWord].color === "amber"  ? "radial-gradient(circle, rgba(245,158,11,1), transparent)"
              :                                                        "radial-gradient(circle, rgba(244,63,94,1), transparent)"
              : "transparent"
        }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      />
    </div>
  );
}
