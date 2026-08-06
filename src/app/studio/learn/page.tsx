"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle, Lock, Play, GraduationCap, ChevronRight, Binary, Fingerprint, Network } from "lucide-react";
import { RoboExplainer } from "@/components/studio/RoboExplainer";

export default function LearnModule() {
  const [activeCourse, setActiveCourse] = useState(0);
  const [activeLessonContext, setActiveLessonContext] = useState<string | null>(null);

  const courses = [
    {
      level: "Beginner",
      title: "Introduction to Lightweight Cryptography",
      description: "Understand the constraints of IoT devices (ESP32) and why standard AES operations are too heavy.",
      status: "completed",
      modules: [
        { title: "The IoT Problem", icon: Network, context: "AES mathematically demands heavy S-Box translations and wide byte arrays. On a 32-bit microcontroller like the ESP32, fetching these substitution mappings causes cache-timing delays and drains battery power immensely. ASCON was built to use bit-wise logical instructions (AND, NOT, XOR) natively supported by simple ALUs." },
        { title: "What is ASCON?", icon: Fingerprint, context: "ASCON is an Authenticated Encryption with Associated Data (AEAD) algorithm. It guarantees confidentiality (encryption) and integrity (authentication). NIST heavily favored it for its low footprint and phenomenal performance in hardware." },
        { title: "Sponge Construction", icon: Binary, context: "Instead of block ciphers, ASCON acts as a Sponge. It maintains a 320-bit internal state. You 'absorb' data into this state (mixing it via permutations), and then 'squeeze' ciphertext out of it. The 320-bit state acts as a one-way mathematical blender." }
      ]
    },
    {
      level: "Intermediate",
      title: "The 320-Bit State Matrix",
      description: "Dive into how ASCON processes data structurally using 64-bit bounds and word limits.",
      status: "completed",
      modules: [
        { title: "Matrix Structure", icon: Binary, context: "The 320-bit state is five standard 64-bit integers: x0, x1, x2, x3, x4. This specific vertical orientation allows Bitsliced S-Boxes to operate." },
        { title: "Nonce & Initialization", icon: Fingerprint, context: "During initialization, a 128-bit Key and 128-bit Nonce are absorbed into the state alongside an Initialization Vector, followed by a heavy 12-round permutation (p^12) to destroy all linearity." }
      ]
    },
    {
      level: "Advanced",
      title: "Substitution & Linear Diffusion",
      description: "Explore the core permutation layers mapping non-linear S-Boxes across bitslices.",
      status: "in-progress",
      modules: [
        { title: "Non-Linearity (S-Box)", icon: Network, context: "The only non-linear component of ASCON. Bits are substituted vertically relying on Algebraic degree 2 functions. It provides confusion." },
        { title: "Right Rotations (ROTR)", icon: Network, context: "Linear diffusion is achieved by rotating the 64-bit words by specific asymmetrical integer bounds (e.g., x0 >>> 19 ^ x0 >>> 28). This forces bits to quickly bleed across the columns." }
      ]
    },
    {
      level: "Expert",
      title: "Attacking ASCON",
      description: "Analyze rotational cryptanalysis and evaluate the strict avalanche criterion bounds.",
      status: "locked",
      modules: [
        { title: "Bit-Flip Attacks", icon: Fingerprint, context: "Locked until intermediate modules verify XP bounds." }
      ]
    }
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 flex flex-col min-h-[calc(100vh-4rem)]">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
           <GraduationCap className="w-8 h-8 text-purple-400" />
           Interactive Learning Curriculum
        </h1>
        <p className="text-zinc-400">Deep, structural explanations governing ASCON cryptographic parameters.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Path Map */}
        <div className="w-full md:w-1/3 flex flex-col gap-4">
          {courses.map((course, idx) => (
            <div 
              key={idx}
              onClick={() => {
                if(course.status !== "locked") {
                  setActiveCourse(idx);
                  setActiveLessonContext(null);
                }
              }}
              className={`p-5 rounded-2xl border transition-all ${activeCourse === idx ? 'bg-purple-900/20 border-purple-500 shadow-[0_0_25px_rgba(168,85,247,0.15)] overflow-hidden' : 'bg-[#09090b] border-white/10 hover:bg-white/5'} ${course.status === "locked" ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${activeCourse === idx ? 'text-purple-400' : 'text-zinc-500'}`}>
                  {course.level}
                </span>
                {course.status === "completed" && <CheckCircle className="w-5 h-5 text-green-500" />}
                {course.status === "in-progress" && <span className="w-5 h-5 flex items-center justify-center rounded-full border-2 border-purple-500"><div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" /></span>}
                {course.status === "locked" && <Lock className="w-4 h-4 text-zinc-600" />}
              </div>
              <h3 className="font-bold text-white mb-1">{course.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">{course.description}</p>
            </div>
          ))}
        </div>

        {/* Active Course View */}
        <div className="w-full md:w-2/3 bg-[#0d0d0d] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="mb-6">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">{courses[activeCourse].level} Reading</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">{courses[activeCourse].title}</h2>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {!activeLessonContext ? (
               <>
                 <h4 className="text-zinc-300 font-medium mb-2 flex items-center gap-2"><BookOpen className="w-4 h-4"/> Select a specialized module</h4>
                 {courses[activeCourse].modules.map((mod, i) => (
                    <motion.div 
                      key={i}
                      onClick={() => setActiveLessonContext(mod.context)}
                      whileHover={{ scale: 1.01 }}
                      className="group flex flex-col justify-center p-5 rounded-xl bg-black border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-500/20 text-purple-400">
                           <mod.icon className="w-5 h-5" />
                        </div>
                        <span className="text-zinc-200 font-bold group-hover:text-purple-300 transition-colors">{mod.title}</span>
                        <ChevronRight className="w-5 h-5 text-zinc-600 ml-auto group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </motion.div>
                 ))}
               </>
            ) : (
                 <RoboExplainer 
                   text={activeLessonContext} 
                   onBack={() => setActiveLessonContext(null)} 
                 />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
