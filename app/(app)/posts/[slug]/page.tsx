import { notFound } from "next/navigation";
import { Suspense } from "react";

import AmbientBackground from "@/components/ambient-background";
import { PostBody } from "@/components/posts/post-body";
import { PostBodyFallback } from "@/components/posts/post-body-fallback";
import { PostCover } from "@/components/posts/post-cover";
import { PostDetailHeader } from "@/components/posts/post-detail-header";
import { PostDivider } from "@/components/posts/post-divider";
import { PostEngagementPanel } from "@/components/posts/post-engagement-panel";
import { PostHeaderActions } from "@/components/posts/post-header-actions";
import { PostTOC } from "@/components/posts/post-toc";
import { getPostEngagementSnapshot, listPostComments } from "@/lib/post-engagement";
import { getPostBySlugAsync, getPostSummaries } from "@/lib/posts";
import { cn, getRandomCover } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await getPostSummaries();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostBySlugAsync(slug);

  if (!post) notFound();

  const coverImage = post.metadata.cover || getRandomCover(slug);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://icstudio.top";
  const postUrl = `${baseUrl}/posts/${slug}`;
  const [engagement, comments] = await Promise.all([
    getPostEngagementSnapshot(slug),
    listPostComments(slug),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden selection:bg-primary/30">
      <AmbientBackground />

      <PostCover image={coverImage} />

      <main className="max-w-4xl mx-auto px-6 pb-24 relative">
        <PostDetailHeader
          slug={slug}
          metadata={post.metadata}
          actions={
            <PostHeaderActions
              title={post.metadata.title}
              date={post.metadata.date}
              description={post.metadata.description}
              tags={post.metadata.tags}
              cover={post.metadata.cover}
              content={post.content}
              url={postUrl}
            />
          }
        />
        <PostDivider />

        <div
          className={cn(
            "max-w-3xl mx-auto",
            "font-quicksand font-medium leading-relaxed",
            "prose prose-zinc dark:prose-invert"
          )}
        >
          <Suspense fallback={<PostBodyFallback />}>
            <PostBody slug={slug} content={post.content} />
          </Suspense>
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <PostEngagementPanel
            slug={slug}
            postUrl={postUrl}
            initialEngagement={engagement}
            initialComments={comments}
          />
        </div>
      </main>

      <div className="hidden xl:block">
        <Suspense fallback={null}>
          <PostTOC slug={slug} content={post.content} />
        </Suspense>
      </div>
    </div>
  );
}
