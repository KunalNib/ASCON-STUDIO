"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Lock, 
  Unlock, 
  RefreshCcw, 
  Database, 
  Activity, 
  ShieldAlert, 
  Cpu, 
  Bot, 
  Search, 
  FileText, 
  Settings,
  Box,
  Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { group: "Studio", items: [
    { name: "Dashboard", href: "/studio", icon: LayoutDashboard },
    { name: "Learn", href: "/studio/learn", icon: BookOpen },
    { name: "Quiz Arena", href: "/studio/quiz", icon: Trophy },
  ]},
  { group: "Cryptography", items: [
    { name: "Encryption", href: "/studio/encryption", icon: Lock },
    { name: "Decryption", href: "/studio/decryption", icon: Unlock },
    { name: "Permutation", href: "/studio/permutation", icon: RefreshCcw },
    { name: "320-bit State", href: "/studio/state", icon: Database },
    { name: "3D Topology", href: "/studio/3d-view", icon: Box },
  ]},
  { group: "Analytics", items: [
    { name: "Performance", href: "/studio/performance", icon: Activity },
    { name: "Security", href: "/studio/security", icon: ShieldAlert },
    { name: "ESP32", href: "/studio/hardware", icon: Cpu },
  ]},
  { group: "AI & Docs", items: [
    { name: "AI Tutor", href: "/studio/ai-tutor", icon: Bot },
    { name: "Research", href: "/studio/research", icon: Search },
    { name: "Reports", href: "/studio/reports", icon: FileText },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-white/10 bg-black/50 backdrop-blur-xl hidden md:flex flex-col h-full shrink-0">
      <div className="h-14 flex items-center px-4 border-b border-white/10 font-bold text-lg text-white">
        ASCON <span className="text-blue-500 ml-1">Studio</span>
      </div>

      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {NAV_ITEMS.map((group, i) => (
          <div key={i} className="mb-6 px-3">
            <h4 className="px-2 mb-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              {group.group}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-500/10 text-blue-400" 
                        : "text-zinc-400 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-zinc-500")} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-white/10">
        <Link
          href="/studio/settings"
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <Settings className="w-4 h-4 text-zinc-500" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
