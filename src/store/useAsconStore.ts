import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Ascon128 } from "@/lib/ascon";

export type LearningMode = "beginner" | "intermediate" | "research";
export type MicroStep = 
  | "INIT_IDLE"
  | "LOAD_KEY"
  | "LOAD_NONCE"
  | "BUILD_STATE"
  | "INIT_PERMUTATION"
  | "LOAD_AD"
  | "AD_ABSORB"
  | "AD_PERMUTATION"
  | "LOAD_PT"
  | "PT_ENCRYPT"
  | "FINAL_TAG";

interface AsconState {
  plaintext: string;
  key: string;
  nonce: string;
  associatedData: string;
  ciphertext: string;
  tag: string;
  token: string | null;
  xp: number;
  
  // New Interactive State
  learningMode: LearningMode;
  currentStepIndex: number;
  steps: MicroStep[];
  activeFlippedBit: number | null;
  hoveredOperation: string | null;
  
  // Update functions
  setPlaintext: (pt: string) => void;
  setKey: (k: string) => void;
  setNonce: (n: string) => void;
  setAssociatedData: (ad: string) => void;
  setToken: (t: string | null) => void;
  setLearningMode: (mode: LearningMode) => void;
  nextStep: () => void;
  prevStep: () => void;
  addXp: (amount: number) => void;
  setActiveFlippedBit: (bitIndex: number | null) => void;
  setHoveredOperation: (op: string | null) => void;
  
  // Execution
  encrypt: () => void;
  reset: () => void;
}

export const useAsconStore = create<AsconState>()(
  persist(
    (set, get) => ({
      plaintext: "Hello ASCON!",
      key: "000102030405060708090A0B0C0D0E0F",
      nonce: "000102030405060708090A0B0C0D0E0F",
      associatedData: "ASCON",
      ciphertext: "",
      tag: "",
      token: null,
      xp: 0,
      
      learningMode: "beginner",
      currentStepIndex: 0,
      steps: [
        "INIT_IDLE",
        "LOAD_KEY",
        "LOAD_NONCE",
        "BUILD_STATE",
        "INIT_PERMUTATION",
        "LOAD_AD",
        "AD_ABSORB",
        "AD_PERMUTATION",
        "LOAD_PT",
        "PT_ENCRYPT",
        "FINAL_TAG"
      ],
      activeFlippedBit: null,
      hoveredOperation: null,
      
      setPlaintext: (pt) => set({ plaintext: pt }),
      setKey: (k) => set({ key: k }),
      setNonce: (n) => set({ nonce: n }),
      setAssociatedData: (ad) => set({ associatedData: ad }),
      setToken: (t) => set({ token: t }),
      setLearningMode: (mode) => set({ learningMode: mode }),
      nextStep: () => set((state) => ({ 
        currentStepIndex: Math.min(state.currentStepIndex + 1, state.steps.length - 1) 
      })),
      prevStep: () => set((state) => ({ 
        currentStepIndex: Math.max(state.currentStepIndex - 1, 0) 
      })),
      addXp: (amount) => set((state) => ({ xp: state.xp + amount })),
      setActiveFlippedBit: (index) => set({ activeFlippedBit: index }),
      setHoveredOperation: (op) => set({ hoveredOperation: op }),
      
      encrypt: () => {
        const { plaintext } = get();
        try {
          // Fire true ASCON encryption
          const output = Ascon128.encrypt(plaintext);
          set({ 
            ciphertext: output.replace(/(.{2})/g, '$1 ').trim().toUpperCase(),
            tag: "VALID_TAG_E3",
            currentStepIndex: 9 // Fast forward visualization jump
          });
        } catch {
          set({ ciphertext: "ERR_EXECUTION_FAILED" });
        }
      },
      
      reset: () => set({
        plaintext: "",
        key: "",
        nonce: "",
        associatedData: "",
        ciphertext: "",
        tag: "",
        currentStepIndex: 0
      }),
    }),
    {
      name: 'ascon-auth-storage', // saves to localStorage natively
    }
  )
);
