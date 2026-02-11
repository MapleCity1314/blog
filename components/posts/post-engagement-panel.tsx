"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { MessageSquare, Share2, ThumbsDown, ThumbsUp, Terminal, RotateCcw, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- 类型定义保持不变 ---
type EngagementSnapshot = { likes: number; dislikes: number; shares: number; comments: number };
type VoteAction = "like" | "dislike";
type CommentItem = {
  id: string; parentId: string | null; author: string; content: string;
  likeCount: number; dislikeCount: number; createdAt: string; replies: CommentItem[];
};

type PostEngagementPanelProps = {
  slug: string;
  postUrl: string;
  initialEngagement: EngagementSnapshot;
  initialComments: CommentItem[];
};

// --- 工具函数 ---
function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

function updateCommentInTree(
  nodes: CommentItem[],
  commentId: string,
  updater: (node: CommentItem) => CommentItem
): CommentItem[] {
  return nodes.map((node) => {
    if (node.id === commentId) return updater(node);
    if (node.replies.length === 0) return node;
    return { ...node, replies: updateCommentInTree(node.replies, commentId, updater) };
  });
}

// --- 核心组件 ---
export function PostEngagementPanel({
  slug, postUrl, initialEngagement, initialComments,
}: PostEngagementPanelProps) {
  const [engagement, setEngagement] = useState(initialEngagement);
  const [viewerVote, setViewerVote] = useState<VoteAction | null>(null);
  const [comments, setComments] = useState(initialComments);
  const [author, setAuthor] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReloading, setIsReloading] = useState(false);

  // 逻辑部分保持原样...
  useEffect(() => {
    let isMounted = true;
    async function syncEngagementVote() {
      try {
        const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/engagement`);
        if (!response.ok || !isMounted) return;
        const data = await response.json();
        setEngagement(data.engagement);
        setViewerVote(data.viewerVote ?? null);
      } catch {}
    }
    syncEngagementVote();
    return () => { isMounted = false; };
  }, [slug]);

  const sendEngagement = useCallback((action: "like" | "dislike" | "share") => {
    if (action !== "share" && viewerVote === action) return;
    const previousEngagement = engagement;
    const previousVote = viewerVote;

    if (action === "share") {
      setEngagement(p => ({ ...p, shares: p.shares + 1 }));
    } else if (action === "like") {
      setEngagement(p => ({
        ...p,
        likes: p.likes + (previousVote === "like" ? 0 : 1),
        dislikes: Math.max(p.dislikes - (previousVote === "dislike" ? 1 : 0), 0),
      }));
      setViewerVote("like");
    } else {
      setEngagement(p => ({
        ...p,
        dislikes: p.dislikes + (previousVote === "dislike" ? 0 : 1),
        likes: Math.max(p.likes - (previousVote === "like" ? 1 : 0), 0),
      }));
      setViewerVote("dislike");
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/posts/${encodeURIComponent(slug)}/engagement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        });
        const data = await res.json();
        setEngagement(data.engagement);
      } catch {
        setEngagement(previousEngagement);
        setViewerVote(previousVote);
      }
    });
  }, [engagement, slug, viewerVote]);

  const handleShare = useCallback(async () => {
    try {
      if (navigator.share) await navigator.share({ url: postUrl });
      else if (navigator.clipboard) await navigator.clipboard.writeText(postUrl);
      sendEngagement("share");
      setMessage("LINK_COPIED");
    } catch {}
  }, [postUrl, sendEngagement]);

  const handleSubmitComment = useCallback(async () => {
    if (!content.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${encodeURIComponent(slug)}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author.trim() || undefined, content }),
      });
      const data = await response.json();
      if (data.comment) {
        setComments(p => [...p, data.comment]);
        setEngagement(p => ({ ...p, comments: p.comments + 1 }));
        setContent("");
        setMessage("TRANSMISSION_COMPLETE");
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [author, content, slug]);

  const handleVoteComment = useCallback(async (commentId: string, action: "like" | "dislike") => {
    setComments(p => updateCommentInTree(p, commentId, n => ({
      ...n,
      likeCount: action === "like" ? n.likeCount + 1 : n.likeCount,
      dislikeCount: action === "dislike" ? n.dislikeCount + 1 : n.dislikeCount,
    })));
    await fetch(`/api/comments/${encodeURIComponent(commentId)}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
  }, []);

  return (
    <section className="relative mt-24 w-full max-w-3xl mx-auto px-6 py-12">
      {/* 磨砂背景装饰 */}
      <div className="absolute inset-0 z-0 bg-zinc-50/50 dark:bg-zinc-900/20 backdrop-blur-xl rounded-[2rem] border border-zinc-200/50 dark:border-zinc-800/50" />

      <div className="relative z-10">
        {/* 头部统计 */}
        <div className="flex items-end justify-between mb-12 px-2">
          <div className="space-y-1">
            <h2 className="text-[10px] font-mono tracking-[0.4em] uppercase opacity-40">Protocol_Feedback</h2>
            <div className="text-2xl font-extralight tracking-tighter">Community Thoughts.</div>
          </div>
          <div className="text-right">
             <span className="text-2xl font-light tracking-tighter">{engagement.comments}</span>
             <span className="text-[10px] font-mono opacity-30 ml-2 tracking-widest uppercase">Nodes</span>
          </div>
        </div>

        {/* 交互按钮组 */}
        <div className="flex items-center gap-6 mb-16 px-2">
          <StatButton 
            active={viewerVote === "like"} 
            onClick={() => sendEngagement("like")}
            icon={<ThumbsUp size={14} />}
            label="ACK"
            count={engagement.likes}
          />
          <StatButton 
            active={viewerVote === "dislike"} 
            onClick={() => sendEngagement("dislike")}
            icon={<ThumbsDown size={14} />}
            label="REJ"
            count={engagement.dislikes}
          />
          <StatButton 
            onClick={handleShare}
            icon={<Share2 size={14} />}
            label="SYNC"
            count={engagement.shares}
          />
        </div>

        {/* 伪“命令行”输入区 */}
        <div className="mb-20 group relative">
          <div className="flex items-center gap-3 mb-4 opacity-30 group-focus-within:opacity-100 transition-opacity">
            <Terminal size={14} />
            <span className="text-[10px] font-mono tracking-[0.2em] uppercase">Initialize_Message...</span>
          </div>
          
          <div className="space-y-6 pl-6 border-l border-zinc-200 dark:border-zinc-800">
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="IDENTITY (GUEST_USER)"
              className="w-full bg-transparent border-none outline-none text-xs font-mono tracking-widest placeholder:opacity-20 uppercase"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="TYPE_YOUR_THOUGHTS_HERE..."
              className="w-full bg-transparent border-none outline-none text-sm font-light leading-relaxed min-h-[100px] resize-none placeholder:opacity-20"
            />
          </div>

          <div className="mt-6 flex items-center justify-between pl-6">
            <div className="text-[10px] font-mono opacity-30 uppercase tracking-widest italic">
              {message || error || (isSubmitting ? "Transmitting..." : "Ready to Send")}
            </div>
            <button
              onClick={handleSubmitComment}
              disabled={isSubmitting || !content.trim()}
              className="flex items-center gap-2 px-6 py-2 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-[10px] font-bold tracking-[0.2em] uppercase transition-transform active:scale-95 disabled:opacity-20"
            >
              Execute <Send size={12} />
            </button>
          </div>
        </div>

        {/* 评论列表 */}
        <div className="space-y-12">
          <AnimatePresence>
            {comments.length === 0 ? (
              <div className="text-center py-12 opacity-20 font-mono text-[10px] tracking-widest uppercase italic">
                No active signals detected.
              </div>
            ) : (
              comments.map((comment) => (
                <CommentNode key={comment.id} item={comment} onVote={handleVoteComment} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

// --- 子组件：统计按钮 ---
function StatButton({ active, onClick, icon, label, count }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 group transition-all",
        active ? "text-blue-500" : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
      )}
    >
      <div className={cn(
        "p-2 rounded-full border border-transparent transition-all",
        active ? "bg-blue-500/10 border-blue-500/20" : "group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
      )}>
        {icon}
      </div>
      <div className="flex flex-col items-start leading-none">
        <span className="text-[8px] font-mono uppercase tracking-widest opacity-50">{label}</span>
        <span className="text-xs font-light tracking-tighter">{count}</span>
      </div>
    </button>
  );
}

// --- 子组件：评论节点 ---
function CommentNode({ item, onVote, isReply = false }: { item: CommentItem; onVote: any; isReply?: boolean }) {
  return (
    <motion.article 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("relative", isReply ? "mt-8 ml-8" : "pb-12 border-b border-zinc-100 dark:border-zinc-900 last:border-none")}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-200 to-zinc-400 dark:from-zinc-700 dark:to-zinc-900" />
          <span className="text-xs font-medium tracking-tight">{item.author}</span>
          <span className="text-[9px] font-mono opacity-20 uppercase tracking-widest">
            {formatDate(item.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => onVote(item.id, "like")} className="flex items-center gap-1 text-[10px] font-mono opacity-30 hover:opacity-100 transition-opacity">
              <ThumbsUp size={10} /> {item.likeCount}
           </button>
        </div>
      </div>
      
      <p className="text-sm font-light leading-relaxed text-zinc-600 dark:text-zinc-400 pl-9">
        {item.content}
      </p>

      {item.replies.length > 0 && (
        <div className="pl-4 border-l border-zinc-100 dark:border-zinc-900 ml-3 mt-4">
          {item.replies.map((reply) => (
            <CommentNode key={reply.id} item={reply} onVote={onVote} isReply />
          ))}
        </div>
      )}
    </motion.article>
  );
}