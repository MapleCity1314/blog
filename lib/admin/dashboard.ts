import "server-only";

import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { cacheLife } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, friendRequests, postMetrics, posts } from "@/lib/db/schema";
import { getAdminPostSummaries } from "@/lib/admin/posts";
import { getPostViews } from "@/lib/post-views";

const searchIndexPath = path.join(process.cwd(), "public", "search-index.json");

type SearchIndexStatus = {
  exists: boolean;
  sizeBytes: number;
  updatedAt: string | null;
};

type EngagementStatus = {
  likes: number;
  dislikes: number;
  shares: number;
  metricComments: number;
  visibleComments: number;
  activeComments: number;
  metricsRows: number;
  commentCountInSync: boolean;
};

export type AdminDashboardStats = {
  publishedPosts: number;
  draftPosts: number;
  pendingFriendRequests: number;
  searchIndex: SearchIndexStatus;
  engagement: EngagementStatus;
  popularPosts: {
    slug: string;
    title: string;
    views: number;
    likes: number;
    dislikes: number;
    shares: number;
    comments: number;
    score: number;
  }[];
  lastUpdatedAt: string;
};

async function countPosts() {
  const posts = await getAdminPostSummaries();
  const published = posts.filter((post) => post.metadata.published !== false).length;
  return { published, drafts: posts.length - published };
}

async function countPendingFriendRequests() {
  const rows = await db
    .select({ count: sql<number>`count(*)` })
    .from(friendRequests)
    .where(sql`${friendRequests.status} = 'pending'`);

  return Number(rows[0]?.count ?? 0);
}

async function getEngagementStatus(): Promise<EngagementStatus> {
  const [metricsRows, commentRows] = await Promise.all([
    db
      .select({
        likes: sql<number>`coalesce(sum(${postMetrics.likeCount}), 0)`,
        dislikes: sql<number>`coalesce(sum(${postMetrics.dislikeCount}), 0)`,
        shares: sql<number>`coalesce(sum(${postMetrics.shareCount}), 0)`,
        metricComments: sql<number>`coalesce(sum(${postMetrics.commentCount}), 0)`,
        metricsRows: sql<number>`count(*)`,
      })
      .from(postMetrics),
    db
      .select({
        visibleComments: sql<number>`count(*) filter (where ${comments.status} = 'visible')`,
        activeComments: sql<number>`count(*) filter (where ${comments.status} <> 'deleted')`,
      })
      .from(comments),
  ]);

  const metrics = metricsRows[0];
  const comment = commentRows[0];
  const metricComments = Number(metrics?.metricComments ?? 0);
  const visibleComments = Number(comment?.visibleComments ?? 0);

  return {
    likes: Number(metrics?.likes ?? 0),
    dislikes: Number(metrics?.dislikes ?? 0),
    shares: Number(metrics?.shares ?? 0),
    metricComments,
    visibleComments,
    activeComments: Number(comment?.activeComments ?? 0),
    metricsRows: Number(metrics?.metricsRows ?? 0),
    commentCountInSync: metricComments === visibleComments,
  };
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

async function getPopularPosts() {
  const [summaries, metricRows] = await Promise.all([
    getAdminPostSummaries(),
    db
      .select({
        slug: posts.slug,
        likes: postMetrics.likeCount,
        dislikes: postMetrics.dislikeCount,
        shares: postMetrics.shareCount,
        comments: postMetrics.commentCount,
      })
      .from(posts)
      .leftJoin(postMetrics, eq(posts.id, postMetrics.postId)),
  ]);

  const metricBySlug = new Map(
    metricRows.map((row) => [
      row.slug,
      {
        likes: Number(row.likes ?? 0),
        dislikes: Number(row.dislikes ?? 0),
        shares: Number(row.shares ?? 0),
        comments: Number(row.comments ?? 0),
      },
    ])
  );

  const items = await Promise.all(
    summaries
      .filter((post) => post.metadata.published !== false)
      .map(async (post) => {
        const metrics = metricBySlug.get(post.slug) ?? {
          likes: 0,
          dislikes: 0,
          shares: 0,
          comments: 0,
        };
        const views = await getPostViews(post.slug);
        const score =
          views +
          metrics.likes * 3 +
          metrics.comments * 4 +
          metrics.shares * 5 -
          metrics.dislikes * 2;

        return {
          slug: post.slug,
          title: post.metadata.title,
          views,
          likes: metrics.likes,
          dislikes: metrics.dislikes,
          shares: metrics.shares,
          comments: metrics.comments,
          score,
        };
      })
  );

  return items.sort((a, b) => b.score - a.score).slice(0, 5);
}

export const getAdminDashboardStats = cache(async (): Promise<AdminDashboardStats> => {
  "use cache";
  cacheLife("minutes");

  const [postCounts, pendingFriendRequests, searchIndex, engagement, popularPosts] =
    await Promise.all([
    countPosts(),
    countPendingFriendRequests(),
    getSearchIndexStatus(),
    getEngagementStatus(),
    getPopularPosts(),
  ]);

  return {
    publishedPosts: postCounts.published,
    draftPosts: postCounts.drafts,
    pendingFriendRequests,
    searchIndex,
    engagement,
    popularPosts,
    lastUpdatedAt: new Date().toISOString(),
  };
});
