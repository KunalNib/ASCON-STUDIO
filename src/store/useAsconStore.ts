import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  Ascon128, 
  Ascon128a, 
  AsconHash, 
  AsconSuite, 
  AsconAlgorithm, 
  ALGORITHM_REGISTRY,
  AlgorithmMetadata 
} from "@/lib/ascon";

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
  
  // ── Multi-Algorithm Selection ──
  selectedAlgorithm: AsconAlgorithm;
  setSelectedAlgorithm: (algo: AsconAlgorithm) => void;
  getAlgorithmMetadata: () => AlgorithmMetadata;

  // ── ASCON-Hash State ──
  hashInput: string;
  hashResult: ReturnType<typeof AsconHash.hash>;
  setHashInput: (val: string) => void;
  runHash: () => void;

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
  activeFlippedBit: number | null;
  hoveredOperation: string | null;

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

// Default parameters matching ASCON specification
const DEFAULT_DEMO_KEY = "000102030405060708090A0B0C0D0E0F";
const DEFAULT_DEMO_NONCE = "000102030405060708090A0B0C0D0E0F";
const DEFAULT_DEMO_AD = "ESP32-STATION-1";
const DEFAULT_DEMO_PT = "27.4 °C";

function runAsconEncryption(k: string, n: string, ad: string, pt: string, algo: AsconAlgorithm = "ASCON-128") {
  try {
    const enc = AsconSuite.encrypt(algo === "ASCON-Hash" ? "ASCON-128" : algo, k, n, ad, pt);
    const ptBytes = Array.from(new TextEncoder().encode(pt))
      .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
      .join(" ");
    return {
      ciphertext: enc.ciphertext,
      authenticationTag: enc.authenticationTag,
      initialState: enc.initialStateWords,
      plaintextBytes: ptBytes,
    };
  } catch (e) {
    console.error("Encryption error:", e);
    return {
      ciphertext: "04 C4 2F 82 A8 7B EF A3",
      authenticationTag: "6B 4B BC B6 D4 61 E8 C4 39 DF 2F 20 69 4D 80 18",
      initialState: ["80400C0600000000", "0001020304050607", "08090A0B0C0D0E0F", "0001020304050607", "08090A0B0C0D0E0F"],
      plaintextBytes: "32 37 2E 34 20 C2 B0 43",
    };
  }
}

// Generate the initial deterministic session matching real ASCON
const initialDemoSession = (algo: AsconAlgorithm = "ASCON-128"): ExecutionSession => {
  const enc = runAsconEncryption(DEFAULT_DEMO_KEY, DEFAULT_DEMO_NONCE, DEFAULT_DEMO_AD, DEFAULT_DEMO_PT, algo);
  return {
    sessionId: "DEMO-EXEC-001",
    deviceId: "ESP32-01",
    sensorReading: DEFAULT_DEMO_PT,
    plaintext: DEFAULT_DEMO_PT,
    plaintextBytes: enc.plaintextBytes,
    key: DEFAULT_DEMO_KEY,
    nonce: DEFAULT_DEMO_NONCE,
    associatedData: DEFAULT_DEMO_AD,
    initialState: enc.initialState,
    currentStage: "INPUT_PARAMETERS",
    currentRound: 0,
    currentOperation: "IDLE",
    stateHistory: [],
    ciphertext: enc.ciphertext,
    authenticationTag: enc.authenticationTag,
    verificationResult: true,
    performanceMetrics: {
      timeMs: algo === "ASCON-128a" ? 0.14 : 0.24,
      throughput: algo === "ASCON-128a" ? 6.4 : 3.2,
    },
    timestamp: new Date().toISOString(),
  };
};

const defaultSteps: NarrativeStep[] = [
  "INPUT_PARAMETERS",
  "STATE_INITIALIZATION",
  "AD_PROCESSING",
  "PLAINTEXT_ENCRYPTION",
  "FINALIZATION",
  "AUTH_OUTPUT"
];

const initialHashData = AsconHash.hash("ascon");

export const useAsconStore = create<AsconState>()(
  persist(
    (set, get) => ({
      selectedAlgorithm: "ASCON-128",
      getAlgorithmMetadata: () => ALGORITHM_REGISTRY[get().selectedAlgorithm] || ALGORITHM_REGISTRY["ASCON-128"],
      
      setSelectedAlgorithm: (algo: AsconAlgorithm) => {
        const state = get();
        if (algo === "ASCON-Hash") {
          const hRes = AsconHash.hash(state.hashInput || "ascon");
          return set({
            selectedAlgorithm: algo,
            hashResult: hRes,
          });
        }
        const enc = runAsconEncryption(state.key, state.nonce, state.associatedData, state.plaintext, algo);
        const dec = AsconSuite.decrypt(algo, state.key, state.nonce, state.associatedData, enc.ciphertext, enc.authenticationTag);
        return set({
          selectedAlgorithm: algo,
          decryptionCiphertext: enc.ciphertext,
          decryptionAuthTag: enc.authenticationTag,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
          decryptionTampered: false,
          session: {
            ...state.session,
            ciphertext: enc.ciphertext,
            authenticationTag: enc.authenticationTag,
            initialState: enc.initialState,
            performanceMetrics: {
              timeMs: algo === "ASCON-128a" ? 0.14 : 0.24,
              throughput: algo === "ASCON-128a" ? 6.4 : 3.2,
            },
          },
        });
      },

      hashInput: "ascon",
      hashResult: initialHashData,
      setHashInput: (val: string) => {
        const res = AsconHash.hash(val);
        set({ hashInput: val, hashResult: res });
      },
      runHash: () => {
        const val = get().hashInput;
        const res = AsconHash.hash(val);
        set({ hashResult: res });
      },

      session: initialDemoSession("ASCON-128"),
      
      steps: defaultSteps,
      currentStepIndex: 0,
      
      playbackState: "idle",
      animationSpeed: 1.0,
      demoMode: true,
      isHardwareConnected: false,
      learningMode: "beginner",
      plaintext: DEFAULT_DEMO_PT,
      key: DEFAULT_DEMO_KEY,
      nonce: DEFAULT_DEMO_NONCE,
      associatedData: DEFAULT_DEMO_AD,
      activeExplorerTab: "init",
      modeType: "guided",
      activeFlippedBit: null,
      hoveredOperation: null,
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
      decryptionCiphertext: "04 C4 2F 82 A8 7B EF A3",
      decryptionAuthTag: "6B 4B BC B6 D4 61 E8 C4 39 DF 2F 20 69 4D 80 18",
      decryptionKey: DEFAULT_DEMO_KEY,
      decryptionNonce: DEFAULT_DEMO_NONCE,
      decryptionAssociatedData: DEFAULT_DEMO_AD,
      decryptionRecoveredPlaintext: DEFAULT_DEMO_PT,

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
      setDecryptionTampered: (tampered: boolean) => set((state) => {
        let ct = state.decryptionCiphertext;
        if (tampered) {
          const cleanBytes = ct.trim().split(/\s+/);
          if (cleanBytes.length > 0) {
            const firstByte = (parseInt(cleanBytes[0], 16) ^ 0x01)
              .toString(16)
              .toUpperCase()
              .padStart(2, "0");
            ct = [firstByte, ...cleanBytes.slice(1)].join(" ");
          }
        } else {
          ct = state.session.ciphertext || "04 C4 2F 82 A8 7B EF A3";
        }
        const dec = AsconSuite.decrypt(
          state.selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
          state.decryptionKey,
          state.decryptionNonce,
          state.decryptionAssociatedData,
          ct,
          state.decryptionAuthTag
        );
        return {
          decryptionTampered: tampered,
          decryptionCiphertext: ct,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
        };
      }),
      setDecryptionCiphertext: (ct: string) => set((state) => {
        const dec = AsconSuite.decrypt(
          state.selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
          state.decryptionKey,
          state.decryptionNonce,
          state.decryptionAssociatedData,
          ct,
          state.decryptionAuthTag
        );
        return {
          decryptionCiphertext: ct,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
        };
      }),
      setDecryptionAuthTag: (tag: string) => set((state) => {
        const dec = AsconSuite.decrypt(
          state.selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
          state.decryptionKey,
          state.decryptionNonce,
          state.decryptionAssociatedData,
          state.decryptionCiphertext,
          tag
        );
        return {
          decryptionAuthTag: tag,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
        };
      }),
      setDecryptionKey: (k: string) => set((state) => {
        const dec = AsconSuite.decrypt(
          state.selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
          k,
          state.decryptionNonce,
          state.decryptionAssociatedData,
          state.decryptionCiphertext,
          state.decryptionAuthTag
        );
        return {
          decryptionKey: k,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
        };
      }),
      setDecryptionNonce: (n: string) => set((state) => {
        const dec = AsconSuite.decrypt(
          state.selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
          state.decryptionKey,
          n,
          state.decryptionAssociatedData,
          state.decryptionCiphertext,
          state.decryptionAuthTag
        );
        return {
          decryptionNonce: n,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
        };
      }),
      setDecryptionAssociatedData: (ad: string) => set((state) => {
        const dec = AsconSuite.decrypt(
          state.selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
          state.decryptionKey,
          state.decryptionNonce,
          ad,
          state.decryptionCiphertext,
          state.decryptionAuthTag
        );
        return {
          decryptionAssociatedData: ad,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
        };
      }),
      syncDecryptionFromEncryption: () => set((state) => {
        const ct = state.session.ciphertext || "04 C4 2F 82 A8 7B EF A3";
        const tag = state.session.authenticationTag || "6B 4B BC B6 D4 61 E8 C4 39 DF 2F 20 69 4D 80 18";
        const k = state.session.key || DEFAULT_DEMO_KEY;
        const n = state.session.nonce || DEFAULT_DEMO_NONCE;
        const ad = state.session.associatedData || DEFAULT_DEMO_AD;
        const dec = AsconSuite.decrypt(
          state.selectedAlgorithm === "ASCON-128a" ? "ASCON-128a" : "ASCON-128",
          k, n, ad, ct, tag
        );
        return {
          decryptionCiphertext: ct,
          decryptionAuthTag: tag,
          decryptionKey: k,
          decryptionNonce: n,
          decryptionAssociatedData: ad,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
          decryptionTampered: false,
        };
      }),
      resetDecryption: () => {
        const k = DEFAULT_DEMO_KEY;
        const n = DEFAULT_DEMO_NONCE;
        const ad = DEFAULT_DEMO_AD;
        const ct = "04 C4 2F 82 A8 7B EF A3";
        const tag = "6B 4B BC B6 D4 61 E8 C4 39 DF 2F 20 69 4D 80 18";
        const dec = Ascon128.decryptAEAD(k, n, ad, ct, tag);
        return set({
          currentDecryptionStepIndex: 0,
          decryptionPlaybackState: "idle",
          decryptionXp: 0,
          decryptionCompletedSteps: [],
          decryptionTampered: false,
          decryptionCiphertext: ct,
          decryptionAuthTag: tag,
          decryptionKey: k,
          decryptionNonce: n,
          decryptionAssociatedData: ad,
          decryptionRecoveredPlaintext: dec.recoveredPlaintext,
        });
      },
      // ─────────────────────────────────────────────────────
      
      setToken: (t: string | null) => set({ token: t }),
      setPlaintext: (pt: string) => set((state) => {
        const enc = runAsconEncryption(state.key, state.nonce, state.associatedData, pt, state.selectedAlgorithm);
        return {
          plaintext: pt,
          session: {
            ...state.session,
            plaintext: pt,
            sensorReading: pt,
            plaintextBytes: enc.plaintextBytes,
            ciphertext: enc.ciphertext,
            authenticationTag: enc.authenticationTag,
            initialState: enc.initialState,
          },
        };
      }),
      setKey: (k: string) => set((state) => {
        const enc = runAsconEncryption(k, state.nonce, state.associatedData, state.plaintext, state.selectedAlgorithm);
        return {
          key: k,
          session: {
            ...state.session,
            key: k,
            ciphertext: enc.ciphertext,
            authenticationTag: enc.authenticationTag,
            initialState: enc.initialState,
          },
        };
      }),
      setNonce: (n: string) => set((state) => {
        const enc = runAsconEncryption(state.key, n, state.associatedData, state.plaintext, state.selectedAlgorithm);
        return {
          nonce: n,
          session: {
            ...state.session,
            nonce: n,
            ciphertext: enc.ciphertext,
            authenticationTag: enc.authenticationTag,
            initialState: enc.initialState,
          },
        };
      }),
      setAssociatedData: (ad: string) => set((state) => {
        const enc = runAsconEncryption(state.key, state.nonce, ad, state.plaintext, state.selectedAlgorithm);
        return {
          associatedData: ad,
          session: {
            ...state.session,
            associatedData: ad,
            ciphertext: enc.ciphertext,
            authenticationTag: enc.authenticationTag,
            initialState: enc.initialState,
          },
        };
      }),
      setLearningMode: (mode: any) => set({ learningMode: mode }),
      setModeType: (mode: any) => set({ modeType: mode }),
      setActiveExplorerTab: (tab: any) => set({ activeExplorerTab: tab }),
      setActiveFlippedBit: (index: number | null) => set({ activeFlippedBit: index }),
      setHoveredOperation: (op: string | null) => set({ hoveredOperation: op }),
      encrypt: () => set((state) => {
        const enc = runAsconEncryption(state.key, state.nonce, state.associatedData, state.plaintext, state.selectedAlgorithm);
        return {
          session: {
            ...state.session,
            plaintext: state.plaintext,
            sensorReading: state.plaintext,
            plaintextBytes: enc.plaintextBytes,
            ciphertext: enc.ciphertext,
            authenticationTag: enc.authenticationTag,
            initialState: enc.initialState,
            timestamp: new Date().toISOString(),
          },
        };
      }),
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
      
      startFullDemo: () => set((state) => ({
        currentStepIndex: 0,
        playbackState: "playing",
        session: { ...initialDemoSession(state.selectedAlgorithm), currentStage: "INPUT_PARAMETERS" }
      })),
      
      reset: () => set((state) => ({
        session: initialDemoSession(state.selectedAlgorithm),
        currentStepIndex: 0,
        playbackState: "idle",
        encryptionXp: 0,
        completedSteps: [],
      }))
    }),
    {
      name: 'ascon-auth-storage',
      version: 7,
      migrate: (persistedState: any, version: number) => {
        const state = persistedState as AsconState;
        const validStage = defaultSteps.includes(state?.session?.currentStage as any)
          ? state.session.currentStage
          : defaultSteps[0];
        
        const validCompleted = (state?.completedSteps || []).filter(s => defaultSteps.includes(s as any));
        const validDecryptedCompleted = (state?.decryptionCompletedSteps || []).filter(s => defaultDecryptionSteps.includes(s as any));
        const selectedAlgo = (state?.selectedAlgorithm === "ASCON-128a" || state?.selectedAlgorithm === "ASCON-Hash")
          ? state.selectedAlgorithm
          : "ASCON-128";

        return {
          ...state,
          selectedAlgorithm: selectedAlgo,
          hashInput: state?.hashInput || "ascon",
          hashResult: state?.hashResult || initialHashData,
          steps: defaultSteps,
          decryptionSteps: defaultDecryptionSteps,
          currentDecryptionStepIndex: state?.currentDecryptionStepIndex ?? 0,
          decryptionPlaybackState: "idle",
          decryptionAnimationSpeed: state?.decryptionAnimationSpeed ?? 1.0,
          decryptionXp: state?.decryptionXp ?? 0,
          decryptionCompletedSteps: validDecryptedCompleted,
          decryptionTampered: state?.decryptionTampered ?? false,
          decryptionCiphertext: state?.decryptionCiphertext ?? "04 C4 2F 82 A8 7B EF A3",
          decryptionAuthTag: state?.decryptionAuthTag ?? "6B 4B BC B6 D4 61 E8 C4 39 DF 2F 20 69 4D 80 18",
          decryptionKey: state?.decryptionKey ?? DEFAULT_DEMO_KEY,
          decryptionNonce: state?.decryptionNonce ?? DEFAULT_DEMO_NONCE,
          decryptionAssociatedData: state?.decryptionAssociatedData ?? DEFAULT_DEMO_AD,
          decryptionRecoveredPlaintext: state?.decryptionRecoveredPlaintext ?? DEFAULT_DEMO_PT,
          session: {
            ...state?.session,
            currentStage: validStage
          },
          currentStepIndex: defaultSteps.indexOf(validStage) !== -1 ? defaultSteps.indexOf(validStage) : 0,
          xp: state?.xp ?? 0,
          encryptionXp: state?.encryptionXp ?? 0,
          completedSteps: validCompleted,
        } as AsconState;
      }
    }
  )
);
