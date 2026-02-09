"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";

import { ResourceCard } from "@/components/resources/resource-card";
import type { ResourceCategoryFilter, ResourceItem } from "@/lib/types/resources";
import { cn } from "@/lib/utils";

type ResourcesExplorerProps = {
  resources: ResourceItem[];
  categories: ResourceCategoryFilter[];
};

export default function ResourcesExplorer({ resources, categories }: ResourcesExplorerProps) {
  const [activeCategory, setActiveCategory] = useState<ResourceCategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return resources.filter((item) => {
      const matchesCategory = activeCategory === "All" || item.kind === activeCategory;
      const matchesSearch =
        query.length === 0 ||
        item.title.toLowerCase().includes(query) ||
        item.tags.some((tag) => tag.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, resources, searchQuery]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tighter md:text-7xl uppercase italic">
            Registry
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground max-w-md border-l-2 border-primary/20 pl-4">
            A living index of front-end foundations and component systems. Fast to scan, precise to
            filter, built for builders.
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
          <input
            type="text"
            placeholder="SEARCH_DATABASE…"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full bg-background/50 border border-border/60 p-2 pl-9 text-[10px] font-mono uppercase tracking-widest focus:border-primary/50 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2 mr-4 text-muted-foreground">
          <SlidersHorizontal size={14} />
          <span className="text-[10px] font-mono uppercase tracking-widest">Filter:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-4 py-1.5 text-[10px] font-mono uppercase tracking-widest transition-all",
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.3)]"
                  : "bg-background/40 text-muted-foreground border border-border/60 hover:border-primary/50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <motion.section
        layout
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredResources.map((resource) => (
            <ResourceCard key={resource.id} resource={resource} />
          ))}
        </AnimatePresence>
      </motion.section>

      {filteredResources.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center border border-dashed border-border/60 bg-muted/5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Zero_Matches_Found_In_Registry
          </p>
        </div>
      )}
    </div>
  );
}
