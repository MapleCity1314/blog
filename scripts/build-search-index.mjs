import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const outputPath = path.join(process.cwd(), "public", "search-index.json");

const resolvePostEntries = async () => {
  const entries = await fs.readdir(postsDirectory, { withFileTypes: true });
  const mapped = entries
    .map((entry) => {
      if (entry.isDirectory()) {
        return {
          slug: entry.name,
          fullPath: path.join(postsDirectory, entry.name, "index.mdx"),
        };
      }
      if (entry.isFile() && entry.name.endsWith(".mdx")) {
        return {
          slug: entry.name.replace(/\.mdx$/, ""),
          fullPath: path.join(postsDirectory, entry.name),
        };
      }
      return null;
    })
    .filter(Boolean);

  return Promise.all(
    mapped.map(async (item) => {
      try {
        await fs.access(item.fullPath);
        return item;
      } catch {
        return null;
      }
    })
  ).then((items) => items.filter(Boolean));
};

const normalizeMetadata = (data, fallbackDate) => ({
  title: typeof data.title === "string" && data.title.trim() ? data.title : "Untitled",
  date: typeof data.date === "string" && data.date.trim() ? data.date : fallbackDate,
  description: typeof data.description === "string" ? data.description : "",
  tags: Array.isArray(data.tags) ? data.tags.filter((tag) => typeof tag === "string") : [],
  published: data.published !== false,
});

const sortByDateDesc = (a, b) => {
  if (a.date < b.date) {
    return 1;
  }
  return -1;
};

const buildIndex = async () => {
  if (!existsSync(postsDirectory)) {
    return [];
  }

  const postEntries = await resolvePostEntries();

  const items = await Promise.all(
    postEntries.map(async ({ slug, fullPath }) => {
      const [fileContents, stats] = await Promise.all([
        fs.readFile(fullPath, "utf8"),
        fs.stat(fullPath),
      ]);
      const fallbackDate = stats.mtime.toISOString().split("T")[0];
      const { data, content } = matter(fileContents);
      const metadata = normalizeMetadata(data, fallbackDate);

      return {
        slug,
        title: metadata.title,
        description: metadata.description,
        date: metadata.date,
        tags: metadata.tags,
        content,
        published: metadata.published,
      };
    })
  );

  return items
    .filter((item) => item.published !== false)
    .sort((a, b) => sortByDateDesc(a, b))
    .map(({ published: _published, ...rest }) => rest);
};

const run = async () => {
  const index = await buildIndex();
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(index));
  console.log(`Search index written to ${outputPath} (${index.length} posts).`);
};

run().catch((error) => {
  console.error("Failed to build search index.", error);
  process.exitCode = 1;
});
