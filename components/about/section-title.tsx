import type { ReactNode } from "react";

type SectionTitleProps = {
  title: string;
  icon: ReactNode;
};

export function SectionTitle({ title, icon }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 bg-muted rounded-md text-foreground">{icon}</div>
      <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-muted-foreground">
        {title}
      </h2>
    </div>
  );
}
