"use client";

import { useEffect, useState } from "react";
import { motion, useTransform } from "framer-motion";
import FrameSequencePlayer from "@/components/frame/frame-sequence-player";

type GhostActorProps = {
  scrollProgress: any;
};

export default function GhostActor({ scrollProgress }: GhostActorProps) {
  const [frames, setFrames] = useState<string[]>([]);
  
  useEffect(() => {
    fetch("/api/frames")
      .then((res) => res.json())
      .then((data) => {
        if (data.frames) setFrames(data.frames);
      })
      .catch((err) => console.error(err));
  }, []);

  // Use spring-driven transforms for smoother motion.
  const ghostX = useTransform(scrollProgress, [0, 0.3, 0.6, 1], ["0%", "-45%", "45%", "0%"]);
  const ghostY = useTransform(scrollProgress, [0, 0.3, 0.6, 1], ["-10%", "-5%", "5%", "-10%"]);
  const ghostScale = useTransform(scrollProgress, [0, 0.2, 0.8, 1], [0.55, 0.4, 0.4, 0.55]);
  const ghostRotate = useTransform(scrollProgress, [0, 0.3, 0.6, 1], [0, 5, -5, 0]);
  const lineOpacity = useTransform(scrollProgress, [0.1, 0.9], [0, 0.1]);
  const statusOpacity = useTransform(scrollProgress, [0, 0.1], [1, 0]);

  return (
    <div className="fixed inset-0 z-0 flex items-center justify-center pointer-events-none">
      {/* Motion trail */}
      <motion.svg 
        style={{ opacity: lineOpacity }} 
        className="absolute inset-0 w-full h-full text-primary" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
      >
        <path d="M50,10 C50,30 20,40 20,50 T80,70 T50,90" fill="none" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 1" />
      </motion.svg>

      <motion.div 
        style={{ x: ghostX, y: ghostY, scale: ghostScale, rotate: ghostRotate }}
        className="relative z-10"
      >
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/10 rounded-full blur-[60px] animate-pulse" />
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
        
        {/* Status indicator */}
        <motion.div 
          style={{ opacity: statusOpacity }}
          className="absolute top-[120%] left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-px h-8 bg-gradient-to-b from-primary/50 to-transparent" />
            <p className="font-mono text-[10px] tracking-widest text-muted-foreground animate-pulse">
              WAITING FOR INPUT
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
