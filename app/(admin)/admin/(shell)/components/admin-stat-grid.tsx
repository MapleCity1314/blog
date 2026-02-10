export default function AdminStatGrid({
  stats,
}: {
  stats: { label: string; value: string; note: string }[];
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-border/70 bg-background/70 p-4"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            {item.label}
          </p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {item.value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{item.note}</p>
        </div>
      ))}
    </div>
  );
}
