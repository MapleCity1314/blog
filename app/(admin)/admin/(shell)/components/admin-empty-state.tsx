import type { ReactNode } from "react";

export default function AdminEmptyState({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border/80 bg-background/70 p-4 text-sm text-muted-foreground">
      {children}
    </div>
  );
}
