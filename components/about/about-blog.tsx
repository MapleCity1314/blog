import type { ComponentType } from "react";
import { Monitor, Cpu, Layers, Palette, Terminal } from "lucide-react";
import { SectionTitle } from "./section-title";
import type { AboutBlog as AboutBlogData, AboutBlogSpecIcon } from "@/lib/data/about";

const ICONS: Record<AboutBlogSpecIcon, ComponentType<{ size?: number }>> = {
  cpu: Cpu,
  layers: Layers,
  palette: Palette,
  monitor: Monitor,
};

type AboutBlogProps = {
  data: AboutBlogData;
};

export function AboutBlog({ data }: AboutBlogProps) {
  return (
    <section className="relative">
      <SectionTitle title={data.title} icon={<Terminal size={16} />} />
      
      <div className="relative overflow-hidden border border-border/60 bg-background/40 backdrop-blur-md">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[grid]" />
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 border-b md:border-b-0 md:border-r border-border/60">
            <h3 className="text-xl font-bold tracking-tighter uppercase italic mb-4">{data.overviewTitle}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 font-light">
              {data.overviewBody}
            </p>
            <div className="flex items-center gap-4">
               <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-primary/60 uppercase">{data.buildStatusLabel}</span>
                  <span className="text-xs font-mono font-bold text-emerald-500">{data.buildStatusValue}</span>
               </div>
               <div className="h-8 w-px bg-border/60" />
               <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-primary/60 uppercase">{data.versionLabel}</span>
                  <span className="text-xs font-mono font-bold">{data.versionValue}</span>
               </div>
            </div>
          </div>

          <div className="p-8 space-y-4 bg-primary/[0.01]">
            {data.specs.map((spec) => {
              const Icon = ICONS[spec.icon];
              return (
                <div key={spec.label} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="text-primary/40 group-hover:text-primary transition-colors">
                      <Icon size={14} />
                    </div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {spec.label}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono tracking-tight text-foreground/80">
                    {spec.value}
                  </span>
                </div>
              );
            })}
            
            <div className="mt-6 pt-6 border-t border-dashed border-border/60">
              <div className="text-[9px] font-mono text-muted-foreground/40 leading-tight">
                {data.footerLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-primary/40" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-primary/40" />
      </div>
    </section>
  );
}
