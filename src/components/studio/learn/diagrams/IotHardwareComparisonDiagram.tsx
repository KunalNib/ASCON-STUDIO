"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Cpu, BatteryCharging, HardDrive, Zap, CheckCircle2, XCircle } from "lucide-react";

export function IotHardwareComparisonDiagram() {
  const [selectedMetric, setSelectedMetric] = useState<"ram" | "cycles" | "battery" | "flash">("ram");

  const metrics = {
    ram: {
      title: "RAM Footprint (Working Memory)",
      unit: "Bytes of SRAM required",
      asconVal: 64,
      aesVal: 280,
      asconDisplay: "~64 Bytes (320-bit state)",
      aesDisplay: "~280 Bytes (S-box tables + buffers)",
      advantage: "4.3x less RAM required",
      desc: "ASCON's 320-bit state fits into just five 64-bit registers (40 bytes total + minimal stack). AES requires storing 256-byte substitution tables (T-tables) or incurring heavy compute penalties.",
    },
    cycles: {
      title: "CPU Cycles per Byte (Speed)",
      unit: "Cycles / Byte on 32-bit RISC-V",
      asconVal: 85,
      aesVal: 340,
      asconDisplay: "~85 Cycles / Byte",
      aesDisplay: "~340 Cycles / Byte (AES-GCM)",
      advantage: "4x faster on low-end CPUs",
      desc: "ASCON uses native bitwise instructions (AND, XOR, NOT, ROTR) supported natively in 1 cycle on almost all microprocessors without needing specialized hardware crypto accelerators.",
    },
    battery: {
      title: "Sensor Battery Lifespan",
      unit: "Estimated operating life on CR2032 coin cell",
      asconVal: 36,
      aesVal: 11,
      asconDisplay: "~36 Months (3 Years)",
      aesDisplay: "~11 Months (Under 1 Year)",
      advantage: "3.2x longer battery life",
      desc: "In periodic IoT reporting (sending sensor readings every minute), the microcontroller spends drastically less active energy running cryptographic loops before going back to deep sleep.",
    },
    flash: {
      title: "Flash Code Size (Program Memory)",
      unit: "Kilobytes of compiled firmware",
      asconVal: 1.4,
      aesVal: 7.2,
      asconDisplay: "~1.4 KB",
      aesDisplay: "~7.2 KB (AES-GCM + GHASH)",
      advantage: "5.1x smaller firmware footprint",
      desc: "AES-GCM requires both AES block cipher code and GHASH polynomial multiplication logic. ASCON implements encryption, hashing, and authentication from a single shared 320-bit permutation.",
    },
  };

  const current = metrics[selectedMetric];

  return (
    <div className="w-full flex flex-col items-center bg-zinc-50 dark:bg-black/40 border border-zinc-200 dark:border-white/10 rounded-2xl p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            Hardware Benchmark on IoT Microcontrollers (ESP32 / RISC-V)
          </span>
          <h4 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            Why NIST Standardized ASCON over Traditional AES
          </h4>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold gap-1 flex-wrap">
          {[
            { id: "ram", label: "RAM Memory", icon: HardDrive },
            { id: "cycles", label: "CPU Speed", icon: Cpu },
            { id: "battery", label: "Battery Life", icon: BatteryCharging },
            { id: "flash", label: "Firmware Size", icon: Zap },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMetric(m.id as any)}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  selectedMetric === m.id
                    ? "bg-white dark:bg-black text-emerald-600 dark:text-emerald-400 shadow-sm"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Benchmark Comparison Cards */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ASCON Card */}
        <motion.div
          key={`ascon-${selectedMetric}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-400 dark:border-emerald-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-md"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ASCON-128 (Lightweight Standard)
              </span>
              <span className="text-[10px] bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2 py-0.5 rounded font-bold">
                Winner
              </span>
            </div>

            <div className="text-3xl font-black text-emerald-700 dark:text-emerald-300 font-mono my-2">
              {current.asconDisplay}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-2">
              {current.desc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <span>Performance Edge</span>
            <span className="bg-emerald-600 text-white px-2.5 py-0.5 rounded-full text-[11px]">
              {current.advantage}
            </span>
          </div>
        </motion.div>

        {/* Traditional AES-128-GCM Card */}
        <motion.div
          key={`aes-${selectedMetric}`}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-zinc-500" />
                AES-128-GCM (Heavyweight Classic)
              </span>
              <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded font-bold">
                Legacy
              </span>
            </div>

            <div className="text-3xl font-black text-zinc-700 dark:text-zinc-300 font-mono my-2">
              {current.aesDisplay}
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed mt-2">
              Designed in 1998 for desktop workstations and enterprise servers with dedicated hardware acceleration, not 8-bit/32-bit battery-operated microcontrollers.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 font-medium">
            Requires hardware AES instruction set for acceptable speed.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
