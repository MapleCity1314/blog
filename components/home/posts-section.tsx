"use client";

import Link from "next/link";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { Terminal, ArrowRight, ArrowUpRight } from "lucide-react";
import type { PostSummary } from "@/lib/posts";

type PostsSectionProps = {
  posts: PostSummary[];
  scrollProgress: MotionValue<number>;
};

export default function PostsSection({ posts, scrollProgress }: PostsSectionProps) {
  const opacity = useTransform(scrollProgress, [0.2, 0.3, 0.4], [0, 1, 0]);
  const x = useTransform(scrollProgress, [0.2, 0.3, 0.4], [100, 0, -100]);

  const recentPosts = posts.slice(0, 3);

  return (
    <section className="absolute top-[100vh] w-full h-screen flex items-center justify-end px-6 md:px-20 z-10">
      <motion.div 
        style={{ opacity, x }}
        className="w-full md:w-[500px]"
      >
        <div className="flex items-center justify-between mb-8 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-md text-primary">
              <Terminal size={18} />
            </div>
            <h2 className="text-sm font-bold font-mono tracking-widest text-muted-foreground">SYSTEM_LOGS</h2>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/50">V.2.0.4</span>
        </div>

        <div className="flex flex-col gap-3">
          {recentPosts.length > 0 ? (
            recentPosts.map((post) => (
              <LogEntry key={post.slug} post={post} />
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground font-mono text-sm">
              No posts available
            </div>
          )}
        </div>

        <div className="mt-8 text-right">
          <Link href="/posts" className="inline-flex items-center gap-2 text-xs font-mono font-bold text-primary hover:text-foreground transition-colors group">
            ARCHIVE_DATABASE <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform"/>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function LogEntry({ post }: { post: PostSummary }) {
  const wordCount = post.metadata.description?.split(/\s+/).length || 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Link href={`/posts/${post.slug}`} className="group relative block">
      <div className="absolute inset-0 bg-primary/5 scale-x-95 opacity-0 group-hover:opacity-100 group-hover:scale-x-100 transition-all duration-300 rounded-sm origin-left" />

      <div className="relative flex items-baseline justify-between py-4 px-4 border-l-2 border-border group-hover:border-primary transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
            <span>{post.metadata.date || "Unknown"}</span>
            {post.metadata.tags && post.metadata.tags.length > 0 && (
              <>
                <span className="w-1 h-1 rounded-full bg-border group-hover:bg-primary transition-colors" />
                <span className="text-primary/70">{post.metadata.tags[0]}</span>
              </>
            )}
          </div>
          <h3 className="text-xl font-serif text-foreground/90 group-hover:text-primary transition-colors">
            {post.metadata.title}
          </h3>
        </div>

        <div className="hidden sm:flex items-center gap-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <span className="font-mono text-[10px] text-muted-foreground">{readTime} min</span>
          <ArrowUpRight size={14} className="text-primary" />
        </div>
      </div>
    </Link>
  );
}
