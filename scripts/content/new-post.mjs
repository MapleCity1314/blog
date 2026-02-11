import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const templatePath = path.join(root, "scripts", "content", "templates", "post.mdx");
const postsDir = path.join(root, "content", "posts");

const args = process.argv.slice(2);
const slug = args[0];
const customTitle = args[1];

if (!slug) {
  console.error("Usage: bun run new:post <slug> [title]");
  process.exit(1);
}

const postDir = path.join(postsDir, slug);
const filePath = path.join(postDir, "index.mdx");

if (!fs.existsSync(templatePath)) {
  console.error("Missing template at scripts/content/templates/post.mdx.");
  process.exit(1);
}

if (fs.existsSync(path.join(postsDir, `${slug}.mdx`)) || fs.existsSync(filePath)) {
  console.error(`Post already exists for slug "${slug}".`);
  process.exit(1);
}

fs.mkdirSync(postDir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const title =
  customTitle ??
  slug
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());

const description = `A short summary for ${title}.`;

const template = fs.readFileSync(templatePath, "utf8");
const content = template
  .replace(/__TITLE__/g, title)
  .replace(/__DATE__/g, today)
  .replace(/__DESCRIPTION__/g, description);

fs.writeFileSync(filePath, content, "utf8");

console.log(`Created ${filePath}`);
