"use client";

import dynamic from "next/dynamic";
import type { AdminPost } from "@/lib/admin/posts";

const PostStudio = dynamic(() => import("./post-studio"), {
  ssr: false,
  loading: () => (
    <div className="border border-border/70 bg-background/40 p-6 text-xs text-muted-foreground">
      Loading editor...
    </div>
  ),
});

export default function PostStudioClient({ post }: { post: AdminPost }) {
  return <PostStudio post={post} />;
}
