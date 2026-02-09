import Link from "next/link";
import { ArrowRight, Calendar, Hash } from "lucide-react";
import type { PostSummary } from "@/lib/posts";

type PostEntryProps = {
  post: PostSummary;
  index: number;
};

export function PostEntry({ post, index }: PostEntryProps) {
  const entryId = `LOG-${(index + 1).toString().padStart(3, "0")}`;

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group relative block bg-background/40 backdrop-blur-sm border border-border/60 p-6 transition-all duration-300 hover:border-primary/50 hover:bg-primary/[0.02]"
    >
      <div className="absolute left-0 top-0 h-1.5 w-1.5 border-l border-t border-primary/30 group-hover:border-primary transition-colors" />
      <div className="absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b border-primary/30 group-hover:border-primary transition-colors" />

      <div className="flex flex-col md:flex-row md:items-start gap-6">
        <div className="flex md:flex-col items-center md:items-start justify-between md:justify-start gap-2 min-w-[100px]">
          <span className="text-[10px] font-mono font-bold text-primary tracking-widest">
            {entryId}
          </span>
          <div className="flex items-center gap-2 md:mt-1">
            <Calendar size={10} className="text-muted-foreground/40" />
            <time className="text-[10px] font-mono text-muted-foreground">
              {post.metadata.date}
            </time>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
              {post.metadata.title}
            </h3>
            <div className="flex flex-wrap gap-3">
              {post.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center text-[9px] font-mono uppercase tracking-tighter text-muted-foreground/60 group-hover:text-muted-foreground transition-colors"
                >
                  <Hash size={8} className="mr-0.5 opacity-40" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground/80 line-clamp-2 font-sans italic opacity-80 group-hover:opacity-100 transition-opacity">
            {post.metadata.description}
          </p>
        </div>

        <div className="hidden md:flex items-center self-stretch">
          <div className="h-full w-[1px] bg-border/40 group-hover:bg-primary/30 mx-4 transition-colors" />
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all">
            <ArrowRight size={16} className="text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-0.5" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-all duration-500 group-hover:w-full" />
    </Link>
  );
}
