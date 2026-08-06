"use client";

import { useState, useEffect } from "react";
import { ThreeCube } from "@/components/ThreeCube";
import { RefreshCcw, Camera } from "lucide-react";

export default function ThreeDimensionalView() {
  const [activeBits, setActiveBits] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(true);

  // Mocking bits changing over time representing ASCON states
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      const newBits = [];
      const numActive = Math.floor(Math.random() * 80) + 20; // 20 to 100 bits active
      for (let i = 0; i < numActive; i++) {
        newBits.push(Math.floor(Math.random() * 320));
      }
      setActiveBits(newBits);
    }, 800);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 w-full">
      <header className="mb-4 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1">3D Topology Matrix</h1>
          <p className="text-zinc-400 text-sm">Spatial visualization of the 320-bit internal state.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
             <RefreshCcw className="w-4 h-4" />
             {isPlaying ? "Pause Flow" : "Stream Data"}
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 relative bg-[#09090b] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <ThreeCube bitData={activeBits} />
        
        {/* Overlay UI elements */}
        <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none">
          <div className="flex items-end justify-between">
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 p-4 rounded-xl max-w-sm pointer-events-auto">
              <h3 className="text-white font-semibold flex items-center gap-2 mb-2">
                <Camera className="w-4 h-4 text-blue-400" />
                Viewport Controls
              </h3>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                ASCON's state spans 5 layers (x0 to x4). Drag to rotate around the 320-block matrix. Scrolling zooms the camera lens.
              </p>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-zinc-500">Active Bits</span>
                <span className="text-blue-400">{activeBits.length} / 320</span>
              </div>
            </div>
            
            <div className="text-zinc-600 font-mono text-[10px] hidden md:block">
              RENDER: WEBGL2  |  ENGINE: THREE.JS
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
