"use client";

import { useAsconStore, NarrativeStep } from "@/store/useAsconStore";
import { motion } from "framer-motion";
import { FileText, Download, Award, Target, BrainCircuit, Activity, CheckCircle2, Circle } from "lucide-react";

export default function ReportsModule() {
  const { xp, encryptionXp, completedSteps, steps } = useAsconStore();

  // Derived metrics
  const level = Math.floor(xp / 500) + 1;
  const progressToNextLevel = ((xp % 500) / 500) * 100;
  
  const totalSteps = steps.length;
  const completedCount = completedSteps.length;
  const encryptionProgress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;
  
  // Quiz XP is total XP minus encryption XP (roughly)
  const quizXp = Math.max(0, xp - encryptionXp);
  const quizQuestionsAnswered = Math.floor(quizXp / 150); // XP_PER_QUESTION was 150

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto flex flex-col h-full space-y-8">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-500" /> Progression Report
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Comprehensive overview of your cryptography learning journey.
          </p>
        </div>
        
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4" /> Export PDF
        </button>
      </header>

      {/* Main Print Container */}
      <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-white/10 rounded-2xl p-6 md:p-10 shadow-sm dark:shadow-2xl relative overflow-hidden print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Visual Background Flair */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none print:hidden" />
        
        {/* Printable Header */}
        <div className="hidden print:block mb-10 border-b pb-6">
          <h1 className="text-4xl font-black text-black mb-2">ASCON Studio</h1>
          <h2 className="text-2xl text-gray-600">Official Progression Report</h2>
          <p className="text-gray-400 mt-2">Generated on: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/10 rounded-2xl p-8 mb-8 flex flex-col md:flex-row items-center gap-8 print:bg-gray-50 print:border-gray-200"
        >
          <div className="w-32 h-32 shrink-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full p-1 shadow-[0_0_30px_rgba(59,130,246,0.1)] dark:shadow-[0_0_30px_rgba(59,130,246,0.3)] print:shadow-none">
            <div className="w-full h-full bg-white dark:bg-[#09090b] print:bg-white rounded-full flex items-center justify-center flex-col">
              <Award className="w-10 h-10 text-yellow-500 dark:text-yellow-400 mb-1" />
              <span className="font-black text-xl text-zinc-900 dark:text-white print:text-black">Lv.{level}</span>
            </div>
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white print:text-black mb-2">Cryptographer Profile</h2>
            <div className="text-zinc-600 dark:text-zinc-400 print:text-gray-600 mb-6 flex flex-wrap gap-4 justify-center md:justify-start">
              <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Rank: Scholar</span>
              <span className="flex items-center gap-1.5"><Activity className="w-4 h-4 text-green-600 dark:text-green-400" /> {xp} Total XP</span>
            </div>
            
            <div className="w-full max-w-md mx-auto md:mx-0">
              <div className="flex justify-between text-xs mb-2 font-mono">
                <span className="text-zinc-500 dark:text-zinc-400 print:text-gray-500">XP Progress</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">{Math.round(progressToNextLevel)}%</span>
              </div>
              <div className="h-2 bg-zinc-200 dark:bg-zinc-800 print:bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNextLevel}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 print:bg-blue-600"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 p-6 rounded-xl print:border-gray-200 print:bg-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
                <BrainCircuit className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-300 print:text-gray-700">Quiz Mastery</h3>
            </div>
            <div className="text-4xl font-black text-zinc-900 dark:text-white print:text-black mb-1">{quizXp}</div>
            <div className="text-sm text-zinc-500 print:text-gray-500">XP from AI Challenges</div>
            <div className="mt-4 text-xs font-mono text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-500/10 py-1 px-2 rounded inline-block border border-purple-200 dark:border-transparent">
              ~{quizQuestionsAnswered} Correct Answers
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 p-6 rounded-xl print:border-gray-200 print:bg-white"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-300 print:text-gray-700">Lab Execution</h3>
            </div>
            <div className="text-4xl font-black text-zinc-900 dark:text-white print:text-black mb-1">{encryptionXp}</div>
            <div className="text-sm text-zinc-500 print:text-gray-500">XP from Guided Lab</div>
            <div className="mt-4 text-xs font-mono text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-500/10 py-1 px-2 rounded inline-block border border-green-200 dark:border-transparent">
              {completedCount} Narrative Stages Passed
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-white/5 p-6 rounded-xl print:border-gray-200 print:bg-white flex flex-col justify-center"
          >
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-300 print:text-gray-700 mb-6 text-center">Encryption Core Progress</h3>
            
            <div className="relative w-32 h-32 mx-auto">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="40" className="fill-none stroke-zinc-200 dark:stroke-zinc-800 print:stroke-gray-200" strokeWidth="8" />
                <motion.circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  className="fill-none stroke-blue-500" 
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                  animate={{ strokeDashoffset: (2 * Math.PI * 40) * (1 - encryptionProgress / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-black text-zinc-900 dark:text-white print:text-black">{Math.round(encryptionProgress)}%</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Narrative Steps Completion List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 rounded-xl p-8 print:border-gray-200 print:bg-white"
        >
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white print:text-black mb-6 border-b border-zinc-200 dark:border-white/10 print:border-gray-200 pb-4">
            Encryption Sequence Checklist
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {steps.map((step, idx) => {
              const isCompleted = completedSteps.includes(step);
              return (
                <div 
                  key={step} 
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isCompleted 
                      ? "bg-green-100 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-900 dark:text-green-100 print:bg-green-50 print:border-green-200 print:text-green-900" 
                      : "bg-white dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-500 print:bg-gray-50 print:border-gray-100 print:text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-500 print:text-green-600 shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 shrink-0 text-zinc-400 dark:text-zinc-500" />
                  )}
                  <span className="text-sm font-medium leading-tight truncate">
                    {idx + 1}. {step.replace(/_/g, " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
