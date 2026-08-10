"use client";

import { PermutationExplorer } from "@/components/studio/modules/PermutationExplorer";
import { RefreshCcw } from "lucide-react";

export default function PermutationPage() {
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-4rem)]">
      <header className="shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <RefreshCcw className="w-8 h-8 text-orange-500" /> Permutation (p^12 / p^8)
        </h1>
        <p className="text-zinc-400">Deep structural breakdown behind the constant, S-Box, and linear diffusion layers.</p>
      </header>

      <div className="flex-1 bg-black rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden flex flex-col">
          <PermutationExplorer />
      </div>
    </div>
  );
}
