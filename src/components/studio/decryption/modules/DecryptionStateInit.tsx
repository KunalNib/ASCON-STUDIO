"use client";

import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { Cpu, Zap, Layers, ShieldCheck, ArrowRight, RefreshCw } from "lucide-react";
import { useAsconStore } from "@/store/useAsconStore";
import { Ascon128 } from "@/lib/ascon";
import { CryptoTerm } from "@/components/ui/CryptoTerm";

export function DecryptionStateInit() {
  const { decryptionKey, decryptionNonce } = useAsconStore();
  const [activeRound, setActiveRound] = useState(0);
  const [isPermuting, setIsPermuting] = useState(false);
  const [permuted, setPermuted] = useState(false);

  const keyClean = (decryptionKey || "000102030405060708090A0B0C0D0E0F").padEnd(32, "0").slice(0, 32);
  const nonceClean = (decryptionNonce || "000102030405060708090A0B0C0D0E0F").padEnd(32, "0").slice(0, 32);

  // Compute live initial and permuted state words
  const stateMatrix = useMemo(() => {
    const enc = Ascon128.encryptAEAD(keyClean, nonceClean, "ESP32-STATION-1", "27.4 °C");
    const initialWords = [
      { label: "x0", hex: enc.initialStateWords[0] || "80400C0600000000", role: "IV (64-bit)" },
      { label: "x1", hex: enc.initialStateWords[1] || keyClean.slice(0, 16), role: "Key [0:63]" },
      { label: "x2", hex: enc.initialStateWords[2] || keyClean.slice(16, 32), role: "Key [64:127]" },
      { label: "x3", hex: enc.initialStateWords[3] || nonceClean.slice(0, 16), role: "Nonce [0:63]" },
      { label: "x4", hex: enc.initialStateWords[4] || nonceClean.slice(16, 32), role: "Nonce [64:127]" },
    ];

    const permutedWords = [
      { label: "x0", hex: enc.initializedStateWords[0] || "BC830FBEF3A1651B" },
      { label: "x1", hex: enc.initializedStateWords[1] || "487A66865036B909" },
      { label: "x2", hex: enc.initializedStateWords[2] || "A031B0C5810C1CD6" },
      { label: "x3", hex: enc.initializedStateWords[3] || "DD7CE72083702217" },
      { label: "x4", hex: enc.initializedStateWords[4] || "9B17156EDE557CE7" },
    ];

    return { initialWords, permutedWords };
  }, [keyClean, nonceClean]);

  const runPermutationSimulation = () => {
    setIsPermuting(true);
    let r = 0;
    const interval = setInterval(() => {
      r++;
      setActiveRound(r);
      if (r >= 12) {
        clearInterval(interval);
        setIsPermuting(false);
        setPermuted(true);
      }
    }, 140);
  };

  const handleReset = () => {
    setActiveRound(0);
    setPermuted(false);
    setIsPermuting(false);
  };

  const toBytes = (hex: string) => {
    const bytes: string[] = [];
    for (let i = 0; i < 16; i += 2) {
      bytes.push(hex.slice(i, i + 2));
    }
    return bytes;
  };

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto gap-5 overflow-y-auto custom-scrollbar items-center">
      {/* Header */}
      <div className="text-center shrink-0">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-2 border border-emerald-500/20">
          <span>Plain English: Setting Up Internal Memory &amp; Blending the Master Key</span>
        </div>
        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
          <Cpu className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          State Initialization &amp; <CryptoTerm term="Sponge" display="Sponge Symmetry" />
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-sm leading-relaxed">
          ASCON initializes the 320-bit state with the 64-bit <CryptoTerm term="IV" display="IV" />, 128-bit <CryptoTerm term="Key" display="Key" />, and 128-bit <CryptoTerm term="Nonce" display="Nonce" />.
          Notice the key architectural marvel:{" "}
          <strong className="text-emerald-600 dark:text-emerald-400">
            Decryption uses the exact same forward 12-round permutation (<CryptoTerm term="p12" display="p¹²" />)
          </strong>
          — no inverse S-box or reverse linear layer circuits are needed!
        </p>
      </div>

      {/* Hardware highlight card */}
      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div>
          <span className="font-bold">Lightweight IoT Architecture Win: </span>
          Traditional AES requires distinct encryption and decryption hardware (SubBytes vs InvSubBytes).
          ASCON sponge construction evaluates <CryptoTerm term="S-Box" display="p(S)" /> in the forward direction
          identically on both endpoints, reducing silicon area by ~40%.
        </div>
      </div>

      {/* 320-bit State Matrix Visual */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-5 gap-3">
        {stateMatrix.initialWords.map((w, idx) => {
          const displayBytes = permuted
            ? toBytes(stateMatrix.permutedWords[idx]?.hex || "0000000000000000")
            : toBytes(w.hex);

          return (
            <motion.div
              key={w.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 flex flex-col gap-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {w.label}
                </span>
                <span className="text-[10px] uppercase font-bold text-zinc-400">{w.role}</span>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {displayBytes.map((byte, bIdx) => (
                  <motion.div
                    key={bIdx}
                    animate={
                      isPermuting
                        ? {
                            backgroundColor: ["rgba(16,185,129,0.1)", "rgba(16,185,129,0.4)", "rgba(16,185,129,0.1)"],
                            scale: [1, 1.05, 1],
                          }
                        : {}
                    }
                    transition={{ repeat: isPermuting ? Infinity : 0, duration: 0.3, delay: bIdx * 0.02 }}
                    className="p-1 rounded bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/5 text-center font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-200"
                  >
                    {byte}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Permutation Controls & Round Progress */}
      <div className="w-full bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
              Forward Permutation <CryptoTerm term="p12" display="p¹²" /> Execution (12 Rounds: 0 → 11)
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {!permuted ? (
              <button
                onClick={runPermutationSimulation}
                disabled={isPermuting}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>{isPermuting ? `Executing Round ${activeRound}/12...` : "Run Forward Permutation p¹²"}</span>
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-semibold transition-all"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset to S₀</span>
              </button>
            )}
          </div>
        </div>

        {/* 12-Round Progress Bar */}
        <div className="flex items-center gap-1.5 w-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-3 rounded-full border transition-all ${
                i < activeRound
                  ? "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : i === activeRound && isPermuting
                  ? "bg-yellow-400 border-yellow-300 animate-pulse"
                  : "bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200 dark:border-white/5"
              }`}
              title={`Round ${i}`}
            />
          ))}
        </div>

        {/* Round internals summary with plain English */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-200 dark:border-white/5 text-xs text-zinc-600 dark:text-zinc-400">
          <div>
            <strong className="text-zinc-900 dark:text-white block mb-0.5">
              1. Constant Addition (<CryptoTerm term="Addition of Constants" display="pC" />)
            </strong>
            <span>Injects unique round numbers so rounds don&apos;t repeat patterns.</span>
          </div>
          <div>
            <strong className="text-zinc-900 dark:text-white block mb-0.5">
              2. Substitution Layer (<CryptoTerm term="S-Box" display="pS" />)
            </strong>
            <span>64 parallel 5-bit S-boxes confuse linear mathematical analysis.</span>
          </div>
          <div>
            <strong className="text-zinc-900 dark:text-white block mb-0.5">
              3. Linear Diffusion (<CryptoTerm term="Linear Diffusion" display="pL" />)
            </strong>
            <span>Rotates and spreads every bit across all 64 positions in the register.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

