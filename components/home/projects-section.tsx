"use client";

import Link from "next/link";
import { motion, useTransform } from "framer-motion";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type ProjectsSectionProps = {
  scrollProgress: any;
};

const projects = [
  { id: "01", name: "Presto Theme", type: "VS Code", status: "Live" },
  { id: "02", name: "Ether Folio", type: "DApp", status: "Beta" },
  { id: "03", name: "Ghost UI", type: "Library", status: "Dev" },
];

export default function ProjectsSection({ scrollProgress }: ProjectsSectionProps) {
  const opacity = useTransform(scrollProgress, [0.5, 0.6, 0.7], [0, 1, 0]);
  const x = useTransform(scrollProgress, [0.5, 0.6, 0.7], [-100, 0, 100]);

  return (
    <section className="absolute top-[200vh] w-full h-screen flex items-center justify-start px-6 md:px-20 z-10">
      <motion.div 
        style={{ opacity, x }}
        className="w-full md:w-[600px]"
      >
        <div className="flex items-center gap-4 mb-12">
          <div className="h-px w-8 bg-primary" />
          <h2 className="text-sm font-bold font-mono tracking-widest text-muted-foreground uppercase">Active Modules</h2>
        </div>
        
        {/* 工业风 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {projects.map((proj) => (
            <ProjectCard key={proj.id} {...proj} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

// 项目卡片组件：工业蓝图风格
function ProjectCard({ id, name, type, status }: { id: string, name: string, type: string, status: string }) {
  return (
    <Link href="#" className="group relative block bg-background/40 border border-border/60 hover:border-primary/50 transition-all duration-300 overflow-hidden">
      {/* 角落装饰 (Crop Marks) */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/30 group-hover:border-primary transition-colors" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-primary/30 group-hover:border-primary transition-colors" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-primary/30 group-hover:border-primary transition-colors" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/30 group-hover:border-primary transition-colors" />

      <div className="p-6 space-y-8">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="block font-mono text-[9px] text-muted-foreground/60 uppercase tracking-widest">{type}</span>
            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{name}</h3>
          </div>
          <span className="font-mono text-[10px] text-muted-foreground/30 group-hover:text-primary/50">#{id}</span>
        </div>

        <div className="flex justify-between items-end pt-4 border-t border-dashed border-border/30">
          <div className="flex items-center gap-1.5">
            <span className={cn("w-1.5 h-1.5 rounded-full", status === 'Live' ? "bg-emerald-500" : "bg-amber-500")} />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">{status}</span>
          </div>
          <Layers size={16} className="text-muted-foreground/40 group-hover:text-primary transition-colors group-hover:-translate-y-1 transform duration-300" />
        </div>
      </div>
      
      {/* 悬停时的扫描光效 */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
    </Link>
  );
}
