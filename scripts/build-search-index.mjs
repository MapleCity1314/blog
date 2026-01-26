import fs from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content", "posts");
const outputPath = path.join(process.cwd(), "public", "search-index.json");

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

  const fileNames = await fs.readdir(postsDirectory);
  const mdxNames = fileNames.filter((fileName) => fileName.endsWith(".mdx"));

  const items = await Promise.all(
    mdxNames.map(async (fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const fullPath = path.join(postsDirectory, fileName);
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
