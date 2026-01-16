"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import FrameSequencePlayer from "@/components/frame/frame-sequence-player";

export default function Loading() {
  const [frames, setFrames] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/frames")
      .then((res) => res.json())
      .then((data) => {
        if (data.frames) setFrames(data.frames);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="fixed inset-0 z-9999 bg-background flex flex-col items-center justify-center overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-size-[2rem_2rem]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* 1. Ghost core */}
        <div className="relative">
          {/* Rotating rings to simulate loading */}
          <motion.div
            className="absolute -inset-8 rounded-full border border-dashed border-primary/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute -inset-4 rounded-full border border-primary/40 border-t-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Ghost body with breathing effect */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="opacity-80 scale-[0.3]"
          >
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
          </motion.div>
        </div>

        {/* 2. Status copy */}
        <div className="text-center space-y-2">
          <h2 className="text-lg font-logo animate-pulse">
            Synthesizing Interface<span className="text-primary">...</span>
          </h2>

          {/* Simulated log lines */}
          <div className="h-4 overflow-hidden flex flex-col items-center">
            <motion.div
              animate={{ y: ["0%", "-100%"] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                times: [0, 0.25, 0.5, 0.75, 1],
              }}
              className="flex flex-col text-[10px] font-mono text-muted-foreground/60"
            >
              <span>LOADING_ASSETS_0x1A...</span>
              <span>ESTABLISHING_UPLINK...</span>
              <span>PARSING_GHOST_DATA...</span>
              <span>RENDERING_PIXELS...</span>
              <span>LOADING_ASSETS_0x1A...</span>
            </motion.div>
          </div>
        </div>

        {/* 3. Minimal progress bar */}
        <div className="w-48 h-px bg-border relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-primary"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}
