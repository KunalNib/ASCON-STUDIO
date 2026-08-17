"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { GuidedTour } from "@/components/ui/GuidedTour";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import React, { useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { useAsconStore } from "@/store/useAsconStore";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAsconStore(state => state.token);

  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    setIsHydrated(true);
  }, []);

  React.useEffect(() => {
    // Basic Client Route Guard (only post-hydration)
    if (isHydrated && !token) {
      console.log("No token, redirecting from layout");
      router.push("/login");
    }
  }, [token, router, isHydrated]);

  if (!isHydrated || !token) {
    return <div className="min-h-screen bg-zinc-50 dark:bg-black flex items-center justify-center text-zinc-900 dark:text-white font-mono text-sm">Verifying Session...</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 overflow-hidden font-sans transition-colors duration-300">
        <GuidedTour />
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto w-full relative">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
