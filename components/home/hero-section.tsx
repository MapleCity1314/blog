"use client";

import { motion, useTransform } from "framer-motion";

type HeroSectionProps = {
  scrollProgress: any;
};

export default function HeroSection({ scrollProgress }: HeroSectionProps) {
  const opacity = useTransform(scrollProgress, [0, 0.15], [1, 0]);

  return (
    <section className="absolute top-0 w-full h-screen flex flex-col items-center justify-center z-10 pointer-events-none">
      <motion.div 
        style={{ opacity }}
        className="text-center space-y-6 mt-32 pointer-events-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest text-muted-foreground uppercase">System Online</span>
        </div>
        <h1 className="text-8xl md:text-9xl font-logo leading-none mix-blend-difference">
          Presto<span className="text-primary">.</span>
        </h1>
        <p className="font-serif italic text-xl text-muted-foreground/80">
          "The digital ghost in the machine."
        </p>
      </motion.div>
    </section>
  );
}
