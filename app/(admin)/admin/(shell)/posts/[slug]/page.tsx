import type { Metadata } from "next";
import Link from "next/link";
import AdminEmptyState from "../../components/admin-empty-state";
import { getAdminPostBySlug } from "@/lib/admin/posts";
import PostStudioClient from "./post-studio-client";

export const metadata: Metadata = {
  title: "Post Studio",
  description: "Immersive editor for a single post.",
};

export default async function AdminPostEditorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getAdminPostBySlug(slug);

  if (!post) {
    return (
      <AdminEmptyState>
        Post not found. Return to the post list and create a new entry.
      </AdminEmptyState>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <Link
          href="/admin/posts"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
        >
          Back to posts
        </Link>
        <Link
          href={`/posts/${post.slug}`}
          className="rounded-full border border-border/60 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground transition hover:border-primary/40 hover:text-primary"
        >
          Open public page
        </Link>
      </header>

      <PostStudioClient post={post} />
    </div>
  );
}
