# Presto Blog

一个现代化的个人博客系统，基于 Next.js 16 构建，支持 MDX 文章、友链管理、主题切换等功能。

## ✨ 特性

- 📝 **MDX 文章系统** - 支持 Markdown + React 组件，代码高亮、数学公式、Mermaid 图表
- 🔗 **友链管理** - 带邮件确认的安全友链申请流程
- 🎨 **现代化 UI** - 响应式设计，支持深色/浅色主题切换
- 🔍 **全文搜索** - 实时搜索文章标题、内容、标签
- ⚡ **性能优化** - Next.js 16 Cache Components、静态生成、图片优化
- 🎭 **动画效果** - Framer Motion 驱动的流畅过渡动画
- 📱 **移动端适配** - 完善的移动端体验

## 🛠️ 技术栈

- **框架**: [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **UI**: React 19, TypeScript, Tailwind CSS v4
- **内容**: MDX, gray-matter, next-mdx-remote
- **样式**: Tailwind CSS v4, Framer Motion
- **代码高亮**: rehype-pretty-code, Shiki
- **数学公式**: KaTeX (rehype-katex)
- **图表**: Mermaid
- **邮件**: Nodemailer
- **字体**: Quicksand, Noto Serif SC, Liu Jian Mao Cao, Geist Mono

## 🚀 快速开始

### 前置要求

- Node.js 18+ 或 [Bun](https://bun.sh/) 1.0+
- Git

### 安装依赖

```bash
# 使用 Bun (推荐)
bun install

# 或使用 npm
npm install
```

### 环境变量配置

创建 `.env.local` 文件（参考 `.env.example`）：

```bash
# 站点基础 URL（用于生成友链确认链接）
PUBLIC_SITE_URL=https://your-domain.com
# 或
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# 友链邮件配置（可选，如需使用友链功能）
FRIENDS_ADMIN_EMAIL=your-email@example.com
FRIENDS_SMTP_HOST=smtp.example.com
FRIENDS_SMTP_PORT=587
FRIENDS_SMTP_USER=your-smtp-user
FRIENDS_SMTP_PASS=your-smtp-password
FRIENDS_SMTP_FROM=noreply@example.com
```

### 开发模式

```bash
bun dev
# 或
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 构建生产版本

```bash
bun run build
bun run start
```

### 创建新文章

```bash
bun run new:post
```

## 📁 项目结构

```
blog/
├── app/                    # Next.js App Router
│   ├── (app)/             # 公共博客路由组
│   │   ├── api/           # API 路由
│   │   │   ├── friends/   # 友链 API
│   │   │   ├── search/    # 搜索 API
│   │   │   └── frames/    # 动画帧 API
│   │   ├── posts/         # 文章列表和详情页
│   │   ├── friends/       # 友链页面
│   │   └── about/         # 关于页面
│   ├── layout.tsx         # 根布局
│   └── globals.css        # 全局样式
├── components/            # React 组件
│   ├── home/             # 首页组件
│   ├── mdx/              # MDX 相关组件
│   └── ui/               # UI 基础组件
├── content/              # 内容文件
│   ├── posts/            # MDX 文章
│   └── friends.json      # 友链数据
├── lib/                  # 工具函数
│   ├── friends/         # 友链相关逻辑
│   ├── posts.ts         # 文章处理
│   └── security.ts      # 安全工具（限流等）
├── public/              # 静态资源
└── scripts/             # 构建和工具脚本
```

## 🔐 安全特性

- ✅ **友链访问令牌** - UUID v4 生成，30 分钟有效期，一次性使用
- ✅ **API 限流** - 基于 IP 的文件级限流，防止滥用和邮件轰炸
- ✅ **安全 URL 生成** - 使用环境变量配置站点 URL，避免 Host Header 注入
- ✅ **输入验证** - 所有用户输入都经过校验和清理

## 📝 文章编写

文章使用 MDX 格式，存放在 `content/posts/` 目录下。

### Frontmatter 示例

```mdx
---
title: "文章标题"
date: "2025-01-26"
description: "文章描述"
tags: ["tag1", "tag2"]
published: true
---

文章内容...
```

### 支持的 MDX 特性

- **代码块** - 自动语法高亮，支持复制
- **数学公式** - 使用 `$...$` (行内) 或 `$$...$$` (块级)
- **Mermaid 图表** - 使用 `<Mermaid />` 组件
- **Callout 提示框** - 使用 `<Callout type="warning">` 等
- **GFM** - GitHub Flavored Markdown 支持

## 🔗 友链功能

友链功能包含以下流程：

1. **申请访问** - 用户点击"Request Access"，系统发送确认邮件
2. **邮件确认** - 管理员点击邮件中的链接，用户获得访问权限
3. **提交友链** - 用户填写友链信息并提交
4. **自动展示** - 友链自动出现在友链页面

### 限流策略

- **访问申请**: 30 分钟内最多 5 次
- **Token 校验**: 10 分钟内最多 30 次
- **友链提交**: 1 小时内最多 10 次

## 🚢 部署

### Vercel (推荐)

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com) 导入项目
3. 配置环境变量
4. 自动部署

### Docker

```bash
bun run build:docker
docker build -f scripts/Dockerfile.standalone -t blog .
docker run -p 3000:3000 blog
```

### Standalone 模式

```bash
bun run build:standalone
bun run start:standalone
```

## 🧪 开发指南

### 代码规范

- 使用 TypeScript，严格模式
- 优先使用 Server Components
- 路由文件夹使用 kebab-case
- JSX 使用 2 空格缩进
- 遵循 [AGENTS.md](./AGENTS.md) 中的开发规范

### 常用命令

```bash
# 开发服务器
bun dev

# 生产构建
bun run build

# 本地预览生产构建
bun run start

# 创建新文章
bun run new:post

# 代码检查（可选）
bunx next lint
```

## 📄 许可证

MIT License

## 👤 作者

**Presto** (z0_DEV)

- Blog: [your-blog-url]
- GitHub: [@your-username]

---

Built with ❤️ using Next.js
