import fs from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { cache } from "react";
import { getPostsWithContent } from "@/lib/posts";


type SearchResult = {
  slug: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
};

type SearchIndexItem = SearchResult & {
  content: string;
};

const searchIndexPath = path.join(process.cwd(), "public", "search-index.json");

const loadSearchIndex = cache(async (): Promise<SearchIndexItem[] | null> => {
  try {
    const raw = await fs.readFile(searchIndexPath, "utf8");
    const data = JSON.parse(raw) as SearchIndexItem[];
    return Array.isArray(data) ? data : null;
  } catch (error) {
    return null;
  }
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const indexedPosts = await loadSearchIndex();
  const posts = indexedPosts ?? (await getPostsWithContent()).map((post) => ({
    slug: post.slug,
    title: post.metadata.title,
    description: post.metadata.description,
    date: post.metadata.date,
    tags: post.metadata.tags,
    content: post.content,
  }));

  const results = posts
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
