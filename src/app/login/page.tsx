"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, KeyRound, Loader2 } from "lucide-react";
import { useAsconStore } from "@/store/useAsconStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setToken } = useAsconStore();
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isRegistering ? "/register" : "/login";
    
    try {
      const res = await fetch(`http://127.0.0.1:8000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || "Authentication Failed");
      }

      if (isRegistering) {
        // Toggle to login after successful register
        setIsRegistering(false);
      } else {
        // Successful login
        setToken(data.access_token);
        router.push("/studio");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[128px] mix-blend-multiply dark:mix-blend-screen" />
      </div>

      <motion.div 
         initial={{ opacity: 0, y: 20 }}
         animate={{ opacity: 1, y: 0 }}
         className="w-full max-w-md bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-2xl border border-zinc-200 dark:border-white/10 p-8 rounded-3xl shadow-xl dark:shadow-2xl relative z-10"
      >
         <div className="w-12 h-12 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl flex items-center justify-center mb-6">
            <LockKeyhole className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
         </div>
         
         <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
           {isRegistering ? "Create your account" : "Sign in to Studio"}
         </h1>
         <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8">
           Access the interactive ASCON cryptography platform.
         </p>

         <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">Email Address</label>
              <div className="relative">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                 <input 
                   type="email" 
                   required
                   value={email}
                   onChange={e => setEmail(e.target.value)}
                   className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                   placeholder="scholar@university.edu"
                 />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">Password</label>
              <div className="relative">
                 <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                 <input 
                   type="password" 
                   required
                   value={password}
                   onChange={e => setPassword(e.target.value)}
                   className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                   placeholder="••••••••"
                 />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-red-400 text-xs bg-red-500/10 p-2 rounded-lg border border-red-500/20 text-center">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl py-2.5 font-bold transition-colors disabled:opacity-50 mt-4 group"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  {isRegistering ? "Register Account" : "Access Studio"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
         </form>
         
         <div className="mt-6 text-center">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setError(null); }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              {isRegistering ? "Already have an account? Sign In" : "Need access? Create an account"}
            </button>
         </div>
      </motion.div>
    </div>
  );
}
