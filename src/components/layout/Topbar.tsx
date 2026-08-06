"use client";

import { Bell, Search, Sun, UserCircle, LogOut } from "lucide-react";
import { useAsconStore } from "@/store/useAsconStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Topbar() {
  const { token, setToken } = useAsconStore();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
    <header className="h-14 border-b border-white/10 bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-2 max-w-md w-full ml-4 md:ml-0">
        {/* Global Search Bar simulating IDE Command Palette */}
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search ASCON docs, commands, hardware..."
            className="w-full bg-white/5 border border-white/10 rounded-md pl-9 pr-4 py-1.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-zinc-400 font-mono">⌘</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] rounded bg-white/10 text-zinc-400 font-mono">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-zinc-400 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border border-black"></span>
        </button>
        <button className="text-zinc-400 hover:text-white transition-colors">
          <Sun className="w-5 h-5" />
        </button>
        <div className="w-px h-6 bg-white/10 mx-1"></div>
        <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
          <UserCircle className="w-6 h-6 text-zinc-400" />
          <span className="hidden md:inline">{userEmail ? userEmail.split('@')[0] : "Guest Scholar"}</span>
        </div>
        {userEmail && (
           <button 
             onClick={handleLogout}
             className="text-red-400 hover:text-red-300 transition-colors ml-2 flex items-center gap-1"
             title="Logout"
           >
             <LogOut className="w-4 h-4" />
           </button>
        )}
      </div>
    </header>
  );
}
