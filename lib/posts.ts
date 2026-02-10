import fs from "fs";
import matter from "gray-matter";
import { cache } from "react";
import { cacheLife } from "next/cache";
import { listPostFileEntries, resolvePostFilePath } from "@/lib/post-files";

export type Post = {
  slug: string;
  metadata: {
    title: string;
    date: string;
    description: string;
    tags: string[];
    published: boolean;
    cover?: string;
  };
  content: string;
};

export type PostSummary = Omit<Post, "content">;
export type PostMetadata = Post["metadata"];

const normalizeMetadata = (data: Record<string, any>, fallbackDate: string): Post["metadata"] => ({
  title: data.title || "Untitled",
  date: data.date || fallbackDate,
  description: data.description || "",
  tags: Array.isArray(data.tags) ? data.tags : [],
  published: data.published !== false,
  cover: typeof data.cover === "string" ? data.cover : undefined,
});

const sortByDateDesc = (a: Post["metadata"], b: Post["metadata"]) => {
  if (a.date < b.date) {
    return 1;
  }
  return -1;
};

// List page only needs frontmatter; avoid loading MDX content into memory.
export const getPostSummaries = async (): Promise<PostSummary[]> => {
  "use cache";
  cacheLife("max");

  const entries = await listPostFileEntries();

  const allPostsData = await Promise.all(
    entries.map(async ({ slug, filePath: fullPath }) => {
      const [fileContents, stats] = await Promise.all([
        fs.promises.readFile(fullPath, "utf8"),
        fs.promises.stat(fullPath),
      ]);
      const fallbackDate = stats.mtime.toISOString().split("T")[0];

      const { data } = matter(fileContents);
      const metadata = normalizeMetadata(data, fallbackDate);

      return {
        slug,
        metadata,
      };
    })
  );

  return allPostsData
    .filter((post) => post.metadata.published !== false)
    .sort((a, b) => sortByDateDesc(a.metadata, b.metadata));
};

// Search needs full content; keep separate to avoid heavy work on list routes.
export const getPostsWithContent = async (): Promise<Post[]> => {
  "use cache";
  cacheLife("max");

  const entries = await listPostFileEntries();

  const allPostsData = await Promise.all(
    entries.map(async ({ slug, filePath: fullPath }) => {
      const [fileContents, stats] = await Promise.all([
        fs.promises.readFile(fullPath, "utf8"),
        fs.promises.stat(fullPath),
      ]);
      const fallbackDate = stats.mtime.toISOString().split("T")[0];

      const { data, content } = matter(fileContents);
      const metadata = normalizeMetadata(data, fallbackDate);

      return {
        slug,
        metadata,
        content,
      };
    })
  );

  return allPostsData
    .filter((post) => post.metadata.published !== false)
    .sort((a, b) => sortByDateDesc(a.metadata, b.metadata));
};

export const getPostMetadataBySlug = async (slug: string): Promise<PostMetadata | null> => {
  "use cache";
  cacheLife("max");

  try {
    const fullPath = resolvePostFilePath(slug);
    if (!fullPath) {
      return null;
    }
    const [fileContents, stats] = await Promise.all([
      fs.promises.readFile(fullPath, "utf8"),
      fs.promises.stat(fullPath),
    ]);
    const fallbackDate = stats.mtime.toISOString().split("T")[0];
    const { data } = matter(fileContents);
    return normalizeMetadata(data, fallbackDate);
  } catch (e) {
    return null;
  }
};

// Detail page requires full content; cache to avoid repeated IO in dev.
export const getPostBySlug = cache((slug: string): Post | null => {
  try {
    const fullPath = resolvePostFilePath(slug);
    if (!fullPath) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const stats = fs.statSync(fullPath);
    const fallbackDate = stats.mtime.toISOString().split("T")[0];
    const { data, content } = matter(fileContents);

    const metadata = normalizeMetadata(data, fallbackDate);

    return {
      slug,
      metadata,
      content,
    };
  } catch (e) {
    return null;
  }
});

// Async version for Suspense streaming boundaries.
export const getPostBySlugAsync = async (slug: string): Promise<Post | null> => {
  "use cache";
  cacheLife("max");

  try {
    const fullPath = resolvePostFilePath(slug);
    if (!fullPath) {
      return null;
    }
    const [fileContents, stats] = await Promise.all([
      fs.promises.readFile(fullPath, "utf8"),
      fs.promises.stat(fullPath),
    ]);
    const fallbackDate = stats.mtime.toISOString().split("T")[0];
    const { data, content } = matter(fileContents);
    const metadata = normalizeMetadata(data, fallbackDate);

    return {
      slug,
      metadata,
      content,
    };
  } catch (e) {
    return null;
  }
};
