"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Cpu } from "lucide-react";
import Link from "next/link";

export default function StudioDashboard() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">ASCON Command Center</h1>
        <p className="text-zinc-400">Welcome to the interactive visualization environment.</p>
      </header>

      {/* Quick Stats Grid mimicking Grafana */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Execution Time", value: "0.24 ms", icon: Zap, color: "text-yellow-400" },
          { label: "Throughput", value: "3.2 GB/s", icon: Activity, color: "text-blue-400" },
          { label: "Security Level", value: "128-bit", icon: ShieldCheck, color: "text-green-400" },
          { label: "ESP32 Status", value: "Disconnected", icon: Cpu, color: "text-red-400" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <stat.icon className={`w-16 h-16 ${stat.color}`} />
            </div>
            <p className="text-zinc-400 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-semibold text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="border border-white/10 rounded-xl bg-black overflow-hidden flex flex-col md:flex-row h-96">
        <div className="p-8 flex flex-col justify-center w-full md:w-1/2 border-b md:border-b-0 md:border-r border-white/10 gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-500/10 text-blue-400 w-fit">
            Next Module
          </div>
          <h2 className="text-2xl font-bold">Understanding the 320-bit State</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            The core of ASCON operations relies on updating a 320-bit state organized as five 64-bit words. 
            Dive into our interactive 3D visualization to see how standard bits map into this matrix during permutation.
          </p>
          <Link href="/studio/state" className="mt-4 bg-white text-black font-semibold px-6 py-2 rounded-md w-fit hover:bg-zinc-200 transition-colors">
            Visualize State Matrix
          </Link>
        </div>
        <div className="w-full md:w-1/2 bg-gradient-to-br from-zinc-900 to-black relative">
          {/* Mockup for 3D state viewer visual */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-rows-5 gap-2 opacity-50 perspective-1000 transform -rotate-y-12 rotate-x-12">
              {[...Array(5)].map((_, r) => (
                <div key={r} className="flex gap-1">
                  {[...Array(16)].map((_, c) => (
                    <div key={c} className="w-2 h-2 rounded-sm bg-blue-500 animate-pulse" style={{ animationDelay: `${(r * 16 + c) * 0.05}s` }}></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
