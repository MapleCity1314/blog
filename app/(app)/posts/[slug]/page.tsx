import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlugAsync, getPostMetadataBySlug, getPostSummaries } from "@/lib/posts";
import { useMDXComponents } from "@/mdx-components";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import AmbientBackground from "@/components/ambient-background";
import PhantomTOC from "@/components/mdx/phantom-toc";
import { extractHeadings } from "@/lib/toc";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import Link from "next/link";
import { Suspense, cache } from "react";
import { cacheLife } from "next/cache";

export async function generateStaticParams() {
  const posts = await getPostSummaries();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

const rehypePrettyCodeOptions = {
  theme: "one-dark-pro",
  keepBackground: false,
  defaultLang: "text",
} as Parameters<typeof rehypePrettyCode>[0];

const getMDXComponents = cache(() => useMDXComponents({}));

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const metadata = await getPostMetadataBySlug(slug);

  if (!metadata) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden selection:bg-zinc-800 selection:text-zinc-100 dark:selection:bg-zinc-200 dark:selection:text-zinc-900">
      <AmbientBackground />

      <main className="max-w-3xl mx-auto px-6 py-24">
        {/* Back Button */}
        <Link 
          href="/posts" 
          className="inline-flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors mb-10 group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          cd ..
        </Link>

        {/* Post Header: 更干净的布局 */}
        <header className="mb-14 space-y-6">
          <div className="flex flex-wrap gap-2">
            {metadata.tags.map((tag) => (
              <span 
                key={tag} 
                className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-2.5 py-0.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
              >
                <Tag size={10} className="opacity-70" />
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            {metadata.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-muted-foreground font-mono border-b border-zinc-100 dark:border-zinc-800 pb-8">
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{metadata.date}</span>
            </div>
            {/* 假如你有阅读时间数据，可以在这里加 */}
            {/* <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>5 min read</span>
            </div> */}
          </div>
        </header>

        <Suspense fallback={<PostBodyFallback />}>
          <PostBody slug={slug} />
        </Suspense>
      </main>

      {/* TOC: 仅在宽屏显示，不影响移动端 */}
      <div className="hidden xl:block">
        <Suspense fallback={null}>
          <PostTOC slug={slug} />
        </Suspense>
      </div>
    </div>
  );
}

async function PostBody({ slug }: { slug: string }) {
  "use cache";
  cacheLife("max");

  const post = await getPostBySlugAsync(slug);
  if (!post) {
    return null;
  }

  const components = getMDXComponents();

  return (
    <article className="max-w-none break-words">
      <MDXRemote
        source={post.content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkMath, remarkGfm],
            rehypePlugins: [
              rehypeKatex,
              [rehypePrettyCode, rehypePrettyCodeOptions],
              rehypeSlug,
            ],
          },
        }}
      />
    </article>
  );
}

async function PostTOC({ slug }: { slug: string }) {
  "use cache";
  cacheLife("max");

  const post = await getPostBySlugAsync(slug);
  if (!post) {
    return null;
  }

  const headings = extractHeadings(post.content);
  return <PhantomTOC headings={headings} />;
}

function PostBodyFallback() {
  return (
    <article className="max-w-none space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 animate-pulse">
          <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </article>
  );
}