import { MDXRemote } from "next-mdx-remote/rsc";
import { cache } from "react";
import { cacheLife } from "next/cache";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

import { getPostBySlugAsync } from "@/lib/posts";
import { useMDXComponents } from "@/mdx-components";

const rehypePrettyCodeOptions = {
  theme: "one-dark-pro",
  keepBackground: false,
  defaultLang: "text",
} as Parameters<typeof rehypePrettyCode>[0];

const getMDXComponents = cache(() => useMDXComponents({}));

type PostBodyProps = {
  slug: string;
  content?: string;
};

export async function PostBody({ slug, content }: PostBodyProps) {
  let source = content ?? "";

  if (!source) {
    "use cache";
    cacheLife("max");

    const post = await getPostBySlugAsync(slug);
    if (!post) {
      return null;
    }
    source = post.content;
  }

  const components = getMDXComponents();

  return (
    <article className="max-w-none break-words">
      <MDXRemote
        source={source}
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
