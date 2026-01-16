"use client";

import { cn } from "@/lib/utils";

interface AmbientBackgroundProps {
  className?: string;
  gridColor?: string; // 可选：自定义网格颜色
}

export default function AmbientBackground({ 
  className 
}: AmbientBackgroundProps) {
  return (
    <div className={cn("fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-background", className)}>
      
      {/* 1. 噪点纹理 (Noise) - 增加胶片/纸张质感 */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      />
      
      {/* 2. 基础网格 (Base Grid) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* 3. 氛围光 (Ambient Light) - 顶部中间的微光 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 blur-[120px] rounded-[100%]" />
      
      {/* 4. 底部反光 - 增加立体感 */}
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-background via-background/80 to-transparent" />
    </div>
  );
}