import Link from "next/link";
import { getPostSummaries } from "@/lib/posts";
import { Terminal, ArrowRight, Hash } from "lucide-react";
import AmbientBackground from "@/components/ambient-background";
import { cn } from "@/lib/utils";

export default async function PostsPage() {
  const posts = await getPostSummaries();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-zinc-800 selection:text-zinc-100 dark:selection:bg-zinc-200 dark:selection:text-zinc-900">
      <AmbientBackground />
      
      <main className="max-w-3xl mx-auto px-6 py-20 lg:py-32">
        {/* Header: 极简风格 */}
        <div className="flex items-center gap-3 mb-16 opacity-80">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <Terminal size={14} className="text-foreground" />
          </div>
          <h1 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">
            System_Logs
          </h1>
        </div>

        {/* Posts List */}
        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-3 sm:ml-4 space-y-12 pb-12">
          {posts.length === 0 ? (
            <div className="pl-8 sm:pl-12 py-4 text-muted-foreground font-mono text-sm">
              <p>_No entries found.</p>
              <p className="mt-2 opacity-50 text-xs">Waiting for input in content/posts/...</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.slug} className="relative pl-8 sm:pl-12 group">
                {/* 时间轴节点: 移动端优化，选中态增强 */}
                <div className="absolute left-[-4px] top-2 h-2 w-2 rounded-full border border-background bg-zinc-300 ring-4 ring-background transition-all group-hover:bg-foreground group-hover:scale-110 dark:bg-zinc-700 dark:group-hover:bg-zinc-100" />
                
                <Link 
                  href={`/posts/${post.slug}`}
                  className="block space-y-3 transition-opacity hover:opacity-100"
                >
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-muted-foreground/80">
                    <time className="font-medium text-foreground/80">{post.metadata.date}</time>
                    <span className="text-zinc-300 dark:text-zinc-700">/</span>
                    <div className="flex gap-2">
                      {post.metadata.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-0.5 hover:text-foreground transition-colors">
                          <Hash size={10} className="opacity-50" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors group-hover:underline group-hover:decoration-zinc-400/50 group-hover:underline-offset-4">
                    {post.metadata.title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 md:w-11/12">
                    {post.metadata.description}
                  </p>
                  
                  {/* Link indicator */}
                  <div className="flex items-center gap-1 text-xs font-medium text-foreground/60 group-hover:text-foreground pt-1">
                    Read Entry <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}