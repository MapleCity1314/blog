"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCcw, AlertTriangle, Terminal } from "lucide-react";
import AmbientBackground from "@/components/ambient-background";
import FrameSequencePlayer from "@/components/frame/frame-sequence-player";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [frames, setFrames] = useState<string[]>([]);

  useEffect(() => {
    // 这里可以记录错误日志到服务
    console.error(error);
  }, [error]);

  useEffect(() => {
    fetch("/api/frames")
      .then((res) => res.json())
      .then((data) => {
        if (data.frames) setFrames(data.frames);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center font-sans p-6 selection:bg-amber-500/30">
      
      <AmbientBackground />
      
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        
        {/* Left: The Broken Ghost */}
        <div className="relative flex items-center justify-center h-[300px] bg-muted/20 rounded-2xl border border-dashed border-border/60 overflow-hidden">
            {/* 故障效果：幽灵变成红色/琥珀色 */}
            <div className="text-amber-600/80 dark:text-amber-500/80 filter blur-[0.5px] animate-pulse scale-125">
                {frames.length > 0 && (
                  <FrameSequencePlayer
                    frames={frames}
                    config={{
                      scaleX: 1.15,
                      scaleY: 0.9,
                      fps: 40,
                    }}
                  />
                )}
            </div>
            
            {/* 覆盖层：警告条带 */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(245,158,11,0.05)_10px,rgba(245,158,11,0.05)_20px)] pointer-events-none" />
            
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-amber-600 font-mono text-xs font-bold bg-amber-100 dark:bg-amber-900/30 px-3 py-1 rounded-full">
                <AlertTriangle size={14} />
                <span>RUNTIME_EXCEPTION</span>
            </div>
        </div>

        {/* Right: The Debug Log */}
        <div className="space-y-8">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-logo text-foreground">
                    System <br/> <span className="text-amber-500">Malfunction.</span>
                </h1>
                <p className="text-muted-foreground font-light">
                    An unexpected error has occurred in the neural network.
                </p>
            </div>

            {/* 模拟堆栈追踪代码块 */}
            <div className="bg-black/90 rounded-lg p-4 font-mono text-[10px] md:text-xs text-left shadow-2xl overflow-hidden border border-border/50 relative group">
                <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-2">
                    <Terminal size={12} className="text-amber-500" />
                    <span className="text-white/40">stack_trace.log</span>
                </div>
                <div className="space-y-1 text-red-400 opacity-80 font-mono">
                    <p>{`Error: ${error.message || "Unknown error occurred"}`}</p>
                    <p className="opacity-50 pl-4">at Object.render (page.tsx:42:1)</p>
                    <p className="opacity-50 pl-4">at processTicksAndRejections (task_queues:95:5)</p>
                    {error.digest && <p className="text-amber-500 mt-2">{`Digest: ${error.digest}`}</p>}
                </div>
                {/* 装饰性光标 */}
                <motion.div 
                    className="w-2 h-4 bg-amber-500 mt-1"
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                />
            </div>

            <button
                onClick={reset}
                className="group flex items-center gap-3 px-6 py-3 bg-foreground text-background rounded-lg font-mono text-sm font-bold uppercase hover:bg-amber-500 hover:text-white transition-all shadow-lg hover:shadow-amber-500/20"
            >
                <RefreshCcw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Reboot_Segment</span>
            </button>
        </div>

      </div>
    </div>
  );
}