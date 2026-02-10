import Link from "next/link";
import { Eye, Edit3, Trash2 } from "lucide-react";
import { SystemInput } from "@/components/ui/system-input";
import { getAdminPostSummaries } from "@/lib/admin/posts";
import { getPostViews } from "@/lib/post-views";
import CreatePostForm from "./create-post-form";
import { removePost } from "./actions";

function formatDate(value: string) {
  return new Date(value).toISOString().split("T")[0];
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const query = (resolvedParams?.q ?? "").trim().toLowerCase();

  const summaries = await getAdminPostSummaries();
  const filtered = query
    ? summaries.filter(
        (post) =>
          post.slug.toLowerCase().includes(query) ||
          post.metadata.title.toLowerCase().includes(query)
      )
    : summaries;

  const rows = await Promise.all(
    filtered.map(async (post) => ({
      slug: post.slug,
      title: post.metadata.title,
      date: post.metadata.date,
      status: post.metadata.published ? "Live" : "Draft",
      views: await getPostViews(post.slug),
    }))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4">
        <form className="w-full md:w-96" method="get">
          <SystemInput
            label="Search_Database"
            placeholder="Input Title or ID..."
            name="q"
            type="search"
            defaultValue={resolvedParams?.q ?? ""}
          />
        </form>
        <div className="border border-border/60 bg-background/40 p-4">
          <CreatePostForm />
        </div>
      </div>

      <div className="border border-border/60 bg-background/40 overflow-x-auto">
        <table className="w-full text-left font-mono">
          <thead className="bg-muted/30 border-b border-border/60">
            <tr className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
              <th className="p-4 font-medium">Entry_ID</th>
              <th className="p-4 font-medium">Title_&_Metadata</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-xs text-muted-foreground">
                  No posts found.
                </td>
              </tr>
            ) : (
              rows.map((post) => (
                <tr
                  key={post.slug}
                  className="group hover:bg-primary/[0.02] transition-colors"
                >
                  <td className="p-4 text-xs font-bold text-primary">
                    {post.slug.toUpperCase()}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-sans font-bold group-hover:text-primary transition-colors">
                        {post.title}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50 mt-1 uppercase">
                        Updated: {formatDate(post.date)} // Views: {post.views}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          post.status === "Live"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-zinc-500"
                        }`}
                      />
                      <span className="text-[10px] uppercase font-bold">
                        {post.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/admin/posts/${post.slug}`}
                        className="p-2 hover:text-primary transition-colors"
                        aria-label={`Edit ${post.title}`}
                      >
                        <Edit3 size={14} />
                      </Link>
                      <Link
                        href={`/posts/${post.slug}`}
                        className="p-2 hover:text-primary transition-colors"
                        aria-label={`View ${post.title}`}
                      >
                        <Eye size={14} />
                      </Link>
                      <form action={removePost}>
                        <input type="hidden" name="slug" value={post.slug} />
                        <button
                          type="submit"
                          className="p-2 hover:text-red-500 transition-colors"
                          aria-label={`Delete ${post.title}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
