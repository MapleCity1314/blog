import fs from "node:fs";
import path from "node:path";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

export type PostFileEntry = {
  slug: string;
  filePath: string;
};

function exists(filePath: string) {
  return fs.existsSync(filePath);
}

export function getPostsDirectory() {
  return POSTS_DIRECTORY;
}

export function getPostDirectory(slug: string) {
  return path.join(POSTS_DIRECTORY, slug);
}

export function getPostIndexPath(slug: string) {
  return path.join(getPostDirectory(slug), "index.mdx");
}

export function getLegacyPostPath(slug: string) {
  return path.join(POSTS_DIRECTORY, `${slug}.mdx`);
}

export function resolvePostFilePath(slug: string): string | null {
  const indexPath = getPostIndexPath(slug);
  if (exists(indexPath)) {
    return indexPath;
  }

  const legacyPath = getLegacyPostPath(slug);
  if (exists(legacyPath)) {
    return legacyPath;
  }

  return null;
}

export async function listPostFileEntries(): Promise<PostFileEntry[]> {
  if (!exists(POSTS_DIRECTORY)) {
    return [];
  }

  const entries = await fs.promises.readdir(POSTS_DIRECTORY, {
    withFileTypes: true,
  });

  const mapped = await Promise.all(
    entries.map(async (entry) => {
      if (entry.isDirectory()) {
        const indexPath = path.join(POSTS_DIRECTORY, entry.name, "index.mdx");
        if (!exists(indexPath)) {
          return null;
        }
        return { slug: entry.name, filePath: indexPath } as PostFileEntry;
      }

      if (entry.isFile() && entry.name.endsWith(".mdx")) {
        const slug = entry.name.replace(/\.mdx$/, "");
        return { slug, filePath: path.join(POSTS_DIRECTORY, entry.name) } as PostFileEntry;
      }

      return null;
    })
  );

  return mapped.filter((item): item is PostFileEntry => item !== null);
}
