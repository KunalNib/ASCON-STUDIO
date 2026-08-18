"use client";

import { motion } from "framer-motion";
import { Activity, Cpu, Battery, Gauge, Info } from "lucide-react";
import { useEffect, useState } from "react";

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState({
    fps: 60,
    latency: 14.2,
    cpuCycles: 2314,
    power: 3.4
  });

  // Mocking live telemetry data typically pushed via ESP32 / Backend
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        fps: 58 + Math.random() * 4,
        latency: 14 + Math.random() * 2,
        cpuCycles: 2300 + Math.floor(Math.random() * 50),
        power: 3.3 + Math.random() * 0.2
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1">Performance & Telemetry</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Real-time Grafana-style hardware analytics and ESP32 metrics.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 dark:opacity-5 group-hover:opacity-30 dark:group-hover:opacity-10 text-cyan-600 dark:text-cyan-500 transition-opacity"><Activity className="w-16 h-16"/></div>
          <div className="text-zinc-600 dark:text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-1">Execution Speed</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{metrics.fps.toFixed(1)} <span className="text-lg text-cyan-600 dark:text-cyan-500">FPS</span></div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 dark:opacity-5 group-hover:opacity-30 dark:group-hover:opacity-10 text-orange-600 dark:text-orange-500 transition-opacity"><Gauge className="w-16 h-16"/></div>
          <div className="text-zinc-600 dark:text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-1">Latency (End-to-End)</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{metrics.latency.toFixed(2)} <span className="text-lg text-orange-600 dark:text-orange-500">ms</span></div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 dark:opacity-5 group-hover:opacity-30 dark:group-hover:opacity-10 text-purple-600 dark:text-purple-500 transition-opacity"><Cpu className="w-16 h-16"/></div>
          <div className="text-zinc-600 dark:text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-1">MCU Cycles</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{metrics.cpuCycles} <span className="text-lg text-purple-600 dark:text-purple-500">/ op</span></div>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl p-5 shadow-sm dark:shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 dark:opacity-5 group-hover:opacity-30 dark:group-hover:opacity-10 text-green-600 dark:text-green-500 transition-opacity"><Battery className="w-16 h-16"/></div>
          <div className="text-zinc-600 dark:text-zinc-500 font-semibold text-xs tracking-wider uppercase mb-1">Power Draw</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{metrics.power.toFixed(2)} <span className="text-lg text-green-600 dark:text-green-500">mW</span></div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ESP32 Mock View */}
        <div className="md:col-span-2 bg-white dark:bg-[#0d0d0d] border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-sm dark:shadow-2xl">
          <div className="absolute top-4 left-4 flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-black/50 px-3 py-1 rounded-full border border-zinc-300 dark:border-white/5">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div> Mock ESP32 Device connected
          </div>
          <div className="w-48 h-64 border-2 border-zinc-300 dark:border-zinc-800 rounded-lg relative bg-zinc-100 dark:bg-zinc-950 flex flex-col p-4 shadow-[0_0_50px_rgba(0,0,0,0.05)] dark:shadow-[0_0_50px_rgba(255,255,255,0.05)]">
            {/* Mock ESP32 Hardware visual */}
            <div className="flex-1 mt-4 relative">
              <div className="absolute top-0 left-0 right-0 h-16 bg-zinc-200 dark:bg-zinc-900 border-b border-zinc-300 dark:border-zinc-800 mx-4">
                 <div className="text-[8px] text-zinc-500 dark:text-zinc-600 m-2 font-mono">ESP-WROOM-32</div>
              </div>
              
              <div className="absolute bottom-4 left-2 right-2 flex justify-between">
                <div className="w-1 h-32 bg-zinc-300 dark:bg-zinc-800 flex flex-col justify-between py-1">
                  {[...Array(15)].map((_, i) => <div key={i} className="w-full h-px bg-zinc-400 dark:bg-zinc-600"></div>)}
                </div>
                <div className="w-1 h-32 bg-zinc-300 dark:bg-zinc-800 flex flex-col justify-between py-1">
                  {[...Array(15)].map((_, i) => <div key={i} className="w-full h-px bg-zinc-400 dark:bg-zinc-600"></div>)}
                </div>
              </div>
            </div>
            
            {/* Glowing data flow lines */}
            <motion.div 
               animate={{ opacity: [0, 1, 0] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="absolute top-8 right-2 w-1 h-4 bg-green-500 rounded-full"
            />
          </div>
          
        </div>

        {/* Console / Logs */}
        <div className="bg-white dark:bg-[#050505] border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col">
          <div className="p-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-black/80 flex items-center gap-2">
            <Info className="w-4 h-4 text-zinc-500" />
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">SERIAL MONITOR</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto font-mono text-[10px] text-zinc-500 dark:text-zinc-500 space-y-1">
             <div className="text-green-600 dark:text-green-500">[INFO] Serial connection established at 115200 baud.</div>
             <div>[ESP] ASCON-128 initialized.</div>
             <div>[ESP] Memory allocated: 12.4 KB</div>
             <div className="text-blue-600 dark:text-blue-400">[ESP] Awaiting plaintext payload...</div>
             <div className="text-blue-600 dark:text-blue-400">[ESP] Transmitting telemetry packets to dashboard.</div>
             {[...Array(15)].map((_, i) => (
               <div key={i}>[DATA] 0x{Math.random().toString(16).substr(2, 8).toUpperCase()}... OK</div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}
