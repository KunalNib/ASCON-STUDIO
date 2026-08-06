"use client";

import { useEffect, useState } from "react";
import { Cpu, Activity, Zap, Terminal } from "lucide-react";
import { motion } from "framer-motion";

export default function HardwareDashboard() {
  const [logs, setLogs] = useState<string[]>([]);
  const [power, setPower] = useState(0);

  useEffect(() => {
    // Mock UART streaming and power sensor
    const interval = setInterval(() => {
      setLogs((prev) => {
        const newLogs = [...prev, `[ESP32] UART RX: ${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase()}...`];
        return newLogs.slice(-8);
      });
      setPower(30 + Math.random() * 15);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 text-zinc-300 max-w-7xl mx-auto space-y-8 font-sans">
      <header>
        <h2 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
          <Cpu className="w-8 h-8 text-blue-500" />
          Hardware Target: ESP32-C3
        </h2>
        <p className="border-l-4 border-blue-500 pl-4 py-1 text-zinc-400 max-w-3xl">
          ASCON is designed for constrained IoT devices. This dashboard monitors a simulated live deployment on an ESP32 RISC-V microcontroller, profiling power consumption and latency compared to standard AES-GCM.
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* KPI Cards */}
         <div className="bg-black border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-zinc-500 text-sm font-semibold">ASCON ROM Footprint</div>
                  <div className="text-3xl font-bold text-white mt-1">7.2 KB</div>
               </div>
               <div className="p-2 bg-green-500/10 rounded-lg"><Activity className="w-5 h-5 text-green-400" /></div>
            </div>
            <p className="text-xs text-green-400 mt-4 align-middle">↓ 45% smaller than AES-GCM</p>
         </div>

         <div className="bg-black border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
               <div>
                  <div className="text-zinc-500 text-sm font-semibold">Live Power Draw</div>
                  <div className="text-3xl font-bold text-white mt-1 flex items-baseline gap-1">
                     {power.toFixed(1)} <span className="text-lg text-zinc-500">mW</span>
                  </div>
               </div>
               <div className="p-2 bg-yellow-500/10 rounded-lg"><Zap className="w-5 h-5 text-yellow-400" /></div>
            </div>
            {/* Animated power bar */}
            <div className="w-full h-2 bg-zinc-900 rounded-full mt-4 overflow-hidden">
               <motion.div className="h-full bg-yellow-400" animate={{ width: `${(power/60)*100}%` }} transition={{ type: "tween" }} />
            </div>
         </div>

         <div className="bg-black border border-zinc-800 rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="text-zinc-500 text-sm font-semibold mb-2">Algorithm Latency</div>
            <div className="space-y-3">
               <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-blue-400">ASCON-128</span><span className="text-white">12.4 ms</span></div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full"><div className="h-full bg-blue-500 w-[30%]" /></div>
               </div>
               <div>
                  <div className="flex justify-between text-xs mb-1"><span className="text-zinc-500">AES-256-GCM</span><span className="text-white">35.1 ms</span></div>
                  <div className="w-full h-1.5 bg-zinc-900 rounded-full"><div className="h-full bg-zinc-600 w-[80%]" /></div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-xl h-64 flex flex-col relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none" />
         <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
            <Terminal className="w-5 h-5 text-zinc-400" />
            <h3 className="text-lg font-bold text-white">Live UART Ciphertext Intercept</h3>
            <span className="ml-auto flex items-center gap-2 text-xs font-mono text-green-400"><span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> TX/RX ACTIVE</span>
         </div>
         <div className="flex-1 overflow-y-auto font-mono text-xs text-blue-300 space-y-1">
            {logs.map((log, i) => (
               <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="py-1">
                  {log}
               </motion.div>
            ))}
         </div>
      </div>
    </div>
  );
}
