import type { PostSummary } from "@/lib/posts";
import { PostEntry } from "@/components/posts/post-entry";

type PostsListProps = {
  posts: PostSummary[];
};

export function PostsList({ posts }: PostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="p-10 border border-dashed border-border/60 text-center font-mono text-xs text-muted-foreground uppercase tracking-widest">
        [!] Warning: No log files detected in the current directory.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post, index) => (
        <PostEntry key={post.slug} post={post} index={index} />
      ))}
    </div>
  );
}
