"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Activity,
  Gauge,
  Clock,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  ThreatSelectorRail,
  ThreatId,
  THREAT_MODELS,
} from "@/components/studio/security/ThreatSelectorRail";
import { BitFlippingAttack } from "@/components/studio/security/attacks/BitFlippingAttack";
import { AvalancheDifferentialAttack } from "@/components/studio/security/attacks/AvalancheDifferentialAttack";
import { NonceReuseAttack } from "@/components/studio/security/attacks/NonceReuseAttack";
import { PaddingOracleAttack } from "@/components/studio/security/attacks/PaddingOracleAttack";
import { SideChannelDPAAttack } from "@/components/studio/security/attacks/SideChannelDPAAttack";

export default function SecurityModule() {
  const [activeThreat, setActiveThreat] = useState<ThreatId>("malleability");
  const [isNistDrawerOpen, setIsNistDrawerOpen] = useState(false);

  const activeThreatData = THREAT_MODELS.find((t) => t.id === activeThreat) || THREAT_MODELS[0];

  const renderActiveThreat = () => {
    switch (activeThreat) {
      case "malleability":
        return <BitFlippingAttack />;
      case "differential":
        return <AvalancheDifferentialAttack />;
      case "nonce":
        return <NonceReuseAttack />;
      case "oracle":
        return <PaddingOracleAttack />;
      case "dpa":
        return <SideChannelDPAAttack />;
      default:
        return <BitFlippingAttack />;
    }
  };

  return (
    <div className="p-3 md:p-4 max-w-7xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col gap-3">
      {/* ── Top Header & Global Security Posture ── */}
      <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            <h1 className="text-lg font-black tracking-tight text-zinc-900 dark:text-white">
              Cryptographic Threat &amp; Defense Laboratory
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Interactive cryptanalysis arena: how ASCON-128 mathematically thwarts 5 major attack vectors.
          </p>
        </div>

        {/* Global Security Metrics Chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Resilience: 100% (5/5)</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
            <Gauge className="w-3.5 h-3.5 text-amber-500" />
            <span>SAC: 50.0%</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-700 dark:text-zinc-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-orange-500" />
            <span>Timing Δ: 0μs</span>
          </div>

          <button
            onClick={() => setIsNistDrawerOpen(!isNistDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-black font-bold text-xs transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>NIST Spec</span>
            {isNistDrawerOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ── NIST Spec Collapsible Drawer ── */}
      <AnimatePresence>
        {isNistDrawerOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-zinc-50 dark:bg-[#0c0d10] border border-zinc-200 dark:border-white/10 rounded-2xl p-4 text-xs text-zinc-600 dark:text-zinc-300 overflow-hidden shadow-sm shrink-0"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[11px]">
                NIST SP 800-232 &amp; Standard Evaluation Criteria
              </span>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                NIST Lightweight Cryptography Finalist Winner
              </span>
            </div>
            <p className="leading-relaxed">
              In 2023, NIST concluded a multi-year global competition to standardize lightweight cryptography
              for IoT, medical implants, and automotive microcontrollers. ASCON was selected as the #1 standard
              specifically for its comprehensive defense against <strong>ciphertext malleability</strong>,{" "}
              <strong>differential trails</strong>, and its unmatched suitability for <strong>low-cost side-channel threshold masking</strong>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Arena: Threat Rail (Left) + Attack Canvas (Right) ── */}
      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-3 w-full overflow-hidden">
        {/* Left Rail: 5 Threat Vectors */}
        <div className="w-full md:w-72 lg:w-80 shrink-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl p-3 shadow-sm overflow-y-auto custom-scrollbar">
          <ThreatSelectorRail
            activeThreat={activeThreat}
            onSelectThreat={(id) => setActiveThreat(id)}
          />
        </div>

        {/* Right Canvas: Interactive Simulation View */}
        <div className="flex-1 min-w-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeThreat}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="w-full h-full overflow-hidden"
            >
              {renderActiveThreat()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
