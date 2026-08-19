"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, LockKeyhole, Mail, KeyRound, Loader2 } from "lucide-react";
import { useAsconStore } from "@/store/useAsconStore";
import { useRouter } from "next/navigation";
import Script from "next/script";

declare global {
  interface Window {
    google?: any;
  }
}

const API_URLS = ["http://localhost:8000"];

async function fetchApi(endpoint: string, options?: RequestInit) {
  let lastError: any = null;
  for (const baseUrl of API_URLS) {
    try {
      const res = await fetch(`${baseUrl}${endpoint}`, options);
      return res;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Failed to connect to backend server");
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oauthKey, setOauthKey] = useState<string>(
    process.env.NEXT_PUBLIC_OAUTH_KEY || ""
  );

  const { setToken } = useAsconStore();
  const router = useRouter();

  // Fetch OAUTH_KEY from backend if not defined in frontend env
  useEffect(() => {
    if (!oauthKey || oauthKey === "your_google_oauth_client_id_here") {
      fetchApi("/auth/config")
        .then((res) => res.json())
        .then((data) => {
          if (data.oauth_key) {
            setOauthKey(data.oauth_key);
          }
        })
        .catch(() => {});
    }
  }, [oauthKey]);

  const handleGoogleCredentialResponse = useCallback(
    async (response: any) => {
      if (!response.credential) return;
      setIsGoogleLoading(true);
      setError(null);

      try {
        const res = await fetchApi("/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: response.credential }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || "Google authentication failed");
        }

        setToken(data.access_token);
        router.push("/studio");
      } catch (err: any) {
        setError(err.message || "NetworkError when attempting to fetch resource");
      } finally {
        setIsGoogleLoading(false);
      }
    },
    [router, setToken]
  );


  const initGoogleAuth = useCallback(() => {
    if (
      typeof window !== "undefined" &&
      window.google &&
      oauthKey &&
      oauthKey !== "your_google_oauth_client_id_here"
    ) {
      try {
        window.google.accounts.id.initialize({
          client_id: oauthKey,
          callback: handleGoogleCredentialResponse,
        });

        const container = document.getElementById("google-signin-btn");
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: "100%",
            text: "continue_with",
            shape: "pill",
          });
        }
      } catch (e) {
        console.error("Google Auth initialization error:", e);
      }
    }
  }, [oauthKey, handleGoogleCredentialResponse]);

  useEffect(() => {
    initGoogleAuth();
  }, [initGoogleAuth]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isRegistering ? "/register" : "/login";

    try {
      const res = await fetchApi(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });


      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Authentication Failed");
      }

      if (isRegistering) {
        setIsRegistering(false);
      } else {
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
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initGoogleAuth}
      />
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
          <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
            Access the interactive ASCON cryptography platform.
          </p>

          {/* Google OAuth Section */}
          <div className="mb-6 space-y-3">
            <div id="google-signin-btn" className="w-full min-h-[44px] flex justify-center" />

            {(!oauthKey || oauthKey === "your_google_oauth_client_id_here") && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 text-xs text-center">
                <span className="font-semibold">OAuth Notice:</span> Set <code className="bg-black/10 dark:bg-white/10 px-1 py-0.5 rounded font-mono">OAUTH_KEY</code> in <code className="font-mono">.env</code> to enable active Google OAuth login.
              </div>
            )}

            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-zinc-200 dark:border-white/10 w-full" />
              <span className="bg-white dark:bg-[#09090b] px-3 text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wider font-mono absolute">
                or
              </span>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="scholar@university.edu"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 ml-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {(error || isGoogleLoading) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-xs p-2.5 rounded-lg border text-center ${
                    isGoogleLoading
                      ? "bg-blue-500/10 border-blue-500/20 text-blue-400 flex items-center justify-center gap-2"
                      : "bg-red-500/10 border-red-500/20 text-red-400"
                  }`}
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Authenticating with Google...
                    </>
                  ) : (
                    error
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading || isGoogleLoading}
              className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white hover:bg-black dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl py-2.5 font-bold transition-colors disabled:opacity-50 mt-4 group"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {isRegistering ? "Register Account" : "Access Studio"}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError(null);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white transition-colors"
            >
              {isRegistering
                ? "Already have an account? Sign In"
                : "Need access? Create an account"}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

