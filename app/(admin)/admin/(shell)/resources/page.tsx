import { ExternalLink, Plus, Save, Trash2 } from "lucide-react";
import { getResourcesAdminData } from "@/lib/data/resources";
import { createResource, deleteResource, updateResource, updateResourceStatus } from "./actions";

function mapToDbStatus(status: "Live" | "Curating" | "Drafting") {
  switch (status) {
    case "Live":
      return "published";
    case "Curating":
      return "archived";
    default:
      return "draft";
  }
}

export default async function AdminResourcesPage() {
  const resources = await getResourcesAdminData();
  const total = resources.length;
  const liveCount = resources.filter((item) => item.status === "Live").length;
  const draftCount = resources.filter((item) => item.status === "Drafting").length;

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border/60 pb-6">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-tighter italic">
            Resource_Registry
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage the public-facing resources feed.
          </p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono uppercase text-muted-foreground/60">
          <span>Total: {total}</span>
          <span>Live: {liveCount}</span>
          <span>Drafting: {draftCount}</span>
        </div>
      </div>

      <section className="border border-border/60 bg-background/30 p-6">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60 mb-4">
          Register_New_Asset
        </h3>
        <form action={createResource} className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Title
            </label>
            <input
              name="title"
              required
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              URL
            </label>
            <input
              name="url"
              type="url"
              inputMode="url"
              required
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Category
            </label>
            <input
              name="category"
              placeholder="e.g. Framework"
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Status
            </label>
            <select
              name="status"
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-mono uppercase text-muted-foreground">
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="inline-flex items-center gap-2 bg-primary px-4 py-2 text-[10px] font-mono font-bold uppercase tracking-widest text-primary-foreground hover:opacity-90 transition-all">
              <Plus size={14} /> Create_Asset
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
          Registry_Assets
        </h3>
        {resources.length === 0 ? (
          <div className="border border-dashed border-border/60 bg-background/20 p-6 text-xs text-muted-foreground">
            No resources yet. Create your first entry above.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group relative border border-border/60 bg-background/40 p-5 space-y-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-mono text-primary/70 uppercase">
                      {resource.kind}
                    </p>
                    <h4 className="text-base font-semibold">{resource.title}</h4>
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-muted-foreground hover:text-primary"
                    >
                      {resource.url} <ExternalLink size={10} className="inline" />
                    </a>
                  </div>
                  <span className="text-[9px] border border-border/60 px-2 py-0.5 font-mono uppercase text-muted-foreground">
                    {resource.status}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {resource.summary}
                </p>

                <div className="flex flex-wrap gap-2">
                  {resource.tags?.length ? (
                    resource.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono text-muted-foreground/50 lowercase"
                      >
                        #{tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-[9px] font-mono text-muted-foreground/40 lowercase">
                      #uncategorized
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {["draft", "published", "archived"].map((status) => (
                    <form key={status} action={updateResourceStatus}>
                      <input type="hidden" name="id" value={resource.id} />
                      <input type="hidden" name="status" value={status} />
                      <button className="rounded-full border border-border/60 px-3 py-1 text-[9px] font-mono uppercase text-muted-foreground hover:text-primary hover:border-primary/40 transition">
                        Set_{status}
                      </button>
                    </form>
                  ))}
                </div>

                <details className="border-t border-dashed border-border/60 pt-4">
                  <summary className="cursor-pointer text-[10px] font-mono uppercase text-muted-foreground">
                    Edit_Asset
                  </summary>
                  <form action={updateResource} className="mt-4 space-y-3">
                    <input type="hidden" name="id" value={resource.id} />
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Title
                      </label>
                      <input
                        name="title"
                        defaultValue={resource.title}
                        required
                        className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">
                        URL
                      </label>
                      <input
                        name="url"
                        type="url"
                        inputMode="url"
                        defaultValue={resource.url}
                        required
                        className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Category
                      </label>
                      <input
                        name="category"
                        defaultValue={resource.kind}
                        className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Status
                      </label>
                      <select
                        name="status"
                        defaultValue={mapToDbStatus(resource.status)}
                        className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase text-muted-foreground">
                        Description
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        defaultValue={resource.summary}
                        className="w-full border border-border/60 bg-background/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <button className="inline-flex items-center gap-2 rounded-full border border-border/60 px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 transition">
                        <Save size={12} /> Save_Changes
                      </button>
                    </div>
                  </form>
                  <form action={deleteResource} className="mt-3">
                    <input type="hidden" name="id" value={resource.id} />
                    <button
                      className="inline-flex items-center gap-2 text-[10px] font-mono uppercase text-red-300 hover:text-red-200 transition"
                      type="submit"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </form>
                </details>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
