import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPostBySlug, getPosts } from "@/lib/posts";
import { useMDXComponents } from "@/mdx-components";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import AmbientBackground from "@/components/ambient-background";
import PhantomTOC from "@/components/mdx/phantom-toc";
import { extractHeadings } from "@/lib/toc";
import { ArrowLeft, Calendar, Tag } from "lucide-react";
import Link from "next/link";

// 静态生成所有文章路径（SSG）
export async function generateStaticParams() {
  const posts = getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// 插件配置：代码高亮
const options = {
  theme: "one-dark-pro", // 或者 'github-dark', 'dracula'
  keepBackground: false,
  // rehype-pretty-code 会自动在 pre 和 code 标签上添加 data-language 属性
};

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // 1. 提取标题数据
  const headings = extractHeadings(post.content);

  // 获取自定义组件
  const components = useMDXComponents({});

  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden selection:bg-primary selection:text-white">
      <AmbientBackground />
      
      <main className="max-w-3xl mx-auto px-6 py-24">
        {/* 返回按钮 */}
        <Link href="/posts" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-12 group font-mono">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            BACK_TO_LOGS
        </Link>

        {/* 文章头部元数据 */}
        <header className="mb-12 space-y-6 border-b border-border pb-12">
            <div className="flex gap-2">
                {post.metadata.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold uppercase">
                        {tag}
                    </span>
                ))}
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                {post.metadata.title}
            </h1>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground font-mono">
                <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{post.metadata.date}</span>
                </div>
                <div>// {post.slug}</div>
            </div>
        </header>
        
        {/* MDX 内容渲染区 */}
        <article className="max-w-none space-y-6
            [&_h1]:scroll-mt-20 [&_h2]:scroll-mt-20 [&_h3]:scroll-mt-20
            [&_pre]:bg-muted/30 [&_pre]:dark:bg-muted/50 [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto
            [&_code]:before:content-none [&_code]:after:content-none
        ">
          <MDXRemote
            source={post.content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkMath, remarkGfm],
                // 添加 rehypeSlug 自动生成 id，rehypeKatex 渲染数学公式
                // 注意：rehypeKatex 必须在 rehypePrettyCode 之前，避免冲突
                rehypePlugins: [
                  rehypeKatex,
                  [rehypePrettyCode, options], 
                  rehypeSlug,
                ], 
              },
            }}
          />
        </article>
      </main>

      {/* Phantom TOC - 固定在右侧 */}
      <PhantomTOC headings={headings} />
    </div>
  );
}
