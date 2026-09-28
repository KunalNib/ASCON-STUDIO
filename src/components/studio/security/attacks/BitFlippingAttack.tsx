"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Radio,
  Send,
  Zap,
  Layers,
  ChevronRight,
  Sliders,
  Sparkles,
} from "lucide-react";
import { emitSecurityLog } from "../AdversaryConsole";
import { playBitClick, playAlarmAlert, playGateSlam } from "@/lib/soundFx";

export function BitFlippingAttack() {
  // Original Message: "VALVE:OFF" -> 9 bytes
  const originalPlaintext = "VALVE:OFF";
  const defaultCiphertextHex = ["6C", "A3", "F4", "19", "E2", "0B", "71", "88", "C9"];
  const expectedTag = "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09";

  const [ciphertext, setCiphertext] = useState<string[]>([...defaultCiphertextHex]);
  const [selectedByteIdx, setSelectedByteIdx] = useState<number>(6); // Byte 6 ('O')
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(true);

  // Compute XOR delta between original and current ciphertext
  const getFlippedBitsCount = () => {
    let flips = 0;
    ciphertext.forEach((byte, idx) => {
      const orig = parseInt(defaultCiphertextHex[idx], 16);
      const curr = parseInt(byte, 16);
      let xor = orig ^ curr;
      while (xor > 0) {
        if (xor & 1) flips++;
        xor >>= 1;
      }
    });
    return flips;
  };

  const flippedBitsTotal = getFlippedBitsCount();
  const isTampered = flippedBitsTotal > 0;

  // Compute what legacy unauthenticated cipher decodes into: P' = P ^ (C ^ C')
  const getDecryptedLegacyPlaintext = () => {
    return Array.from(originalPlaintext)
      .map((char, idx) => {
        const origByte = parseInt(defaultCiphertextHex[idx] || "00", 16);
        const currByte = parseInt(ciphertext[idx] || "00", 16);
        const delta = origByte ^ currByte;
        const decodedChar = String.fromCharCode(char.charCodeAt(0) ^ delta);
        // Printable ASCII check
        const code = decodedChar.charCodeAt(0);
        return code >= 32 && code <= 126 ? decodedChar : "";
      })
      .join("");
  };

  // Toggle specific bit (0..7) of a byte
  const toggleBit = (byteIdx: number, bitIdx: number) => {
    playBitClick();
    const currVal = parseInt(ciphertext[byteIdx], 16);
    const newVal = currVal ^ (1 << bitIdx);
    const newHex = newVal.toString(16).toUpperCase().padStart(2, "0");

    const updated = [...ciphertext];
    updated[byteIdx] = newHex;
    setCiphertext(updated);

    emitSecurityLog(
      "INJECT",
      `Toggled bit ${bitIdx} on Byte[${byteIdx}]. Byte changed: 0x${ciphertext[byteIdx]} ⟹ 0x${newHex}`,
      newHex,
      "malleability"
    );
  };

  // Pre-configured attack injection: "OFF" -> "ON_"
  const injectTargetedExploit = () => {
    playBitClick();
    // To transform 'O' (0x4F) into 'O' and 'F' (0x46) into 'N' (0x4E)
    // 'F' ^ 'N' = 0x46 ^ 0x4E = 0x08 (bit 3)
    const updated = [...defaultCiphertextHex];
    const byte7Val = parseInt(defaultCiphertextHex[7], 16) ^ 0x08;
    updated[7] = byte7Val.toString(16).toUpperCase().padStart(2, "0");

    // 'F' ^ '_' = 0x46 ^ 0x5F = 0x19 (bits 4, 3, 0)
    const byte8Val = parseInt(defaultCiphertextHex[8], 16) ^ 0x19;
    updated[8] = byte8Val.toString(16).toUpperCase().padStart(2, "0");

    setCiphertext(updated);
    setSelectedByteIdx(7);
    emitSecurityLog(
      "INJECT",
      "Injected targeted ciphertext delta Δ to flip payload from 'VALVE:OFF' ⟹ 'VALVE:ON_'",
      "Δ=0x08,0x19",
      "malleability"
    );
  };

  const handleReset = () => {
    playBitClick();
    setCiphertext([...defaultCiphertextHex]);
    setSelectedByteIdx(6);
    emitSecurityLog("INFO", "Reset ciphertext to pristine transmission state.", undefined, "malleability");
  };

  const handleTransmit = () => {
    setIsTransmitting(true);
    setHasEvaluated(false);

    setTimeout(() => {
      setIsTransmitting(false);
      setHasEvaluated(true);
      if (isTampered) {
        playGateSlam();
        setTimeout(() => playAlarmAlert(), 150);
        emitSecurityLog(
          "AUTH_FAIL",
          "ASCON Decryption: Candidate tag T* diverges from expected tag. Authentication failed!",
          "T* ≠ T",
          "malleability"
        );
        emitSecurityLog(
          "BLOCKED",
          "Zero-Trust Gate closed! Plaintext memory wiped to 0x00. Actuator command DISCARDED.",
          "RELEASE_GATE_ZEROED",
          "malleability"
        );
      } else {
        emitSecurityLog(
          "SUCCESS",
          "ASCON Decryption: Sponge state integrity verified. Tag matched perfectly. Command released.",
          expectedTag.slice(0, 11),
          "malleability"
        );
      }
    }, 700);
  };

  const currentByteVal = parseInt(ciphertext[selectedByteIdx] || "00", 16);
  const originalByteVal = parseInt(defaultCiphertextHex[selectedByteIdx] || "00", 16);

  return (
    <div className="w-full h-full flex flex-col p-3 md:p-5 gap-4 overflow-y-auto custom-scrollbar">
      {/* ── Attack Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              Active Threat Arena
            </span>
            <span className="text-xs text-zinc-400 font-mono">CWE-327 / CWE-353 Malleability</span>
          </div>
          <h2 className="text-lg md:text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            Ciphertext Bit-Flipping &amp; In-Flight Malleability
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={injectTargetedExploit}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/10 hover:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Preset: &quot;VALVE:ON_&quot;</span>
          </button>
          <button
            onClick={handleTransmit}
            disabled={isTransmitting}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isTransmitting ? "Transmitting..." : "Send & Verify"}</span>
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 transition-colors"
            title="Reset to pristine ciphertext"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Interactive In-Flight Packet Bus & Adversary Interceptor ── */}
      <div className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 shadow-sm flex flex-col gap-3 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-72 h-32 bg-rose-500/5 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-zinc-800 dark:text-zinc-200">
              TRANSMISSION BUS (WIRE TAP)
            </span>
            <span className="text-[10px] text-zinc-400">
              {flippedBitsTotal > 0 ? (
                <span className="text-rose-500 font-bold">{flippedBitsTotal} Bit(s) Corrupted</span>
              ) : (
                <span className="text-emerald-500 font-medium">Pristine Ciphertext</span>
              )}
            </span>
          </div>

          <span className="text-[10px] font-mono text-zinc-400">
            Click byte to select, then toggle individual bits below
          </span>
        </div>

        {/* Transmission Visual Flow */}
        <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-black/40 rounded-xl border border-zinc-200 dark:border-white/5 overflow-x-auto">
          {/* Sender Node */}
          <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shrink-0 flex flex-col items-center">
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Sender</span>
            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">&quot;VALVE:OFF&quot;</span>
          </div>

          {/* Wire & Packet Bytes */}
          <div className="flex-1 flex items-center justify-center gap-1.5 min-w-[360px]">
            {ciphertext.map((hexByte, idx) => {
              const isSelected = selectedByteIdx === idx;
              const origByte = defaultCiphertextHex[idx];
              const isByteTampered = hexByte !== origByte;

              return (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    playBitClick();
                    setSelectedByteIdx(idx);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border font-mono transition-all relative ${
                    isByteTampered
                      ? "bg-rose-500/20 border-rose-500 text-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)] ring-1 ring-rose-500/40"
                      : isSelected
                      ? "bg-amber-500/10 border-amber-500 text-amber-500 shadow-sm"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400"
                  }`}
                >
                  {isByteTampered && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  )}
                  <span className="text-xs font-bold">0x{hexByte}</span>
                  <span className="text-[9px] text-zinc-400">[{idx}]</span>
                  <span className="text-[8px] text-zinc-500 mt-0.5 truncate max-w-[28px]">
                    &apos;{originalPlaintext[idx]}&apos;
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Receiver Node */}
          <div className="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 shrink-0 flex flex-col items-center">
            <span className="text-[9px] font-mono text-zinc-400 uppercase">Receiver</span>
            <span className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-200">Actuator</span>
          </div>
        </div>

        {/* ── 8-Bit Micro-Manipulator Panel ── */}
        <div className="p-3 bg-zinc-900 dark:bg-black rounded-xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-rose-500" />
            <div className="font-mono text-xs">
              <span className="text-zinc-400">Byte [{selectedByteIdx}] Bit Inspector: </span>
              <span className="font-bold text-white">0x{ciphertext[selectedByteIdx]}</span>{" "}
              <span className="text-zinc-500">
                (Orig: 0x{defaultCiphertextHex[selectedByteIdx]})
              </span>
            </div>
          </div>

          {/* 8 Bit Switches: b7 down to b0 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {Array.from({ length: 8 }).map((_, bitPos) => {
              const bitIdx = 7 - bitPos; // MSB to LSB
              const isBitSet = (currentByteVal & (1 << bitIdx)) !== 0;
              const wasBitSet = (originalByteVal & (1 << bitIdx)) !== 0;
              const hasChanged = isBitSet !== wasBitSet;

              return (
                <button
                  key={bitIdx}
                  onClick={() => toggleBit(selectedByteIdx, bitIdx)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border transition-all flex flex-col items-center ${
                    hasChanged
                      ? "bg-rose-600 text-white border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                      : isBitSet
                      ? "bg-zinc-700 text-zinc-200 border-zinc-600 hover:bg-zinc-600"
                      : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:bg-zinc-700"
                  }`}
                  title={`Toggle bit ${bitIdx} (weight 2^${bitIdx} = ${1 << bitIdx})`}
                >
                  <span>{isBitSet ? "1" : "0"}</span>
                  <span className="text-[8px] text-zinc-400 font-normal">b{bitIdx}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Side-by-Side Dual Decryption Arena ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Left: Legacy Unauthenticated Stream Cipher (AES-CTR) */}
        <div className="bg-white dark:bg-[#0c0d10] border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                  Legacy Unauthenticated Stream Cipher
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 border border-rose-500/20">
                AES-CTR / No MAC
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase">Cryptographic Malleability Formula</span>
                <div className="text-zinc-600 dark:text-zinc-400">P&apos; = C&apos; ⊕ Keystream</div>
                <div className="text-rose-500 font-bold">
                  P&apos; = (P ⊕ Δ) ⊕ Keystream = P ⊕ Δ
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase">Decoded Plaintext at Actuator</span>
                <div
                  className={`text-base font-bold font-mono tracking-wider ${
                    isTampered ? "text-rose-600 dark:text-rose-400" : "text-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  &quot;{getDecryptedLegacyPlaintext()}&quot;
                </div>
              </div>
            </div>
          </div>

          {/* Verdict Banner */}
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/5">
            {isTampered ? (
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                <div className="text-xs text-rose-600 dark:text-rose-400">
                  <span className="font-black block uppercase text-[11px]">Silent Exploit Succeeded!</span>
                  Receiver accepted modified ciphertext. Industrial valve position corrupted without warning.
                </div>
              </div>
            ) : (
              <div className="text-xs text-zinc-400 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Pristine transmission awaiting adversary bit-flip.</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: ASCON-128 AEAD Sponge Defense */}
        <div className="bg-white dark:bg-[#0c0d10] border border-emerald-500/40 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden ring-1 ring-emerald-500/20">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  ASCON-128 AEAD Autonomous Defense
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                NIST SP 800-232
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase">Sponge State Trajectory</span>
                <div className="text-zinc-600 dark:text-zinc-400">
                  Rate x0 absorbs C&apos; ⟹ Permutation p⁶ cascades Δ across all 320 bits
                </div>
                <div
                  className={`text-[11px] truncate font-bold ${
                    isTampered ? "text-rose-500" : "text-emerald-500"
                  }`}
                >
                  {isTampered
                    ? "Candidate Tag T* = 8E F4 01 7C ... ≠ Expected T"
                    : `Tag T* == T (${expectedTag.slice(0, 14)}...)`}
                </div>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-white/5 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase">Actuator Memory Release Gate</span>
                <div
                  className={`text-sm font-bold tracking-wider font-mono ${
                    isTampered
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {isTampered ? "[0x00 0x00 0x00... WIPED & QUARANTINED]" : 'RELEASED: "VALVE:OFF"'}
                </div>
              </div>
            </div>
          </div>

          {/* Verdict Banner / Zero-Trust Gate */}
          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-white/5">
            <AnimatePresence mode="wait">
              {isTampered ? (
                <motion.div
                  key="tampered"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div className="text-xs text-emerald-700 dark:text-emerald-400">
                    <span className="font-black block uppercase text-[11px]">
                      Zero-Trust Physical Gate Sealed!
                    </span>
                    Forgery detected at finalization. Decrypted buffer was zeroed in RAM before execution could trigger.
                  </div>
                </motion.div>
              ) : (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sponge capacity intact. Cryptographic authentication holding.</span>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
