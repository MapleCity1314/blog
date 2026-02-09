import { cacheLife } from "next/cache";

import PhantomTOC from "@/components/mdx/phantom-toc";
import { getPostBySlugAsync } from "@/lib/posts";
import { extractHeadings } from "@/lib/toc";

type PostTOCProps = {
  slug: string;
  content?: string;
};

export async function PostTOC({ slug, content }: PostTOCProps) {
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

  const headings = extractHeadings(source);
  return <PhantomTOC headings={headings} />;
}
