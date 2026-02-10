"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { MessageSquare, Share2, ThumbsDown, ThumbsUp } from "lucide-react";

type EngagementSnapshot = {
  likes: number;
  dislikes: number;
  shares: number;
  comments: number;
};

type CommentItem = {
  id: string;
  parentId: string | null;
  author: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  createdAt: string;
  replies: CommentItem[];
};

type PostEngagementPanelProps = {
  slug: string;
  postUrl: string;
  initialEngagement: EngagementSnapshot;
  initialComments: CommentItem[];
};

const INPUT_BASE =
  "w-full rounded-none border border-border/60 bg-background/40 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus-visible:border-primary/50";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function updateCommentInTree(
  nodes: CommentItem[],
  commentId: string,
  updater: (node: CommentItem) => CommentItem
): CommentItem[] {
  return nodes.map((node) => {
    if (node.id === commentId) {
      return updater(node);
    }
    if (node.replies.length === 0) {
      return node;
    }
    return {
      ...node,
      replies: updateCommentInTree(node.replies, commentId, updater),
    };
  });
}

export function PostEngagementPanel({
  slug,
  postUrl,
  initialEngagement,
  initialComments,
}: PostEngagementPanelProps) {
  const [engagement, setEngagement] = useState(initialEngagement);
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  const commentCount = useMemo(() => engagement.comments, [engagement.comments]);

  const sendEngagement = useCallback((action: "like" | "dislike" | "share") => {
    setError(null);
    setMessage(null);
    setEngagement((previous) => ({
      ...previous,
      likes: action === "like" ? previous.likes + 1 : previous.likes,
      dislikes: action === "dislike" ? previous.dislikes + 1 : previous.dislikes,
      shares: action === "share" ? previous.shares + 1 : previous.shares,
    }));

    startTransition(async () => {
      try {
        const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/engagement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        if (!response.ok) throw new Error("Failed to update engagement.");
        const data = (await response.json()) as { engagement: EngagementSnapshot };
        setEngagement(data.engagement);
      } catch {
        setError("Update failed, please retry.");
      }
    });
  }, [slug]);

  const reloadComments = useCallback(async () => {
    setError(null);
    setIsReloading(true);
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "GET",
      });
      if (!response.ok) throw new Error("Failed to load comments.");
      const data = (await response.json()) as { comments: CommentItem[] };
      setComments(data.comments);
      setMessage("Comments refreshed.");
    } catch {
      setError("Failed to load comments, please retry.");
    } finally {
      setIsReloading(false);
    }
  }, [slug]);

  const handleShare = useCallback(async () => {
    setError(null);
    setMessage(null);
    try {
      if (navigator.share) {
        await navigator.share({ url: postUrl });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(postUrl);
      }
      setMessage("Link ready to share.");
      sendEngagement("share");
    } catch {
      setError("Share cancelled or failed.");
    }
  }, [postUrl, sendEngagement]);

  const handleSubmitComment = useCallback(async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Comment cannot be empty.");
      return;
    }

    setError(null);
    setMessage(null);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: author.trim() || undefined,
          content: trimmed,
        }),
      });
      const data = (await response.json()) as { comment?: CommentItem; error?: string };
      if (!response.ok || !data.comment) {
        throw new Error(data.error ?? "Failed to submit comment.");
      }
      setComments((previous) => [...previous, data.comment!]);
      setEngagement((previous) => ({ ...previous, comments: previous.comments + 1 }));
      setContent("");
      setMessage("Comment posted.");
    } catch (submitError) {
      const submitMessage =
        submitError instanceof Error ? submitError.message : "Failed to submit comment.";
      setError(submitMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [author, content, slug]);

  const handleVoteComment = useCallback(async (commentId: string, action: "like" | "dislike") => {
    setComments((previous) =>
      updateCommentInTree(previous, commentId, (node) => ({
        ...node,
        likeCount: action === "like" ? node.likeCount + 1 : node.likeCount,
        dislikeCount: action === "dislike" ? node.dislikeCount + 1 : node.dislikeCount,
      }))
    );

    try {
      const response = await fetch(`/api/comments/${encodeURIComponent(commentId)}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!response.ok) throw new Error("Vote failed.");
      const data = (await response.json()) as { likeCount: number; dislikeCount: number };
      setComments((previous) =>
        updateCommentInTree(previous, commentId, (node) => ({
          ...node,
          likeCount: data.likeCount,
          dislikeCount: data.dislikeCount,
        }))
      );
    } catch {
      setError("Vote failed, please retry.");
    }
  }, []);

  return (
    <section className="mt-12 border border-border/60 bg-background/30 p-6 sm:p-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
          Community Feedback
        </h2>
        <span className="text-[10px] font-mono text-muted-foreground/80">
          {commentCount.toLocaleString()} comment(s)
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => sendEngagement("like")}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-border/60 bg-background/40 px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:border-primary/60 touch-manipulation"
        >
          <ThumbsUp size={14} /> Like {engagement.likes.toLocaleString()}
        </button>
        <button
          type="button"
          onClick={() => sendEngagement("dislike")}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-border/60 bg-background/40 px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:border-primary/60 touch-manipulation"
        >
          <ThumbsDown size={14} /> Dislike {engagement.dislikes.toLocaleString()}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex min-h-11 items-center justify-center gap-2 border border-border/60 bg-background/40 px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:border-primary/60 touch-manipulation"
        >
          <Share2 size={14} /> Share {engagement.shares.toLocaleString()}
        </button>
      </div>

      <div className="mt-8 space-y-3 border border-border/50 bg-background/20 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Display Name
            </span>
            <input
              type="text"
              name="author"
              autoComplete="nickname"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              placeholder="Guest…"
              className={INPUT_BASE}
              maxLength={80}
            />
          </label>
          <div className="hidden sm:block" />
        </div>
        <label className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Comment
          </span>
          <textarea
            name="content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Share your thoughts…"
            className={`${INPUT_BASE} min-h-28 resize-y`}
            maxLength={2000}
          />
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSubmitComment}
            disabled={isSubmitting}
            className="inline-flex min-h-11 items-center justify-center gap-2 border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-mono uppercase tracking-widest text-primary transition-colors hover:bg-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MessageSquare size={14} /> {isSubmitting ? "Posting…" : "Post Comment"}
          </button>
          <button
            type="button"
            onClick={reloadComments}
            disabled={isReloading}
            className="inline-flex min-h-11 items-center justify-center border border-border/60 bg-background/40 px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isReloading ? "Reloading…" : "Retry Fetch"}
          </button>
          <span className="text-[11px] text-muted-foreground" aria-live="polite">
            {error ?? message ?? (isPending ? "Updating…" : "")}
          </span>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {comments.length === 0 ? (
          <div className="border border-dashed border-border/60 p-4 text-sm text-muted-foreground">
            No comments yet. Be the first one.
          </div>
        ) : (
          comments.map((comment) => (
            <CommentCard
              key={comment.id}
              item={comment}
              onVote={handleVoteComment}
            />
          ))
        )}
      </div>
    </section>
  );
}

function CommentCard({
  item,
  onVote,
}: {
  item: CommentItem;
  onVote: (commentId: string, action: "like" | "dislike") => void;
}) {
  return (
    <article className="border border-border/60 bg-background/20 p-4 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-sm text-foreground break-words">{item.author}</strong>
        <span className="text-[10px] font-mono text-muted-foreground">
          {formatDate(item.createdAt)}
        </span>
      </div>
      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">
        {item.content}
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onVote(item.id, "like")}
          className="inline-flex min-h-8 items-center gap-1 border border-border/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ThumbsUp size={12} /> {item.likeCount}
        </button>
        <button
          type="button"
          onClick={() => onVote(item.id, "dislike")}
          className="inline-flex min-h-8 items-center gap-1 border border-border/60 px-2 py-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <ThumbsDown size={12} /> {item.dislikeCount}
        </button>
      </div>
      {item.replies.length > 0 ? (
        <div className="mt-4 space-y-3 border-l border-border/50 pl-4">
          {item.replies.map((reply) => (
            <CommentCard key={reply.id} item={reply} onVote={onVote} />
          ))}
        </div>
      ) : null}
    </article>
  );
}

