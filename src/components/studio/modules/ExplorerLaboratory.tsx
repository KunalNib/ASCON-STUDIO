import { useAsconStore, ExplorerTab } from "@/store/useAsconStore";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Fingerprint, Activity, Box, ArrowRightLeft, Key, Code2, Bug } from "lucide-react";
import { InteractiveStateGrid } from "@/components/studio/InteractiveStateGrid";
import { PermutationExplorer } from "@/components/studio/modules/PermutationExplorer";
import { InputConfigurationPanel } from "@/components/studio/modules/InputConfigurationPanel";
import { AssociatedDataFlow } from "@/components/studio/modules/AssociatedDataFlow";
import { FinalizationAndTag } from "@/components/studio/modules/FinalizationAndTag";
import { PlaintextProcessingFlow } from "@/components/studio/modules/PlaintextProcessingFlow";

export function ExplorerLaboratory() {
  const { activeExplorerTab, setActiveExplorerTab } = useAsconStore();

  const tabs: { id: ExplorerTab; label: string; icon: any }[] = [
    { id: "init", label: "Inputs", icon: Cpu },
    { id: "permutation", label: "Permutation", icon: Activity },
    { id: "ad", label: "Associated Data", icon: Fingerprint },
    { id: "encryption", label: "Encryption", icon: Key },
    { id: "tag", label: "Auth Tag", icon: Code2 },
    { id: "debugger", label: "320-bit Debugger", icon: Bug },
  ];

  return (
    <div className="flex flex-col h-full relative space-y-6">
      
      {/* Explorer Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 border-b border-white/10 custom-scrollbar mask-gradient-right">
         {tabs.map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveExplorerTab(tab.id)}
             className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
               activeExplorerTab === tab.id 
                 ? "bg-purple-600/20 text-purple-400 border border-purple-500/50 shadow-inner" 
                 : "bg-[#09090b] text-zinc-500 border border-white/5 hover:text-zinc-300 hover:bg-white/5"
             }`}
           >
             <tab.icon className="w-4 h-4" />
             {tab.label}
           </button>
         ))}
      </div>

      {/* Explorer Content Area */}
      <div className="flex-1 min-h-0 relative bg-[#09090b] rounded-2xl border border-white/5 overflow-hidden flex flex-col">
         <AnimatePresence mode="wait">
           <motion.div
             key={activeExplorerTab}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, scale: 0.98 }}
             transition={{ duration: 0.3 }}
             className="h-full flex flex-col items-center justify-center relative"
           >
             {activeExplorerTab === "init" && <InputConfigurationPanel />}
             {activeExplorerTab === "permutation" && <PermutationExplorer />}
             {activeExplorerTab === "ad" && <AssociatedDataFlow />}
             {activeExplorerTab === "encryption" && <PlaintextProcessingFlow />}
             {activeExplorerTab === "tag" && <FinalizationAndTag />}
             {activeExplorerTab === "debugger" && (
                <div className="flex-1 flex flex-col w-full p-6">
                   <h3 className="text-zinc-400 mb-4 font-mono text-sm self-start">320-BIT TRACE DEBUGGER</h3>
                   <InteractiveStateGrid />
                </div>
             )}
           </motion.div>
         </AnimatePresence>
      </div>

    </div>
  );
}
