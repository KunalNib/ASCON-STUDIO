"use client";

import { useState } from "react";
import {
  Gamepad2,
  BrainCircuit,
  CheckCircle,
  XCircle,
  ArrowRight,
  Loader2,
  Trophy,
  RotateCcw,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAsconStore } from "@/store/useAsconStore";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface QuizQuestion {
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

type QuizPhase = "idle" | "loading" | "active" | "results";

export default function QuizGamification() {
  const { xp, addXp } = useAsconStore();
  const { width, height } = useWindowSize();

  const [phase, setPhase] = useState<QuizPhase>("idle");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const level = Math.floor(xp / 500) + 1;
  const progressToNextLevel = ((xp % 500) / 500) * 100;
  const XP_PER_QUESTION = 150;

  const fetchQuizSet = async () => {
    setPhase("loading");
    setCurrentIndex(0);
    setScore(0);
    setSelectedValue(null);
    setShowResult(false);
    setShowConfetti(false);

    // Mistral can take 1-3 minutes on first run; give it plenty of time
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3 * 60 * 1000); // 3 min

    try {
      const res = await fetch("http://127.0.0.1:8000/quiz/generate", {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setQuestions(data.questions ?? []);
      setPhase("active");
    } catch (e) {
      clearTimeout(timeoutId);
      console.error("Quiz generation failed:", e);
      setPhase("idle");
    }
  };

  const handleSelect = async (idx: number) => {
    if (showResult) return;
    setSelectedValue(idx);
    setShowResult(true);

    const correct = idx === questions[currentIndex].correct_index;
    setIsCorrect(correct);

    if (correct) {
      const newScore = score + 1;
      setScore(newScore);
      addXp(XP_PER_QUESTION);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);

      await fetch("http://127.0.0.1:8000/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ earned_xp: XP_PER_QUESTION }),
      });
    }
  };

  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questions.length) {
      setPhase("results");
    } else {
      setCurrentIndex(nextIdx);
      setSelectedValue(null);
      setShowResult(false);
      setIsCorrect(false);
    }
  };

  const currentQ = questions[currentIndex];
  const totalQ = questions.length;
  const progressPct = totalQ > 0 ? ((currentIndex + (showResult ? 1 : 0)) / totalQ) * 100 : 0;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={220}
          colors={["#3b82f6", "#a855f7", "#10b981", "#f59e0b"]}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-yellow-500" /> Cryptography Arena
          </h1>
          <p className="text-zinc-400">
            Put your ASCON knowledge to the test against the Llama 3 LLM.
          </p>
        </div>

        {/* XP Card */}
        <div className="bg-[#09090b] border border-white/10 rounded-2xl p-4 flex items-center gap-6 min-w-[250px] shadow-lg">
          <div>
            <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">
              Rank
            </div>
            <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
              Scholar Lv.{level}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-zinc-400">XP Progress</span>
              <span className="text-yellow-500 font-mono">{xp} XP</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNextLevel}%` }}
                transition={{ type: "spring" }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {/* ── IDLE ── */}
          {phase === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <BrainCircuit className="w-24 h-24 text-zinc-700 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">
                Ready to test your limits?
              </h2>
              <p className="text-zinc-500 mb-8 text-sm">
                10 unique ASCON questions · +{XP_PER_QUESTION} XP per correct answer
              </p>
              <button
                onClick={fetchQuizSet}
                className="bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                Generate AI Challenge
              </button>
            </motion.div>
          )}

          {/* ── LOADING ── */}
          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center flex flex-col items-center"
            >
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <p className="text-zinc-400 font-mono animate-pulse">
                Llama 3 is constructing 10 cryptographic challenges…
              </p>
            </motion.div>
          )}

          {/* ── ACTIVE QUIZ ── */}
          {phase === "active" && currentQ && (
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="w-full max-w-3xl"
            >
              {/* Progress bar + counter */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">
                    Question {currentIndex + 1} of {totalQ}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Score:{" "}
                    <span className="text-green-400 font-bold">{score}</span> /{" "}
                    {currentIndex + (showResult ? 1 : 0)}
                  </span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    animate={{ width: `${progressPct}%` }}
                    transition={{ type: "spring" }}
                  />
                </div>
              </div>

              {/* Question card */}
              <div className="bg-[#0d0d0d] border border-white/10 p-8 rounded-3xl shadow-2xl">
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 rounded bg-blue-500/10 text-blue-400 font-mono text-xs mb-4 border border-blue-500/20">
                    Challenge Active · Q{currentIndex + 1}
                  </span>
                  <h2 className="text-xl font-semibold text-white leading-relaxed">
                    {currentQ.question}
                  </h2>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQ.options.map((opt, idx) => {
                    const isSelected = selectedValue === idx;
                    const isWinner =
                      showResult && idx === currentQ.correct_index;
                    const isLoser =
                      showResult && isSelected && !isCorrect;

                    let styles =
                      "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-300 cursor-pointer";
                    if (isWinner)
                      styles =
                        "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]";
                    else if (isLoser)
                      styles =
                        "bg-red-500/20 border-red-500 text-red-300";
                    else if (showResult)
                      styles = "bg-white/5 border-white/10 text-zinc-500 cursor-default opacity-60";

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelect(idx)}
                        disabled={showResult}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center gap-3 ${styles}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="shrink-0 w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-bold">
                            {["A", "B", "C", "D"][idx]}
                          </span>
                          <span className="text-sm leading-snug">{opt}</span>
                        </div>
                        {showResult && isWinner && (
                          <CheckCircle className="w-5 h-5 shrink-0 text-green-400" />
                        )}
                        {showResult && isLoser && (
                          <XCircle className="w-5 h-5 shrink-0 text-red-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation + Next */}
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      className="overflow-hidden"
                    >
                      <div
                        className={`p-4 rounded-xl border ${
                          isCorrect
                            ? "bg-green-500/10 border-green-500/20 text-green-400"
                            : "bg-zinc-900 border-zinc-800 text-zinc-400"
                        }`}
                      >
                        <h4 className="font-bold mb-1 text-sm">
                          {isCorrect ? `✓ Correct! +${XP_PER_QUESTION} XP` : "✗ Incorrect"}
                        </h4>
                        <p className="text-sm leading-relaxed">
                          {currentQ.explanation}
                        </p>
                      </div>
                      <button
                        onClick={handleNext}
                        className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-xl font-bold transition-all"
                      >
                        {currentIndex + 1 < totalQ ? (
                          <>
                            Next Question <ArrowRight className="w-5 h-5" />
                          </>
                        ) : (
                          <>
                            See Results <Trophy className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── RESULTS ── */}
          {phase === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-2xl text-center"
            >
              <Confetti
                width={width}
                height={height}
                recycle={false}
                numberOfPieces={score >= totalQ * 0.8 ? 400 : 120}
                colors={["#f59e0b", "#a855f7", "#3b82f6", "#10b981"]}
              />

              {/* Trophy */}
              <div className="mb-8 relative">
                <div className="w-28 h-28 mx-auto bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full flex items-center justify-center border border-yellow-500/30 mb-6">
                  <Trophy className="w-14 h-14 text-yellow-400" />
                </div>
                <h2 className="text-4xl font-black text-white mb-2">
                  Quiz Complete!
                </h2>
                <p className="text-zinc-400">Here&apos;s how you did:</p>
              </div>

              {/* Score card */}
              <div className="bg-[#0d0d0d] border border-white/10 rounded-3xl p-8 mb-8 shadow-2xl">
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-white">
                      {score}/{totalQ}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">
                      Correct
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-yellow-400">
                      +{score * XP_PER_QUESTION}
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">
                      XP Earned
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-3xl font-black text-purple-400">
                      {Math.round((score / totalQ) * 100)}%
                    </div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider">
                      Accuracy
                    </div>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-6 h-6 ${
                        i < Math.round((score / totalQ) * 5)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-zinc-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-zinc-400 text-sm">
                  {score === totalQ
                    ? "🏆 Perfect Score! You're an ASCON master!"
                    : score >= totalQ * 0.8
                    ? "🎉 Excellent work! You have strong ASCON knowledge."
                    : score >= totalQ * 0.5
                    ? "👍 Good effort! Keep studying to master ASCON."
                    : "📚 Keep learning! ASCON is complex — you'll get there."}
                </p>
              </div>

              <button
                onClick={fetchQuizSet}
                className="flex items-center justify-center gap-2 mx-auto bg-white hover:bg-zinc-200 text-black px-8 py-3 rounded-full font-bold transition-transform hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                <RotateCcw className="w-5 h-5" /> Play Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
