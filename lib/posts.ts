import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type Post = {
  slug: string;
  metadata: {
    title: string;
    date: string;
    description: string;
    tags: string[];
    published: boolean;
  };
  content: string;
};

// 获取所有文章列表（用于列表页）
export function getPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map((fileName) => {
      const slug = fileName.replace(/\.mdx$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      
      // 解析 Frontmatter
      const { data, content } = matter(fileContents);

      // 提供默认值，确保所有必需字段都存在
      const metadata: Post["metadata"] = {
        title: data.title || "Untitled",
        date: data.date || new Date().toISOString().split("T")[0],
        description: data.description || "",
        tags: Array.isArray(data.tags) ? data.tags : [],
        published: data.published !== false, // 默认为 true
      };

      return {
        slug,
        metadata,
        content,
      };
    })
    .filter((post) => post.metadata.published !== false); // 只返回已发布的文章

  // 按日期排序
  return allPostsData.sort((a, b) => {
    if (a.metadata.date < b.metadata.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// 获取单篇文章（用于详情页）
export function getPostBySlug(slug: string): Post | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.mdx`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);
    
    // 提供默认值，确保所有必需字段都存在
    const metadata: Post["metadata"] = {
      title: data.title || "Untitled",
      date: data.date || new Date().toISOString().split("T")[0],
      description: data.description || "",
      tags: Array.isArray(data.tags) ? data.tags : [],
      published: data.published !== false, // 默认为 true
    };
    
    return {
      slug,
      metadata,
      content,
    };
  } catch (e) {
    return null;
  }
}
