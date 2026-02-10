import type { ReactNode } from "react";

export default function AdminCard({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-3xl border border-border/80 bg-card/90 p-6 ${className ?? ""}`}
    >
      {title ? (
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      ) : null}
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className={title || description ? "mt-4" : undefined}>{children}</div>
    </section>
  );
}
