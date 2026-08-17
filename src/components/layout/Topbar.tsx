"use client";

import { Bell, Search, Sun, Moon, UserCircle, LogOut, PanelLeft } from "lucide-react";
import { useAsconStore } from "@/store/useAsconStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "./SidebarContext";
import { useTheme } from "next-themes";

export function Topbar() {
  const { token, setToken } = useAsconStore();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const { collapsed, toggle } = useSidebar();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserEmail(payload.sub);
      } catch (e) {
         // Invalid token
      }
    }
  }, [token]);

  const handleLogout = () => {
    setToken(null);
    router.push("/login");
  };

  return (
    <header className="h-14 border-b border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-10 shrink-0 transition-colors">
      <div className="flex items-center gap-3 max-w-md w-full">
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

        {/* Global Search Bar */}
        <div className="relative flex-1">
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

      <div className="flex items-center gap-4 relative">
        <button onClick={() => setShowNotifications(!showNotifications)} className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-white dark:border-black"></span>
        </button>
        
        <AnimatePresence>
          {showNotifications && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-4 right-20 w-72 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
            >
              <div className="p-3 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/5 font-bold text-sm text-black dark:text-white">Notifications</div>
              <div className="p-4 flex flex-col gap-3">
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <div className="text-black dark:text-white">ASCON Engine Ready</div>
                    <div className="text-zinc-500 text-xs mt-0.5">320-bit state initialized.</div>
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
          className="text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="w-px h-6 bg-zinc-200 dark:bg-white/10 mx-1"></div>
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          <UserCircle className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
          <span className="hidden md:inline">{userEmail ? userEmail.split('@')[0] : "Guest Scholar"}</span>
        </div>
        {userEmail && (
           <button 
             onClick={handleLogout}
             className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors ml-2 flex items-center gap-1"
             title="Logout"
           >
             <LogOut className="w-4 h-4" />
           </button>
        )}
      </div>
    </header>
  );
}
