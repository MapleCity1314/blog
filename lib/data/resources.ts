import "server-only";

import { cache } from "react";
import { cacheLife } from "next/cache";
import { desc, eq } from "drizzle-orm";
import type { ResourceItem, ResourceStatus } from "@/lib/types/resources";
import { db } from "@/lib/db";
import { resources as resourcesTable } from "@/lib/db/schema";

type ResourceRow = {
  id: string;
  title: string;
  url: string;
  status: "draft" | "published" | "archived";
  description: string | null;
  category: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function mapStatus(status: ResourceRow["status"]): ResourceStatus {
  switch (status) {
    case "published":
      return "Live";
    case "archived":
      return "Curating";
    default:
      return "Drafting";
  }
}

function buildTags(category: string | null) {
  if (!category) return [];
  return category
    .split(/[\\s/|,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function toResourceItem(row: ResourceRow): ResourceItem {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    kind: row.category ?? "Uncategorized",
    status: mapStatus(row.status),
    summary: row.description ?? "No description yet.",
    tags: buildTags(row.category),
  };
}

async function fetchResources(status?: ResourceRow["status"]) {
  const baseQuery = db
    .select({
      id: resourcesTable.id,
      title: resourcesTable.title,
      url: resourcesTable.url,
      status: resourcesTable.status,
      description: resourcesTable.description,
      category: resourcesTable.category,
      createdAt: resourcesTable.createdAt,
      updatedAt: resourcesTable.updatedAt,
    })
    .from(resourcesTable);

  const rows = status
    ? await baseQuery.where(eq(resourcesTable.status, status)).orderBy(desc(resourcesTable.createdAt))
    : await baseQuery.orderBy(desc(resourcesTable.createdAt));

  return rows.map(toResourceItem);
}

export const getResourcesData = cache(async () => {
  "use cache";
  cacheLife("hours");
  return fetchResources("published");
});

export const getResourcesAdminData = cache(async () => {
  "use cache";
  cacheLife("hours");
  return fetchResources();
});
