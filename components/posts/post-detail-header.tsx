import type { ReactNode } from "react";
import { Calendar, ShieldCheck, Tag } from "lucide-react";

import { PostViewCount } from "@/components/posts/post-view-count";

type PostMetadata = {
  title: string;
  date: string;
  tags: string[];
};

type PostDetailHeaderProps = {
  slug: string;
  metadata: PostMetadata;
  actions?: ReactNode;
};

export function PostDetailHeader({ slug, metadata, actions }: PostDetailHeaderProps) {
  return (
    <header className="relative -mt-20 mb-16 p-8 bg-background/80 backdrop-blur-xl border border-border/60 shadow-2xl">
      <div className="absolute left-0 top-0 h-3 w-3 border-l border-t border-primary" />
      <div className="absolute right-0 bottom-0 h-3 w-3 border-r border-b border-primary" />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono uppercase tracking-widest text-primary/70">
          <span className="px-2 py-0.5 border border-primary/30 bg-primary/5">
            ENTRY_{slug.toUpperCase().slice(0, 6)}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} /> {metadata.date}
          </span>
          <PostViewCount slug={slug} />
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-500" /> STATUS: DECRYPTED
          </span>
          {actions ? <div className="ml-auto flex items-center">{actions}</div> : null}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground leading-tight italic uppercase">
          {metadata.title}
        </h1>

        <div className="flex flex-wrap gap-2">
          {metadata.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-muted/30 px-2 py-0.5 border border-border/40"
            >
              <Tag size={10} /> {tag}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
