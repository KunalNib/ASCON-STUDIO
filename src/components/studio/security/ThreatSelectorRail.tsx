"use client";

import { motion } from "framer-motion";
import {
  ShieldAlert,
  Flame,
  Zap,
  RotateCcw,
  Clock,
  Activity,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export type ThreatId = "malleability" | "differential" | "nonce" | "oracle" | "dpa";

export interface ThreatItem {
  id: ThreatId;
  title: string;
  subtitle: string;
  icon: typeof Flame;
  severity: "CRITICAL" | "HIGH" | "MATH" | "PHYSICAL";
  severityColor: string;
  asconDefenseSummary: string;
}

export const THREAT_MODELS: ThreatItem[] = [
  {
    id: "malleability",
    title: "Ciphertext Bit-Flipping",
    subtitle: "Active Man-in-the-Middle Malleability",
    icon: Flame,
    severity: "CRITICAL",
    severityColor: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    asconDefenseSummary: "Sponge state capacity continuously binds ciphertext, failing MAC verification instantly.",
  },
  {
    id: "differential",
    title: "Differential Cryptanalysis",
    subtitle: "Strict Avalanche Criterion (SAC) Failure",
    icon: Zap,
    severity: "MATH",
    severityColor: "text-amber-500 bg-amber-500/10 border-amber-500/30",
    asconDefenseSummary: "5-bit optimal S-box + linear diffusion achieves ~50% bit flip saturation by Round 4.",
  },
  {
    id: "nonce",
    title: "Nonce-Reuse / Two-Time Pad",
    subtitle: "Keystream Cancellation Attack",
    icon: RotateCcw,
    severity: "CRITICAL",
    severityColor: "text-rose-500 bg-rose-500/10 border-rose-500/30",
    asconDefenseSummary: "Plaintext absorption in duplex rate alters state trajectory; tag forgery remains impossible.",
  },
  {
    id: "oracle",
    title: "Timing & Decryption Oracle",
    subtitle: "Bleichenbacher / Padding Side-Channel",
    icon: Clock,
    severity: "HIGH",
    severityColor: "text-orange-500 bg-orange-500/10 border-orange-500/30",
    asconDefenseSummary: "O(1) constant-time tag verification gates all releases; minimal 10* padding eliminates oracles.",
  },
  {
    id: "dpa",
    title: "Side-Channel Power DPA",
    subtitle: "Differential Power Analysis on IoT Microcontrollers",
    icon: Activity,
    severity: "PHYSICAL",
    severityColor: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30",
    asconDefenseSummary: "Algebraic degree of only 2 allows lightweight 3-share Threshold Masking on constrained MCUs.",
  },
];

interface ThreatSelectorRailProps {
  activeThreat: ThreatId;
  onSelectThreat: (id: ThreatId) => void;
}

export function ThreatSelectorRail({ activeThreat, onSelectThreat }: ThreatSelectorRailProps) {
  return (
    <div className="flex flex-col gap-2.5 w-full">
      <div className="flex items-center justify-between px-2 mb-1">
        <span className="text-[11px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          Adversary Threat Vectors
        </span>
        <span className="text-[10px] font-mono text-zinc-400">5 Models</span>
      </div>

      <div className="flex flex-col gap-2">
        {THREAT_MODELS.map((threat) => {
          const isActive = activeThreat === threat.id;
          const Icon = threat.icon;

          return (
            <motion.button
              key={threat.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectThreat(threat.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col gap-1.5 ${
                isActive
                  ? "bg-white dark:bg-[#0f1117] border-rose-500 dark:border-rose-500 shadow-md dark:shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/40"
                  : "bg-white/80 dark:bg-white/[0.02] border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/20 hover:bg-zinc-50 dark:hover:bg-white/[0.04]"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      isActive
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {threat.title}
                  </span>
                </div>

                <span
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${threat.severityColor}`}
                >
                  {threat.severity}
                </span>
              </div>

              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug line-clamp-1 pl-8">
                {threat.subtitle}
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
