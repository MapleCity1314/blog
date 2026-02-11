"use client";

import React from "react";
import { motion } from "framer-motion";

// -----------------------------------------------------------------------------
// 1. 磨砂光球组件 (Frosted Glass Orbs)
// -----------------------------------------------------------------------------
const FrostedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 动态光球层 */}
      <div className="absolute inset-0 z-0">
        {/* 球 A - 深蓝 */}
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-600/40 rounded-full"
        />
        {/* 球 B - 紫色 */}
        <motion.div
          animate={{
            x: [0, -120, 60, 0],
            y: [0, 100, -60, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 right-1/4 w-80 h-80 bg-purple-500/30 rounded-full"
        />
        {/* 球 C - 粉/红 */}
        <motion.div
          animate={{
            x: [0, 50, -100, 0],
            y: [0, 120, -40, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-rose-500/20 rounded-full"
        />
        {/* 球 D - 青色 */}
        <motion.div
          animate={{
            x: [0, -80, 40, 0],
            y: [0, -100, 80, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/3 right-1/3 w-48 h-48 bg-emerald-400/20 rounded-full"
        />
      </div>

      {/* 核心磨砂遮罩层 */}
      <div className="absolute inset-0 z-10 backdrop-blur-[120px] bg-white/40 dark:bg-black/40" />
      
      {/* 极细微的颗粒感 (Grain) */}
      <div className="absolute inset-0 z-20 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

// -----------------------------------------------------------------------------
// 2. 页面内容
// -----------------------------------------------------------------------------
export default function U0ComingSoonPage() {
  const features = [
    "Web3/Web2 Fusion",
    "A2UI",
    "Subagent",
    "Digital Economy",
    "Vibecoding",
    "Skills"
  ];

  return (
    <main className="relative w-full min-h-[80vh] flex flex-col items-center justify-center bg-white dark:bg-black overflow-hidden">
      {/* 磨砂背景 */}
      <FrostedBackground />

      {/* 内容层 */}
      <div className="relative z-30 flex flex-col items-center text-center px-6">
        
        {/* 顶部微小标识 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2 }}
          className="mb-12"
        >
          <span className="text-[10px] font-mono tracking-[0.5em] uppercase dark:text-white text-black">
             System Preview
          </span>
        </motion.div>

        {/* 主标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-extralight tracking-tighter dark:text-white text-zinc-900">
            u0 <span className="opacity-20">is coming.</span>
          </h1>
          <p className="text-sm md:text-base font-extralight tracking-[0.3em] text-zinc-500 dark:text-zinc-400 uppercase">
             多功能智能体预览前瞻
          </p>
        </motion.div>

        {/* 极简功能列表 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 2 }}
          className="mt-24 flex flex-wrap justify-center items-center gap-x-12 gap-y-6 max-w-2xl"
        >
          {features.map((feature, i) => (
            <span 
              key={feature}
              className="text-[11px] font-light tracking-[0.2em] text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-500 uppercase"
            >
              {feature}
            </span>
          ))}
        </motion.div>

        {/* 底部点缀线 */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.2 }}
          transition={{ delay: 1.5, duration: 1.5 }}
          className="mt-24 w-32 h-[1px] bg-zinc-500 dark:bg-white"
        />
      </div>

      {/* 隐藏的 SEO 内容 */}
      <h2 className="sr-only">u0 Agent - 结合 Web3, Web2, A2UI, Digital Economy 的新型智能体</h2>
    </main>
  );
}