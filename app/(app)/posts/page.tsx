import Link from "next/link";
import { getPosts } from "@/lib/posts";
import { Terminal, Calendar, ArrowUpRight } from "lucide-react";
import AmbientBackground from "@/components/ambient-background";

export default function PostsPage() {
  const posts = getPosts();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <AmbientBackground />
      
      <main className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-12">
          <Terminal size={18} className="text-primary" />
          <h1 className="text-sm font-mono uppercase tracking-widest text-muted-foreground">
            SYSTEM_LOGS
          </h1>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Posts List */}
        <div className="flex flex-col gap-0 border-l border-border ml-2">
          {posts.length === 0 ? (
            <div className="pl-8 py-12 text-center text-muted-foreground">
              <p className="font-mono text-sm">No posts found.</p>
              <p className="font-mono text-xs mt-2">Create your first post in content/posts/</p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <Link 
                key={post.slug} 
                href={`/posts/${post.slug}`} 
                className="group relative pl-8 py-6 hover:bg-muted/30 transition-colors"
              >
                {/* 时间轴节点 */}
                <div className="absolute left-[-5px] top-8 w-2.5 h-2.5 rounded-full border-2 border-background bg-border group-hover:bg-primary group-hover:scale-125 transition-all" />
                
                <article className="space-y-2">
                  <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                    <Calendar size={12} />
                    <time>{post.metadata.date}</time>
                    <span className="text-primary/50">/</span>
                    <div className="flex gap-2">
                      {post.metadata.tags.map(tag => (
                        <span key={tag} className="text-foreground/70">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-serif italic group-hover:text-primary transition-colors">
                    {post.metadata.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.metadata.description}
                  </p>
                  
                  <div className="pt-2 flex items-center text-xs font-bold uppercase tracking-wider text-primary opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Read Entry <ArrowUpRight size={12} className="ml-1" />
                  </div>
                </article>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
