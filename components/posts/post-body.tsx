import { cache } from "react";
import { cacheLife } from "next/cache";
import { evaluate } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { getPostBySlugAsync } from "@/lib/posts";
import { useMDXComponents } from "@/mdx-components";

const getMDXComponents = cache(() => useMDXComponents({}));

type PostBodyProps = {
  slug: string;
  content?: string;
};

export async function PostBody({ slug, content }: PostBodyProps) {
  "use cache";
  cacheLife("max");

  let source = content ?? "";

  if (!source) {
    const post = await getPostBySlugAsync(slug);
    if (!post) {
      return null;
    }
    source = post.content;
  }

  const components = getMDXComponents();

  try {
    const result = await evaluate(source, {
      ...runtime,
      remarkPlugins: [remarkMath, remarkGfm],
      rehypePlugins: [rehypeKatex, rehypeSlug],
    });
    const Content = result.default as (props: { components?: Record<string, unknown> }) => any;

    return (
      <article className="max-w-none break-words">
        <Content components={components as Record<string, unknown>} />
      </article>
    );
  } catch {
    return (
      <article className="max-w-none break-words">
        <div className="rounded-lg border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          This post content has an MDX rendering error. Please open it in admin and fix syntax.
        </div>
      </article>
    );
  }
}
