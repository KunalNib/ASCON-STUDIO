import { useState } from "react";
import { ShieldAlert, ShieldX, KeySquare, Zap, Crosshair } from "lucide-react";
import { SecurityVisualizer } from "@/components/studio/SecurityVisualizer";

export function SecurityPlayground() {
  const [activeExp, setActiveExp] = useState<"avalanche" | "tamper" | "nonce" | "brute">("avalanche");

  return (
    <div className="w-full h-full flex p-6 gap-6 pt-0">
      
      {/* Sidebar for Experiments */}
      <div className="w-1/3 flex flex-col gap-3">
         <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
           <Crosshair className="text-rose-500 w-5 h-5" /> Threat Models
         </h2>

         <button 
           onClick={() => setActiveExp("avalanche")}
           className={`p-4 rounded-xl border text-left transition-all ${activeExp === 'avalanche' ? 'bg-rose-900/20 border-rose-500 shadow-inner' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}
         >
            <Zap className={`w-5 h-5 mb-2 ${activeExp === 'avalanche' ? 'text-rose-400' : 'text-zinc-600'}`} />
            <div className="font-bold text-white mb-1">Avalanche Effect</div>
            <div className="text-xs">Observe a single bit-flip cascading through the sponge state.</div>
         </button>

         <button 
           onClick={() => setActiveExp("tamper")}
           className={`p-4 rounded-xl border text-left transition-all ${activeExp === 'tamper' ? 'bg-rose-900/20 border-rose-500 shadow-inner' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}
         >
            <ShieldX className={`w-5 h-5 mb-2 ${activeExp === 'tamper' ? 'text-rose-400' : 'text-zinc-600'}`} />
            <div className="font-bold text-white mb-1">Ciphertext Tampering</div>
            <div className="text-xs">Modify ciphertext in transit and watch the MAC verification fail.</div>
         </button>

         <button 
           onClick={() => setActiveExp("nonce")}
           className={`p-4 rounded-xl border text-left transition-all ${activeExp === 'nonce' ? 'bg-rose-900/20 border-rose-500 shadow-inner' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}
         >
            <ShieldAlert className={`w-5 h-5 mb-2 ${activeExp === 'nonce' ? 'text-rose-400' : 'text-zinc-600'}`} />
            <div className="font-bold text-white mb-1">Nonce Reuse Simulation</div>
            <div className="text-xs">Why reusing an initialization vector destroys encryption.</div>
         </button>

         <button 
           onClick={() => setActiveExp("brute")}
           className={`p-4 rounded-xl border text-left transition-all ${activeExp === 'brute' ? 'bg-rose-900/20 border-rose-500 shadow-inner' : 'bg-black border-white/5 text-zinc-500 hover:border-white/20'}`}
         >
            <KeySquare className={`w-5 h-5 mb-2 ${activeExp === 'brute' ? 'text-rose-400' : 'text-zinc-600'}`} />
            <div className="font-bold text-white mb-1">Key Space (Brute Force)</div>
            <div className="text-xs">Visualizing the $2^{128}$ absolute bound of ASCON-128.</div>
         </button>
      </div>

      <div className="flex-1 bg-black border border-white/10 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
         {activeExp === "avalanche" && (
            <div className="h-full w-full flex flex-col">
               <SecurityVisualizer />
            </div>
         )}
         {activeExp !== "avalanche" && (
            <div className="h-full w-full flex flex-col items-center justify-center text-zinc-600 p-8 text-center text-sm">
               <Crosshair className="w-12 h-12 mb-4 opacity-50" />
               Constructing Interactive Module: {activeExp.toUpperCase()}
            </div>
         )}
      </div>

    </div>
  );
}
