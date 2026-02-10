"use client";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import type { ResourceItem } from "@/lib/types/resources";
import { cn } from "@/lib/utils";

export function ResourceCard({ resource }: { resource: ResourceItem }) {
  const isLive = resource.status === "Live";
  const tags = resource.tags ?? [];
  const shortId =
    resource.id.split("-").slice(-1)[0]?.slice(0, 4) ??
    resource.id.slice(0, 4);

  return (
    <motion.a
      layout
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative flex flex-col border border-border/60 bg-background/40 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-background/80"
    >
      {/* L-Corners */}
      <div className="absolute left-0 top-0 h-2 w-2 border-l border-t border-primary/20 transition-colors group-hover:border-primary" />
      <div className="absolute right-0 bottom-0 h-2 w-2 border-r border-b border-primary/20 transition-colors group-hover:border-primary" />

      {/* Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/40">
        {resource.image ? (
          <>
            <img
              src={resource.image}
              alt={resource.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-80 grayscale group-hover:grayscale-0 opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,oklch(0.85_0.12_250/50%),transparent_60%),linear-gradient(135deg,oklch(0.18_0.02_260),oklch(0.08_0.02_260))]" />
        )}
        
        {/* Status Tag */}
        <div className="absolute left-3 top-3 flex items-center gap-2 bg-background/90 px-2 py-1 border border-border/40 shadow-2xl">
          <span className={cn(
            "h-1.5 w-1.5 rounded-full animate-pulse",
            isLive ? "bg-emerald-500" : "bg-amber-500"
          )} />
          <span className="text-[9px] font-mono uppercase tracking-widest">{resource.status}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[9px] font-mono uppercase tracking-tighter text-primary/60">{resource.kind}</p>
            <h3 className="text-base font-bold tracking-tight group-hover:text-primary transition-colors">
              {resource.title}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/30">#{shortId}</span>
        </div>

        <p className="mb-6 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {resource.summary}
        </p>

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between border-t border-dashed border-border/30 pt-4">
          <div className="flex flex-wrap gap-2">
            {tags.length > 0 ? (
              tags.map((tag) => (
                <span key={tag} className="text-[9px] font-mono text-muted-foreground/50 lowercase">#{tag}</span>
              ))
            ) : (
              <span className="text-[9px] font-mono text-muted-foreground/40 lowercase">#uncategorized</span>
            )}
          </div>
          <ExternalLink size={14} className="text-muted-foreground/30 transition-colors group-hover:text-primary" />
        </div>
      </div>

      {/* Scanline Animation */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100">
        <div className="absolute inset-x-0 h-[1px] bg-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-scan" />
      </div>
    </motion.a>
  );
}
