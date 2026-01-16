"use client";

import { motion, useTransform } from "framer-motion";
import { Github, Twitter } from "lucide-react";

type FooterSectionProps = {
  scrollProgress: any;
};

export default function FooterSection({ scrollProgress }: FooterSectionProps) {
  const opacity = useTransform(scrollProgress, [0.85, 1], [0, 1]);

  return (
    <section className="absolute top-[300vh] w-full h-screen flex flex-col items-center justify-center z-10 pointer-events-none">
      <motion.div 
        style={{ opacity }}
        className="text-center space-y-8 pointer-events-auto"
      >
        <h2 className="text-5xl md:text-7xl font-logo">Connect.</h2>
        <div className="flex justify-center gap-4">
          <SocialButton icon={<Github size={18}/>} label="GitHub" href="https://github.com/MapleCity1314" />
          <SocialButton icon={<Twitter size={18}/>} label="Twitter" href="https://x.com/maplecity1314" />
        </div>
        <div className="pt-12 opacity-50">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase">End of Transmission</p>
        </div>
      </motion.div>
    </section>
  );
}

// 社交按钮
function SocialButton({ icon, label, href }: { icon: React.ReactNode, label: string, href: string }) {
  return (
    <a href={href} target="_blank" className="group flex items-center gap-2 px-5 py-2.5 bg-background border border-border rounded-full hover:border-primary/50 hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
      <span className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</span>
      <span className="text-xs font-mono font-bold tracking-wide group-hover:text-foreground">{label}</span>
    </a>
  );
}
