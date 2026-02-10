import Link from "next/link";
import { listAdminComments } from "@/lib/admin/comments";
import { updateCommentStatus } from "./actions";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminCommentsPage() {
  const comments = await listAdminComments();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Comment Moderation</h1>
        <p className="text-sm text-muted-foreground">
          Review user comments and control visibility in one place.
        </p>
      </section>

      <section className="border border-border/60 bg-background/40 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-muted/30">
              <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-medium">Post</th>
                <th className="px-4 py-3 font-medium">Author</th>
                <th className="px-4 py-3 font-medium">Content</th>
                <th className="px-4 py-3 font-medium">Votes</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {comments.length === 0 ? (
                <tr>
                  <td className="px-4 py-8 text-muted-foreground" colSpan={7}>
                    No comments found yet.
                  </td>
                </tr>
              ) : (
                comments.map((comment) => (
                  <tr key={comment.id} className="border-t border-border/40 align-top">
                    <td className="px-4 py-3">
                      <Link
                        href={`/posts/${comment.postSlug}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {comment.postTitle}
                      </Link>
                      <p className="mt-1 text-xs text-muted-foreground">{comment.postSlug}</p>
                    </td>
                    <td className="px-4 py-3 text-foreground">{comment.author}</td>
                    <td className="px-4 py-3 max-w-xl">
                      <p className="line-clamp-3 break-words text-muted-foreground">
                        {comment.content}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      +{comment.likeCount} / -{comment.dislikeCount}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded border border-border/60 px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                        {comment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(comment.createdAt)}</td>
                    <td className="px-4 py-3">
                      <form action={updateCommentStatus} className="flex items-center gap-2">
                        <input type="hidden" name="id" value={comment.id} />
                        <input type="hidden" name="redirect_to" value="/admin/comments" />
                        <select
                          name="status"
                          defaultValue={comment.status}
                          className="h-9 border border-border/60 bg-background px-2 text-xs"
                        >
                          <option value="visible">Visible</option>
                          <option value="hidden">Hidden</option>
                          <option value="deleted">Deleted</option>
                        </select>
                        <button
                          type="submit"
                          className="h-9 border border-primary/40 bg-primary/10 px-3 text-xs font-semibold text-primary hover:bg-primary/20"
                        >
                          Save
                        </button>
                      </form>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

