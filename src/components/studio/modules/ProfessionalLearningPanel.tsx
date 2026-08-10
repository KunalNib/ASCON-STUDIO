import { useAsconStore, NarrativeStep } from "@/store/useAsconStore";
import { motion, AnimatePresence } from "framer-motion";
import { Network, Calculator, Code, Bot, HelpCircle } from "lucide-react";

export function ProfessionalLearningPanel() {
  const { currentStepIndex, steps, session } = useAsconStore();
  const currentStep = steps[currentStepIndex];

  // We are storing deterministic explanations for the steps here.
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
  
  const data = explanations[currentStep] || explanations["INTRODUCTION"];

  return (
    <div className="bg-[#09090b] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 shadow-xl h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
         <h2 className="text-xl font-bold text-white flex items-center gap-3 tracking-tight">
           <HelpCircle className="text-blue-500 w-6 h-6" /> 
           What is happening?
         </h2>
         <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded font-bold uppercase cursor-pointer hover:bg-blue-500/30 transition-colors">
            Value Trace Context
         </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div>
            <div className="text-2xl font-bold text-white mb-2">{data.title}</div>
          </div>
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <h3 className="text-[11px] text-blue-400 uppercase font-bold mb-1 tracking-wider ml-1">What changed?</h3>
            <p className="text-sm text-zinc-200 leading-relaxed ml-1">{data.what}</p>
          </div>
          
          <div>
            <h3 className="text-[11px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">How does it work?</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{data.how}</p>
          </div>

          <div>
            <h3 className="text-[11px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Why is it necessary?</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{data.why}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 bg-black/40 p-3 rounded-xl border border-white/5">
            <div>
              <h3 className="text-[10px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Input</h3>
              <p className="text-xs text-zinc-300 font-mono break-words">{data.input}</p>
            </div>
            <div>
              <h3 className="text-[10px] text-zinc-500 uppercase font-bold mb-1 tracking-wider">Output</h3>
              <p className="text-xs text-zinc-300 font-mono break-words">{data.output}</p>
            </div>
          </div>

          <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rotate-45 transform translate-x-8 -translate-y-8 blur-md"></div>
             <h3 className="text-[11px] text-emerald-500 uppercase font-bold mb-2 tracking-wider">Security Purpose</h3>
             <p className="text-sm text-emerald-100/80 leading-relaxed relative z-10">{data.security}</p>
          </div>
          
          <div className="pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
             <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-xs gap-1">
               <Calculator className="w-4 h-4" /> Math
             </button>
             <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors text-xs gap-1">
               <Code className="w-4 h-4" /> Code
             </button>
             <button className="flex flex-col items-center justify-center p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/20 transition-colors text-xs gap-1">
               <Bot className="w-4 h-4" /> Ask AI
             </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
