import React from "react";
import {
  ArrowUpRight,
  Cpu,
  Eye,
  FileText,
  Share2,
  Terminal,
  TrendingUp,
  Users,
} from "lucide-react";
import { getAdminDashboardStats } from "@/lib/admin/dashboard";
import { cn } from "@/lib/utils";

function formatRelativeTimestamp(value: string | null) {
  if (!value) return "unknown";
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const topPostViews = stats.popularPosts.map((post) => ({
    title: post.title,
    views: post.views.toLocaleString(),
    engagement: `L${post.likes} / D${post.dislikes} / S${post.shares} / C${post.comments}`,
    score: post.score.toLocaleString(),
  }));

  const metrics = [
    {
      label: "Published_Posts",
      value: stats.publishedPosts.toString(),
      trend: "+0%",
      icon: <Eye />,
    },
    {
      label: "Draft_Posts",
      value: stats.draftPosts.toString(),
      trend: "+0%",
      icon: <Users />,
    },
    {
      label: "Pending_Friends",
      value: stats.pendingFriendRequests.toString(),
      trend: "+0%",
      icon: <Cpu />,
    },
    {
      label: "Search_Index",
      value: stats.searchIndex.exists ? "ONLINE" : "MISSING",
      trend: stats.searchIndex.exists ? "+0%" : "-0%",
      icon: <Share2 />,
    },
    {
      label: "Likes",
      value: stats.engagement.likes.toString(),
      trend: "+0%",
      icon: <ArrowUpRight />,
    },
    {
      label: "Dislikes",
      value: stats.engagement.dislikes.toString(),
      trend: "+0%",
      icon: <ArrowUpRight />,
    },
    {
      label: "Shares",
      value: stats.engagement.shares.toString(),
      trend: "+0%",
      icon: <ArrowUpRight />,
    },
    {
      label: "Visible_Comments",
      value: stats.engagement.visibleComments.toString(),
      trend: stats.engagement.commentCountInSync ? "+0%" : "-0%",
      icon: <Users />,
    },
  ];

  const interactions = [
    {
      user: "System",
      action: `${stats.pendingFriendRequests} friend request(s) pending review.`,
      time: formatRelativeTimestamp(stats.lastUpdatedAt),
    },
    {
      user: "Search_Index",
      action: stats.searchIndex.exists
        ? `Index last updated ${formatRelativeTimestamp(stats.searchIndex.updatedAt)}.`
        : "Search index file missing.",
      time: formatRelativeTimestamp(stats.searchIndex.updatedAt),
    },
    {
      user: "Comments_Sync",
      action: stats.engagement.commentCountInSync
        ? `post_metrics.comment_count (${stats.engagement.metricComments}) matches visible comments (${stats.engagement.visibleComments}).`
        : `post_metrics.comment_count (${stats.engagement.metricComments}) differs from visible comments (${stats.engagement.visibleComments}).`,
      time: formatRelativeTimestamp(stats.lastUpdatedAt),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <TrendingUp size={16} /> Flux_Metrics
          </h2>
          <span className="text-[10px] font-mono text-primary/60">LAST_24_HOURS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <FileText size={16} /> Registry_Performance
          </h2>
          <div className="bg-background/40 border border-border/60 p-6 relative overflow-hidden">
            <table className="w-full text-left font-mono">
              <thead>
                <tr className="text-[10px] text-muted-foreground/50 border-b border-border/40">
                  <th className="pb-4 font-normal">ENTRY_TITLE</th>
                  <th className="pb-4 font-normal">VIEWS</th>
                  <th className="pb-4 font-normal">ENGAGEMENT</th>
                  <th className="pb-4 font-normal">POPULARITY_SCORE</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {topPostViews.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-xs text-muted-foreground">
                      No popularity data yet.
                    </td>
                  </tr>
                ) : (
                  topPostViews.map((row) => (
                    <ContentRow key={row.title} {...row} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-sm font-mono font-bold uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
            <Terminal size={16} /> Signal_Logs
          </h2>
          <div className="space-y-4">
            {interactions.map((item) => (
              <InteractionCard key={item.user} {...item} />
            ))}
            <div className="border border-primary/20 bg-primary/5 p-4 flex flex-col gap-3">
              <span className="text-[10px] font-mono text-primary font-bold uppercase">
                System_Action
              </span>
              <p className="text-xs text-muted-foreground">
                You have {stats.draftPosts} unpublished draft(s) and{" "}
                {stats.pendingFriendRequests} friend request(s) pending.
              </p>
              <button className="text-xs font-mono font-bold text-primary flex items-center gap-1 hover:underline">
                RESOLVE_ALL <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
  trend: string;
  icon: React.ReactElement<{ size?: number }>;
};

function MetricCard({ label, value, trend, icon }: MetricCardProps) {
  return (
    <div className="group relative p-6 bg-background/40 border border-border/60 overflow-hidden transition-all hover:border-primary/40">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-muted/50 text-muted-foreground group-hover:text-primary transition-colors">
          {React.cloneElement(icon, { size: 18 })}
        </div>
        <span
          className={cn(
            "text-[10px] font-mono font-bold px-1.5 py-0.5 border",
            trend.startsWith("+")
              ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5"
              : "border-red-500/30 text-red-500 bg-red-500/5"
          )}
        >
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60 mb-1">
          {label}
        </p>
        <p className="text-3xl font-bold tracking-tighter italic">{value}</p>
      </div>
      <div className="absolute right-0 bottom-0 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
        {React.cloneElement(icon, { size: 100 })}
      </div>
    </div>
  );
}

type ContentRowProps = {
  title: string;
  views: string;
  engagement: string;
  score: string;
};

function ContentRow({ title, views, engagement, score }: ContentRowProps) {
  return (
    <tr className="group border-b border-border/20 last:border-0 hover:bg-primary/[0.02] transition-colors">
      <td className="py-4 font-sans font-medium group-hover:text-primary transition-colors cursor-pointer">
        {title}
      </td>
      <td className="py-4 text-muted-foreground">{views}</td>
      <td className="py-4 text-muted-foreground">{engagement}</td>
      <td className="py-4 text-primary">{score}</td>
    </tr>
  );
}

type InteractionCardProps = {
  user: string;
  action: string;
  time: string;
};

function InteractionCard({ user, action, time }: InteractionCardProps) {
  return (
    <div className="p-4 border border-border/60 bg-background/20 flex flex-col gap-1 hover:border-border transition-colors group">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors italic">
          {user}
        </span>
        <span className="text-[9px] font-mono text-muted-foreground/40">
          {time}
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">{action}</p>
    </div>
  );
}
