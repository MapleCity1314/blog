"use client";

import { motion } from "framer-motion";
import { Heart, Link as LinkIcon, Lock } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { AboutPartner } from "@/lib/data/about";

type NeuralLinkModuleProps = {
  partner: AboutPartner;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function getDaysTogether(startTime: number, now: number) {
  if (!Number.isFinite(startTime)) return 0;
  return Math.max(0, Math.floor((now - startTime) / MS_PER_DAY));
}

export function NeuralLinkModule({ partner }: NeuralLinkModuleProps) {
  const startTime = useMemo(() => new Date(partner.startDate).getTime(), [partner.startDate]);
  const [daysTogether, setDaysTogether] = useState(() => getDaysTogether(startTime, Date.now()));

  useEffect(() => {
    setDaysTogether(getDaysTogether(startTime, Date.now()));
    const interval = setInterval(() => {
      setDaysTogether(getDaysTogether(startTime, Date.now()));
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return (
    <div className="relative group p-4 rounded-xl border border-pink-500/20 bg-background/40 backdrop-blur-sm overflow-hidden hover:border-pink-500/40 transition-all duration-500">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_14px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-pink-500/80 uppercase tracking-wider">
          <LinkIcon size={12} className="animate-pulse" />
          <span>Dual_Core Link</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
          <Lock size={10} />
          <span>E2EE</span>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 relative z-10">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-primary/30 p-0.5 relative">
            <div className="w-full h-full rounded-full bg-muted overflow-hidden">
              <img src={partner.myAvatar} alt="Me" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{partner.alias1}</span>
        </div>

        <div className="flex-1 flex flex-col items-center px-2">
          <div className="relative w-full h-px bg-gradient-to-r from-blue-500/20 via-pink-500/50 to-purple-500/20">
            <motion.div
              className="absolute top-[-1px] left-0 w-2 h-0.5 bg-pink-400 blur-[1px]"
              animate={{ left: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <div className="mt-2 flex items-center gap-1 text-pink-400">
            <Heart size={10} className="fill-pink-400/50 animate-pulse" />
            <span className="text-xs font-bold font-mono tabular-nums">{daysTogether}d</span>
          </div>
          <span className="text-[9px] text-muted-foreground/50 scale-90 uppercase">Connection Uptime</span>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 border border-pink-500/30 p-0.5 relative">
            <div className="w-full h-full rounded-full bg-muted overflow-hidden">
              <img src={partner.partnerAvatar} alt="Partner" className="w-full h-full object-cover opacity-80" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">{partner.alias2}</span>
        </div>
      </div>
    </div>
  );
}
