"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Maximize2, Minimize2, ChevronLeft, ChevronRight, CheckCircle2, 
  Lightbulb, Activity, BookOpen, Layers, CheckCircle, HelpCircle, 
  Sparkles, Shield, Cpu, Play
} from "lucide-react";
import type { LearningLesson } from "./LearningCurriculumData";

// Interactive Diagrams
import { SpongeConstructionDiagram } from "./diagrams/SpongeConstructionDiagram";
import { StateMatrixDiagram } from "./diagrams/StateMatrixDiagram";
import { PermutationRoundDiagram } from "./diagrams/PermutationRoundDiagram";
import { DecryptionGateDiagram } from "./diagrams/DecryptionGateDiagram";
import { IotHardwareComparisonDiagram } from "./diagrams/IotHardwareComparisonDiagram";
import { AeadPipelineDiagram } from "./diagrams/AeadPipelineDiagram";
import { AvalancheDiffusionDiagram } from "./diagrams/AvalancheDiffusionDiagram";
import { SymmetricKeyDiagram } from "./diagrams/SymmetricKeyDiagram";

// Interactive Sandboxes
import { BitFlipSandbox } from "./sandboxes/BitFlipSandbox";
import { AeadEnvelopeSandbox } from "./sandboxes/AeadEnvelopeSandbox";

interface LearningWindowProps {
  lesson: LearningLesson;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  onComplete?: () => void;
  isCompleted?: boolean;
}

type TabType = "diagram" | "analogy" | "anatomy" | "sandbox" | "quiz";

export function LearningWindow({
  lesson,
  onClose,
  onPrev,
  onNext,
  hasPrev = false,
  hasNext = false,
  onComplete,
  isCompleted = false,
}: LearningWindowProps) {
  const [activeTab, setActiveTab] = useState<TabType>("diagram");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Reset quiz state when lesson changes
  React.useEffect(() => {
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
    setActiveTab("diagram");
  }, [lesson.id]);

  const Icon = lesson.icon;

  const levelColors = {
    Beginner: "bg-emerald-100 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300",
    Intermediate: "bg-blue-100 dark:bg-blue-950/60 border-blue-300 dark:border-blue-500/40 text-blue-800 dark:text-blue-300",
    Advanced: "bg-purple-100 dark:bg-purple-950/60 border-purple-300 dark:border-purple-500/40 text-purple-800 dark:text-purple-300",
    Expert: "bg-rose-100 dark:bg-rose-950/60 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300",
  };

  const renderDiagram = () => {
    switch (lesson.diagramType) {
      case "sponge":
        return <SpongeConstructionDiagram />;
      case "state-matrix":
        return <StateMatrixDiagram />;
      case "permutation":
        return <PermutationRoundDiagram />;
      case "decryption-gate":
        return <DecryptionGateDiagram />;
      case "iot-hardware":
        return <IotHardwareComparisonDiagram />;
      case "aead-pipeline":
        return <AeadPipelineDiagram />;
      case "avalanche":
        return <AvalancheDiffusionDiagram />;
      case "symmetric-key":
        return <SymmetricKeyDiagram />;
      default:
        return <SpongeConstructionDiagram />;
    }
  };

  const renderSandbox = () => {
    if (lesson.sandboxType === "bit-flip") {
      return <BitFlipSandbox />;
    }
    if (lesson.sandboxType === "aead-envelope") {
      return <AeadEnvelopeSandbox />;
    }
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-2">
        <Sparkles className="w-8 h-8 text-purple-500 opacity-60" />
        <p className="text-sm font-semibold">Interactive Sandbox for this lesson is integrated into the diagram view.</p>
        <button
          onClick={() => setActiveTab("diagram")}
          className="text-xs text-purple-600 dark:text-purple-400 font-bold underline"
        >
          View Interactive Diagram Tab →
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <motion.div
        layout
        className={`w-full bg-white dark:bg-[#090a0f] border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen ? "h-full max-h-[98vh] max-w-[98vw]" : "h-[90vh] max-h-[880px] max-w-5xl"
        }`}
      >
        {/* Top Window Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
              <Icon className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${levelColors[lesson.level]}`}>
                  {lesson.level}
                </span>
                <span className="text-xs text-zinc-500 font-medium">
                  {lesson.estimatedMinutes} min explore
                </span>
                {isCompleted && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                  </span>
                )}
              </div>

              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                {lesson.title}
                <span className="hidden sm:inline-block text-xs font-normal text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 px-2 py-0.5 rounded-full">
                  Simple Concept: {lesson.simpleTerm}
                </span>
              </h2>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Window"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              title="Close Learning Window"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation Rail */}
        <div className="flex items-center px-4 pt-2 border-b border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-950/50 gap-1 overflow-x-auto custom-scrollbar">
          {[
            { id: "diagram", label: "Interactive Diagram", icon: Activity },
            { id: "analogy", label: "Everyday Analogy", icon: Lightbulb },
            { id: "anatomy", label: "Technical Anatomy", icon: BookOpen },
            { id: "sandbox", label: "Live Sandbox", icon: Sparkles },
            { id: "quiz", label: "Knowledge Check", icon: HelpCircle },
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                  isActive
                    ? "border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 bg-purple-50/50 dark:bg-purple-950/20 rounded-t-xl"
                    : "border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Main Tab Content Container (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-6">
          <AnimatePresence mode="wait">
            {/* Tab 1: Interactive Diagram */}
            {activeTab === "diagram" && (
              <motion.div
                key="tab-diagram"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-widest block">
                      Visual Blueprint &amp; Data Motion
                    </span>
                    <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-0.5">
                      {lesson.summary}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-white dark:bg-black/60 px-3 py-1 rounded-xl border border-purple-200 dark:border-purple-500/30 self-start sm:self-auto shrink-0">
                    Concept: {lesson.simpleTerm}
                  </span>
                </div>

                {renderDiagram()}
              </motion.div>
            )}

            {/* Tab 2: Plain-English Analogy */}
            {activeTab === "analogy" && (
              <motion.div
                key="tab-analogy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-3xl mx-auto py-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Lightbulb className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                      Real-World Intuition
                    </span>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {lesson.analogy.title}
                    </h3>
                  </div>
                </div>

                <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-6 text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm sm:text-base space-y-4 shadow-sm">
                  <p className="font-serif italic text-lg text-amber-900 dark:text-amber-200/90 border-l-4 border-amber-500 pl-4 py-1">
                    "{lesson.analogy.story}"
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 flex items-start gap-3 shadow-sm">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                      The Key Takeaway
                    </h4>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      {lesson.analogy.takeaway}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab 3: Deep Technical Anatomy */}
            {activeTab === "anatomy" && (
              <motion.div
                key="tab-anatomy"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-3xl mx-auto py-2"
              >
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-white/10 pb-4">
                  <div>
                    <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                      Cryptographic Specification
                    </span>
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                      {lesson.technicalAnatomy.heading}
                    </h3>
                  </div>
                  {lesson.technicalAnatomy.formula && (
                    <div className="font-mono text-xs text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 px-3 py-1.5 rounded-xl font-bold">
                      {lesson.technicalAnatomy.formula}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-zinc-500 tracking-wider">
                    Core Architectural Specifications
                  </h4>
                  <div className="grid grid-cols-1 gap-2.5">
                    {lesson.technicalAnatomy.keyPoints.map((pt, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50/70 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 rounded-2xl p-4 text-xs text-purple-900 dark:text-purple-200">
                  <strong className="font-bold">NIST Standard Detail: </strong>
                  {lesson.technicalAnatomy.specDetail}
                </div>
              </motion.div>
            )}

            {/* Tab 4: Interactive Sandbox */}
            {activeTab === "sandbox" && (
              <motion.div
                key="tab-sandbox"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 max-w-3xl mx-auto py-2"
              >
                {renderSandbox()}
              </motion.div>
            )}

            {/* Tab 5: Knowledge Check Quiz */}
            {activeTab === "quiz" && (
              <motion.div
                key="tab-quiz"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 max-w-2xl mx-auto py-4"
              >
                <div className="text-center space-y-1">
                  <span className="text-xs uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                    Interactive Mastery Check
                  </span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                    {lesson.quiz.question}
                  </h3>
                </div>

                {/* Quiz options */}
                <div className="space-y-2.5">
                  {lesson.quiz.options.map((opt, idx) => {
                    const isSelected = selectedQuizAnswer === idx;
                    const isCorrect = idx === lesson.quiz.correctIndex;

                    let btnClass = "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-purple-300 dark:hover:border-purple-700 text-zinc-800 dark:text-zinc-200";

                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                      } else if (isSelected) {
                        btnClass = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 font-bold shadow-sm";
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (!quizSubmitted) setSelectedQuizAnswer(idx);
                        }}
                        className={`w-full text-left p-4 rounded-2xl border transition-all text-xs sm:text-sm flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>

                {/* Submit / Results */}
                {!quizSubmitted ? (
                  <button
                    onClick={() => {
                      if (selectedQuizAnswer !== null) {
                        setQuizSubmitted(true);
                        if (selectedQuizAnswer === lesson.quiz.correctIndex && onComplete) {
                          onComplete();
                        }
                      }
                    }}
                    disabled={selectedQuizAnswer === null}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-2xl text-xs sm:text-sm transition-all shadow-md"
                  >
                    Check Answer
                  </button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                      selectedQuizAnswer === lesson.quiz.correctIndex
                        ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                        : "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-200"
                    }`}
                  >
                    <div className="font-bold mb-1 flex items-center gap-1.5">
                      {selectedQuizAnswer === lesson.quiz.correctIndex ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Mastery Verified! Excellent understanding.
                        </>
                      ) : (
                        "Not quite correct."
                      )}
                    </div>
                    <p className="opacity-90">{lesson.quiz.explanation}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Window Navigation Bar */}
        <div className="px-5 py-3 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/80 dark:bg-black/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              if (onComplete) onComplete();
              if (hasNext && onNext) onNext();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isCompleted
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-purple-600 hover:bg-purple-500 text-white shadow-md hover:scale-105 active:scale-95"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isCompleted ? "Completed Lesson" : "Mark as Completed"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
