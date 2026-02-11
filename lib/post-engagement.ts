import "server-only";

import { createHash } from "node:crypto";
import { and, asc, eq, ne, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { comments, postEngagementVotes, postMetrics, posts } from "@/lib/db/schema";
import { getPostMetadataBySlug } from "@/lib/posts";

export type EngagementAction = "like" | "dislike" | "share";
export type EngagementVoteAction = "like" | "dislike";
export type CommentVoteAction = "like" | "dislike";

export type PostEngagementSnapshot = {
  likes: number;
  dislikes: number;
  shares: number;
  comments: number;
};

export type PostEngagementResult = {
  engagement: PostEngagementSnapshot;
  viewerVote: EngagementVoteAction | null;
};

export type PostCommentItem = {
  id: string;
  parentId: string | null;
  author: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  replies: PostCommentItem[];
};

const DEFAULT_AUTHOR = "Guest";
const MAX_COMMENT_LENGTH = 2000;
const MAX_AUTHOR_LENGTH = 80;

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

function normalizeVoterIdentity(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

function getVoteHash(voterIdentity: string | null | undefined) {
  const normalized = normalizeVoterIdentity(voterIdentity);
  if (!normalized) return null;

  const secret = process.env.ENGAGEMENT_VOTE_SALT ?? "blog-engagement-v1";
  return createHash("sha256")
    .update(`${secret}:${normalized}`)
    .digest("hex");
}

function isMissingVoteTableError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const dbError = error as { code?: string; message?: string };
  if (dbError.code !== "42P01") return false;
  return (dbError.message ?? "").includes("post_engagement_votes");
}

function normalizeCommentContent(content: string) {
  return content.trim().slice(0, MAX_COMMENT_LENGTH);
}

function normalizeAuthor(author: string | null | undefined) {
  const trimmed = (author ?? "").trim();
  if (!trimmed) return DEFAULT_AUTHOR;
  return trimmed.slice(0, MAX_AUTHOR_LENGTH);
}

function parsePublishedAt(value?: string | null) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

async function resolveOrCreatePost(slugRaw: string) {
  const slug = normalizeSlug(slugRaw);
  const existing = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (existing[0]?.id) {
    return existing[0].id;
  }

  const metadata = await getPostMetadataBySlug(slug);
  await db
    .insert(posts)
    .values({
      slug,
      title: metadata?.title ?? slug,
      summary: metadata?.description ?? "",
      content: "",
      status: metadata?.published === false ? "draft" : "published",
      publishedAt:
        metadata?.published === false ? null : parsePublishedAt(metadata?.date) ?? new Date(),
    })
    .onConflictDoNothing({ target: posts.slug });

  const created = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);

  if (!created[0]?.id) {
    throw new Error("Failed to resolve post record.");
  }

  return created[0].id;
}

async function ensurePostMetricsRow(postId: string) {
  await db.insert(postMetrics).values({ postId }).onConflictDoNothing({
    target: postMetrics.postId,
  });
}

function toEngagementSnapshot(
  row:
    | {
        likeCount: number;
        dislikeCount: number;
        shareCount: number;
        commentCount: number;
      }
    | undefined
): PostEngagementSnapshot {
  return {
    likes: Number(row?.likeCount ?? 0),
    dislikes: Number(row?.dislikeCount ?? 0),
    shares: Number(row?.shareCount ?? 0),
    comments: Number(row?.commentCount ?? 0),
  };
}

export async function getPostEngagementSnapshot(slug: string): Promise<PostEngagementSnapshot> {
  const postId = await resolveOrCreatePost(slug);
  await ensurePostMetricsRow(postId);

  const rows = await db
    .select({
      likeCount: postMetrics.likeCount,
      dislikeCount: postMetrics.dislikeCount,
      shareCount: postMetrics.shareCount,
      commentCount: postMetrics.commentCount,
    })
    .from(postMetrics)
    .where(eq(postMetrics.postId, postId))
    .limit(1);

  return toEngagementSnapshot(rows[0]);
}

export async function getPostEngagementForViewer(input: {
  slug: string;
  voterIdentity?: string | null;
}): Promise<PostEngagementResult> {
  const postId = await resolveOrCreatePost(input.slug);
  await ensurePostMetricsRow(postId);

  const [metricsRow] = await db
    .select({
      likeCount: postMetrics.likeCount,
      dislikeCount: postMetrics.dislikeCount,
      shareCount: postMetrics.shareCount,
      commentCount: postMetrics.commentCount,
    })
    .from(postMetrics)
    .where(eq(postMetrics.postId, postId))
    .limit(1);

  const voteHash = getVoteHash(input.voterIdentity);
  if (!voteHash) {
    return { engagement: toEngagementSnapshot(metricsRow), viewerVote: null };
  }

  try {
    const [voteRow] = await db
      .select({ action: postEngagementVotes.action })
      .from(postEngagementVotes)
      .where(and(eq(postEngagementVotes.postId, postId), eq(postEngagementVotes.voterHash, voteHash)))
      .limit(1);

    return {
      engagement: toEngagementSnapshot(metricsRow),
      viewerVote: voteRow?.action ?? null,
    };
  } catch (error) {
    if (isMissingVoteTableError(error)) {
      return { engagement: toEngagementSnapshot(metricsRow), viewerVote: null };
    }
    throw error;
  }
}

export async function incrementPostEngagement(
  slug: string,
  action: EngagementAction,
  voterIdentity?: string | null
): Promise<PostEngagementResult> {
  const postId = await resolveOrCreatePost(slug);
  await ensurePostMetricsRow(postId);

  if (action === "share") {
    const rows = await db
      .update(postMetrics)
      .set({
        shareCount: sql`${postMetrics.shareCount} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(postMetrics.postId, postId))
      .returning({
        likeCount: postMetrics.likeCount,
        dislikeCount: postMetrics.dislikeCount,
        shareCount: postMetrics.shareCount,
        commentCount: postMetrics.commentCount,
      });

    const voteHash = getVoteHash(voterIdentity);
    if (!voteHash) {
      return { engagement: toEngagementSnapshot(rows[0]), viewerVote: null };
    }

    try {
      const [voteRow] = await db
        .select({ action: postEngagementVotes.action })
        .from(postEngagementVotes)
        .where(and(eq(postEngagementVotes.postId, postId), eq(postEngagementVotes.voterHash, voteHash)))
        .limit(1);

      return {
        engagement: toEngagementSnapshot(rows[0]),
        viewerVote: voteRow?.action ?? null,
      };
    } catch (error) {
      if (isMissingVoteTableError(error)) {
        return { engagement: toEngagementSnapshot(rows[0]), viewerVote: null };
      }
      throw error;
    }
  }

  const voteHash = getVoteHash(voterIdentity);
  if (!voteHash) {
    const rows = await db
      .update(postMetrics)
      .set(
        action === "like"
          ? {
              likeCount: sql`${postMetrics.likeCount} + 1`,
              updatedAt: sql`now()`,
            }
          : {
              dislikeCount: sql`${postMetrics.dislikeCount} + 1`,
              updatedAt: sql`now()`,
            }
      )
      .where(eq(postMetrics.postId, postId))
      .returning({
        likeCount: postMetrics.likeCount,
        dislikeCount: postMetrics.dislikeCount,
        shareCount: postMetrics.shareCount,
        commentCount: postMetrics.commentCount,
      });

    return { engagement: toEngagementSnapshot(rows[0]), viewerVote: null };
  }

  let result: PostEngagementResult;
  try {
    result = await db.transaction(async (tx) => {
      const [existingVote] = await tx
        .select({ action: postEngagementVotes.action })
        .from(postEngagementVotes)
        .where(and(eq(postEngagementVotes.postId, postId), eq(postEngagementVotes.voterHash, voteHash)))
        .limit(1);

    if (!existingVote) {
      await tx
        .insert(postEngagementVotes)
        .values({
          postId,
          voterHash: voteHash,
          action,
        })
        .onConflictDoNothing({
          target: [postEngagementVotes.postId, postEngagementVotes.voterHash],
        });

      const [createdVote] = await tx
        .select({ action: postEngagementVotes.action })
        .from(postEngagementVotes)
        .where(and(eq(postEngagementVotes.postId, postId), eq(postEngagementVotes.voterHash, voteHash)))
        .limit(1);

      const effectiveAction = createdVote?.action;
      if (effectiveAction) {
        await tx
          .update(postMetrics)
          .set(
            effectiveAction === "like"
              ? {
                  likeCount: sql`${postMetrics.likeCount} + 1`,
                  updatedAt: sql`now()`,
                }
              : {
                  dislikeCount: sql`${postMetrics.dislikeCount} + 1`,
                  updatedAt: sql`now()`,
                }
          )
          .where(eq(postMetrics.postId, postId));
      }

      const [metrics] = await tx
        .select({
          likeCount: postMetrics.likeCount,
          dislikeCount: postMetrics.dislikeCount,
          shareCount: postMetrics.shareCount,
          commentCount: postMetrics.commentCount,
        })
        .from(postMetrics)
        .where(eq(postMetrics.postId, postId))
        .limit(1);

      return {
        engagement: toEngagementSnapshot(metrics),
        viewerVote: createdVote?.action ?? null,
      } satisfies PostEngagementResult;
    }

    if (existingVote.action !== action) {
      await tx
        .update(postEngagementVotes)
        .set({ action, updatedAt: sql`now()` })
        .where(and(eq(postEngagementVotes.postId, postId), eq(postEngagementVotes.voterHash, voteHash)));

      await tx
        .update(postMetrics)
        .set(
          action === "like"
            ? {
                likeCount: sql`${postMetrics.likeCount} + 1`,
                dislikeCount: sql`greatest(${postMetrics.dislikeCount} - 1, 0)`,
                updatedAt: sql`now()`,
              }
            : {
                dislikeCount: sql`${postMetrics.dislikeCount} + 1`,
                likeCount: sql`greatest(${postMetrics.likeCount} - 1, 0)`,
                updatedAt: sql`now()`,
              }
        )
        .where(eq(postMetrics.postId, postId));
    }

    const [metrics] = await tx
      .select({
        likeCount: postMetrics.likeCount,
        dislikeCount: postMetrics.dislikeCount,
        shareCount: postMetrics.shareCount,
        commentCount: postMetrics.commentCount,
      })
      .from(postMetrics)
      .where(eq(postMetrics.postId, postId))
      .limit(1);

      return {
        engagement: toEngagementSnapshot(metrics),
        viewerVote: existingVote.action === action ? existingVote.action : action,
      } satisfies PostEngagementResult;
    });
  } catch (error) {
    if (!isMissingVoteTableError(error)) {
      throw error;
    }

    const rows = await db
      .update(postMetrics)
      .set(
        action === "like"
          ? {
              likeCount: sql`${postMetrics.likeCount} + 1`,
              updatedAt: sql`now()`,
            }
          : {
              dislikeCount: sql`${postMetrics.dislikeCount} + 1`,
              updatedAt: sql`now()`,
            }
      )
      .where(eq(postMetrics.postId, postId))
      .returning({
        likeCount: postMetrics.likeCount,
        dislikeCount: postMetrics.dislikeCount,
        shareCount: postMetrics.shareCount,
        commentCount: postMetrics.commentCount,
      });

    result = { engagement: toEngagementSnapshot(rows[0]), viewerVote: null };
  }

  return result;
}

export async function listPostComments(slug: string, limit = 200): Promise<PostCommentItem[]> {
  const postId = await resolveOrCreatePost(slug);

  const rows = await db
    .select({
      id: comments.id,
      parentId: comments.parentId,
      author: comments.author,
      content: comments.content,
      likeCount: comments.likeCount,
      dislikeCount: comments.dislikeCount,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(and(eq(comments.postId, postId), eq(comments.status, "visible")))
    .orderBy(asc(comments.createdAt))
    .limit(limit);

  const nodes = rows.map((row) => ({
    id: row.id,
    parentId: row.parentId,
    author: row.author ?? DEFAULT_AUTHOR,
    content: row.content,
    likeCount: Number(row.likeCount),
    dislikeCount: Number(row.dislikeCount),
    createdAt: row.createdAt.toISOString(),
    replies: [] as PostCommentItem[],
  }));

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const roots: PostCommentItem[] = [];

  for (const node of nodes) {
    if (!node.parentId) {
      roots.push(node);
      continue;
    }
    const parent = byId.get(node.parentId);
    if (!parent) {
      roots.push(node);
      continue;
    }
    parent.replies.push(node);
  }

  return roots;
}

export async function createPostComment(input: {
  slug: string;
  content: string;
  author?: string | null;
  parentId?: string | null;
}) {
  const postId = await resolveOrCreatePost(input.slug);
  await ensurePostMetricsRow(postId);

  const content = normalizeCommentContent(input.content);
  if (!content) {
    throw new Error("Comment content is required.");
  }

  const author = normalizeAuthor(input.author);
  const parentId = input.parentId?.trim() || null;

  const created = await db.transaction(async (tx) => {
    const inserted = await tx
      .insert(comments)
      .values({
        postId,
        parentId,
        author,
        content,
        status: "visible",
      })
      .returning({
        id: comments.id,
        parentId: comments.parentId,
        author: comments.author,
        content: comments.content,
        likeCount: comments.likeCount,
        dislikeCount: comments.dislikeCount,
        createdAt: comments.createdAt,
      });

    await tx
      .update(postMetrics)
      .set({
        commentCount: sql`${postMetrics.commentCount} + 1`,
        updatedAt: sql`now()`,
      })
      .where(eq(postMetrics.postId, postId));

    return inserted[0];
  });

  return {
    id: created.id,
    parentId: created.parentId,
    author: created.author ?? DEFAULT_AUTHOR,
    content: created.content,
    likeCount: Number(created.likeCount),
    dislikeCount: Number(created.dislikeCount),
    createdAt: created.createdAt.toISOString(),
    replies: [] as PostCommentItem[],
  };
}

export async function voteCommentById(
  commentId: string,
  action: CommentVoteAction
): Promise<{ likeCount: number; dislikeCount: number } | null> {
  const id = commentId.trim();
  if (!id) return null;

  const rows = await db
    .update(comments)
    .set(
      action === "like"
        ? {
            likeCount: sql`${comments.likeCount} + 1`,
            updatedAt: sql`now()`,
          }
        : {
            dislikeCount: sql`${comments.dislikeCount} + 1`,
            updatedAt: sql`now()`,
          }
    )
    .where(and(eq(comments.id, id), ne(comments.status, "deleted")))
    .returning({
      likeCount: comments.likeCount,
      dislikeCount: comments.dislikeCount,
    });

  if (!rows[0]) return null;
  return {
    likeCount: Number(rows[0].likeCount),
    dislikeCount: Number(rows[0].dislikeCount),
  };
}
