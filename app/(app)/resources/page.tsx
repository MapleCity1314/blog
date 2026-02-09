import { Library } from "lucide-react";

import AmbientBackground from "@/components/ambient-background";
import { ResourceStats } from "@/components/resources/resource-stat";
import ResourcesExplorer from "@/components/resources/resources-explorer";
import type { ResourceCategoryFilter, ResourceItem, ResourceStatus } from "@/lib/types/resources";
import { getResourcesDataAction } from "./actions";

function buildResourceStats(resources: ResourceItem[]) {
  const byStatus = resources.reduce<Record<ResourceStatus, number>>(
    (acc, item) => {
      acc[item.status] = (acc[item.status] ?? 0) + 1;
      return acc;
    },
    { Live: 0, Curating: 0, Drafting: 0 }
  );

  return { total: resources.length, byStatus };
}

function buildCategories(resources: ResourceItem[]): ResourceCategoryFilter[] {
  const kinds = Array.from(new Set(resources.map((item) => item.kind)));
  return ["All", ...kinds];
}

export default async function ResourcesPage() {
  const resources = await getResourcesDataAction();
  const stats = buildResourceStats(resources);
  const categories = buildCategories(resources);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <AmbientBackground />

      <main className="mx-auto max-w-7xl px-6 py-20 lg:py-32 space-y-12">
        <header className="relative">
          <div className="mb-6 inline-flex items-center gap-3 rounded-none border border-primary/30 bg-primary/5 px-4 py-2 backdrop-blur-sm">
            <Library size={16} className="text-primary" />
            <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-primary">
              System.Resource_Atlas / v1.1.0
            </span>
          </div>
        </header>

        <ResourceStats total={stats.total} byStatus={stats.byStatus} />

        <ResourcesExplorer resources={resources} categories={categories} />
      </main>
    </div>
  );
}
