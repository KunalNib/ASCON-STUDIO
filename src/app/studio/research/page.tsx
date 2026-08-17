"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Search, ShieldAlert, GitBranch, History, ChevronRight } from "lucide-react";

type TabId = "variants" | "journey" | "security";

export default function ResearchModule() {
  const [activeTab, setActiveTab] = useState<TabId>("variants");

  const tabs: { id: TabId; label: string; icon: any }[] = [
    { id: "variants", label: "ASCON Variants", icon: GitBranch },
    { id: "journey", label: "NIST Journey", icon: History },
    { id: "security", label: "Security Analysis", icon: ShieldAlert },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-500" /> Research Library
          </h1>
          <p className="text-zinc-400">
            Deep dive into the academic foundations of ASCON cryptography.
          </p>
        </div>
        
        {/* Mock Search */}
        <div className="relative group w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search papers, variants..." 
            className="w-full bg-black border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
        </div>
      </header>

      {/* Tabs */}
      <div className="flex space-x-1 p-1 bg-white/5 rounded-xl border border-white/10 w-fit backdrop-blur-sm">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? "text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-purple-400" : ""}`} />
              {tab.label}
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-white/10 rounded-lg border border-white/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-[#09090b] border border-white/10 rounded-2xl p-6 md:p-8 overflow-y-auto shadow-2xl relative">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/10 via-transparent to-transparent pointer-events-none" />

        <AnimatePresence mode="wait">
          {activeTab === "variants" && <VariantsContent key="variants" />}
          {activeTab === "journey" && <JourneyContent key="journey" />}
          {activeTab === "security" && <SecurityContent key="security" />}
        </AnimatePresence>
      </div>
    </div>
  );
}

function VariantsContent() {
  const variants = [
    {
      name: "ASCON-128",
      primary: true,
      desc: "The primary standard for lightweight AEAD. Highly optimized for constrained environments.",
      specs: { rate: "64 bits", capacity: "256 bits", rounds: "a=12, b=6", security: "128-bit" }
    },
    {
      name: "ASCON-128a",
      primary: false,
      desc: "An accelerated variant optimized for high throughput on systems with slightly more resources.",
      specs: { rate: "128 bits", capacity: "192 bits", rounds: "a=12, b=8", security: "128-bit" }
    },
    {
      name: "ASCON-Hash",
      primary: false,
      desc: "The companion hashing algorithm utilizing the same core permutation as the AEAD cipher.",
      specs: { rate: "64 bits", capacity: "256 bits", rounds: "a=12, b=12", security: "256-bit hash" }
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 relative z-10"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Algorithm Variants</h2>
        <p className="text-zinc-400 max-w-3xl leading-relaxed">
          The ASCON suite consists of several variants, all built upon the same 320-bit permutation structure. 
          By adjusting the <i>rate</i> and <i>capacity</i> boundaries within the sponge construction, the algorithms trade off between throughput and security margins.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {variants.map((v) => (
          <div key={v.name} className="bg-black/50 border border-white/10 rounded-xl p-6 hover:border-purple-500/30 transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-white">{v.name}</h3>
              {v.primary && (
                <span className="px-2 py-1 text-xs font-semibold bg-purple-500/20 text-purple-400 rounded border border-purple-500/30">Primary</span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mb-6 min-h-[60px]">{v.desc}</p>
            
            <div className="space-y-3">
              {Object.entries(v.specs).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-sm border-b border-white/5 pb-2 last:border-0 last:pb-0">
                  <span className="text-zinc-500 capitalize">{key}</span>
                  <span className="text-zinc-200 font-mono">{val}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function JourneyContent() {
  const timeline = [
    { year: "2018", title: "NIST LWC Initiated", desc: "NIST announces the Lightweight Cryptography project to find algorithms suitable for constrained environments (IoT, RFID)." },
    { year: "2019", title: "Round 1 & 2 Candidates", desc: "ASCON is submitted by a team of cryptographers from Graz University of Technology, Infineon Technologies, and Lamarr Security Research." },
    { year: "2021", title: "Finalists Announced", desc: "ASCON is selected as one of the 10 finalists out of 57 original submissions, praised for its elegant sponge construction and robust security bounds." },
    { year: "2023", title: "Selection as Standard", desc: "NIST officially selects the ASCON family for standardisation, citing its exceptional performance, low memory footprint, and resistance against side-channel attacks." },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 relative z-10"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">The Road to Standardization</h2>
        <p className="text-zinc-400 max-w-3xl leading-relaxed">
          ASCON wasn't built in a day. Its selection by the National Institute of Standards and Technology (NIST) was the culmination of a rigorous 5-year public competition.
        </p>
      </div>

      <div className="relative pl-4 md:pl-0">
        {/* Vertical Line */}
        <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-px bg-white/10 md:-translate-x-1/2" />
        
        <div className="space-y-12">
          {timeline.map((item, idx) => {
            const isEven = idx % 2 === 0;
            return (
              <div key={item.year} className={`relative flex flex-col md:flex-row ${isEven ? "md:flex-row-reverse" : ""} items-start md:items-center gap-8`}>
                
                {/* Timeline Dot */}
                <div className="absolute left-[15px] md:left-1/2 w-4 h-4 rounded-full bg-[#09090b] border-2 border-purple-500 transform -translate-x-[7px] md:-translate-x-1/2 mt-1 md:mt-0 z-10" />
                
                {/* Content */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${isEven ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                  <span className="text-purple-400 font-mono font-bold text-lg mb-1 block">{item.year}</span>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function SecurityContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-8 relative z-10"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Cryptanalysis & Security</h2>
        <p className="text-zinc-400 max-w-3xl leading-relaxed">
          ASCON provides a robust 128-bit security level against key recovery, forgery, and state recovery attacks. Its design inherently mitigates several classes of advanced cryptanalysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-black/40 border border-white/5 rounded-xl p-6">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" /> Differential Cryptanalysis
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed">
            The 5-bit S-box used in the substitution layer was heavily optimized to maximize resistance against differential trails. Coupled with the linear diffusion layer, the maximum expected differential probability drops exponentially with each round, rendering statistical attacks infeasible.
          </p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-6">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Linear Cryptanalysis
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Similar to differential resistance, the active S-box count across multiple rounds guarantees strong bounds against linear cryptanalysis. The choice of 12 rounds for initialization creates an insurmountable barrier for linear approximations.
          </p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-6">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Forgery Attacks
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed">
            Operating as a sponge-based AEAD cipher, forgery implies recovering the inner state or guessing the authentication tag. With a capacity of 256 bits, the probability of a successful forgery is bound by 2^-128, adhering perfectly to the 128-bit security target.
          </p>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-6">
          <h4 className="font-bold text-white mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500" /> Side-Channel Resistance
          </h4>
          <p className="text-sm text-zinc-400 leading-relaxed">
            ASCON's operations are fundamentally based on bitwise AND, NOT, and XOR logic. This allows for straightforward, high-speed masked implementations in hardware, defending effectively against power analysis (DPA/CPA) and timing attacks.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
