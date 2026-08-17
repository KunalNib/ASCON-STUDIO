import { Cpu, Activity, Zap, Server } from "lucide-react";
import { motion } from "framer-motion";

export function PerformanceLab() {
  const metrics = [
    { label: "Execution Latency", value: "0.24 ms", icon: Zap, color: "text-amber-400" },
    { label: "CPU Cycles", value: "3,402", icon: Cpu, color: "text-blue-400" },
    { label: "RAM Usage (Peak)", value: "320 bits", icon: Server, color: "text-emerald-400" },
    { label: "Throughput", value: "1.2 GB/s", icon: Activity, color: "text-purple-400" }
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8 p-6 pb-12">
       
       <div className="text-center mb-4">
         <h2 className="text-3xl font-bold flex items-center justify-center gap-3 text-zinc-900 dark:text-white mb-2">
           <Zap className="w-8 h-8 text-amber-500" />
           Hardware Performance Metrics
         </h2>
         <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto text-sm leading-relaxed">
           ASCON destroys AES-GCM on embedded devices because it strictly utilizes logical AND, NOT, XOR. It avoids memory-heavy lookup tables which drain battery and cache times.
         </p>
       </div>

       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-5xl">
         {metrics.map((m, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-white dark:bg-black border border-zinc-200 dark:border-white/5 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm dark:shadow-xl relative overflow-hidden"
           >
              <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50" style={{ color: "transparent" }}>
                <div className={`w-full h-full ${m.color.replace('text', 'bg')}`} />
              </div>
              <m.icon className={`w-8 h-8 mb-4 ${m.color}`} />
              <div className="text-2xl font-bold text-zinc-900 dark:text-white mb-1 font-mono">{m.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">{m.label}</div>
           </motion.div>
         ))}
       </div>

       <div className="w-full max-w-5xl bg-zinc-50 dark:bg-[#09090b] border border-zinc-200 dark:border-white/5 rounded-3xl p-8 mt-8 flex gap-8 items-center shadow-sm dark:shadow-none">
          <div className="flex-1 space-y-4">
             <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">ESP32 Simulation Map</h3>
             <div className="flex flex-col gap-2 font-mono text-xs">
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 p-2 bg-white dark:bg-black rounded border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                   <span>Flash Memory Overhead</span>
                   <span className="text-zinc-800 dark:text-zinc-200">~2.4 KB (AES: 14KB)</span>
                </div>
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 p-2 bg-white dark:bg-black rounded border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                   <span>State Size</span>
                   <span className="text-emerald-600 dark:text-emerald-400">40 Bytes (Perfect for registers)</span>
                </div>
                <div className="flex justify-between items-center text-zinc-600 dark:text-zinc-400 p-2 bg-white dark:bg-black rounded border border-zinc-200 dark:border-white/5 shadow-sm dark:shadow-none">
                   <span>Instruction Set Architecture</span>
                   <span className="text-blue-600 dark:text-blue-400">Extremely lightweight</span>
                </div>
             </div>
          </div>

          <div className="w-64 h-64 bg-white dark:bg-black rounded-full border-4 border-amber-300 dark:border-amber-500/20 flex flex-col items-center justify-center p-4 text-center shadow-[0_0_30px_rgba(245,158,11,0.1)] relative">
             <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute inset-4 rounded-full border border-dashed border-amber-500/30" />
             <Activity className="w-10 h-10 text-amber-500 mb-2" />
             <div className="text-amber-500 font-bold uppercase tracking-widest text-[10px]">Live Profiling</div>
             <div className="text-zinc-900 dark:text-white font-mono mt-1 text-2xl">ACTIVE</div>
          </div>
       </div>

    </div>
  );
}
