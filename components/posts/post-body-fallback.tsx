export function PostBodyFallback() {
  return (
    <article className="max-w-none space-y-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-4 animate-pulse">
          <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-full rounded bg-zinc-100 dark:bg-zinc-800" />
          <div className="h-4 w-5/6 rounded bg-zinc-100 dark:bg-zinc-800" />
        </div>
      ))}
    </article>
  );
}
