import type { ResourceStatus } from "@/lib/types/resources";

type ResourceStatsProps = {
  total: number;
  byStatus: Record<ResourceStatus, number>;
};

export function ResourceStats({ total, byStatus }: ResourceStatsProps) {
  const stats = [
    { label: "Total_Entries", value: total },
    { label: "Status_Online", value: byStatus.Live ?? 0 },
    { label: "Curating", value: (byStatus.Curating ?? 0) + (byStatus.Drafting ?? 0) },
  ];

  return (
    <div className="flex flex-wrap gap-8 border-y border-border/40 py-6 mb-12">
      {stats.map((stat) => (
        <div key={stat.label} className="flex flex-col gap-1">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
            {stat.label}
          </span>
          <span className="text-2xl font-mono font-bold italic tracking-tighter">
            {stat.value.toString().padStart(2, "0")}
          </span>
        </div>
      ))}
    </div>
  );
}
