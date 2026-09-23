import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Ascon128 } from "@/lib/ascon";

// The 5 Beginner-Friendly Narrative Steps
export type NarrativeStep = 
  | "INPUT_PARAMETERS"
  | "STATE_INITIALIZATION"
  | "AD_PROCESSING"
  | "PLAINTEXT_ENCRYPTION"
  | "FINALIZATION"
  | "AUTH_OUTPUT";

// The Decryption Pipeline Steps
export type DecryptionNarrativeStep =
  | "DECRYPT_INPUT_PARAMETERS"
  | "DECRYPT_STATE_INITIALIZATION"
  | "DECRYPT_AD_PROCESSING"
  | "DECRYPT_CIPHERTEXT_PROCESSING"
  | "DECRYPT_FINALIZATION"
  | "DECRYPT_TAG_VERIFICATION";

export const defaultDecryptionSteps: DecryptionNarrativeStep[] = [
  "DECRYPT_INPUT_PARAMETERS",
  "DECRYPT_STATE_INITIALIZATION",
  "DECRYPT_AD_PROCESSING",
  "DECRYPT_CIPHERTEXT_PROCESSING",
  "DECRYPT_FINALIZATION",
  "DECRYPT_TAG_VERIFICATION",
];

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
  demoMode: boolean;
  isHardwareConnected: boolean;

  // Helper flags
  learningMode: "beginner" | "intermediate" | "research";
  plaintext: string;
  key: string;
  nonce: string;
  associatedData: string;
  activeExplorerTab: string;
  modeType: string;

  // ── Gamification ──────────────────────────────────────────
  /** Global XP shared with the Quiz arena */
  xp: number;
  addXp: (amount: number) => void;
  /** XP earned exclusively inside the Encryption lab */
  encryptionXp: number;
  addEncryptionXp: (amount: number) => void;
  /** Steps where the challenge has been completed (gates progression) */
  completedSteps: NarrativeStep[];
  markStepComplete: (step: NarrativeStep) => void;
  // ──────────────────────────────────────────────────────────

  // ── Decryption Lab State ─────────────────────────────────
  decryptionSteps: DecryptionNarrativeStep[];
  currentDecryptionStepIndex: number;
  decryptionPlaybackState: "playing" | "paused" | "idle";
  decryptionAnimationSpeed: number;
  decryptionXp: number;
  decryptionCompletedSteps: DecryptionNarrativeStep[];
  decryptionTampered: boolean;
  decryptionCiphertext: string;
  decryptionAuthTag: string;
  decryptionKey: string;
  decryptionNonce: string;
  decryptionAssociatedData: string;
  decryptionRecoveredPlaintext: string;

  setDecryptionStep: (index: number) => void;
  nextDecryptionStep: () => void;
  prevDecryptionStep: () => void;
  setDecryptionPlaybackState: (state: "playing" | "paused" | "idle") => void;
  setDecryptionAnimationSpeed: (speed: number) => void;
  addDecryptionXp: (amount: number) => void;
  markDecryptionStepComplete: (step: DecryptionNarrativeStep) => void;
  setDecryptionTampered: (tampered: boolean) => void;
  setDecryptionCiphertext: (ct: string) => void;
  setDecryptionAuthTag: (tag: string) => void;
  setDecryptionKey: (k: string) => void;
  setDecryptionNonce: (n: string) => void;
  setDecryptionAssociatedData: (ad: string) => void;
  syncDecryptionFromEncryption: () => void;
  resetDecryption: () => void;
  // ──────────────────────────────────────────────────────────

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
  setHardwareConnected: (status: boolean) => void;

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
  
  currentStage: "INPUT_PARAMETERS",
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
  "INPUT_PARAMETERS",
  "STATE_INITIALIZATION",
  "AD_PROCESSING",
  "PLAINTEXT_ENCRYPTION",
  "FINALIZATION",
  "AUTH_OUTPUT"
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
      isHardwareConnected: false,
      learningMode: "beginner",
      plaintext: "27.4 °C",
      key: "000102030405060708090A0B0C0D0E0F",
      nonce: "000102030405060708090A0B0C0D0E0F",
      associatedData: "AUTH_DATA",
      activeExplorerTab: "init",
      modeType: "guided",
      token: null,

      // ── Gamification initial state ────────────────────────
      xp: 0,
      encryptionXp: 0,
      completedSteps: [],
      // ─────────────────────────────────────────────────────

      // ── Decryption Lab Initial State ──────────────────────
      decryptionSteps: defaultDecryptionSteps,
      currentDecryptionStepIndex: 0,
      decryptionPlaybackState: "idle",
      decryptionAnimationSpeed: 1.0,
      decryptionXp: 0,
      decryptionCompletedSteps: [],
      decryptionTampered: false,
      decryptionCiphertext: "A0 94 4F CB 23 BB 9B 3E",
      decryptionAuthTag: "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09",
      decryptionKey: "000102030405060708090A0B0C0D0E0F",
      decryptionNonce: "101112131415161718191A1B1C1D1E1F",
      decryptionAssociatedData: "ESP32-STATION-1",
      decryptionRecoveredPlaintext: "Hello IoT",

      setDecryptionStep: (index: number) => set({
        currentDecryptionStepIndex: Math.max(0, Math.min(index, defaultDecryptionSteps.length - 1))
      }),
      nextDecryptionStep: () => set((state) => ({
        currentDecryptionStepIndex: Math.min(state.currentDecryptionStepIndex + 1, state.decryptionSteps.length - 1)
      })),
      prevDecryptionStep: () => set((state) => ({
        currentDecryptionStepIndex: Math.max(state.currentDecryptionStepIndex - 1, 0)
      })),
      setDecryptionPlaybackState: (st) => set({ decryptionPlaybackState: st }),
      setDecryptionAnimationSpeed: (speed) => set({ decryptionAnimationSpeed: speed }),
      addDecryptionXp: (amount: number) => set((state) => ({
        decryptionXp: Math.max(0, state.decryptionXp + amount)
      })),
      markDecryptionStepComplete: (step: DecryptionNarrativeStep) => set((state) => ({
        decryptionCompletedSteps: state.decryptionCompletedSteps.includes(step)
          ? state.decryptionCompletedSteps
          : [...state.decryptionCompletedSteps, step]
      })),
      setDecryptionTampered: (tampered: boolean) => set({ decryptionTampered: tampered }),
      setDecryptionCiphertext: (ct: string) => set({ decryptionCiphertext: ct }),
      setDecryptionAuthTag: (tag: string) => set({ decryptionAuthTag: tag }),
      setDecryptionKey: (k: string) => set({ decryptionKey: k }),
      setDecryptionNonce: (n: string) => set({ decryptionNonce: n }),
      setDecryptionAssociatedData: (ad: string) => set({ decryptionAssociatedData: ad }),
      syncDecryptionFromEncryption: () => set((state) => ({
        decryptionCiphertext: state.session.ciphertext || "A0 94 4F CB 23 BB 9B 3E",
        decryptionAuthTag: state.session.authenticationTag || "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09",
        decryptionKey: state.session.key || "000102030405060708090A0B0C0D0E0F",
        decryptionNonce: state.session.nonce || "101112131415161718191A1B1C1D1E1F",
        decryptionAssociatedData: state.session.associatedData || "ESP32-STATION-1",
        decryptionRecoveredPlaintext: state.session.plaintext || "Hello IoT",
        decryptionTampered: false,
      })),
      resetDecryption: () => set({
        currentDecryptionStepIndex: 0,
        decryptionPlaybackState: "idle",
        decryptionXp: 0,
        decryptionCompletedSteps: [],
        decryptionTampered: false,
        decryptionCiphertext: "A0 94 4F CB 23 BB 9B 3E",
        decryptionAuthTag: "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09",
        decryptionKey: "000102030405060708090A0B0C0D0E0F",
        decryptionNonce: "101112131415161718191A1B1C1D1E1F",
        decryptionAssociatedData: "ESP32-STATION-1",
        decryptionRecoveredPlaintext: "Hello IoT",
      }),
      // ─────────────────────────────────────────────────────
      
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
      setHardwareConnected: (status: boolean) => set({ isHardwareConnected: status }),

      addXp: (amount: number) => set((state) => ({ xp: Math.max(0, state.xp + amount) })),
      addEncryptionXp: (amount: number) => set((state) => ({
        encryptionXp: Math.max(0, state.encryptionXp + amount)
      })),
      markStepComplete: (step: NarrativeStep) => set((state) => ({
        completedSteps: state.completedSteps.includes(step)
          ? state.completedSteps
          : [...state.completedSteps, step]
      })),
      
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
        session: { ...initialDemoSession(), currentStage: "INPUT_PARAMETERS" }
      }),
      
      reset: () => set({
        session: initialDemoSession(),
        currentStepIndex: 0,
        playbackState: "idle",
        encryptionXp: 0,
        completedSteps: [],
      })
    }),
    {
      name: 'ascon-auth-storage',
      version: 5,
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as AsconState;
        const validStage = defaultSteps.includes(state?.session?.currentStage as any)
          ? state.session.currentStage
          : defaultSteps[0];
        
        const validCompleted = (state?.completedSteps || []).filter(s => defaultSteps.includes(s as any));
        const validDecryptedCompleted = (state?.decryptionCompletedSteps || []).filter(s => defaultDecryptionSteps.includes(s as any));

        return {
          ...state,
          steps: defaultSteps,
          decryptionSteps: defaultDecryptionSteps,
          currentDecryptionStepIndex: state?.currentDecryptionStepIndex ?? 0,
          decryptionPlaybackState: "idle",
          decryptionAnimationSpeed: state?.decryptionAnimationSpeed ?? 1.0,
          decryptionXp: state?.decryptionXp ?? 0,
          decryptionCompletedSteps: validDecryptedCompleted,
          decryptionTampered: state?.decryptionTampered ?? false,
          decryptionCiphertext: state?.decryptionCiphertext ?? "A0 94 4F CB 23 BB 9B 3E",
          decryptionAuthTag: state?.decryptionAuthTag ?? "1A 2B 3C 4D 5E 6F 70 81 92 A3 B4 C5 D6 E7 F8 09",
          decryptionKey: state?.decryptionKey ?? "000102030405060708090A0B0C0D0E0F",
          decryptionNonce: state?.decryptionNonce ?? "101112131415161718191A1B1C1D1E1F",
          decryptionAssociatedData: state?.decryptionAssociatedData ?? "ESP32-STATION-1",
          decryptionRecoveredPlaintext: state?.decryptionRecoveredPlaintext ?? "Hello IoT",
          session: {
            ...state?.session,
            currentStage: validStage
          },
          currentStepIndex: defaultSteps.indexOf(validStage) !== -1 ? defaultSteps.indexOf(validStage) : 0,
          // Ensure new gamification fields exist after migration
          xp: state?.xp ?? 0,
          encryptionXp: state?.encryptionXp ?? 0,
          completedSteps: validCompleted,
        } as AsconState;
      }
    }
  )
);
