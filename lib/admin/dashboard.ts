import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { cacheLife } from "next/cache";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { friendRequests } from "@/lib/db/schema";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const searchIndexPath = path.join(process.cwd(), "public", "search-index.json");

type SearchIndexStatus = {
  exists: boolean;
  sizeBytes: number;
  updatedAt: string | null;
};

export type AdminDashboardStats = {
  publishedPosts: number;
  draftPosts: number;
  pendingFriendRequests: number;
  searchIndex: SearchIndexStatus;
  lastUpdatedAt: string;
};

async function countPosts() {
  if (!fs.existsSync(postsDirectory)) {
    return { published: 0, drafts: 0 };
  }

  const fileNames = await fs.promises.readdir(postsDirectory);
  const mdxNames = fileNames.filter((fileName) => fileName.endsWith(".mdx"));

  const results = await Promise.all(
    mdxNames.map(async (fileName) => {
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = await fs.promises.readFile(fullPath, "utf8");
      const { data } = matter(fileContents);
      return data.published !== false;
    })
  );

  const published = results.filter(Boolean).length;
  return { published, drafts: results.length - published };
}

async function countPendingFriendRequests() {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendRequests)
    .where(sql`${friendRequests.status} = 'pending'`);

  return Number(rows[0]?.count ?? 0);
}

async function getSearchIndexStatus(): Promise<SearchIndexStatus> {
  try {
    if (!fs.existsSync(searchIndexPath)) {
      return { exists: false, sizeBytes: 0, updatedAt: null };
    }
    const stats = await fs.promises.stat(searchIndexPath);
    return {
      exists: true,
      sizeBytes: stats.size,
      updatedAt: stats.mtime.toISOString(),
    };
  } catch {
    return { exists: false, sizeBytes: 0, updatedAt: null };
  }
}

export const getAdminDashboardStats = cache(async (): Promise<AdminDashboardStats> => {
  "use cache";
  cacheLife("minutes");

  const [postCounts, pendingFriendRequests, searchIndex] = await Promise.all([
    countPosts(),
    countPendingFriendRequests(),
    getSearchIndexStatus(),
  ]);

  return {
    publishedPosts: postCounts.published,
    draftPosts: postCounts.drafts,
    pendingFriendRequests,
    searchIndex,
    lastUpdatedAt: new Date().toISOString(),
  };
});
