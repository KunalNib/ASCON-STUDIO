import { motion } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import { GraduationCap, Microscope } from "lucide-react";

export function LaboratoryNav() {
  const { modeType, setModeType } = useAsconStore();

  return (
    <div className="flex items-center gap-4 bg-black border border-white/10 rounded-full p-1 w-fit shadow-xl">
      <button
        onClick={() => setModeType("guided")}
        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
          modeType === "guided" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        {modeType === "guided" && (
          <motion.div 
            layoutId="lab-nav-pill" 
            className="absolute inset-0 bg-blue-600 rounded-full" 
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Guided Learning
        </span>
      </button>

      <button
        onClick={() => setModeType("explorer")}
        className={`relative flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-colors duration-300 ${
          modeType === "explorer" ? "text-white" : "text-zinc-500 hover:text-zinc-300"
        }`}
      >
        {modeType === "explorer" && (
          <motion.div 
            layoutId="lab-nav-pill" 
            className="absolute inset-0 bg-purple-600 rounded-full" 
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Microscope className="w-4 h-4" />
          Explorer Mode
        </span>
      </button>
    </div>
  );
}
