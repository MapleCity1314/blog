import type { ReactNode } from "react";

export function AdminPillButton({
  children,
  tone = "ghost",
}: {
  children: ReactNode;
  tone?: "ghost" | "solid";
}) {
  const base =
    "h-10 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40";
  const styles =
    tone === "solid"
      ? "bg-foreground text-background hover:opacity-90"
      : "border border-border/70 bg-background text-muted-foreground hover:text-foreground";

  return (
    <button type="button" className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

export function AdminPillTab({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className="h-9 rounded-full border border-border/70 bg-background px-3 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
    >
      {children}
    </button>
  );
}
