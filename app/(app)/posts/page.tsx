import { getPostSummaries } from "@/lib/posts";
import AmbientBackground from "@/components/ambient-background";
import { PostsHeader } from "@/components/posts/posts-header";
import { PostsList } from "@/components/posts/posts-list";

export default async function PostsPage() {
  const posts = await getPostSummaries();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <AmbientBackground />

      <main className="max-w-4xl mx-auto px-6 py-20 lg:py-32">
        <PostsHeader total={posts.length} />
        <PostsList posts={posts} />
      </main>
    </div>
  );
}
