import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

type PostViewsStore = {
  records: Record<string, number>;
};

const VIEWS_FILE = path.join(process.cwd(), "content", "post-views.json");

async function ensureContentDir() {
  await fs.mkdir(path.join(process.cwd(), "content"), { recursive: true });
}

async function readViewsStore(): Promise<PostViewsStore> {
  try {
    const raw = await fs.readFile(VIEWS_FILE, "utf8");
    return JSON.parse(raw) as PostViewsStore;
  } catch {
    return { records: {} };
  }
}

async function writeViewsStore(store: PostViewsStore) {
  await ensureContentDir();
  await fs.writeFile(VIEWS_FILE, JSON.stringify(store, null, 2));
}

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase();
}

export async function getPostViews(slug: string) {
  const key = normalizeSlug(slug);
  const store = await readViewsStore();
  return store.records[key] ?? 0;
}

export async function incrementPostViews(slug: string) {
  const key = normalizeSlug(slug);
  const store = await readViewsStore();
  const next = (store.records[key] ?? 0) + 1;
  store.records[key] = next;
  await writeViewsStore(store);
  return next;
}
