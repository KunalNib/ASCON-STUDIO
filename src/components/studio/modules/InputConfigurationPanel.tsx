import { useAsconStore } from "@/store/useAsconStore";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Binary, Key, Baseline, Wifi } from "lucide-react";
import { useState } from "react";

export function InputConfigurationPanel() {
  const { plaintext, setPlaintext, key, setKey, nonce, setNonce, associatedData, setAssociatedData } = useAsconStore();
  const [activeTab, setActiveTab] = useState<"plaintext" | "key" | "nonce" | "ad">("plaintext");

  // A quick helper to demo string to hex/binary translation mapping for visuals
  const stringToDisplayMap = (str: string) => {
    return str.split('').map((char, idx) => {
      const code = char.charCodeAt(0);
      return {
        id: idx,
        char,
        hex: code.toString(16).padStart(2, '0').toUpperCase(),
        bin: code.toString(2).padStart(8, '0')
      };
    });
  };

  const getActiveValue = () => {
    switch (activeTab) {
      case "plaintext": return plaintext;
      case "key": return key;
      case "nonce": return nonce;
      case "ad": return associatedData;
    }
  };
  
  const activeMappedData = stringToDisplayMap(getActiveValue());
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center space-y-8 max-w-4xl mx-auto p-4">
      
      {/* Top Config Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        <button onClick={() => setActiveTab("plaintext")} className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'plaintext' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
          <Baseline className="w-5 h-5 text-blue-400 mb-2" />
          <div className="text-xs text-zinc-500 uppercase font-bold">Plaintext</div>
          <div className="text-sm text-zinc-300 font-mono truncate">{plaintext || "Empty"}</div>
        </button>
        <button onClick={() => setActiveTab("key")} className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'key' ? 'border-amber-500 bg-amber-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
          <Key className="w-5 h-5 text-amber-400 mb-2" />
          <div className="text-xs text-zinc-500 uppercase font-bold">Secret Key</div>
          <div className="text-sm text-zinc-300 font-mono truncate">{key || "Empty"}</div>
        </button>
        <button onClick={() => setActiveTab("nonce")} className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'nonce' ? 'border-rose-500 bg-rose-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
          <Database className="w-5 h-5 text-rose-400 mb-2" />
          <div className="text-xs text-zinc-500 uppercase font-bold">Nonce</div>
          <div className="text-sm text-zinc-300 font-mono truncate">{nonce || "Empty"}</div>
        </button>
        <button onClick={() => setActiveTab("ad")} className={`p-4 rounded-2xl border text-left transition-all ${activeTab === 'ad' ? 'border-emerald-500 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}>
          <Baseline className="w-5 h-5 text-emerald-400 mb-2" />
          <div className="text-xs text-zinc-500 uppercase font-bold">Assoc Data</div>
          <div className="text-sm text-zinc-300 font-mono truncate">{associatedData || "Empty"}</div>
        </button>
      </div>

      <div className="flex gap-4 w-full">
         <button className="flex-1 py-3 items-center justify-center flex gap-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-blue-500 transition-colors text-sm font-semibold">
           <Database className="w-4 h-4 text-blue-400" /> Use Sample Data
         </button>
         <button className="flex-1 py-3 items-center justify-center flex gap-2 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition-colors text-sm font-semibold text-purple-300">
           <Wifi className="w-4 h-4 animate-pulse" /> Live ESP32 Mode
         </button>
      </div>

      {/* Main Cascade Visualization */}
      <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 relative">
      
         {/* Edit Field */}
         <div className="w-full flex justify-center pb-8 border-b border-white/5 relative">
            <input 
               type="text" 
               value={getActiveValue()} 
               onChange={(e) => {
                  const v = e.target.value;
                  if (activeTab === "plaintext") setPlaintext(v);
                  if (activeTab === "key") setKey(v);
                  if (activeTab === "nonce") setNonce(v);
                  if (activeTab === "ad") setAssociatedData(v);
               }}
               className="bg-transparent text-center text-4xl w-full max-w-xl text-white font-mono focus:outline-none border-b-2 border-transparent focus:border-blue-500 transition-colors"
               placeholder="Enter data..."
            />
         </div>

         {/* Hex / Binary Transformation Map */}
         <div className="w-full flex-1 flex flex-col gap-2 overflow-y-auto max-h-64 custom-scrollbar">
            <AnimatePresence>
               {activeMappedData.map((item) => (
                  <motion.div 
                     key={item.id}
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0 }}
                     onHoverStart={() => setHoveredIdx(item.id)}
                     onHoverEnd={() => setHoveredIdx(null)}
                     className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${hoveredIdx === item.id ? 'bg-blue-500/10 border-blue-500/30' : 'bg-black border-white/5'}`}
                  >
                     <div className="text-xl font-bold font-mono w-16 text-center text-zinc-300">{item.char}</div>
                     <motion.div animate={{ opacity: hoveredIdx === item.id ? 1 : 0.5 }} className="px-4 py-1 rounded bg-white/5 text-zinc-400 font-mono text-sm border border-white/10">0x{item.hex}</motion.div>
                     <div className="flex-1 px-8 flex justify-end">
                       <motion.div 
                         className="flex gap-1"
                       >
                         {item.bin.split('').map((bit, bIdx) => (
                            <motion.span 
                               key={bIdx}
                               animate={{ 
                                 scale: hoveredIdx === item.id ? 1.1 : 1, 
                                 color: hoveredIdx === item.id ? (bit === '1' ? '#3b82f6' : '#94a3b8') : '#52525b',
                                 textShadow: hoveredIdx === item.id && bit === '1' ? '0 0 10px rgba(59,130,246,0.5)' : 'none'
                               }}
                               className="font-mono text-lg transition-colors"
                            >
                               {bit}
                            </motion.span>
                         ))}
                       </motion.div>
                     </div>
                  </motion.div>
               ))}
            </AnimatePresence>
         </div>

      </div>
    </div>
  );
}
