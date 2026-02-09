"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useTransform } from "framer-motion";
import { 
  Fingerprint, 
  Globe, 
  MapPin, 
  Plane, 
  RefreshCcw, 
  ScanLine, 
  ShieldCheck, 
  Ticket, 
  XCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// 组件：锯齿状边缘 (用于小票底部)
// -----------------------------------------------------------------------------
const JaggedEdge = ({ className }: { className?: string }) => (
  <div className={cn("flex w-full overflow-hidden h-3", className)}>
    {Array.from({ length: 20 }).map((_, i) => (
      <div 
        key={i} 
        className="w-4 h-4 bg-white dark:bg-zinc-900 rotate-45 transform origin-center -ml-2 translate-y-2 border border-zinc-200 dark:border-zinc-700"
      />
    ))}
  </div>
);

// -----------------------------------------------------------------------------
// 主页面
// -----------------------------------------------------------------------------
export default function BiometricGatePage() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "scanning" | "printing" | "done">("idle");
  const [scanProgress, setScanProgress] = useState(0);
  
  // 模拟按住的长按逻辑
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScan = () => {
    if (status !== "idle") return;
    setStatus("scanning");
    setScanProgress(0);

    intervalRef.current = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          handleScanComplete();
          return 100;
        }
        return prev + 2; // 扫描速度
      });
    }, 30);
  };

  const stopScan = () => {
    if (status === "scanning" && scanProgress < 100) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStatus("idle");
      setScanProgress(0);
    }
  };

  const handleScanComplete = () => {
    setStatus("printing");
    // 模拟打印耗时
    setTimeout(() => {
      setStatus("done");
    }, 600);
  };

  const reset = () => {
    setStatus("idle");
    setScanProgress(0);
  };

  return (
    <div className="relative w-full min-h-screen bg-zinc-100 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans flex flex-col items-center justify-center p-4 overflow-hidden">
      
      {/* 背景装饰：网格线 */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03]"
        style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
        }}
      />

      {/* 标题区 */}
      <div className="absolute top-10 left-0 right-0 text-center z-10">
        <h1 className="text-xl font-bold tracking-tight flex items-center justify-center gap-2">
           <ShieldCheck size={20} className="text-zinc-400" />
           PROTOCOL_GATEWAY
        </h1>
        <p className="text-xs text-zinc-400 font-mono mt-2">IDENTITY VERIFICATION REQUIRED</p>
      </div>

      {/* --- 核心交互卡片 --- */}
      <div className="relative z-20 w-full max-w-sm">
        
        {/* 1. 扫描仪主体 */}
        <motion.div 
          layout
          className="relative z-30 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-8 flex flex-col items-center gap-6 overflow-hidden"
        >
           {/* 扫描动画层 */}
           <div className="relative w-32 h-32 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center overflow-hidden group cursor-pointer select-none">
              
              {/* 指纹图标 */}
              <Fingerprint 
                size={64} 
                className={cn(
                    "text-zinc-300 dark:text-zinc-600 transition-colors duration-500",
                    status === "scanning" && "text-blue-500 dark:text-blue-400 opacity-50",
                    status === "done" && "text-rose-500 opacity-50"
                )} 
              />

              {/* 扫描光束 */}
              {status === "scanning" && (
                <motion.div 
                  initial={{ top: "-10%" }}
                  animate={{ top: "110%" }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10"
                />
              )}

              {/* 交互遮罩 */}
              <div 
                className="absolute inset-0 z-20"
                onMouseDown={startScan}
                onMouseUp={stopScan}
                onMouseLeave={stopScan}
                onTouchStart={startScan}
                onTouchEnd={stopScan}
              />
           </div>

           {/* 状态文字 */}
           <div className="text-center space-y-1 h-12">
             <h2 className="text-lg font-bold">
               {status === "idle" && "Authenticate"}
               {status === "scanning" && "Verifying..."}
               {status === "printing" && "Generating Report..."}
               {status === "done" && "Access Denied"}
             </h2>
             <p className="text-xs text-zinc-400 font-mono">
                {status === "idle" && "Hold sensor to connect to Agent"}
                {status === "scanning" && "Analyzing network topology"}
                {status === "done" && "Please take your receipt"}
             </p>
           </div>
           
           {/* 进度条 */}
           <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
             <motion.div 
               className={cn("h-full transition-all duration-75", 
                  status === "done" ? "bg-rose-500" : "bg-zinc-900 dark:bg-zinc-100"
               )}
               style={{ width: `${scanProgress}%` }}
             />
           </div>

        </motion.div>


        {/* 2. 打印出的小票 (Receipt) */}
        {/* 它位于卡片下方，但在视觉上是从卡片底部“滑”出来的 */}
        <div className="relative z-10 w-[90%] mx-auto -mt-6">
            <AnimatePresence>
                {(status === "printing" || status === "done") && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 120, damping: 20, delay: 0.1 }}
                        className="bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono text-xs shadow-xl rounded-b-xl overflow-hidden pt-8 pb-2"
                    >
                        {/* 小票内容 */}
                        <div className="p-5 space-y-4 border-t border-dashed border-zinc-300 dark:border-zinc-600 mt-2">
                            
                            {/* 错误头部 */}
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <span className="bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                                        Connection Error
                                    </span>
                                    <p className="font-bold text-zinc-900 dark:text-white mt-1">GEOFENCE_LOCK</p>
                                </div>
                                <XCircle size={20} className="text-rose-500" />
                            </div>

                            {/* 详细信息 */}
                            <div className="space-y-2 opacity-80">
                                <div className="flex justify-between">
                                    <span>Target:</span>
                                    <span>Trustless Agent</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Current IP:</span>
                                    <span className="blur-[2px]">202.106.0.1</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Status:</span>
                                    <span>Restricted Area</span>
                                </div>
                            </div>

                            {/* 虚线分割 */}
                            <div className="w-full border-b border-dashed border-zinc-300 dark:border-zinc-600" />

                            {/* 建议 (Recommendation) - 核心梗 */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-900/30">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold mb-1">
                                    <Plane size={12} />
                                    <span>TRAVEL ADVISORY</span>
                                </div>
                                <p className="leading-relaxed text-[11px] text-zinc-500 dark:text-zinc-400">
                                    Your digital footprint is located in a restricted flight zone.
                                    <br/><br/>
                                    <strong>Recommendation:</strong> Use a <span className="underline decoration-wavy decoration-blue-400 text-zinc-900 dark:text-white">Quantum Tunnel (VPN)</span> to relocate your presence to a supported region (e.g., US/JP/SG).
                                </p>
                            </div>

                            <div className="text-center pt-2 opacity-50 text-[10px]">
                                SYSTEM_TIME: {new Date().toLocaleTimeString()}
                            </div>
                            
                            {/* 底部操作 */}
                            <div className="flex gap-2 pt-2">
                                <button 
                                  onClick={reset}
                                  className="flex-1 py-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded text-zinc-900 dark:text-white transition-colors"
                                >
                                  Retry
                                </button>
                                <button 
                                  onClick={() => router.back()}
                                  className="flex-1 py-2 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                                >
                                  Leave
                                </button>
                            </div>
                        </div>

                        {/* 锯齿效果装饰 */}
                        <div 
                          className="h-2 w-full bg-[linear-gradient(45deg,transparent_33.333%,#f4f4f5_33.333%,#f4f4f5_66.667%,transparent_66.667%),linear-gradient(-45deg,transparent_33.333%,#f4f4f5_33.333%,#f4f4f5_66.667%,transparent_66.667%)] bg-[length:12px_24px] bg-[position:0_20px] rotate-180 dark:hidden opacity-0" 
                          // 注意：Tailwind 实现锯齿比较复杂，这里用简单的 CSS clip-path 替代可能更好，或者直接用上面的 JaggedEdge 组件
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>

      </div>

      {/* 底部水印 */}
      <div className="fixed bottom-6 flex items-center gap-2 text-[10px] text-zinc-300 dark:text-zinc-700 font-mono uppercase tracking-widest">
         <ScanLine size={12} />
         <span>Secure Access Layer v2.1</span>
      </div>

    </div>
  );
}