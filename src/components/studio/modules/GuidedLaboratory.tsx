import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore, NarrativeStep } from "@/store/useAsconStore";
import { Play, Pause, SkipBack, SkipForward, FastForward, Settings, HelpCircle, Calculator, Code, Bot, PanelRightClose, PanelRightOpen } from "lucide-react";
import { InteractiveStateGrid } from "@/components/studio/InteractiveStateGrid";
import { InputConfigurationPanel } from "@/components/studio/modules/InputConfigurationPanel";
import { PermutationExplorer } from "@/components/studio/modules/PermutationExplorer";
import { AssociatedDataFlow } from "@/components/studio/modules/AssociatedDataFlow";
import { PlaintextProcessingFlow } from "@/components/studio/modules/PlaintextProcessingFlow";
import { FinalizationAndTag } from "@/components/studio/modules/FinalizationAndTag";
import { GuidedTour, TourStep } from "@/components/studio/GuidedTour";
import { Modal } from "@/components/ui/Modal";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function GuidedLaboratory() {
  const router = useRouter();
  const { currentStepIndex, steps, playbackState, setPlaybackState, nextStep, prevStep, session, animationSpeed, setAnimationSpeed, setPlaintext } = useAsconStore();
  const progress = ((currentStepIndex) / (steps.length - 1)) * 100;
  
  const [isMathModalOpen, setIsMathModalOpen] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [showNarrative, setShowNarrative] = useState(true);
  const [isMasterGuideOpen, setIsMasterGuideOpen] = useState(false);

  // Auto-start Guided Tour on first visit
  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("ascon-tour-triggered")) {
      setIsTourOpen(true);
      localStorage.setItem("ascon-tour-triggered", "true");
    }
  }, []);

  // Playback timer — auto-advance steps when playing
  useEffect(() => {
    if (playbackState !== "playing") return;
    const delay = Math.round(3500 / animationSpeed);
    const timer = setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        nextStep();
      } else {
        setPlaybackState("paused");
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [playbackState, currentStepIndex, animationSpeed, steps.length, nextStep, setPlaybackState]);

  // Extract Live ESP32 Sensor Data
  useEffect(() => {
    let ws: WebSocket;
    let isMounted = true;
    
    const connectWS = () => {
      ws = new WebSocket("ws://localhost:8000/ws/hardware");
      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const data = JSON.parse(event.data);
          if (data.log && (data.log.includes("Temperature:") || data.log.includes("Humidity:"))) {
             const cleanReading = data.log.replace(/\[ESP32\] RX:\s*/g, '').trim();
             
             // Shorten labels and combine them into one stable string
             let formatted = cleanReading.replace("Temperature:", "Temp:").replace("Humidity:", "Humid:");
             
             useAsconStore.setState(prev => {
                 let current = prev.plaintext || "";
                 let temp = current.split(" | ").find(p => p.startsWith("Temp:")) || "";
                 let humid = current.split(" | ").find(p => p.startsWith("Humid:")) || "";
                 
                 if (formatted.startsWith("Temp:")) temp = formatted;
                 if (formatted.startsWith("Humid:")) humid = formatted;
                 
                 let combined = [temp, humid].filter(Boolean).join(" | ");
                 return { plaintext: combined, session: { ...prev.session, plaintext: combined, sensorReading: combined }};
             });
          }
        } catch(e) {}
      };
      ws.onclose = () => { if (isMounted) setTimeout(connectWS, 3000); };
    };
    connectWS();
    return () => { isMounted = false; if (ws) ws.close(); };
  }, [setPlaintext]);
  
  const tourSteps: TourStep[] = [
    { targetId: "tour-timeline", title: "Execution Timeline", content: "This is the deterministc execution sequence. Every step in ASCON is represented here, moving from zero knowledge to a secure ciphertext.", position: "right" },
    { targetId: "tour-visualizer", title: "Visualization Engine", content: "This central canvas provides deep mathematical visualization of exactly what the cipher is doing to the bytes at a microscopic level.", position: "bottom" },
    { targetId: "tour-narrative", title: "Narrative & Context", content: "As you progress through the timeline, this panel updates to provide context: What changed, how it works, and why it's necessary for security.", position: "left" },
    { targetId: "tour-controls", title: "Execution Controls", content: "Use these controls to step through the cipher autonomously, pause animation, or adjust simulation speed.", position: "top" }
  ];
  
  const speeds = [0.5, 1.0, 1.5, 2.0, 4.0];
  const toggleSpeed = () => {
    const idx = speeds.indexOf(animationSpeed);
    const nextIdx = (idx + 1) % speeds.length;
    setAnimationSpeed(speeds[nextIdx]);
  };

  const currentStage = steps[currentStepIndex];

  // Explanations integrated directly for immersive Overlay/Split UX
  const explanations: Record<NarrativeStep, { title: string; what: string; how: string; why: string; input: string; output: string; security: string }> = {
    "INTRODUCTION": {
      title: "Preparation",
      what: "Awaiting execution sequence for the fixed session.",
      how: "The system prepares the narrative environment.",
      why: "Cryptography requires clear deterministic inputs to trace behavior.",
      input: "None",
      output: "None",
      security: "Establishes a baseline for tracing."
    },
    "SENSOR_DATA": {
      title: "Reading Sensor Data",
      what: "We received data directly from the ESP32 temperature sensor.",
      how: `The device (${session.deviceId}) transacted the reading "${session.sensorReading}" over its internal bus.`,
      why: "This data represents real-world information that must remain confidential.",
      input: "ESP32 Sensor Bus",
      output: session.sensorReading,
      security: "Raw data is vulnerable if intercepted here."
    },
    "PREPARE_DATA": {
      title: "Data Representation",
      what: "Translating the human-readable string into bytes.",
      how: "Converting each character to standard ASCII/UTF-8 hex chunks.",
      why: "Cryptographic algorithms only operate on byte blocks, not text.",
      input: session.plaintext,
      output: session.plaintextBytes,
      security: "Standardized formatting prevents parsing attacks."
    },
    "CRYPTO_PARAMS": {
      title: "Cryptographic Parameters",
      what: "Loading Key, Nonce, and Associated Data (AD).",
      how: "Allocating 128-bit Key, 128-bit Nonce, and arbitrary length AD into memory.",
      why: "Key provides secrecy. Nonce ensures uniqueness. AD provides authenticated context.",
      input: "Memory / Key Store",
      output: "Key + Nonce + AD loaded",
      security: "Never reuse a Nonce with the same Key."
    },
    "INITIAL_STATE": {
      title: "320-bit State Loading",
      what: "Populating the central memory matrix.",
      how: "Formatting IV (Initialization Vector), Key, and Nonce into five 64-bit words (X0-X4).",
      why: "This state is the core engine for all subsequent mixing.",
      input: "IV + Key + Nonce",
      output: "X0, X1, X2, X3, X4",
      security: "Ensures the state is completely unpredictable to observers without the key."
    },
    "INITIALIZATION": {
      title: "State Initialization",
      what: "Scrambling the initial state.",
      how: "Running the 12-round ASCON permutation over the state.",
      why: "Distributes the key and nonce completely across all 320 bits.",
      input: "Initial 320-bit State",
      output: "Mixed 320-bit State",
      security: "Achieves full diffusion before processing any AD or Plaintext."
    },
    "PERMUTATION": {
      title: "Permutation Execution",
      what: "The core mixing function of ASCON.",
      how: "Repeatedly applies mathematical transformations.",
      why: "Provides the non-linear properties and diffusion needed for security.",
      input: "State (Previous)",
      output: "State (Mixed)",
      security: "The heart of the cipher's resistance against analysis."
    },
    "SUBSTITUTION": {
      title: "Substitution Layer (S-Box)",
      what: "Applying a non-linear look-up substitute.",
      how: "Each 5-bit column across the 5 words is replaced via the ASCON S-box.",
      why: "Adds confusion. It is the ONLY non-linear part of ASCON.",
      input: "5-bit slice",
      output: "5-bit substituted slice",
      security: "Prevents algebraic equation solving attacks."
    },
    "DIFFUSION": {
      title: "Linear Diffusion",
      what: "Spreading bits horizontally.",
      how: "XORing shifted and rotated versions of each 64-bit word with itself.",
      why: "Ensures a single bit change affects many bits rapidly (Avalanche Effect).",
      input: "X_i",
      output: "X_i ^ (X_i >>> a) ^ (X_i >>> b)",
      security: "Defeats differential cryptanalysis."
    },
    "PLAINTEXT_PROCESSING": {
      title: "Plaintext Processing",
      what: "Encrypting the sensor data.",
      how: "XORing the plaintext block with the highest bits of the state (X0), then updating the state.",
      why: "Extracts ciphertext while feeding plaintext back into the state for authentication.",
      input: "Plaintext block + State",
      output: "Ciphertext chunk + New State",
      security: "Provides both Confidentiality and Integrity tracking."
    },
    "FINALIZATION": {
      title: "Finalization",
      what: "Preparing to generate the tag.",
      how: "XORing the key into the state again and running the permutation one last time.",
      why: "Ensures the tag securely depends on the key and the entire message history.",
      input: "Current State + Key",
      output: "Finalized State",
      security: "Prevents attackers from forging tags by exploiting internal state."
    },
    "AUTH_TAG": {
      title: "Authentication Tag Generation",
      what: "Extracting the final security footprint.",
      how: "Taking the lowest bits of the final state (X3, X4) and XORing with the Key.",
      why: "Produces a 128-bit tag attached to the message to verify integrity.",
      input: "Final State (X3, X4)",
      output: session.authenticationTag,
      security: "If 1 bit of plaintext/AD changes, this tag changes completely."
    },
    "FINAL_RESULT": {
      title: "Complete Encryption",
      what: "The message is now fully protected.",
      how: "Ciphertext and Tag are bundled for transmission.",
      why: "Ready to be sent over the untrusted network.",
      input: "Plaintext",
      output: "Ciphertext + Tag",
      security: "Guarantees Confidentiality and Authenticity."
    }
  };
  
  const data = explanations[currentStage] || explanations["INTRODUCTION"];

  const renderActiveVisual = () => {
    switch (currentStage) {
      case "INTRODUCTION":
        return (
          <div className="text-center p-8 flex flex-col items-center max-w-2xl mx-auto h-full justify-center">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-blue-500/30">
               <svg className="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" /></svg>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4 leading-tight">You are about to encrypt data generated by an IoT device.</h2>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8">
              This is a fully deterministic, interactive laboratory. It will guide you through the complete ASCON cryptographic process, taking a real <b>ESP32 temperature reading</b> from zero knowledge to a authenticated ciphertext.
            </p>
            <button onClick={nextStep} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
              START ENCRYPTION JOURNEY
            </button>
          </div>
        );
      case "SENSOR_DATA":
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <h3 className="text-zinc-500 uppercase tracking-widest font-bold text-sm mb-2">Original Information</h3>
            <h2 className="text-[5rem] font-black text-white mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              {session.sensorReading}
            </h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-96 text-left mb-6 relative overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay"></div>
              <p className="text-zinc-400 text-sm mb-2 relative z-10"><span className="text-zinc-600 w-20 inline-block font-mono">Device:</span> <span className="text-white font-medium">{session.deviceId}</span></p>
              <p className="text-zinc-400 text-sm mb-2 relative z-10"><span className="text-zinc-600 w-20 inline-block font-mono">Sensors:</span> <span className="text-white font-medium">Temp & Humid</span></p>
              <p className="text-zinc-400 text-sm mb-2 relative z-10"><span className="text-zinc-600 w-20 inline-block font-mono">Status:</span> <span className="text-green-400 font-medium">Combined Stream Secure</span></p>
            </div>
          </div>
        );
      case "PREPARE_DATA":
      case "CRYPTO_PARAMS":
        return <InputConfigurationPanel />; 
      case "INITIAL_STATE":
        return <div className="w-full h-full flex flex-col p-4"><InteractiveStateGrid /></div>;
      case "INITIALIZATION":
        return <AssociatedDataFlow />;
      case "PERMUTATION":
      case "SUBSTITUTION":
      case "DIFFUSION":
        return <PermutationExplorer />;
      case "PLAINTEXT_PROCESSING":
        return <PlaintextProcessingFlow />;
      case "FINALIZATION":
      case "AUTH_TAG":
      case "FINAL_RESULT":
        return <FinalizationAndTag />;
      default:
        return <div className="w-full h-full flex items-center justify-center"><InteractiveStateGrid /></div>;
    }
  };

  return (
    <div className="flex flex-col h-full relative p-2 md:p-3 w-full">
      <div className="flex-1 min-h-0 relative flex flex-col lg:flex-row gap-3 w-full overflow-hidden">
        
        {/* Active Visiualization Stage */}
        <div id="tour-visualizer" className="flex-1 relative bg-black/40 border border-white/5 rounded-3xl overflow-hidden shadow-inner flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentStage + "-visual"}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.4 }}
              className="w-full h-full overflow-y-auto custom-scrollbar"
            >
              {renderActiveVisual()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Narrative & Explanation Interactive Scroll Panel */}
        <AnimatePresence mode="sync">
          {showNarrative ? (
            <motion.div 
              id="tour-narrative"
              key="narrative-open"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "380px" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full lg:w-[380px] shrink-0 bg-white/[0.02] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl overflow-hidden backdrop-blur-xl"
            >
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
                   <h2 className="text-lg font-bold text-white flex items-center gap-2.5 tracking-tight whitespace-nowrap">
                     <HelpCircle className="text-blue-500 w-5 h-5" /> 
                     What is happening?
                   </h2>
                  <button
                    onClick={() => setShowNarrative(false)}
                    title="Collapse guide panel"
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-500 hover:text-white transition-all"
                  >
                    <PanelRightClose className="w-4 h-4" />
                  </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 relative">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentStage + "-text"}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 pb-6"
                >
                  <div className="text-2xl font-bold text-white leading-tight">{data.title}</div>
                  
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative overflow-hidden shadow-sm">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h3 className="text-[11px] text-blue-400 uppercase font-bold mb-2 tracking-wider ml-2">What changed?</h3>
                    <p className="text-sm text-zinc-200 leading-relaxed ml-2">{data.what}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-[11px] text-zinc-500 uppercase font-bold mb-2 tracking-wider">How does it work?</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{data.how}</p>
                  </div>

                  <div>
                    <h3 className="text-[11px] text-zinc-500 uppercase font-bold mb-2 tracking-wider">Why is it necessary?</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{data.why}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                    <div>
                      <h3 className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-wider">Input</h3>
                      <p className="text-xs text-zinc-300 font-mono break-words">{data.input}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] text-zinc-500 uppercase font-bold mb-2 tracking-wider">Output</h3>
                      <p className="text-xs text-zinc-300 font-mono break-words">{data.output}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-5 rounded-xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rotate-45 transform translate-x-12 -translate-y-12 blur-xl"></div>
                     <h3 className="text-[11px] text-emerald-500 uppercase font-bold mb-2 tracking-wider">Security Purpose</h3>
                     <p className="text-sm text-emerald-100/90 leading-relaxed relative z-10">{data.security}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-3">
                     <button onClick={() => setIsMathModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-xs gap-2 font-medium">
                       <Calculator className="w-5 h-5" /> Math
                     </button>
                     <button onClick={() => setIsCodeModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-xs gap-2 font-medium">
                       <Code className="w-5 h-5" /> Code
                     </button>
                     <button onClick={() => router.push('/studio/ai-tutor')} className="flex flex-col items-center justify-center p-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 transition-colors text-xs gap-2 font-bold shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                       <Bot className="w-5 h-5" /> Ask AI
                     </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          ) : (
            <motion.div
              key="narrative-closed"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "40px" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="shrink-0 flex flex-col items-center justify-center"
            >
              <button
                onClick={() => setShowNarrative(true)}
                title="Expand guide panel"
                className="flex flex-col items-center gap-2 h-full w-10 rounded-2xl bg-white/[0.02] border border-white/10 hover:bg-white/[0.05] hover:border-blue-500/30 transition-all group"
              >
                <div className="flex-1 flex flex-col items-center justify-center gap-3">
                  <PanelRightOpen className="w-4 h-4 text-zinc-500 group-hover:text-blue-400 transition-colors" />
                  <div className="[writing-mode:vertical-lr] rotate-180 text-[10px] text-zinc-600 font-bold uppercase tracking-widest group-hover:text-zinc-400 transition-colors select-none">
                    Stage Guide
                  </div>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Compact Single-Row Controls ───────────────────────── */}
      <div id="tour-controls" className="mt-2 pt-2 border-t border-white/10 flex items-center gap-3 shrink-0 overflow-x-auto custom-scrollbar pb-1">

        {/* Left: Settings + Master Guide */}
        <button onClick={() => setIsSettingsModalOpen(true)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors shrink-0">
          <Settings className="w-4 h-4" />
        </button>
        <button onClick={() => setIsMasterGuideOpen(true)} className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/40 rounded-lg text-purple-400 hover:text-purple-300 transition-colors font-bold text-[10px] uppercase tracking-widest whitespace-nowrap shrink-0">
          Guide
        </button>

        {/* Centre: Step label + Progress bar */}
        <span className="text-[10px] text-zinc-600 font-mono shrink-0">{currentStepIndex}/{steps.length - 1}</span>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative shadow-inner min-w-[60px]">
          <motion.div
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Right: Playback controls */}
        <div className="flex items-center gap-2 bg-[#09090b] px-4 py-1.5 rounded-full border border-white/10 shadow-xl shrink-0">
          <button onClick={prevStep} disabled={currentStepIndex === 0} className="p-1.5 text-zinc-400 hover:text-blue-400 transition-colors disabled:opacity-20">
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={() => setPlaybackState(playbackState === 'playing' ? 'paused' : 'playing')}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95"
          >
            {playbackState === 'playing' ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
          </button>
          <button onClick={nextStep} disabled={currentStepIndex === steps.length - 1} className="p-1.5 text-zinc-400 hover:text-blue-400 transition-colors disabled:opacity-20">
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Speed */}
        <button onClick={toggleSpeed} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors text-[10px] font-bold tracking-wider shrink-0">
          <FastForward className="w-3.5 h-3.5" /> {animationSpeed}x
        </button>
      </div>
      
      <Modal isOpen={isMathModalOpen} onClose={() => setIsMathModalOpen(false)} title={`Mathematical Insight: ${data.title}`} icon={<Calculator />}>
        <div className="space-y-4">
          <p className="text-zinc-300">The functional equation applying to <b>{currentStage}</b> is typically represented as an algebraic structure operating over GF(2).</p>
          <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-blue-400 overflow-x-auto text-sm">
             {currentStage === "SUBSTITUTION" 
                ? "x0 ^= x4; x4 ^= x3; x2 ^= x1;\\nT0 = x0 ^ x1 ^ x2 ^ x3 ^ x4;\\n// Bitslice Non-linearity Function"
                : currentStage === "DIFFUSION"
                ? "x0 ^= ROTR(x0, 19) ^ ROTR(x0, 28);\\nx1 ^= ROTR(x1, 61) ^ ROTR(x1, 39);\\nx2 ^= ROTR(x2,  1) ^ ROTR(x2,  6);"
                : "f_a(S) = p^a ( S ⊕ (C || 0^{320-c}) )"}
          </div>
          <p className="text-xs text-zinc-500">Mathematical models for ASCON rely heavily on the Sponge Construction and strict avalanche criterion parameters.</p>
        </div>
      </Modal>

      <Modal isOpen={isCodeModalOpen} onClose={() => setIsCodeModalOpen(false)} title={`Code Implementation: ${data.title}`} icon={<Code />}>
        <div className="space-y-4">
          <p className="text-zinc-300">Below is the reference C implementation standard for this phase on a generic 32-bit/64-bit architecture.</p>
          <div className="bg-[#050505] p-4 rounded-xl border border-white/10 font-mono text-emerald-400 overflow-x-auto text-xs">
             <pre>
{`void ascon_core_${currentStage.toLowerCase()}(ascon_state_t* s) {
    // Stage: ${currentStage}
    ${currentStage === "SUBSTITUTION" ? "s->x0 ^= s->x4;\\ns->x4 ^= s->x3;\\ns->x2 ^= s->x1;\\n/* Apply non-linear S-box */" : "/* Applying standard linear transformations */\\napply_permutation(s);"}
}`}
             </pre>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title="Platform Settings" icon={<Settings />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
             <div>
               <h4 className="text-white font-bold mb-1">Demo Mode Determinism</h4>
               <p className="text-xs text-zinc-400">Lock RNGs to display reproducible visual traces.</p>
             </div>
             <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
               <div className="w-4 h-4 bg-white rounded-full absolute top-1 right-1"></div>
             </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
             <div>
               <h4 className="text-white font-bold mb-1">Hardware Acceleration (ESP32)</h4>
               <p className="text-xs text-zinc-400">Offload encryption to connected edge device if active.</p>
             </div>
             <div className="w-12 h-6 bg-zinc-800 rounded-full relative cursor-not-allowed">
               <div className="w-4 h-4 bg-zinc-500 rounded-full absolute top-1 left-1"></div>
             </div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isMasterGuideOpen} onClose={() => setIsMasterGuideOpen(false)} title="Master ASCON Guide (0 to 100)" icon={<HelpCircle />}>
        <div className="space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 pb-8">
           <p className="text-zinc-400 leading-relaxed">
              This master encyclopedia covers the entire ASCON cryptographic pipeline from zero to one hundred. It details the exact sequence of transformations your data undergoes to guarantee extreme security.
           </p>
           {steps.map((stepKey, idx) => {
              const expl = explanations[stepKey];
              if (!expl) return null;
              return (
                 <div key={stepKey} className="border-b border-white/10 pb-6 mb-6">
                    <h3 className="text-xl font-bold text-blue-400 mb-4">{idx + 1}. {expl.title}</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                          <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">What happens</h4>
                          <p className="text-sm text-zinc-300 leading-relaxed">{expl.what}</p>
                       </div>
                       <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                          <h4 className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">How it works</h4>
                          <p className="text-sm text-zinc-300 leading-relaxed">{expl.how}</p>
                       </div>
                    </div>
                    
                    <div className="mt-4 bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl shadow-inner">
                       <h4 className="text-[10px] text-emerald-500 uppercase tracking-widest font-bold mb-2">Security Justification</h4>
                       <p className="text-sm text-emerald-100/90 leading-relaxed">{expl.security}</p>
                    </div>
                 </div>
              )
           })}
        </div>
      </Modal>

      {isTourOpen && <GuidedTour steps={tourSteps} onClose={() => setIsTourOpen(false)} />}
    </div>
  );
}
