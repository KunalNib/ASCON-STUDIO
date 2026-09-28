"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  ChevronUp,
  ChevronDown,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  Radio,
  Zap,
} from "lucide-react";

export interface SecurityLogEvent {
  id: string;
  timestamp: string;
  type: "INJECT" | "SPONGE" | "AUTH_FAIL" | "BLOCKED" | "PROBE" | "SUCCESS" | "INFO";
  message: string;
  hex?: string;
  threatId?: string;
}

// Global lightweight event bus for security telemetry
type SecurityLogListener = (event: SecurityLogEvent) => void;
const listeners = new Set<SecurityLogListener>();

export function emitSecurityLog(
  type: SecurityLogEvent["type"],
  message: string,
  hex?: string,
  threatId?: string
) {
  const d = new Date();
  const timestamp = `${d.getHours().toString().padStart(2, "0")}:${d
    .getMinutes()
    .toString()
    .padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}.${d
    .getMilliseconds()
    .toString()
    .padStart(3, "0")}`;

  const event: SecurityLogEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp,
    type,
    message,
    hex,
    threatId,
  };

  listeners.forEach((listener) => listener(event));
}

export function AdversaryConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<SecurityLogEvent[]>([
    {
      id: "init-1",
      timestamp: "00:00:00.000",
      type: "INFO",
      message: "Cryptanalysis arena initialized. NIST SP 800-232 telemetry active.",
    },
  ]);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleLog = (event: SecurityLogEvent) => {
      setLogs((prev) => [...prev.slice(-99), event]);
    };

    listeners.add(handleLog);
    return () => {
      listeners.delete(handleLog);
    };
  }, []);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  const handleCopy = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.type}] ${l.message} ${l.hex ? `| Hex: ${l.hex}` : ""}`)
      .join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeStyle = (type: SecurityLogEvent["type"]) => {
    switch (type) {
      case "INJECT":
        return "text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30";
      case "AUTH_FAIL":
        return "text-rose-600 dark:text-rose-500 bg-rose-500/20 border-rose-500/40 font-bold";
      case "BLOCKED":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30 font-bold";
      case "SPONGE":
        return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30";
      case "PROBE":
        return "text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30";
      case "SUCCESS":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
      default:
        return "text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700";
    }
  };

  return (
    <div className="shrink-0 bg-white dark:bg-[#0c0d10] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm transition-all">
      {/* Console Bar / Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200 dark:border-zinc-800/80 text-xs bg-zinc-50/70 dark:bg-black/30">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <div className="flex items-center gap-1.5 font-mono font-bold">
            <Terminal className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] tracking-wider uppercase text-zinc-800 dark:text-zinc-200">Live Adversary Telemetry</span>
          </div>

          <span className="flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-mono text-[10px]">
            <Radio className="w-2.5 h-2.5 animate-pulse text-rose-500" />
            {logs.length}
          </span>

          {isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
          )}
        </button>

        {/* Latest message preview when closed */}
        {!isOpen && logs.length > 0 && (
          <div className="hidden sm:flex items-center gap-2 max-w-[400px] truncate text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-600">[{logs[logs.length - 1].timestamp}]</span>
            <span className="truncate">{logs[logs.length - 1].message}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => setLogs([])}
            className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-rose-500 transition-colors"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expandable Terminal Stream */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 160, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            ref={scrollRef}
            className="overflow-y-auto p-2.5 font-mono text-[11px] space-y-1.5 custom-scrollbar bg-zinc-50/50 dark:bg-black/90"
          >
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-400 dark:text-zinc-600 select-none shrink-0 text-[10px]">
                  {log.timestamp}
                </span>

                <span
                  className={`px-1.5 py-0.2 rounded border text-[9px] font-bold uppercase shrink-0 ${getTypeStyle(
                    log.type
                  )}`}
                >
                  {log.type}
                </span>

                <span className="text-zinc-700 dark:text-zinc-300 flex-1 break-all">
                  {log.message}
                  {log.hex && (
                    <span className="ml-2 px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-amber-600 dark:text-amber-400 text-[10px]">
                      {log.hex}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
