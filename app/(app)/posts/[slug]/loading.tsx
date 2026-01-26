export default function Loading() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans relative overflow-x-hidden">
      <main className="max-w-3xl mx-auto px-6 py-24">
        {/* Back Link Skeleton */}
        <div className="mb-12 h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />

        {/* Header Skeleton */}
        <div className="mb-12 space-y-6 border-b border-zinc-100 dark:border-zinc-800 pb-12">
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
            <div className="h-5 w-20 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          </div>
          <div className="h-10 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
          <div className="h-4 w-40 rounded bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4 animate-pulse">
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-32 w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 mt-8" />
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800 mt-8" />
        </div>
      </main>
    </div>
  );
}