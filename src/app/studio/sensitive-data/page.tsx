"use client";

import { useState, useRef } from "react";
import { Lock, Unlock, Database, FileText, ShieldAlert, Key, Upload, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Ascon128 } from "@/lib/ascon";
import { useAsconStore } from "@/store/useAsconStore";

const SAMPLE_DATASETS = {
  Financial: JSON.stringify({
    account_number: "8472-9102-4811",
    routing_number: "021000021",
    balance: "$145,230.50",
    holder_name: "Alice Smith"
  }, null, 2),
  Healthcare: JSON.stringify({
    patient_id: "PID-99214",
    blood_type: "O-Negative",
    diagnosis: "Hypertension",
    social_security: "XXX-XX-1234"
  }, null, 2),
  PII: JSON.stringify({
    email: "alice.smith@example.com",
    phone: "+1-555-0198",
    address: "123 Crypto Lane, SecurCity",
    dob: "1985-11-20"
  }, null, 2)
};

const DEFAULT_KEY = "000102030405060708090A0B0C0D0E0F";
const DEFAULT_NONCE = "000102030405060708090A0B0C0D0E0F";
const DEFAULT_AD = "DATASET-CLASSIFIED";

export default function SensitiveDataModule() {
  const { plaintext, setPlaintext } = useAsconStore();
  
  const [inputText, setInputText] = useState(() => {
    if (plaintext && plaintext !== "27.4 °C") {
      return plaintext;
    }
    return SAMPLE_DATASETS.Financial;
  });
  
  const [encryptedData, setEncryptedData] = useState<{ ciphertext: string; tag: string } | null>(null);
  const [decryptedText, setDecryptedText] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInputText(content);
      setPlaintext(content);
      setEncryptedData(null);
      setDecryptedText(null);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendToPipeline = () => {
    setPlaintext(inputText);
    alert("Dataset successfully sent to the ASCON Studio Pipeline! You can now view its step-by-step processing in Encryption, Decryption, Permutation, and 320-bit State modules.");
  };

  const handleEncrypt = () => {
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const enc = Ascon128.encryptAEAD(DEFAULT_KEY, DEFAULT_NONCE, DEFAULT_AD, inputText);
        setEncryptedData({ ciphertext: enc.ciphertext, tag: enc.authenticationTag });
        setDecryptedText(null);
      } catch (e) {
        console.error("Encryption failed", e);
      }
      setIsProcessing(false);
    }, 600);
  };

  const handleDecrypt = () => {
    if (!encryptedData) return;
    setIsProcessing(true);
    setTimeout(() => {
      try {
        const dec = Ascon128.decryptAEAD(DEFAULT_KEY, DEFAULT_NONCE, DEFAULT_AD, encryptedData.ciphertext, encryptedData.tag);
        setDecryptedText(dec.recoveredPlaintext);
      } catch (e) {
        console.error("Decryption failed", e);
      }
      setIsProcessing(false);
    }, 600);
  };

  return (
    <div className="p-6 md:p-8 w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)] overflow-y-auto custom-scrollbar">
      
      {/* Header */}
      <header className="mb-8 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-3 mb-2">
          <Database className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          Sensitive Data Processing
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-3xl">
          ASCON is lightweight but highly secure. Here you can test the algorithm on structured sensitive datasets like financial records, PII, and healthcare data. Provide your dataset and witness the AEAD (Authenticated Encryption with Associated Data) process in action.
        </p>
      </header>

      {/* Dataset Selectors */}
      <div className="flex flex-wrap items-center gap-3 mb-6 shrink-0">
        <input 
          type="file" 
          accept=".txt,.json,.csv" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-full text-sm font-bold text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all shadow-sm flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload File
        </button>
        <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-2" />
        {Object.entries(SAMPLE_DATASETS).map(([label, data]) => (
          <button
            key={label}
            onClick={() => {
              setInputText(data);
              setPlaintext(data);
              setEncryptedData(null);
              setDecryptedText(null);
            }}
            className="px-4 py-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-full text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 transition-all shadow-sm"
          >
            Load {label}
          </button>
        ))}
        
        <div className="ml-auto">
          <button
            onClick={handleSendToPipeline}
            className="px-4 py-2 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 rounded-full text-sm font-bold text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-all shadow-sm flex items-center gap-2"
            title="Send this dataset to the main visualizer pipeline"
          >
            <Send className="w-4 h-4" /> Send to Studio Pipeline
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* Left: Input Dataset */}
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-xl flex-1 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-zinc-900 dark:text-white">Input Dataset (Plaintext)</h3>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setEncryptedData(null);
                setDecryptedText(null);
              }}
              onBlur={() => {
                if (inputText) setPlaintext(inputText);
              }}
              className="flex-1 w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl p-4 font-mono text-sm text-zinc-800 dark:text-zinc-300 focus:outline-none focus:border-blue-500 resize-none transition-colors"
              placeholder="Paste your sensitive JSON or text here..."
            />
            <button
              onClick={handleEncrypt}
              disabled={isProcessing || !inputText}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-blue-500/30"
            >
              {isProcessing ? "Processing..." : <><Lock className="w-4 h-4" /> Encrypt Dataset</>}
            </button>
          </div>
          
          {/* Params info */}
          <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl p-4 shrink-0">
            <div className="flex items-center gap-2 mb-2 text-amber-700 dark:text-amber-400 font-bold text-sm uppercase tracking-wider">
              <Key className="w-4 h-4" /> Cryptographic Parameters
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono text-amber-800 dark:text-amber-200">
              <div className="truncate">Key: {DEFAULT_KEY}</div>
              <div className="truncate">Nonce: {DEFAULT_NONCE}</div>
            </div>
          </div>
        </div>

        {/* Right: Ciphertext Output */}
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-xl flex-1 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-zinc-900 dark:text-white">Secured Output (Ciphertext)</h3>
              </div>
            </div>
            
            <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-sm overflow-y-auto custom-scrollbar relative">
              <AnimatePresence>
                {!encryptedData && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center text-zinc-600"
                  >
                    Waiting for encryption...
                  </motion.div>
                )}
                {encryptedData && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="break-all text-emerald-400 leading-relaxed"
                  >
                    {encryptedData.ciphertext}
                    
                    <div className="mt-6 pt-4 border-t border-zinc-800 text-purple-400">
                      <div className="text-[10px] uppercase tracking-widest text-purple-500/50 mb-1">Authentication Tag</div>
                      {encryptedData.tag}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {encryptedData && (
              <button
                onClick={handleDecrypt}
                disabled={isProcessing}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/30"
              >
                {isProcessing ? "Processing..." : <><Unlock className="w-4 h-4" /> Decrypt & Verify</>}
              </button>
            )}
          </div>

          {/* Decryption Result */}
          <AnimatePresence>
            {decryptedText && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 overflow-hidden"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Unlock className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold text-zinc-900 dark:text-white text-sm">Recovered Plaintext</h3>
                  <span className="ml-auto bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
                    Tag Verified
                  </span>
                </div>
                <pre className="text-sm font-mono text-zinc-800 dark:text-zinc-300 whitespace-pre-wrap">
                  {decryptedText}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
