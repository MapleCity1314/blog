"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function FatalErrorPage() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-mono cursor-crosshair selection:bg-red-600 selection:text-black">
      
      {/* 
        LAYER 1: 内存溢出背景 (Raw Data Dump) 
        密密麻麻的报错信息在背景快速滚动
      */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none overflow-hidden text-[10px] leading-tight text-green-700/50 break-all select-none">
        <MemoryDump />
      </div>

      {/* 
        LAYER 2: 疯狂的色块轰炸 (Aggressive Strobe Blocks) 
        使用 mix-blend-difference 实现反色闪烁效果
      */}
      <StrobeBlocks />

      {/* 
        LAYER 3: 视觉撕裂层 (Screen Tearing)
        模拟屏幕硬件损坏的条纹
      */}
      <ScreenTearing />

      {/* 
        LAYER 4: 主内容 
      */}
      <main className="relative z-50 w-full h-full flex flex-col items-center justify-center pointer-events-none">
        
        <div className="relative pointer-events-auto group">
           {/* 
             巨大的 404 文字 
             三个层叠：中间白，两边红蓝疯狂位移
           */}
           <div className="relative">
              {/* 红色故障层 */}
              <motion.h1 
                className="absolute inset-0 text-[20vw] font-black leading-none text-red-600 mix-blend-screen opacity-80"
                animate={{ 
                    x: ["-2%", "2%", "-5%", "1%", "0%"], 
                    y: ["1%", "-3%", "2%", "0%", "-1%"],
                    skewX: [0, 10, -10, 0],
                    opacity: [0.8, 0, 0.8, 0.4]
                }}
                transition={{ duration: 0.1, repeat: Infinity }}
              >
                404
              </motion.h1>

              {/* 蓝色故障层 */}
              <motion.h1 
                className="absolute inset-0 text-[20vw] font-black leading-none text-blue-600 mix-blend-screen opacity-80"
                animate={{ 
                    x: ["2%", "-2%", "5%", "-1%", "0%"], 
                    y: ["-1%", "3%", "-2%", "0%", "1%"],
                    skewX: [0, -20, 10, 0],
                    opacity: [0.4, 0.8, 0, 0.8]
                }}
                transition={{ duration: 0.15, repeat: Infinity }}
              >
                404
              </motion.h1>

              {/* 白色主体层 */}
              <h1 className="relative text-[20vw] font-black leading-none text-white mix-blend-overlay filter blur-[1px]">
                404
              </h1>
           </div>

           {/* 错误提示条 */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-auto bg-yellow-400 rotate-[-5deg] flex items-center justify-center border-4 border-black box-border shadow-[10px_10px_0px_0px_rgba(255,255,255,1)] hover:rotate-0 transition-transform duration-100">
               <span className="text-black font-black text-xl md:text-3xl uppercase tracking-tighter px-4 py-1 animate-pulse">
                   Fatal_System_Error
               </span>
           </div>
        </div>

        {/* 描述信息 */}
        <div className="mt-12 text-center bg-black/90 p-4 border border-red-600 pointer-events-auto backdrop-blur-sm max-w-lg mx-4">
             <p className="text-red-500 font-bold mb-2 blink">/// CRITICAL FAILURE ///</p>
             <p className="text-white/80 text-sm">
                 Memory address 0x00000000 could not be read. The reality you are looking for has collapsed.
             </p>
        </div>

        {/* 交互按钮 */}
        <div className="mt-8 pointer-events-auto">
            <Link href="/" className="relative inline-block group">
                 <div className="absolute inset-0 bg-white translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-75" />
                 <button className="relative px-10 py-4 bg-red-600 text-white font-bold uppercase tracking-[0.2em] border-2 border-white hover:bg-white hover:text-black transition-colors duration-75 text-sm md:text-base">
                     Emergency_Eject
                 </button>
            </Link>
        </div>

      </main>
      
      {/* 
        LAYER 5: 最终噪点覆盖 (Noise Overlay) 
        给整个屏幕加一层老电视的雪花点
      */}
      <div className="absolute inset-0 z-[100] opacity-[0.15] pointer-events-none mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
    </div>
  );
}

// --- 组件：内存溢出文本 ---
function MemoryDump() {
    const [content, setContent] = useState("");

    // 生成随机十六进制码
    useEffect(() => {
        let str = "";
        for(let i=0; i<3000; i++) {
            str += Math.random().toString(16).substr(2, 8) + " ";
        }
        setContent(str);
    }, []);

    return (
        <motion.div 
            className="w-full break-all"
            animate={{ y: ["-10%", "-50%"] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
            {content}
        </motion.div>
    )
}

// --- 组件：暴力闪烁色块 (Strobe Blocks) ---
// 这是视觉冲击力的核心：利用 mix-blend-difference 实现反色
function StrobeBlocks() {
    return (
        <div className="absolute inset-0 z-10 pointer-events-none">
            {Array.from({ length: 10 }).map((_, i) => (
                <FlashBlock key={i} />
            ))}
        </div>
    )
}

function FlashBlock() {
    return (
        <motion.div 
            className="absolute bg-white mix-blend-difference" // 反色混合模式
            style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 40 + 10}vw`, // 巨大的块
                height: `${Math.random() * 20 + 2}vh`,
            }}
            animate={{
                opacity: [0, 1, 0, 0, 1, 0], // 瞬间出现瞬间消失
                x: [0, 50, -50, 0]
            }}
            transition={{
                duration: Math.random() * 0.5 + 0.1, // 极快
                repeat: Infinity,
                repeatDelay: Math.random() * 2, // 随机间隔
                ease: "linear" // 线性过渡，实现快速切换效果
            }}
        />
    )
}

// --- 组件：屏幕撕裂条纹 (Screen Tearing) ---
function ScreenTearing() {
    return (
        <div className="absolute inset-0 z-20 pointer-events-none flex flex-col justify-between">
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div 
                    key={i}
                    className="w-full h-[2px] bg-cyan-400 opacity-50"
                    animate={{
                        x: [-100, 100],
                        opacity: [0, 0.8, 0],
                        height: ["1px", "5px", "1px"]
                    }}
                    transition={{
                        duration: Math.random() * 0.5 + 0.1,
                        repeat: Infinity,
                        repeatDelay: Math.random(),
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    )
}