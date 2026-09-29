"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GraduationCap, CheckCircle2, ChevronRight, ChevronLeft, Search, 
  PanelLeftClose, PanelLeft, Activity, Lightbulb, BookOpen, 
  Sparkles, HelpCircle, CheckCircle, Zap, Shield, Cpu, 
  Calendar, Clock, ArrowLeft, Layers, Check, Play, Filter,
  Terminal, ShieldCheck, Database, Award, ArrowUpRight
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
type TierFilter = "all" | "beginner" | "intermediate" | "advanced" | "expert";

export default function LearnModule() {
  const [viewMode, setViewMode] = useState<"overview" | "workbench">("overview");
  const [activeTier, setActiveTier] = useState<TierFilter>("all");
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

  // Completed lesson tracking with localStorage persistence
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    "iot-problem",
    "sponge-construction"
  ]);

  // Completion dates tracking per lesson
  const [completedDates, setCompletedDates] = useState<Record<string, string>>({
    "iot-problem": "Sep 28, 2026",
    "sponge-construction": "Sep 29, 2026"
  });

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem("ascon_learn_completed_v2");
      if (savedCompleted) {
        setCompletedLessonIds(JSON.parse(savedCompleted));
      }
      const savedDates = localStorage.getItem("ascon_learn_dates_v2");
      if (savedDates) {
        setCompletedDates(JSON.parse(savedDates));
      }
    } catch {
      // LocalStorage unavailable
    }
  }, []);

  const activeLesson = useMemo(() => {
    return allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  }, [allLessons, activeLessonId]);

  const activeIndex = useMemo(() => {
    return allLessons.findIndex((l) => l.id === activeLessonId);
  }, [allLessons, activeLessonId]);

  const activeCategory = useMemo(() => {
    return LEARNING_CURRICULUM.find((cat) => 
      cat.lessons.some((l) => l.id === activeLessonId)
    );
  }, [activeLessonId]);

  // Reset quiz state when active lesson changes
  useEffect(() => {
    setSelectedQuizAnswer(null);
    setQuizSubmitted(false);
  }, [activeLessonId]);

  const toggleComplete = (id: string) => {
    const isCompleted = completedLessonIds.includes(id);
    const newCompleted = isCompleted
      ? completedLessonIds.filter((item) => item !== id)
      : [...completedLessonIds, id];
    
    setCompletedLessonIds(newCompleted);

    const todayStr = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    const newDates = { ...completedDates };
    if (!isCompleted) {
      newDates[id] = todayStr;
    } else {
      delete newDates[id];
    }
    setCompletedDates(newDates);

    try {
      localStorage.setItem("ascon_learn_completed_v2", JSON.stringify(newCompleted));
      localStorage.setItem("ascon_learn_dates_v2", JSON.stringify(newDates));
    } catch {
      // Storage write error
    }
  };

  const openLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    setViewMode("workbench");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    if (viewMode !== "workbench") return;

    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [activeIndex, allLessons, viewMode]);

  const totalLessons = allLessons.length;
  const completedCount = completedLessonIds.length;
  const progressPct = Math.round((completedCount / totalLessons) * 100);

  const tierColors = {
    Beginner: {
      badge: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      accent: "text-emerald-500",
    },
    Intermediate: {
      badge: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      accent: "text-blue-500",
    },
    Advanced: {
      badge: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      accent: "text-purple-500",
    },
    Expert: {
      badge: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      accent: "text-rose-500",
    },
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
      <div className="flex flex-col items-center justify-center p-12 text-center text-zinc-500 space-y-3 bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl">
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
          className="px-3.5 py-1.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-700 transition-colors"
        >
          View Diagram &amp; Controls →
        </button>
      </div>
    );
  };

  // Filtered categories based on selected Tier tab
  const displayedCategories = useMemo(() => {
    if (activeTier === "all") return LEARNING_CURRICULUM;
    return LEARNING_CURRICULUM.filter(cat => cat.id === activeTier);
  }, [activeTier]);

  // Next up lesson for the banner
  const nextUpLesson = useMemo(() => {
    const uncompleted = allLessons.find(l => !completedLessonIds.includes(l.id));
    return uncompleted || allLessons[0];
  }, [allLessons, completedLessonIds]);

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW MODE 1: CLEAN DASHBOARD OVERVIEW (Separated by Beginner, Advanced, etc.)
  // ──────────────────────────────────────────────────────────────────────────
  if (viewMode === "overview") {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Header - Styled like the Dashboard Command Center */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
              Cryptographic Learning Modules
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              NIST SP 800-232 lightweight cryptography curriculum, state matrix anatomy, and permutation mechanics.
            </p>
          </div>

          <button
            onClick={() => openLesson(nextUpLesson.id)}
            className="self-start md:self-auto bg-black text-white dark:bg-white dark:text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm flex items-center gap-2 shrink-0 shadow-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Continue: {nextUpLesson.title}</span>
          </button>
        </header>

        {/* Quick Stats Grid mimicking Dashboard / Grafana metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { 
              label: "Curriculum Progress", 
              value: `${progressPct}%`, 
              sub: `${completedCount} of ${totalLessons} Lessons Completed`,
              icon: Activity, 
              color: "text-blue-500 dark:text-blue-400" 
            },
            { 
              label: "Total Modules", 
              value: "4 Levels", 
              sub: "Beginner, Intermediate, Advanced, Expert",
              icon: Layers, 
              color: "text-purple-500 dark:text-purple-400" 
            },
            { 
              label: "Specification Standard", 
              value: "SP 800-232", 
              sub: "NIST Lightweight Cryptography (2024)",
              icon: ShieldCheck, 
              color: "text-emerald-500 dark:text-emerald-400" 
            },
            { 
              label: "Hardware Footprint", 
              value: "40 Bytes", 
              sub: "Five 64-bit registers (320-bit state)",
              icon: Cpu, 
              color: "text-yellow-500 dark:text-yellow-400" 
            }
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/5 relative overflow-hidden group shadow-sm dark:shadow-none"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20 dark:opacity-[0.07] group-hover:opacity-30 dark:group-hover:opacity-15 transition-opacity">
                <stat.icon className={`w-14 h-14 ${stat.color}`} />
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-zinc-900 dark:text-white truncate">{stat.value}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 truncate">{stat.sub}</p>
            </motion.div>
          ))}
        </div>

        {/* Tier Separation Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-white/10 pb-4">
          {/* Level Tabs: All, Beginner, Intermediate, Advanced, Expert */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            {[
              { id: "all", label: "All Modules", count: 9 },
              { id: "beginner", label: "Beginner", count: 4 },
              { id: "intermediate", label: "Intermediate", count: 2 },
              { id: "advanced", label: "Advanced", count: 2 },
              { id: "expert", label: "Expert", count: 1 }
            ].map((tab) => {
              const isActive = activeTier === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTier(tab.id as TierFilter)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shrink-0 ${
                    isActive
                      ? "bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/5"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? "bg-white/20 dark:bg-black/20 text-white dark:text-black"
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics or terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg focus:outline-none focus:border-zinc-400 text-zinc-900 dark:text-white placeholder:text-zinc-400"
            />
          </div>
        </div>

        {/* Separated Sections Data Display */}
        <div className="space-y-8">
          {displayedCategories.map((category) => {
            // Filter lessons by search query
            const filteredLessons = category.lessons.filter((l) => {
              if (!searchQuery.trim()) return true;
              const q = searchQuery.toLowerCase();
              return (
                l.title.toLowerCase().includes(q) ||
                l.simpleTerm.toLowerCase().includes(q) ||
                l.summary.toLowerCase().includes(q)
              );
            });

            if (filteredLessons.length === 0 && searchQuery.trim()) {
              return null;
            }

            const catCompleted = category.lessons.filter(l => completedLessonIds.includes(l.id)).length;
            const catTotal = category.lessons.length;
            const catPct = Math.round((catCompleted / catTotal) * 100);
            const style = tierColors[category.level] || tierColors.Beginner;

            return (
              <div 
                key={category.id} 
                className="border border-zinc-200 dark:border-white/10 rounded-xl bg-white dark:bg-white/5 overflow-hidden shadow-sm dark:shadow-none"
              >
                {/* Category Header */}
                <div className="p-5 border-b border-zinc-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-black/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                        {category.level} Level
                      </span>
                      {category.schedule && (
                        <span className="text-xs font-mono text-zinc-500">
                          {category.schedule}
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                      {category.title}
                    </h2>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-2xl">
                      {category.description}
                    </p>
                  </div>

                  {/* Progress & Duration */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right space-y-1">
                      <div className="text-xs font-mono text-zinc-500">
                        {catCompleted} of {catTotal} Done ({catPct}%)
                      </div>
                      <div className="w-28 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="bg-zinc-900 dark:bg-white h-full rounded-full transition-all duration-300"
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Lessons List in this Category */}
                <div className="divide-y divide-zinc-200 dark:divide-white/5">
                  {filteredLessons.map((lesson, idx) => {
                    const isDone = completedLessonIds.includes(lesson.id);
                    const completionDate = completedDates[lesson.id];
                    const LessonIcon = lesson.icon || BookOpen;

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => openLesson(lesson.id)}
                        className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-white/[0.02] cursor-pointer transition-colors group"
                      >
                        {/* Left: Icon, Number, Title, Formula / Concept */}
                        <div className="flex items-start gap-3.5 min-w-0 flex-1">
                          <div className={`p-2.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-white/5 shrink-0 text-zinc-700 dark:text-zinc-300 group-hover:border-zinc-400 transition-colors`}>
                            <LessonIcon className="w-4 h-4" />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-zinc-400">
                                0{idx + 1}
                              </span>
                              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors truncate">
                                {lesson.title}
                              </h3>
                              <span className="text-[10px] text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-2 py-0.5 rounded font-medium">
                                {lesson.simpleTerm}
                              </span>
                            </div>

                            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1">
                              {lesson.summary}
                            </p>

                            {/* Technical formula / anatomy preview if available */}
                            {lesson.technicalAnatomy.formula && (
                              <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                Formula: <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{lesson.technicalAnatomy.formula}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Right: Interactive features, Dates, Action button */}
                        <div className="flex items-center justify-between md:justify-end gap-5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-white/5">
                          {/* Tags */}
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-500">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80">
                              Diagram
                            </span>
                            {lesson.sandboxType && (
                              <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                                Sandbox
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80">
                              Quiz
                            </span>
                          </div>

                          {/* Date and Completion Status */}
                          <div className="text-right">
                            {isDone ? (
                              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Completed</span>
                                {completionDate && (
                                  <span className="text-[10px] font-mono text-zinc-400 font-normal">
                                    ({completionDate})
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs font-mono text-zinc-500">
                                ⏱️ {lesson.estimatedMinutes} min
                              </div>
                            )}
                          </div>

                          {/* Action Link */}
                          <div className="bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black p-2 rounded-lg transition-colors text-zinc-700 dark:text-zinc-300">
                            <ArrowUpRight className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW MODE 2: INTERACTIVE LESSON WORKBENCH (Clean, Engineering-Focused)
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <div className="px-3 pt-3 pb-2 w-full mx-auto flex flex-col h-[calc(100vh-3.5rem)] gap-2">
      {/* Top Banner & Navigation */}
      <div className="shrink-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 shadow-sm transition-colors">
        {/* Left: Return to Overview & Lesson Path */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("overview")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Modules Overview</span>
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
            title={isSidebarOpen ? "Hide Lesson Rail" : "Show Lesson Rail"}
          >
            {isSidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
          </button>

          {/* Breadcrumbs */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-500">
            <span>{activeCategory?.level}</span>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-semibold truncate max-w-xs">
              {activeLesson.title}
            </span>
          </div>
        </div>

        {/* Right: Progress & Status */}
        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Lesson {activeIndex + 1} of {totalLessons}
          </div>

          <button
            onClick={() => toggleComplete(activeLesson.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              completedLessonIds.includes(activeLesson.id)
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedLessonIds.includes(activeLesson.id) ? "Completed" : "Mark as Done"}
          </button>
        </div>
      </div>

      {/* Main Dual-Pane Studio Layout */}
      <div className="flex-1 flex gap-2 min-h-0 overflow-hidden">
        {/* Left Rail: Lesson Directory */}
        <AnimatePresence initial={false}>
          {isSidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="shrink-0 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-xl flex flex-col overflow-hidden shadow-sm"
            >
              {/* Search Header */}
              <div className="p-3 border-b border-zinc-200 dark:border-white/10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search topics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg focus:outline-none focus:border-zinc-400 text-zinc-900 dark:text-white placeholder:text-zinc-400"
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
                      <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
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
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                                isCurrent
                                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold"
                                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/60"
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="truncate font-medium text-[12px]">
                                  {l.title}
                                </div>
                                <div className={`text-[10px] truncate mt-0.5 ${isCurrent ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-500"}`}>
                                  {l.simpleTerm}
                                </div>
                              </div>

                              <span className="shrink-0 mt-0.5">
                                {isDone ? (
                                  <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent ? "text-white dark:text-black" : "text-emerald-500"}`} />
                                ) : (
                                  <span className={`w-3.5 h-3.5 rounded-full border inline-block ${isCurrent ? "border-white/50 dark:border-black/50" : "border-zinc-300 dark:border-zinc-700"}`} />
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
        <main className="flex-1 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-xl flex flex-col overflow-hidden shadow-sm">
          {/* Stage Sub-Header */}
          <div className="p-4 border-b border-zinc-200 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-black/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${tierColors[activeLesson.level]?.badge}`}>
                  {activeLesson.level}
                </span>
                <span className="text-[11px] font-mono text-zinc-500">
                  {activeLesson.estimatedMinutes} min read
                </span>
                <span className="text-[11px] text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-mono">
                  Concept: {activeLesson.simpleTerm}
                </span>
              </div>

              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {activeLesson.title}
              </h2>
            </div>

            {/* View Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg text-xs font-semibold shrink-0 self-start md:self-auto overflow-x-auto">
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                      isSelected
                        ? "bg-white dark:bg-black text-zinc-900 dark:text-white shadow-sm"
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
                  <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-3 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed flex items-center justify-between gap-3">
                    <span>{activeLesson.summary}</span>
                    <span className="text-[10px] font-mono text-zinc-400 shrink-0">
                      Interactive State Architecture
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
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 flex items-center justify-center text-amber-500 shrink-0">
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

                  <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-5 text-zinc-800 dark:text-zinc-200 leading-relaxed text-sm space-y-3">
                    <p className="border-l-2 border-amber-500 pl-4 py-0.5 italic text-zinc-800 dark:text-zinc-200">
                      "{activeLesson.analogy.story}"
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl p-4 flex items-start gap-3">
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
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        Formal Specification
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                        {activeLesson.technicalAnatomy.heading}
                      </h3>
                    </div>

                    {activeLesson.technicalAnatomy.formula && (
                      <div className="font-mono text-xs text-zinc-900 dark:text-white bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 px-3 py-1 rounded-lg font-bold self-start sm:self-auto">
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
                          className="p-3 rounded-lg bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed flex items-start gap-2.5"
                        >
                          <span className="w-4 h-4 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <span>{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-lg p-3.5 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
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
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
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

                      let btnStyle = "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-800 dark:text-zinc-200";

                      if (quizSubmitted) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                        } else if (isSelected) {
                          btnStyle = "bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-800 dark:text-rose-200";
                        }
                      } else if (isSelected) {
                        btnStyle = "bg-zinc-100 dark:bg-white/15 border-zinc-400 text-zinc-900 dark:text-white font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!quizSubmitted) setSelectedQuizAnswer(idx);
                          }}
                          className={`w-full text-left p-3.5 rounded-lg border transition-all text-xs flex items-center justify-between ${btnStyle}`}
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
                            if (!completedLessonIds.includes(activeLesson.id)) {
                              toggleComplete(activeLesson.id);
                            }
                          }
                        }
                      }}
                      disabled={selectedQuizAnswer === null}
                      className="w-full py-2.5 bg-zinc-900 text-white dark:bg-white dark:text-black font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 rounded-lg text-xs transition-colors shadow-sm"
                    >
                      Verify Answer
                    </button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                        selectedQuizAnswer === activeLesson.quiz.correctIndex
                          ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-900 dark:text-emerald-200"
                          : "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-900 dark:text-rose-200"
                      }`}
                    >
                      <div className="font-bold mb-1">
                        {selectedQuizAnswer === activeLesson.quiz.correctIndex
                          ? "✓ Verification Passed"
                          : "Verification Failed"}
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
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <button
                onClick={handleNext}
                disabled={activeIndex === allLessons.length - 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setViewMode("overview")}
              className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
            >
              <span>Back to Overview</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
