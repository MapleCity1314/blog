# Presto Blog

基于 `Next.js 16` 的个人博客系统，支持 MDX 内容、前后台管理、友链展示与审核。

## 功能概览

- MDX 文章系统（代码高亮、数学公式、Mermaid）
- 前台页面：`/`、`/about`、`/posts`、`/friends`、`/resources`
- 后台页面：`/admin/*`（文章、友链、资源、设置）
- 友链申请流程：前台请求访问令牌 → 提交友链 → 后台审核入库
- 搜索索引构建：`scripts/build-search-index.mjs`

## 技术栈

- Next.js 16.1.1（App Router）
- React 19 + TypeScript 5
- Tailwind CSS v4
- Drizzle ORM + PostgreSQL

## 快速开始

### 1) 安装依赖

```bash
bun install
```

### 2) 配置环境变量

复制 `.env.example` 为 `.env.local`，至少配置：

```bash
DATABASE_URL=postgres://user:password@localhost:5432/blog
```

可选配置（用于生成站点绝对 URL）：

```bash
PUBLIC_SITE_URL=https://your-domain.com
# 或 NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### 3) 启动开发

```bash
bun run dev
```

访问 `http://localhost:3000`。

## 常用命令

```bash
bun run dev                 # 开发
bun run build               # 构建（含搜索索引）
bun run start               # 生产模式启动
bun run build:search-index  # 仅构建搜索索引
bun run new:post            # 新建文章脚手架
bun run lint:oxlint         # 可选 lint
```

## 目录结构（简化）

```text
app/
  (app)/                    # 前台路由
  (admin)/admin/(shell)/    # 后台路由
components/                 # 组件
content/                    # 内容与数据
lib/                        # 数据访问与工具
scripts/                    # 构建与脚本
public/                     # 静态资源
```

## 友链流程说明（当前）

1. 用户在 `/friends` 点击 `Request Access`
2. 后端直接签发一次性访问令牌（有时效与限流）
3. 用户携带令牌提交友链信息
4. 管理员在 `/admin/friends` 审核通过后展示到前台

## 镜像打包与部署

- 镜像分离打包与手动部署说明：`docs/deploy-images.md`
