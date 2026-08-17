"use client";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { NarrativeStep } from "@/store/useAsconStore";
import { ChevronLeft, ChevronRight, X, MapPin } from "lucide-react";

// ─── Annotation data ──────────────────────────────────────────────────────────

interface Annotation {
  /** DOM element ID to spotlight. Falls back to "tour-visualizer" if not found. */
  targetId: string;
  title: string;
  description: string;
  /** Which side of the spotlight the callout card appears on. */
  calloutSide: "top" | "bottom" | "left" | "right";
}

export const ANNOTATIONS: Partial<Record<NarrativeStep, Annotation[]>> = {
  INPUT_PARAMETERS: [
    {
      targetId: "guide-mission-banner",
      title: "🎯 Mission Progress Bar",
      description: "Tracks your journey across all 6 high-level ASCON steps and total XP earned (max 900). Complete every challenge for the Master badge 🏆.",
      calloutSide: "bottom",
    },
    {
      targetId: "tour-visualizer",
      title: "🔑 Cryptographic Inputs",
      description: "We are preparing Sensor Data (Plaintext), a 128-bit Secret Key, a 128-bit Nonce, and Associated Data. These form the inputs to the AEAD cipher.",
      calloutSide: "right",
    },
  ],
  STATE_INITIALIZATION: [
    {
      targetId: "tour-visualizer",
      title: "🔲 The 320-bit State Matrix",
      description: "Five 64-bit words (x0–x4) form ASCON's entire working memory. They are initialized with the IV, Key, and Nonce, and then heavily scrambled using 12 rounds of the 'pa' permutation.",
      calloutSide: "right",
    },
    {
      targetId: "tour-narrative",
      title: "🔐 Why 12 Rounds?",
      description: "12 rounds guarantees full diffusion — a single flipped input bit changes approximately 160 of 320 output bits. This makes the key and nonce mathematically inseparable.",
      calloutSide: "left",
    },
  ],
  AD_PROCESSING: [
    {
      targetId: "tour-visualizer",
      title: "🔗 Binding Context",
      description: "Associated Data (like routing headers) is absorbed into the state using 'pb' permutations. It is not encrypted, but any tampering will invalidate the final tag.",
      calloutSide: "right",
    }
  ],
  PLAINTEXT_ENCRYPTION: [
    {
      targetId: "tour-visualizer",
      title: "⚙️ Plaintext processing & Permutations",
      description: "Plaintext is XORed into the rate (x0) to produce ciphertext. Then the state runs through the 'pb' permutation: Constant Addition (pc) → S-box Substitution (ps) → Linear Diffusion (pl).",
      calloutSide: "right",
    },
    {
      targetId: "tour-narrative",
      title: "🌊 Avalanche Effect",
      description: "The non-linear S-box (ps) mixed with the Rotate-XOR linear diffusion (pl) ensures that a single bit change rapidly propagates across the entire 320-bit state.",
      calloutSide: "left",
    },
  ],
  FINALIZATION: [
    {
      targetId: "tour-visualizer",
      title: "🔏 The Key Sandwich",
      description: "Structure: ① Key ⊕ state → ② pa (full 12 rounds) → ③ Key ⊕ state again. This double injection binds the authentication tag to the secret key, preventing length-extension attacks.",
      calloutSide: "right",
    }
  ],
  AUTH_OUTPUT: [
    {
      targetId: "tour-visualizer",
      title: "🏷️ Tag Extraction & Output",
      description: "Authentication Tag = (Key ⊕ x3) ‖ (Key ⊕ x4). These capacity words have processed the entire message. Any tampering anywhere in the pipeline changes this 128-bit tag completely.",
      calloutSide: "right",
    },
    {
      targetId: "tour-narrative",
      title: "🏆 Mission Complete!",
      description: "You've traced the full ASCON-128 AEAD pipeline! The receiver decrypts and recomputes the tag to verify integrity.",
      calloutSide: "left",
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const PADDING = 14; // px padding around the spotlight cutout
const CALLOUT_W = 330;

interface SpotlightGuideProps {
  step: NarrativeStep;
  onClose: () => void;
}

export function SpotlightGuide({ step, onClose }: SpotlightGuideProps) {
  const [annIdx, setAnnIdx] = useState(0);
  const [rect, setRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const [mounted, setMounted] = useState(false);

  const annotations = ANNOTATIONS[step] ?? [];
  const current = annotations[annIdx];
  const total = annotations.length;

  useEffect(() => { setMounted(true); }, []);

  /** Resolve where to spotlight */
  const refreshRect = useCallback(() => {
    if (!current) return;
    let el: HTMLElement | null = document.getElementById(current.targetId);
    if (!el) el = document.getElementById("tour-visualizer");
    if (!el) return;
    const r = el.getBoundingClientRect();
    setRect({ x: r.left, y: r.top, w: r.width, h: r.height });
  }, [current]);

  useEffect(() => {
    refreshRect();
    const id = requestAnimationFrame(refreshRect); // second pass after layout
    window.addEventListener("resize", refreshRect);
    return () => { cancelAnimationFrame(id); window.removeEventListener("resize", refreshRect); };
  }, [refreshRect]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  // Reset index when step changes
  useEffect(() => { setAnnIdx(0); }, [step]);

  if (!mounted || !current || total === 0) return null;

  const next = () => { if (annIdx < total - 1) setAnnIdx((i) => i + 1); else onClose(); };
  const prev = () => { if (annIdx > 0) setAnnIdx((i) => i - 1); };

  // Spotlight rect with padding
  const sx = rect.x - PADDING;
  const sy = rect.y - PADDING;
  const sw = rect.w + PADDING * 2;
  const sh = rect.h + PADDING * 2;

  // Callout position
  const GAP = 18;
  const vph = typeof window !== "undefined" ? window.innerHeight : 800;
  const vpw = typeof window !== "undefined" ? window.innerWidth : 1400;

  let cl = 0, ct = 0;

  switch (current.calloutSide) {
    case "right":
      cl = rect.x + rect.w + PADDING + GAP;
      ct = rect.y + rect.h / 2 - 100;
      break;
    case "left":
      cl = rect.x - PADDING - CALLOUT_W - GAP;
      ct = rect.y + rect.h / 2 - 100;
      break;
    case "bottom":
      cl = rect.x + rect.w / 2 - CALLOUT_W / 2;
      ct = rect.y + rect.h + PADDING + GAP;
      break;
    case "top":
      cl = rect.x + rect.w / 2 - CALLOUT_W / 2;
      ct = rect.y - PADDING - 220 - GAP;
      break;
  }
  // Clamp to viewport
  cl = Math.max(12, Math.min(cl, vpw - CALLOUT_W - 12));
  ct = Math.max(12, Math.min(ct, vph - 240));

  // CSS transition string shared across animated rects
  const transition = "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1), width 0.4s ease, height 0.4s ease";

  return createPortal(
    <div style={{ position: "fixed", inset: 0, zIndex: 9998, pointerEvents: "none" }}>
      {/* ── SVG Spotlight overlay ── */}
      <svg
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "all" }}
        onClick={onClose}
      >
        <defs>
          <mask id="ascon-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {/* Transparent cutout — CSS transitions animate SVG attrs in modern browsers */}
            <rect
              x={sx} y={sy} width={sw} height={sh} rx={14} ry={14}
              fill="black"
              style={{ transition }}
            />
          </mask>
        </defs>

        {/* Dark veil */}
        <rect
          width="100%" height="100%"
          fill="rgba(0,0,0,0.80)"
          mask="url(#ascon-spotlight-mask)"
        />

        {/* Glowing border ring — primary */}
        <rect
          x={sx} y={sy} width={sw} height={sh} rx={14} ry={14}
          fill="none"
          stroke="rgba(59,130,246,0.9)"
          strokeWidth={2}
          style={{ transition }}
        >
          <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        </rect>

        {/* Outer glow ring */}
        <rect
          x={sx - 5} y={sy - 5} width={sw + 10} height={sh + 10} rx={18} ry={18}
          fill="none"
          stroke="rgba(99,102,241,0.35)"
          strokeWidth={8}
          style={{ transition }}
        />

        {/* Corner accent — top-left */}
        <rect x={sx} y={sy} width={20} height={3} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1)" }} />
        <rect x={sx} y={sy} width={3} height={20} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1)" }} />

        {/* Corner accent — top-right */}
        <rect x={sx + sw - 20} y={sy} width={20} height={3} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1), width 0.4s ease" }} />
        <rect x={sx + sw - 3} y={sy} width={3} height={20} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1), width 0.4s ease" }} />

        {/* Corner accent — bottom-left */}
        <rect x={sx} y={sy + sh - 3} width={20} height={3} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1), height 0.4s ease" }} />
        <rect x={sx} y={sy + sh - 20} width={3} height={20} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1), height 0.4s ease" }} />

        {/* Corner accent — bottom-right */}
        <rect x={sx + sw - 20} y={sy + sh - 3} width={20} height={3} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1), width 0.4s ease, height 0.4s ease" }} />
        <rect x={sx + sw - 3} y={sy + sh - 20} width={3} height={20} fill="rgba(99,102,241,0.9)" rx={2} style={{ transition: "x 0.45s cubic-bezier(.34,1.3,.64,1), y 0.45s cubic-bezier(.34,1.3,.64,1), width 0.4s ease, height 0.4s ease" }} />
      </svg>

      {/* ── Callout card ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${annIdx}`}
          initial={{ opacity: 0, scale: 0.92, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={{ type: "spring", stiffness: 320, damping: 28 }}
          style={{
            position: "fixed",
            left: cl,
            top: ct,
            width: CALLOUT_W,
            zIndex: 9999,
            pointerEvents: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Arrow triangle pointing toward spotlight */}
          {current.calloutSide === "right" && (
            <span style={{
              position: "absolute", left: -10, top: "40%",
              width: 0, height: 0,
              borderRight: "10px solid rgba(59,130,246,0.5)",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
            }} />
          )}
          {current.calloutSide === "left" && (
            <span style={{
              position: "absolute", right: -10, top: "40%",
              width: 0, height: 0,
              borderLeft: "10px solid rgba(59,130,246,0.5)",
              borderTop: "8px solid transparent",
              borderBottom: "8px solid transparent",
            }} />
          )}
          {current.calloutSide === "bottom" && (
            <span style={{
              position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderBottom: "10px solid rgba(59,130,246,0.5)",
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
            }} />
          )}
          {current.calloutSide === "top" && (
            <span style={{
              position: "absolute", bottom: -10, left: "50%", transform: "translateX(-50%)",
              width: 0, height: 0,
              borderTop: "10px solid rgba(59,130,246,0.5)",
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
            }} />
          )}

          {/* Card body */}
          <div className="bg-[#0b0b14] border border-blue-500/40 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Top gradient bar */}
            <div className="h-0.5 w-full bg-gradient-to-r from-indigo-600 via-blue-500 to-purple-600" />

            <div className="p-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-0.5">
                      Spotlight {annIdx + 1} / {total}
                    </div>
                    <h3 className="text-white font-bold text-sm leading-snug">{current.title}</h3>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded-lg hover:bg-white/10 text-zinc-500 hover:text-zinc-200 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Description */}
              <p className="text-zinc-300 text-xs leading-relaxed mb-4">{current.description}</p>

              {/* Nav bar */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3">
                <button
                  onClick={prev}
                  disabled={annIdx === 0}
                  className="flex items-center gap-1 text-xs text-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>

                {/* Dot indicators */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: total }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setAnnIdx(i)}
                      className={`rounded-full transition-all ${
                        i === annIdx ? "w-4 h-1.5 bg-blue-500" : "w-1.5 h-1.5 bg-zinc-700 hover:bg-zinc-500"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-bold transition-colors"
                >
                  {annIdx === total - 1 ? "Done ✓" : "Next"}{" "}
                  {annIdx < total - 1 && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Keyboard hint */}
              <p className="text-[9px] text-zinc-700 text-center mt-2">← → arrow keys to navigate · Esc to close</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>,
    document.body
  );
}
