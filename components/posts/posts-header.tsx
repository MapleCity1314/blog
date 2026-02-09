import { Fingerprint, ShieldCheck, Terminal } from "lucide-react";

type PostsHeaderProps = {
  total: number;
};

export function PostsHeader({ total }: PostsHeaderProps) {
  return (
    <header className="relative mb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center bg-primary/10 border border-primary/20 text-primary">
          <Terminal size={18} />
        </div>
        <div>
          <h1 className="text-[10px] font-mono uppercase tracking-[0.4em] text-primary leading-none mb-1">
            Directory_System
          </h1>
          <h2 className="text-3xl font-bold tracking-tighter uppercase italic italic-shaping">
            System_Logs
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6 py-4 border-y border-border/40 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <ShieldCheck size={12} className="text-emerald-500" />
          Access: UNRESTRICTED
        </div>
        <div className="flex items-center gap-2">
          <Fingerprint size={12} />
          Status: {total} ENTRIES_LOADED
        </div>
        <div className="ml-auto hidden md:block">
          Loc: /root/logs
        </div>
      </div>
    </header>
  );
}
