"use client";

import { motion } from "framer-motion";

const features = [
  "Web3/Web2 Fusion",
  "A2UI",
  "Subagent",
  "Digital Economy",
  "Vibecoding",
  "Skills",
];

export default function PreviewHero() {
  return (
    <div className="relative z-30 flex flex-col items-center px-6 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="mb-12"
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-zinc-950 dark:text-white">
          u0 Preview
        </span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-4"
      >
        <h1 className="text-5xl font-extralight tracking-tighter text-zinc-950 md:text-7xl dark:text-white">
          u0 <span className="opacity-20">is coming.</span>
        </h1>
        <p className="text-sm font-extralight uppercase tracking-[0.3em] text-zinc-600 md:text-base dark:text-zinc-400">
          {"\u591a\u529f\u80fd\u667a\u80fd\u4f53\u9884\u89c8\u524d\u77bb"}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 2 }}
        className="mt-24 flex max-w-2xl flex-wrap items-center justify-center gap-x-12 gap-y-6"
      >
        {features.map((feature) => (
          <span
            key={feature}
            className="text-[11px] font-light uppercase tracking-[0.2em] text-zinc-600 transition-colors duration-500 hover:text-zinc-950 dark:text-zinc-500 dark:hover:text-zinc-100"
          >
            {feature}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 0.2 }}
        transition={{ delay: 1.5, duration: 1.5 }}
        className="mt-24 h-[1px] w-32 bg-zinc-900 dark:bg-white"
      />
    </div>
  );
}

