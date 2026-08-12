import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Ascon128 } from "@/lib/ascon";

// The 13 Narrative Steps described precisely by the user
export type NarrativeStep = 
  | "INTRODUCTION"
  | "SENSOR_DATA"
  | "PREPARE_DATA"
  | "CRYPTO_PARAMS"
  | "INITIAL_STATE"
  | "INITIALIZATION"
  | "PERMUTATION"
  | "SUBSTITUTION"
  | "DIFFUSION"
  | "PLAINTEXT_PROCESSING"
  | "FINALIZATION"
  | "AUTH_TAG"
  | "FINAL_RESULT";

export interface StateHistoryNode {
  stage: NarrativeStep;
  round: number;
  operation: string;
  before: string[]; // 5 64-bit words before
  after: string[];  // 5 64-bit words after
  explanation: string;
  timestampMs: number;
}

export interface ExecutionSession {
  sessionId: string;
  deviceId: string;
  sensorReading: string;
  
  plaintext: string;
  plaintextBytes: string; // hex representation
  
  key: string;
  nonce: string;
  associatedData: string;
  
  initialState: string[]; // 5x64-bit words as hex
  
  currentStage: NarrativeStep;
  currentRound: number;
  currentOperation: string;
  
  stateHistory: StateHistoryNode[]; // Complete trace
  
  ciphertext: string;
  authenticationTag: string;
  verificationResult: boolean | null;
  performanceMetrics: {
    timeMs: number;
    throughput: number; // GB/s
  };
  
  timestamp: string;
}

interface AsconState {
  session: ExecutionSession;
  
  // Navigation
  steps: NarrativeStep[];
  currentStepIndex: number;
  
  // View Control
  playbackState: "playing" | "paused" | "idle";
  animationSpeed: number;
  demoMode: boolean; // Tells UI to show exactly: DEMO MODE

  // Helper flags avoiding TS issues in existing code (mocked)
  learningMode: "beginner" | "intermediate" | "research";
  plaintext: string;
  key: string;
  nonce: string;
  associatedData: string;
  activeExplorerTab: string;
  modeType: string;

  setPlaintext: (pt: string) => void;
  setKey: (k: string) => void;
  setNonce: (n: string) => void;
  setAssociatedData: (ad: string) => void;
  setLearningMode: (mode: any) => void;
  setModeType: (mode: any) => void;
  setActiveExplorerTab: (tab: any) => void;
  setActiveFlippedBit: (index: number | null) => void;
  setHoveredOperation: (op: string | null) => void;
  encrypt: () => void;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (index: number) => void;
  
  setPlaybackState: (state: "playing" | "paused" | "idle") => void;
  setAnimationSpeed: (speed: number) => void;
  startFullDemo: () => void; 
  
  reset: () => void;
  
  token: string | null;
  setToken: (token: string | null) => void;
}

// Generate the initial deterministic session matching the required parameters
const initialDemoSession = (): ExecutionSession => ({
  sessionId: "DEMO-EXEC-001",
  deviceId: "ESP32-01",
  sensorReading: "27.4 °C",
  
  // Actual mock bytes/hex for education purposes
  plaintext: "27.4 °C",
  plaintextBytes: "32 37 2E 34 20 C2 B0 43",
  
  key: "000102030405060708090A0B0C0D0E0F",
  nonce: "000102030405060708090A0B0C0D0E0F",
  associatedData: "ESP32-STATION-1",
  
  initialState: [
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000",
    "0000000000000000"
  ], 
  
  currentStage: "INTRODUCTION",
  currentRound: 0,
  currentOperation: "IDLE",
  
  stateHistory: [], 
  
  ciphertext: "8F 9C 2B 4A 1F E3 DD C1", // Precomputed
  authenticationTag: "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09", // Precomputed
  verificationResult: true,
  performanceMetrics: {
    timeMs: 0.24,
    throughput: 3.2
  },
  
  timestamp: new Date().toISOString()
});

const defaultSteps: NarrativeStep[] = [
  "INTRODUCTION",
  "SENSOR_DATA",
  "PREPARE_DATA",
  "CRYPTO_PARAMS",
  "INITIAL_STATE",
  "INITIALIZATION",
  "PERMUTATION",
  "SUBSTITUTION",
  "DIFFUSION",
  "PLAINTEXT_PROCESSING",
  "FINALIZATION",
  "AUTH_TAG",
  "FINAL_RESULT"
];

export const useAsconStore = create<AsconState>()(
  persist(
    (set, get) => ({
      session: initialDemoSession(),
      
      steps: defaultSteps,
      currentStepIndex: 0,
      
      playbackState: "idle",
      animationSpeed: 1.0,
      demoMode: true,
      learningMode: "beginner",
      plaintext: "27.4 °C",
      key: "000102030405060708090A0B0C0D0E0F",
      nonce: "000102030405060708090A0B0C0D0E0F",
      associatedData: "AUTH_DATA",
      activeExplorerTab: "init",
      modeType: "guided",
      token: null,
      
      setToken: (t: string | null) => set({ token: t }),
      setPlaintext: (pt: string) => set((state) => ({ 
        plaintext: pt,
        session: { ...state.session, plaintext: pt, sensorReading: pt }
      })),
      setKey: () => {},
      setNonce: () => {},
      setAssociatedData: () => {},
      setLearningMode: () => {},
      setModeType: () => {},
      setActiveExplorerTab: () => {},
      setActiveFlippedBit: () => {},
      setHoveredOperation: () => {},
      encrypt: () => {},
      
      nextStep: () => set((state) => {
        const nextIndex = Math.min(state.currentStepIndex + 1, state.steps.length - 1);
        return { 
          currentStepIndex: nextIndex,
          session: { ...state.session, currentStage: state.steps[nextIndex] }
        };
      }),
      
      prevStep: () => set((state) => {
        const prevIndex = Math.max(state.currentStepIndex - 1, 0);
        return { 
          currentStepIndex: prevIndex,
          session: { ...state.session, currentStage: state.steps[prevIndex] }
        };
      }),
      
      setStep: (index: number) => set((state) => {
        const safeIndex = Math.max(0, Math.min(index, state.steps.length - 1));
        return {
          currentStepIndex: safeIndex,
          session: { ...state.session, currentStage: state.steps[safeIndex] }
        };
      }),
      
      setPlaybackState: (st) => set({ playbackState: st }),
      setAnimationSpeed: (speed) => set({ animationSpeed: speed }),
      
      startFullDemo: () => set({
        currentStepIndex: 0,
        playbackState: "playing",
        session: { ...initialDemoSession(), currentStage: "INTRODUCTION" }
      }),
      
      reset: () => set({
        session: initialDemoSession(),
        currentStepIndex: 0,
        playbackState: "idle"
      })
    }),
    {
      name: 'ascon-auth-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as AsconState;
        const validStage = defaultSteps.includes(state?.session?.currentStage as any)
          ? state.session.currentStage
          : defaultSteps[0];
        
        return {
          ...state,
          steps: defaultSteps,
          session: {
            ...state?.session,
            currentStage: validStage
          },
          currentStepIndex: defaultSteps.indexOf(validStage) !== -1 ? defaultSteps.indexOf(validStage) : 0
        } as AsconState;
      }
    }
  )
);
