import "server-only";

import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, postMetrics, posts } from "@/lib/db/schema";

export type AdminCommentRecord = {
  id: string;
  postId: string;
  postSlug: string;
  postTitle: string;
  parentId: string | null;
  author: string;
  content: string;
  status: "visible" | "hidden" | "deleted";
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
};

async function syncPostCommentCount(postId: string) {
  const rows = await db
    .select({
      visibleCount: sql<number>`count(*) filter (where ${comments.status} = 'visible')`,
    })
    .from(comments)
    .where(eq(comments.postId, postId))
    .limit(1);

  const count = Number(rows[0]?.visibleCount ?? 0);
  await db.insert(postMetrics).values({ postId }).onConflictDoNothing({
    target: postMetrics.postId,
  });
  await db
    .update(postMetrics)
    .set({
      commentCount: count,
      updatedAt: sql`now()`,
    })
    .where(eq(postMetrics.postId, postId));
}

export async function listAdminComments(limit = 200): Promise<AdminCommentRecord[]> {
  const rows = await db
    .select({
      id: comments.id,
      postId: comments.postId,
      postSlug: posts.slug,
      postTitle: posts.title,
      parentId: comments.parentId,
      author: comments.author,
      content: comments.content,
      status: comments.status,
      likeCount: comments.likeCount,
      dislikeCount: comments.dislikeCount,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .innerJoin(posts, eq(comments.postId, posts.id))
    .where(sql`${comments.status} <> 'deleted'`)
    .orderBy(desc(comments.createdAt))
    .limit(limit);

  return rows.map((row) => ({
    id: row.id,
    postId: row.postId,
    postSlug: row.postSlug,
    postTitle: row.postTitle,
    parentId: row.parentId,
    author: row.author ?? "Guest",
    content: row.content,
    status: row.status,
    likeCount: Number(row.likeCount),
    dislikeCount: Number(row.dislikeCount),
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function updateCommentStatusById(
  id: string,
  status: "visible" | "hidden" | "deleted"
) {
  const commentId = id.trim();
  if (!commentId) return false;

  const updated = await db
    .update(comments)
    .set({
      status,
      updatedAt: sql`now()`,
    })
    .where(eq(comments.id, commentId))
    .returning({
      postId: comments.postId,
    });

  const postId = updated[0]?.postId;
  if (!postId) return false;
  await syncPostCommentCount(postId);
  return true;
}
