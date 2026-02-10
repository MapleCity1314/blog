# Posts 重构记录（MDX + Admin）

## 当前状态
- 来源：本地 `content/posts/*.mdx`
- 渲染：Server Components + `next-mdx-remote` + 自定义 MDX 组件
- 缓存：列表/详情加载器使用 `use cache` + `cacheLife("max")`

## 未来数据库迁移（PostgreSQL）
1. 创建 `posts` 表：
   - `id`, `slug`, `title`, `description`, `tags`, `mdx_content`
   - `status` (draft/published), `published_at`, `created_at`, `updated_at`
   - 可选 `cover`
2. 新增 `post_metrics`（阅读量 + 互动统计）：
   - `view_count`, `like_count`, `dislike_count`, `share_count`, `comment_count`
3. 新增 `tags` + `post_tags` 做统一管理
4. 新增 `comments`（匿名 + 支持嵌套评论）
2. 将 `lib/posts.ts` 的文件读取替换为 DB 查询。
3. MDX 渲染链路保持不变：
   - 从 DB 读取 `mdx_content`
   - 使用 `MDXRemote` + `useMDXComponents` 渲染
4. 增加 Admin CRUD 写入 MDX 与更新状态。

## 必须保持不变
- MDX 组件仍放在 `mdx-components.tsx`
- 渲染仍在服务端
- 禁止客户端编译 MDX
- `slug` 作为稳定的规范化标识
