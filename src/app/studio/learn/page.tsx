"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, CheckCircle2, ChevronRight, ChevronLeft, Search, 
  PanelLeftClose, PanelLeft, Activity, Lightbulb, BookOpen, 
  Sparkles, HelpCircle, CheckCircle, Trophy, Zap, Shield, Cpu, 
  ExternalLink, KeyRound
} from "lucide-react";
import { LEARNING_CURRICULUM, LearningLesson } from "@/components/studio/learn/LearningCurriculumData";

// Interactive Diagrams
import { SpongeConstructionDiagram } from "@/components/studio/learn/diagrams/SpongeConstructionDiagram";
import { StateMatrixDiagram } from "@/components/studio/learn/diagrams/StateMatrixDiagram";
import { PermutationRoundDiagram } from "@/components/studio/learn/diagrams/PermutationRoundDiagram";
import { DecryptionGateDiagram } from "@/components/studio/learn/diagrams/DecryptionGateDiagram";
import { IotHardwareComparisonDiagram } from "@/components/studio/learn/diagrams/IotHardwareComparisonDiagram";
import { AeadPipelineDiagram } from "@/components/studio/learn/diagrams/AeadPipelineDiagram";
import { AvalancheDiffusionDiagram } from "@/components/studio/learn/diagrams/AvalancheDiffusionDiagram";
import { SymmetricKeyDiagram } from "@/components/studio/learn/diagrams/SymmetricKeyDiagram";

// Interactive Sandboxes
import { BitFlipSandbox } from "@/components/studio/learn/sandboxes/BitFlipSandbox";
import { AeadEnvelopeSandbox } from "@/components/studio/learn/sandboxes/AeadEnvelopeSandbox";

type WorkbenchTab = "diagram" | "intuition" | "spec" | "sandbox" | "quiz";

export default function LearnModule() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<WorkbenchTab>("diagram");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Flattened lessons list
  const allLessons = useMemo(() => {
    return LEARNING_CURRICULUM.flatMap((cat) => cat.lessons);
  }, []);

  const [activeLessonId, setActiveLessonId] = useState<string>(allLessons[0].id);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    "iot-problem",
    "sponge-construction"
  ]);

  const activeLesson = useMemo(() => {
    return allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  }, [allLessons, activeLessonId]);

  const activeIndex = useMemo(() => {
    return allLessons.findIndex((l) => l.id === activeLessonId);
  }, [allLessons, activeLessonId]);

  // Reset quiz state when active lesson changes
  useEffect(() => {
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  }, [activeLessonId]);

  const toggleComplete = (id: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveLessonId(allLessons[activeIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (activeIndex < allLessons.length - 1) {
      setActiveLessonId(allLessons[activeIndex + 1].id);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in search
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft" && activeIndex > 0) {
        handlePrev();
      } else if (e.key === "ArrowRight" && activeIndex < allLessons.length - 1) {
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, allLessons]);

  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  const levelBadges = {
    Beginner: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    Intermediate: "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-500/30 text-blue-700 dark:text-blue-300",
    Advanced: "bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-500/30 text-purple-700 dark:text-purple-300",
    Expert: "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-500/30 text-rose-700 dark:text-rose-300",
  };

  const renderActiveDiagram = () => {
    switch (activeLesson.diagramType) {
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

  const renderActiveSandbox = () => {
    if (activeLesson.sandboxType === "bit-flip") {
      return <BitFlipSandbox />;
    }
    if (activeLesson.sandboxType === "aead-envelope") {
      return <AeadEnvelopeSandbox />;
    }
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 space-y-3 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-800 rounded-2xl">
        <Sparkles className="w-8 h-8 text-zinc-400" />
        <div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Dedicated Sandbox Integrated
          </p>
          <p className="text-xs text-zinc-500 max-w-sm mt-1">
            This module's interactive simulator is integrated directly into the visual diagram tab with real-time controls.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("diagram")}
          className="px-3.5 py-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300"
        >
          View Diagram &amp; Controls →
        </button>
      </div>
    );
  };

  return (
    <div className="px-3 pt-3 pb-2 w-full mx-auto flex flex-col h-[calc(100vh-3.5rem)] gap-2">
      {/* ── Top Status & Mission Banner ── */}
      <div className="shrink-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl px-4 py-2 flex items-center justify-between gap-4 shadow-sm transition-colors">
        {/* Title & Level Indicator */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            title={isSidebarOpen ? "Hide Lesson Rail" : "Show Lesson Rail"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-bold tracking-tight text-zinc-900 dark:text-white">
              ASCON Cryptographic Studio
            </span>
            <span className="hidden sm:inline-block text-[10px] font-mono text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
              NIST SP 800-232
            </span>
          </div>
        </div>

        {/* Lesson Progress Meter */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-[11px] font-mono text-zinc-500">
              Curriculum Progress: {completedCount}/{totalLessons} ({progressPct}%)
            </span>
            <div className="w-28 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold">
            <span className="text-zinc-500 text-[11px]">Lesson:</span>
            <span className="font-mono text-zinc-900 dark:text-white">
              {activeIndex + 1} of {totalLessons}
            </span>
          </div>
        </div>
      </div>

      {/* ── Main Dual-Pane Studio Layout ── */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        {/* Left Rail: Lesson Directory */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 310, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-sm"
            >
              {/* Search Header */}
              <div className="p-3 border-b border-zinc-200 dark:border-white/10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search topics or terms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:outline-none focus:border-purple-500 text-zinc-900 dark:text-white placeholder:text-zinc-400 font-medium"
                  />
                </div>
              </div>

              {/* Lesson Tree / List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
                {LEARNING_CURRICULUM.map((cat) => {
                  const filteredLessons = cat.lessons.filter((l) => {
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    return (
                      l.title.toLowerCase().includes(q) ||
                      l.simpleTerm.toLowerCase().includes(q) ||
                      l.summary.toLowerCase().includes(q)
                    );
                  });

                  if (filteredLessons.length === 0) return null;

                  return (
                    <div key={cat.id} className="space-y-1">
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
                        <span>{cat.level}: {cat.title}</span>
                        <span className="font-mono">{filteredLessons.length}</span>
                      </div>

                      <div className="space-y-0.5">
                        {filteredLessons.map((l) => {
                          const isCurrent = l.id === activeLessonId;
                          const isDone = completedLessonIds.includes(l.id);

                          return (
                            <button
                              key={l.id}
                              onClick={() => setActiveLessonId(l.id)}
                              className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition-all flex items-start justify-between gap-2 ${
                                isCurrent
                                  ? "bg-purple-100 dark:bg-purple-900/40 text-purple-950 dark:text-purple-200 font-bold border border-purple-300 dark:border-purple-500/30"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border border-transparent"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-semibold text-[12px]">
                                  {l.title}
                                </div>
                                <div className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate mt-0.5">
                                  {l.simpleTerm}
                                </div>
                              </div>

                              <span className="shrink-0 mt-0.5">
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                ) : (
                                  <span className="w-3.5 h-3.5 rounded-full border border-zinc-300 dark:border-zinc-700 inline-block" />
                                )}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Right Stage: Interactive Learning Workbench */}
        <main className="flex-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-sm">
          {/* Stage Sub-Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-black/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${levelBadges[activeLesson.level]}`}>
                  {activeLesson.level}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {activeLesson.estimatedMinutes} min read
                </span>
                <span className="text-[11px] text-purple-700 dark:text-purple-300 font-semibold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 px-2 py-0.5 rounded-md">
                  Plain-English: {activeLesson.simpleTerm}
                </span>
              </div>

              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {activeLesson.title}
              </h2>
            </div>

            {/* View Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-xl text-xs font-bold shrink-0 self-start md:self-auto overflow-x-auto">
              {[
                { id: "diagram", label: "Diagram", icon: Activity },
                { id: "intuition", label: "Intuition", icon: Lightbulb },
                { id: "spec", label: "Specification", icon: BookOpen },
                { id: "sandbox", label: "Sandbox", icon: Sparkles },
                { id: "quiz", label: "Check", icon: HelpCircle },
              ].map((tab) => {
                const TabIcon = tab.icon;
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                      isSelected
                        ? "bg-white dark:bg-black text-purple-600 dark:text-purple-400 shadow-sm"
                        : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage View Area (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar space-y-6">
            <AnimatePresence mode="wait">
              {/* Tab 1: Interactive Diagram */}
              {activeTab === "diagram" && (
                <motion.div
                  key={`tab-diagram-${activeLesson.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-4"
                >
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed flex items-center justify-between gap-3">
                    <span>{activeLesson.summary}</span>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      Interactive Visual Architecture
                    </span>
                  </div>

                  {renderActiveDiagram()}
                </motion.div>
              )}

              {/* Tab 2: Plain-English Intuition */}
              {activeTab === "intuition" && (
                <motion.div
                  key={`tab-intuition-${activeLesson.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-5 max-w-3xl mx-auto py-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                        Conceptual Mental Model
                      </span>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                        {activeLesson.analogy.title}
                      </h3>
                    </div>
                  </div>

                  <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 rounded-2xl p-5 text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm space-y-3">
                    <p className="border-l-2 border-amber-500 pl-4 py-0.5 italic text-zinc-800 dark:text-zinc-200">
                      "{activeLesson.analogy.story}"
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-zinc-900 dark:text-white mb-1">
                        Key Takeaway
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                        {activeLesson.analogy.takeaway}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Cryptographic Specification */}
              {activeTab === "spec" && (
                <motion.div
                  key={`tab-spec-${activeLesson.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-5 max-w-3xl mx-auto py-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                        Formal Specification
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {activeLesson.technicalAnatomy.heading}
                      </h3>
                    </div>

                    {activeLesson.technicalAnatomy.formula && (
                      <div className="font-mono text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-500/30 px-3 py-1 rounded-lg font-bold self-start sm:self-auto">
                        {activeLesson.technicalAnatomy.formula}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-[11px] uppercase font-bold text-zinc-500 tracking-wider">
                      Technical Criteria
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {activeLesson.technicalAnatomy.keyPoints.map((pt, i) => (
                        <div
                          key={i}
                          className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed flex items-start gap-2.5"
                        >
                          <span className="w-4 h-4 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    <strong className="font-bold">NIST Cryptographic Standard: </strong>
                    {activeLesson.technicalAnatomy.specDetail}
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Interactive Sandbox */}
              {activeTab === "sandbox" && (
                <motion.div
                  key={`tab-sandbox-${activeLesson.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-4 max-w-3xl mx-auto py-2"
                >
                  {renderActiveSandbox()}
                </motion.div>
              )}

              {/* Tab 5: Knowledge Check Quiz */}
              {activeTab === "quiz" && (
                <motion.div
                  key={`tab-quiz-${activeLesson.id}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="space-y-5 max-w-xl mx-auto py-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-purple-600 dark:text-purple-400 tracking-wider">
                      Knowledge Verification
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white leading-snug">
                      {activeLesson.quiz.question}
                    </h3>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {activeLesson.quiz.options.map((opt, idx) => {
                      const isSelected = selectedQuizAnswer === idx;
                      const isCorrect = idx === activeLesson.quiz.correctIndex;

                      let btnStyle = "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200";

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-purple-50 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-200 font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!quizSubmitted) setSelectedQuizAnswer(idx);
                          }}
                          className={`w-full text-left p-3.5 rounded-xl border transition-all text-xs flex items-center justify-between ${btnStyle}`}
                        >
                          <span>{opt}</span>
                          {quizSubmitted && isCorrect && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Submit / Verification Result */}
                  {!quizSubmitted ? (
                    <button
                      onClick={() => {
                        if (selectedQuizAnswer !== null) {
                          setQuizSubmitted(true);
                          if (selectedQuizAnswer === activeLesson.quiz.correctIndex) {
                            toggleComplete(activeLesson.id);
                          }
                        }
                      }}
                      disabled={selectedQuizAnswer === null}
                      className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-sm"
                    >
                      Verify Answer
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                        selectedQuizAnswer === activeLesson.quiz.correctIndex
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                          : "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-200"
                      }`}
                    >
                      <div className="font-bold mb-1">
                        {selectedQuizAnswer === activeLesson.quiz.correctIndex
                          ? "✓ Correct understanding verified."
                          : "Incorrect answer."}
                      </div>
                      <p className="opacity-90">{activeLesson.quiz.explanation}</p>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Stage Bottom Action Bar */}
          <div className="p-3 border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrev}
                disabled={activeIndex === 0}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={activeIndex === allLessons.length - 1}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-bold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => toggleComplete(activeLesson.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                completedLessonIds.includes(activeLesson.id)
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-zinc-800 dark:bg-zinc-800 hover:bg-purple-600 text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {completedLessonIds.includes(activeLesson.id) ? "Completed" : "Mark as Done"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
