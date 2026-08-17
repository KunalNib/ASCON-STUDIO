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
import { motion } from "framer-motion";
import { useSidebar } from "./SidebarContext";

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
  const { collapsed } = useSidebar();

  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 256 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="border-r border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-xl hidden md:flex flex-col h-full shrink-0 overflow-hidden transition-colors"
    >
      {/* Logo / brand — shows full name or icon-only */}
      <div className="h-14 flex items-center justify-center border-b border-zinc-200 dark:border-white/10 font-bold text-lg text-black dark:text-white overflow-hidden shrink-0">
        <motion.span
          animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
          transition={{ duration: 0.2 }}
          className="whitespace-nowrap overflow-hidden"
        >
          ASCON <span className="text-blue-500">Studio</span>
        </motion.span>
        {collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-blue-500 font-black text-xl"
          >
            A
          </motion.span>
        )}
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        {NAV_ITEMS.map((group, i) => (
          <div key={i} className="mb-4">
            {/* Group label — only when expanded */}
            <motion.h4
              animate={{ opacity: collapsed ? 0 : 1, height: collapsed ? 0 : "auto" }}
              transition={{ duration: 0.2 }}
              className="px-5 mb-1 text-xs font-semibold text-zinc-500 uppercase tracking-wider overflow-hidden"
            >
              {group.group}
            </motion.h4>
            <div className="space-y-0.5 px-2">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={cn(
                      "flex items-center rounded-lg px-2 py-2 text-sm font-medium transition-colors",
                      collapsed ? "justify-center gap-0" : "gap-3",
                      isActive
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-600 dark:text-blue-400" : "text-zinc-500")} />
                    <motion.span
                      animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Settings at bottom */}
      <div className="p-2 border-t border-zinc-200 dark:border-white/10 shrink-0">
        <Link
          href="/studio/settings"
          title={collapsed ? "Settings" : undefined}
          className={cn(
            "flex items-center rounded-lg px-2 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white transition-colors",
            collapsed ? "justify-center" : "gap-3"
          )}
        >
          <Settings className="w-4 h-4 text-zinc-500 shrink-0" />
          <motion.span
            animate={{ opacity: collapsed ? 0 : 1, width: collapsed ? 0 : "auto" }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden whitespace-nowrap"
          >
            Settings
          </motion.span>
        </Link>
      </div>
    </motion.aside>
  );
}
