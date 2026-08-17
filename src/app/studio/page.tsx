"use client";

import { motion } from "framer-motion";
import { Activity, ShieldCheck, Zap, Cpu } from "lucide-react";
import Link from "next/link";
import { useAsconStore } from "@/store/useAsconStore";
import { useEffect } from "react";

export default function StudioDashboard() {
  const { isHardwareConnected, setHardwareConnected } = useAsconStore();

  useEffect(() => {
    let ws: WebSocket;
    let isMounted = true;
    
    const connectWS = () => {
      ws = new WebSocket("ws://127.0.0.1:8000/ws/hardware");
      
      ws.onopen = () => {
        if (isMounted) setHardwareConnected(true);
      };
      
      ws.onmessage = () => {
        if (isMounted) setHardwareConnected(true);
      };
      
      ws.onclose = () => {
        if (isMounted) {
          setHardwareConnected(false);
          setTimeout(connectWS, 3000);
        }
      };
      
      ws.onerror = () => {
        if (isMounted) setHardwareConnected(false);
      };
    };
    
    connectWS();
    
    return () => {
      isMounted = false;
      if (ws) ws.close();
    };
  }, [setHardwareConnected]);
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">ASCON Command Center</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Welcome to the interactive visualization environment.</p>
      </header>

      {/* Quick Stats Grid mimicking Grafana */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Execution Time", value: "0.24 ms", icon: Zap, color: "text-yellow-500 dark:text-yellow-400" },
          { label: "Throughput", value: "3.2 GB/s", icon: Activity, color: "text-blue-500 dark:text-blue-400" },
          { label: "Security Level", value: "128-bit", icon: ShieldCheck, color: "text-green-500 dark:text-green-400" },
          { 
            label: "ESP32 Status", 
            value: isHardwareConnected ? "Connected" : "Disconnected", 
            icon: Cpu, 
            color: isHardwareConnected ? "text-emerald-500 dark:text-emerald-400" : "text-red-500 dark:text-red-400" 
          },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm dark:shadow-none backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
              <stat.icon className={`w-16 h-16 ${stat.color}`} />
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{stat.label}</p>
            <p className="text-3xl font-semibold text-zinc-900 dark:text-white">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="border border-zinc-200 dark:border-white/10 rounded-xl bg-white dark:bg-black overflow-hidden flex flex-col md:flex-row h-96 shadow-md dark:shadow-none">
        <div className="p-8 flex flex-col justify-center w-full md:w-1/2 border-b md:border-b-0 md:border-r border-zinc-200 dark:border-white/10 gap-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 w-fit">
            Next Module
          </div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Understanding the 320-bit State</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
            The core of ASCON operations relies on updating a 320-bit state organized as five 64-bit words. 
            Dive into our interactive 3D visualization to see how standard bits map into this matrix during permutation.
          </p>
          <Link href="/studio/state" className="mt-4 bg-black text-white dark:bg-white dark:text-black font-semibold px-6 py-2 rounded-md w-fit hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
            Visualize State Matrix
          </Link>
        </div>
        <div className="w-full md:w-1/2 bg-gradient-to-br from-zinc-50 to-zinc-200 dark:from-zinc-900 dark:to-black relative">
          {/* Mockup for 3D state viewer visual */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="grid grid-rows-5 gap-2 opacity-30 dark:opacity-50 perspective-1000 transform -rotate-y-12 rotate-x-12">
              {[...Array(5)].map((_, r) => (
                <div key={r} className="flex gap-1">
                  {[...Array(16)].map((_, c) => (
                    <div key={c} className="w-2 h-2 rounded-sm bg-blue-600 dark:bg-blue-500 animate-pulse" style={{ animationDelay: `${(r * 16 + c) * 0.05}s` }}></div>
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
