import { NextResponse } from "next/server";
import { getPostsWithContent } from "@/lib/posts";


type SearchResult = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const posts = await getPostsWithContent();
  const results = posts
    .map((post) => ({
      slug: post.slug,
      title: post.metadata.title,
      description: post.metadata.description,
      date: post.metadata.date,
      tags: post.metadata.tags,
      content: post.content,
    }))
    .filter((post) => {
      const haystack = [
        post.title,
        post.description,
        post.slug,
        post.tags.join(" "),
        post.content,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    })
    .slice(0, 8)
    .map(({ content: _content, ...rest }) => rest);

  return NextResponse.json({ results });
}
