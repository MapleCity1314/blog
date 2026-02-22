import "server-only";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { cacheLife } from "next/cache";
import {
  getLegacyPostPath,
  getPostDirectory,
  getPostIndexPath,
  listPostFileEntries,
  resolvePostFilePath,
} from "@/lib/post-files";

const publicPostsDirectory = path.join(process.cwd(), "public", "posts");
const AUTOSAVE_FILE = ".autosave.json";
const SUPPORTED_CODE_LANGUAGES = new Set([
  "",
  "txt",
  "text",
  "md",
  "markdown",
  "mdx",
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "yaml",
  "yml",
  "toml",
  "xml",
  "sh",
  "bash",
  "zsh",
  "powershell",
  "ps1",
  "html",
  "css",
  "scss",
  "sql",
  "python",
  "py",
  "rust",
  "go",
  "java",
  "c",
  "cpp",
  "csharp",
  "cs",
  "php",
  "ruby",
  "rb",
  "swift",
  "kotlin",
  "kt",
  "dart",
  "mermaid",
]);

function normalizeMarkdownCodeFences(markdown: string) {
  const normalizedClassName = markdown
    .replace(/\bclassname=/g, "className=")
    .replace(/\bclass=/g, "className=");

  return normalizedClassName.replace(
    /^(\s*)(```|~~~)([^\n`]*)$/gm,
    (_line, indent: string, fence: string, languageRaw: string) => {
      const language = String(languageRaw ?? "").trim();
      if (!language) return `${indent}${fence}`;
      if (language.toLowerCase() === "n/a") return `${indent}${fence}txt`;
      if (!/^[a-z0-9_+-]+$/i.test(language)) return `${indent}${fence}txt`;
      const canonical = language.toLowerCase();
      if (!SUPPORTED_CODE_LANGUAGES.has(canonical)) return `${indent}${fence}txt`;
      return `${indent}${fence}${canonical}`;
    }
  );
}

export type AdminPostMetadata = {
  title: string;
  date: string;
  description: string;
  tags: string[];
  published: boolean;
  cover?: string;
};

export type AdminPostSummary = {
  slug: string;
  metadata: AdminPostMetadata;
  updatedAt: string;
};

export type AdminPost = AdminPostSummary & {
  content: string;
};

const normalizeMetadata = (
  data: Record<string, any>,
  fallbackDate: string
): AdminPostMetadata => ({
  title: data.title || "Untitled",
  date: data.date || fallbackDate,
  description: data.description || "",
  tags: Array.isArray(data.tags) ? data.tags : [],
  published: data.published !== false,
  cover: typeof data.cover === "string" ? data.cover : undefined,
});

const sortByDateDesc = (a: AdminPostMetadata, b: AdminPostMetadata) => {
  if (a.date < b.date) {
    return 1;
  }
  return -1;
};

export const getAdminPostSummaries = cache(async (): Promise<AdminPostSummary[]> => {
  "use cache";
  cacheLife("minutes");

  const entries = await listPostFileEntries();

  const allPostsData = await Promise.all(
    entries.map(async ({ slug, filePath: fullPath }) => {
      const [fileContents, stats] = await Promise.all([
        fs.promises.readFile(fullPath, "utf8"),
        fs.promises.stat(fullPath),
      ]);
      const fallbackDate = stats.mtime.toISOString().split("T")[0];
      const { data } = matter(fileContents);
      const metadata = normalizeMetadata(data, fallbackDate);

      return {
        slug,
        metadata,
        updatedAt: stats.mtime.toISOString(),
      };
    })
  );

  return allPostsData.sort((a, b) => sortByDateDesc(a.metadata, b.metadata));
});

export async function getAdminPostBySlug(slug: string): Promise<AdminPost | null> {
  try {
    const fullPath = resolvePostFilePath(slug);
    if (!fullPath) {
      return null;
    }
    const [fileContents, stats] = await Promise.all([
      fs.promises.readFile(fullPath, "utf8"),
      fs.promises.stat(fullPath),
    ]);
    const fallbackDate = stats.mtime.toISOString().split("T")[0];
    const { data, content } = matter(fileContents);
    const normalizedContent = normalizeMarkdownCodeFences(content);
    const metadata = normalizeMetadata(data, fallbackDate);

    return {
      slug,
      metadata,
      content: normalizedContent,
      updatedAt: stats.mtime.toISOString(),
    };
  } catch {
    return null;
  }
}

function buildFrontmatter(metadata: AdminPostMetadata) {
  const data: Record<string, any> = {
    title: metadata.title,
    date: metadata.date,
    description: metadata.description,
    tags: metadata.tags,
    published: metadata.published,
  };
  if (metadata.cover) {
    data.cover = metadata.cover;
  }
  return data;
}

export async function writeAdminPost(
  slug: string,
  metadata: AdminPostMetadata,
  content: string
) {
  const postDirectory = getPostDirectory(slug);
  const fullPath = getPostIndexPath(slug);
  const frontmatter = buildFrontmatter(metadata);
  const normalizedContent = normalizeMarkdownCodeFences(content);
  const nextBody = matter.stringify(normalizedContent.trimEnd() + "\n", frontmatter);
  await fs.promises.mkdir(postDirectory, { recursive: true });
  await fs.promises.writeFile(fullPath, nextBody, "utf8");

  const legacyPath = getLegacyPostPath(slug);
  if (fs.existsSync(legacyPath)) {
    await fs.promises.unlink(legacyPath);
  }
}

export type PostAutosaveSnapshot = {
  metadata: AdminPostMetadata;
  content: string;
  savedAt: string;
};

export async function writePostAutosave(
  slug: string,
  snapshot: PostAutosaveSnapshot
) {
  const autosavePath = path.join(getPostDirectory(slug), AUTOSAVE_FILE);
  await fs.promises.mkdir(getPostDirectory(slug), { recursive: true });
  await fs.promises.writeFile(
    autosavePath,
    JSON.stringify(
      {
        ...snapshot,
        content: normalizeMarkdownCodeFences(snapshot.content),
      },
      null,
      2
    ),
    "utf8"
  );
}

export async function readPostAutosave(slug: string): Promise<PostAutosaveSnapshot | null> {
  const autosavePath = path.join(getPostDirectory(slug), AUTOSAVE_FILE);
  if (!fs.existsSync(autosavePath)) {
    return null;
  }
  try {
    const raw = await fs.promises.readFile(autosavePath, "utf8");
    const parsed = JSON.parse(raw) as PostAutosaveSnapshot;
    return {
      ...parsed,
      content: normalizeMarkdownCodeFences(parsed.content ?? ""),
    };
  } catch {
    return null;
  }
}

export async function clearPostAutosave(slug: string) {
  const autosavePath = path.join(getPostDirectory(slug), AUTOSAVE_FILE);
  if (!fs.existsSync(autosavePath)) {
    return;
  }
  await fs.promises.unlink(autosavePath);
}

export async function setAdminPostPublished(slug: string, published: boolean) {
  const post = await getAdminPostBySlug(slug);
  if (!post) return false;
  const nextMetadata: AdminPostMetadata = {
    ...post.metadata,
    published,
  };
  await writeAdminPost(slug, nextMetadata, post.content);
  return true;
}

export async function deleteAdminPost(slug: string) {
  const indexPath = getPostIndexPath(slug);
  const legacyPath = getLegacyPostPath(slug);
  const postDirectory = getPostDirectory(slug);
  const publicDirectory = path.join(publicPostsDirectory, slug);

  if (fs.existsSync(postDirectory)) {
    await fs.promises.rm(postDirectory, { recursive: true, force: true });
  }
  if (fs.existsSync(legacyPath)) {
    await fs.promises.unlink(legacyPath);
  }
  if (fs.existsSync(publicDirectory)) {
    await fs.promises.rm(publicDirectory, { recursive: true, force: true });
  }

  if (fs.existsSync(indexPath) || fs.existsSync(legacyPath)) {
    return true;
  }

  return true;
}

export async function renameAdminPost(oldSlug: string, newSlug: string) {
  const oldDirectory = getPostDirectory(oldSlug);
  const newDirectory = getPostDirectory(newSlug);
  const oldLegacyPath = getLegacyPostPath(oldSlug);

  if (fs.existsSync(oldDirectory)) {
    await fs.promises.rename(oldDirectory, newDirectory);
  } else if (fs.existsSync(oldLegacyPath)) {
    await fs.promises.mkdir(newDirectory, { recursive: true });
    await fs.promises.rename(oldLegacyPath, getPostIndexPath(newSlug));
  } else {
    return false;
  }

  const oldPublicDirectory = path.join(publicPostsDirectory, oldSlug);
  const newPublicDirectory = path.join(publicPostsDirectory, newSlug);
  if (fs.existsSync(oldPublicDirectory)) {
    await fs.promises.mkdir(publicPostsDirectory, { recursive: true });
    await fs.promises.rename(oldPublicDirectory, newPublicDirectory);
  }

  const newIndexPath = getPostIndexPath(newSlug);
  if (fs.existsSync(newIndexPath)) {
    const source = await fs.promises.readFile(newIndexPath, "utf8");
    const rewritten = source.replaceAll(`/posts/${oldSlug}/`, `/posts/${newSlug}/`);
    if (rewritten !== source) {
      await fs.promises.writeFile(newIndexPath, rewritten, "utf8");
    }
  }

  return true;
}

function extensionFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  return "png";
}

export async function savePostImage(
  slug: string,
  file: File
): Promise<{ markdownPath: string }> {
  const ext = extensionFromMime(file.type);
  const stamp = Date.now();
  const fileName = `image-${stamp}.${ext}`;
  const postDirectory = getPostDirectory(slug);
  const postAssetsDirectory = path.join(postDirectory, "assets");
  const publicDirectory = path.join(publicPostsDirectory, slug);

  await fs.promises.mkdir(postAssetsDirectory, { recursive: true });
  await fs.promises.mkdir(publicDirectory, { recursive: true });

  const bytes = Buffer.from(await file.arrayBuffer());
  await fs.promises.writeFile(path.join(postAssetsDirectory, fileName), bytes);
  await fs.promises.writeFile(path.join(publicDirectory, fileName), bytes);

  return { markdownPath: `/posts/${slug}/${fileName}` };
}

function sanitizeAssetName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export type PostImageAsset = {
  name: string;
  url: string;
  size: number;
  updatedAt: string;
};

export async function listPostImages(slug: string): Promise<PostImageAsset[]> {
  const postAssetsDirectory = path.join(getPostDirectory(slug), "assets");
  if (!fs.existsSync(postAssetsDirectory)) {
    return [];
  }

  const entries = await fs.promises.readdir(postAssetsDirectory, {
    withFileTypes: true,
  });

  const files = entries.filter((entry) => entry.isFile());
  const mapped = await Promise.all(
    files.map(async (file) => {
      const fullPath = path.join(postAssetsDirectory, file.name);
      const stat = await fs.promises.stat(fullPath);
      return {
        name: file.name,
        url: `/posts/${slug}/${file.name}`,
        size: stat.size,
        updatedAt: stat.mtime.toISOString(),
      } as PostImageAsset;
    })
  );

  return mapped.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function renamePostImage(
  slug: string,
  oldName: string,
  nextNameRaw: string
): Promise<{ oldUrl: string; newUrl: string; newName: string } | null> {
  const nextName = sanitizeAssetName(nextNameRaw);
  if (!oldName || !nextName) {
    return null;
  }

  const postAssetsDirectory = path.join(getPostDirectory(slug), "assets");
  const publicDirectory = path.join(publicPostsDirectory, slug);
  const oldSourcePath = path.join(postAssetsDirectory, oldName);
  const oldPublicPath = path.join(publicDirectory, oldName);
  const nextSourcePath = path.join(postAssetsDirectory, nextName);
  const nextPublicPath = path.join(publicDirectory, nextName);

  if (!fs.existsSync(oldSourcePath) || fs.existsSync(nextSourcePath)) {
    return null;
  }

  await fs.promises.rename(oldSourcePath, nextSourcePath);
  if (fs.existsSync(oldPublicPath)) {
    await fs.promises.rename(oldPublicPath, nextPublicPath);
  }

  return {
    oldUrl: `/posts/${slug}/${oldName}`,
    newUrl: `/posts/${slug}/${nextName}`,
    newName: nextName,
  };
}

export async function deletePostImage(slug: string, name: string) {
  if (!name) return false;

  const postAssetsDirectory = path.join(getPostDirectory(slug), "assets");
  const publicDirectory = path.join(publicPostsDirectory, slug);
  const sourcePath = path.join(postAssetsDirectory, name);
  const publicPath = path.join(publicDirectory, name);

  if (fs.existsSync(sourcePath)) {
    await fs.promises.unlink(sourcePath);
  }
  if (fs.existsSync(publicPath)) {
    await fs.promises.unlink(publicPath);
  }

  return true;
}
