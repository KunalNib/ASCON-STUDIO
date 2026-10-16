"use client";

import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  UserCircle, 
  LogOut, 
  PanelLeft, 
  AlertTriangle, 
  ShieldCheck, 
  Zap, 
  Hash, 
  ChevronDown, 
  Check,
  Layers
} from "lucide-react";
import { useAsconStore } from "@/store/useAsconStore";
import { AsconAlgorithm, ALGORITHM_REGISTRY } from "@/lib/ascon";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./SidebarContext";
import { useTheme } from "next-themes";

export function Topbar() {
  const { token, setToken, selectedAlgorithm, setSelectedAlgorithm } = useAsconStore();
  const router = useRouter();
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAlgoDropdown, setShowAlgoDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { collapsed, toggle } = useSidebar();
  const { theme, setTheme } = useTheme();
  const algoDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.sub);
      } catch (e) {
         // Invalid token
      }
    } else {
      setUserEmail(null);
    }
  }, [token]);

  // Close modal on Escape key press and click outside for dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showLogoutModal) setShowLogoutModal(false);
        if (showAlgoDropdown) setShowAlgoDropdown(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (algoDropdownRef.current && !algoDropdownRef.current.contains(e.target as Node)) {
        setShowAlgoDropdown(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showLogoutModal, showAlgoDropdown]);

  const confirmLogout = () => {
    setToken(null);
    setShowLogoutModal(false);
    router.push("/login");
  };

  const handleSelectAlgorithm = (algo: AsconAlgorithm) => {
    setSelectedAlgorithm(algo);
    setShowAlgoDropdown(false);
    if (algo === "ASCON-Hash" && pathname === "/studio/encryption") {
      router.push("/studio/hash");
    } else if (algo !== "ASCON-Hash" && pathname === "/studio/hash") {
      router.push("/studio/encryption");
    }
  };

  const algoMeta = ALGORITHM_REGISTRY[selectedAlgorithm] || ALGORITHM_REGISTRY["ASCON-128"];

  return (
    <>
      <header className="h-14 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-20 shrink-0 transition-colors">
        <div className="flex items-center gap-3 max-w-xl w-full">
          {/* Sidebar toggle */}
          <button
            onClick={toggle}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-2 rounded-lg bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-all shrink-0 hidden md:flex items-center justify-center"
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <PanelLeft className="w-4 h-4" />
            </motion.div>
          </button>

          {/* Global Algorithm Switcher Pill */}
          <div className="relative" ref={algoDropdownRef}>
            <button
              onClick={() => setShowAlgoDropdown(!showAlgoDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                selectedAlgorithm === "ASCON-128"
                  ? "bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 hover:border-purple-400"
                  : selectedAlgorithm === "ASCON-128a"
                  ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 hover:border-blue-400"
                  : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400"
              }`}
              title="Click to switch active ASCON algorithm"
            >
              {selectedAlgorithm === "ASCON-128" && <ShieldCheck className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
              {selectedAlgorithm === "ASCON-128a" && <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
              {selectedAlgorithm === "ASCON-Hash" && <Hash className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
              
              <span className="font-mono">{selectedAlgorithm}</span>
              <span className="hidden sm:inline opacity-70 font-normal">({algoMeta.badge})</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showAlgoDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 mt-2 w-72 bg-white dark:bg-[#0c0d14] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1"
                >
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-white/5 mb-1">
                    Select Active Algorithm Suite
                  </div>

                  {/* ASCON-128 */}
                  <button
                    onClick={() => handleSelectAlgorithm("ASCON-128")}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between ${
                      selectedAlgorithm === "ASCON-128"
                        ? "bg-purple-50 dark:bg-purple-500/15 text-purple-900 dark:text-purple-200"
                        : "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono">
                        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                        ASCON-128
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400">
                          Primary
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6">
                        Rate: 64b • Rounds: a=12, b=6 • 128-bit AEAD
                      </div>
                    </div>
                    {selectedAlgorithm === "ASCON-128" && <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />}
                  </button>

                  {/* ASCON-128a */}
                  <button
                    onClick={() => handleSelectAlgorithm("ASCON-128a")}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between ${
                      selectedAlgorithm === "ASCON-128a"
                        ? "bg-blue-50 dark:bg-blue-500/15 text-blue-900 dark:text-blue-200"
                        : "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono">
                        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                        ASCON-128a
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                          High-Throughput
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6">
                        Rate: 128b (2x) • Rounds: a=12, b=8 • 128-bit AEAD
                      </div>
                    </div>
                    {selectedAlgorithm === "ASCON-128a" && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />}
                  </button>

                  {/* ASCON-Hash */}
                  <button
                    onClick={() => handleSelectAlgorithm("ASCON-Hash")}
                    className={`w-full text-left p-2.5 rounded-xl transition-all flex items-start justify-between ${
                      selectedAlgorithm === "ASCON-Hash"
                        ? "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200"
                        : "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 text-xs font-bold font-mono">
                        <Hash className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ASCON-Hash
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                          Digest
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-6">
                        Rate: 64b • Rounds: a=12, b=12 • 256-bit Hash
                      </div>
                    </div>
                    {selectedAlgorithm === "ASCON-Hash" && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Global Search Bar */}
          <div className="relative flex-1 hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search ASCON docs, commands, hardware..."
              className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md pl-9 pr-4 py-1.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 font-mono">⌘</kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 font-mono">K</kbd>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 relative">
          <button onClick={() => setShowNotifications(!showNotifications)} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors relative p-1.5">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-black"></span>
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full mt-4 right-16 w-72 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
              >
                <div className="p-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 font-bold text-sm text-black dark:text-white">Notifications</div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <div className="text-black dark:text-white">Active: {selectedAlgorithm}</div>
                      <div className="text-zinc-500 text-xs mt-0.5">{algoMeta.badge} selected across studio.</div>
                    </div>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <div className="text-black dark:text-white">ESP32 Connected</div>
                      <div className="text-zinc-500 text-xs mt-0.5">Hardware simulation active.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors p-1.5"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-0.5"></div>
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <UserCircle className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
            <span className="hidden md:inline">{userEmail ? userEmail.split('@')[0] : "Guest Scholar"}</span>
          </div>
          {userEmail && (
             <button 
               onClick={() => setShowLogoutModal(true)}
               className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors ml-1 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/5 hover:bg-red-500/10 border border-red-500/10"
               title="Logout"
             >
               <LogOut className="w-4 h-4" />
               <span className="text-xs font-semibold hidden lg:inline">Logout</span>
             </button>
          )}
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="fixed inset-0" 
              onClick={() => setShowLogoutModal(false)} 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-white dark:bg-[#0c0d12] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden z-10"
            >
              <div className="flex items-center gap-3 text-red-500 mb-4">
                <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Sign Out</h3>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
                Are you sure you want to log out of ASCON Studio? You will need to sign back in to access the cryptographic modules.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl border border-zinc-200 dark:border-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition-colors shadow-sm"
                >
                  Log Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
