import { Cpu } from "lucide-react";

export function PostDivider() {
  return (
    <div className="relative mb-16 flex items-center justify-center">
      <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-border to-transparent" />
      <div className="relative bg-background px-4 py-1 border border-border/60 flex items-center gap-3 text-[9px] font-mono text-muted-foreground/50 uppercase tracking-[0.5em]">
        <Cpu size={12} className="animate-pulse" />
        End_of_Header_Data
      </div>
    </div>
  );
}
