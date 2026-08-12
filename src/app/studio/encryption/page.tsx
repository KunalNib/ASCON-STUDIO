"use client";

import { useAsconStore } from "@/store/useAsconStore";
import { Lock, PanelLeftClose, PanelLeft } from "lucide-react";
import { GuidedLaboratory } from "@/components/studio/modules/GuidedLaboratory";
import { LearningTimeline } from "@/components/studio/LearningTimeline";
import { useState } from "react";

export default function EncryptionModule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="px-3 pt-3 pb-2 w-full mx-auto flex flex-col h-[calc(100vh-3.5rem)] gap-2">

      {/* Compact single-row header */}
      <header className="flex items-center gap-3 shrink-0 px-1">
        <button 
           onClick={() => setIsSidebarOpen(!isSidebarOpen)}
           className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-zinc-400 hover:text-white transition-all hidden md:flex items-center justify-center"
           title={isSidebarOpen ? "Collapse Timeline" : "Expand Timeline"}
        >
           {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
        </button>
        <Lock className="w-4 h-4 text-blue-500 shrink-0" />
        <h1 className="text-sm font-bold tracking-tight text-white">Interactive Execution Laboratory</h1>
        <span className="text-zinc-600 text-xs hidden lg:inline">— ASCON step-by-step walkthrough</span>
      </header>

      <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-2 w-full relative">
        
        {/* Timeline (Left) */}
        {isSidebarOpen && (
          <div className="hidden md:flex w-56 shrink-0 bg-[#09090b] rounded-2xl border border-white/5 p-3 shadow-xl overflow-y-auto custom-scrollbar transition-all duration-300">
             <LearningTimeline />
          </div>
        )}
        
        {/* Main Vis Engine (Center) */}
        <div className="flex-1 min-w-0 bg-black border border-white/10 rounded-2xl flex flex-col relative overflow-hidden shadow-2xl p-0 transition-all duration-300">
            <GuidedLaboratory />
        </div>
        
      </div>
    </div>
  );
}
