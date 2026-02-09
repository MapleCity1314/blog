"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Library, Database, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResourceItem } from "@/lib/types/resources";

type ResourcesSectionProps = {
  scrollProgress: MotionValue<number>;
  resources: ResourceItem[];
};

export default function ResourcesSection({ scrollProgress, resources }: ResourcesSectionProps) {
  // 保持原有的滚动动画逻辑
  const opacity = useTransform(scrollProgress, [0.5, 0.6, 0.7], [0, 1, 0]);
  const x = useTransform(scrollProgress, [0.5, 0.6, 0.7], [-100, 0, 100]);

  // 仅在首屏展示前 4 个资源作为预览
  const previewResources = resources.slice(0, 4);

  return (
    <section className="absolute top-[200vh] z-10 flex h-screen w-full items-center justify-start px-6 md:px-20">
      <motion.div style={{ opacity, x }} className="w-full max-w-5xl">
        {/* Header: 系统报头风格 */}
        <div className="mb-8 flex items-end justify-between border-b border-border/60 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center border border-primary/30 bg-primary/5 text-primary">
              <Database size={24} />
              <div className="absolute -right-1 -top-1 h-2 w-2 animate-pulse bg-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground/60">
                  Status: Database_Active
                </span>
              </div>
              <h2 className="text-2xl font-bold uppercase tracking-tighter italic">
                Resource_Atlas
              </h2>
            </div>
          </div>
          <div className="hidden flex-col items-end font-mono text-[10px] uppercase tracking-widest text-muted-foreground/40 md:flex">
            <span>Access_Level: Unrestricted</span>
            <span>Registry_Ver: 1.0.4</span>
          </div>
        </div>

        <p className="mb-10 max-w-xl text-sm leading-relaxed text-muted-foreground/80 border-l-2 border-primary/20 pl-4">
          A curated snapshot of upcoming technical modules and design assets. 
          These entries are currently being indexed for the central hub.
        </p>

        {/* Grid: 更加紧凑的预览网格 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {previewResources.map((resource) => (
            <ResourcePreviewCard key={resource.id} resource={resource} />
          ))}
        </div>

        {/* Footer Link */}
        <div className="mt-10 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-[9px] text-muted-foreground/40 uppercase">
                <Zap size={10} />
                Click_Entry_To_Initialize_Connection
            </div>
            <Link
                href="/resources"
                className="group inline-flex items-center gap-3 bg-primary/10 px-6 py-2 text-xs font-mono font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground"
            >
                OPEN_FULL_REGISTRY
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
        </div>
      </motion.div>
    </section>
  );
}

function ResourcePreviewCard({ resource }: { resource: ResourceItem }) {
  // 根据新版 status 映射颜色
  const statusColor = {
    Live: "bg-emerald-500",
    Curating: "bg-amber-500",
    Drafting: "bg-zinc-500",
  }[resource.status];

  return (
    <Link
      href="/resources"
      className="group relative flex flex-col overflow-hidden border border-border/60 bg-background/40 backdrop-blur-sm transition-all duration-300 hover:border-primary/50"
    >
      {/* 装饰边角 */}
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-primary/30 transition-colors group-hover:border-primary" />
      <div className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-primary/30 transition-colors group-hover:border-primary" />

      {/* 图片预览区 */}
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/40">
        <img
          src={resource.image}
          alt={resource.title}
          className="h-full w-full object-cover opacity-40 grayscale transition-all duration-500 group-hover:scale-110 group-hover:opacity-80 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        
        {/* 小 ID 标签 */}
        <div className="absolute bottom-2 left-3 text-[9px] font-mono text-white/40 group-hover:text-primary">
          {resource.id}
        </div>
      </div>

      {/* 内容区 */}
      <div className="p-4">
        <div className="mb-1 text-[9px] font-mono uppercase tracking-widest text-primary/60">
          {resource.kind}
        </div>
        <h3 className="mb-3 line-clamp-1 text-sm font-bold tracking-tight transition-colors group-hover:text-primary">
          {resource.title}
        </h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={cn("h-1 w-1 rounded-full animate-pulse", statusColor)} />
            <span className="text-[9px] font-mono uppercase text-muted-foreground">{resource.status}</span>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground/30 uppercase group-hover:text-primary/40 transition-colors">
            View_Data
          </div>
        </div>
      </div>

      {/* 扫描动画线 */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute inset-x-0 h-[1px] bg-primary/10 opacity-0 group-hover:animate-scan group-hover:opacity-100" />
      </div>
    </Link>
  );
}
