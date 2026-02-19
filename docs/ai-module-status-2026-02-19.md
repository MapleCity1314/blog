# AI 模块状态同步（2026-02-19）

## 1. 今日已完成（核心）
- 已将聊天 API 路由统一到 `app/(chat)/api/chat/*`，避免放在 `(app)` 下导致结构混乱。
- 已完成会话路由形态：`/c/[chatId]`，支持创建会话后跳转到 UUID 路径。
- 已完成聊天页 RSC 包装：服务端负责鉴权和初始数据，客户端使用 `useChat` 处理对话流。
- 已完成分享能力：用户可生成分享链接，其他人可通过分享链接访问对应会话历史（只读）。
- 已完成 `u0-pro` 对 Kimi（OpenAI-compatible）接入，环境变量仅保留 `KIMI_BASE_URL`、`KIMI_API_KEY`。
- 已将 chat preview 页面拆分到 `components`，并补充邀请码直达聊天页入口。
- 已新增 Admin AI 页面（邀请码管理、状态切换、配额调整、概览统计）。

## 2. 已修复的问题
- 修复 Admin AI 页面运行时报错（`ai_invite_codes` 聚合查询失败）：
  - 调整统计查询与异常兜底逻辑，避免页面直接崩溃。
- 修复 `bun run db:migrate` 的 `url: undefined`：
  - `drizzle.config.ts` 已补充从 `.env.local/.env` 读取 `DATABASE_URL` 的逻辑。
- 修复“输入邀请码后卡在验证页”：
  - 对新创建但尚无消息的 `chatId` 增加 `"new"` 访问态，允许进入 `/c/[chatId]`。
  - 仅在 `"forbidden"` 时重定向，避免误判导致循环回验证页。
- 修复聊天壳层 hydration 不一致（随机 href 导致）：
  - 将随机值生成时机改为用户点击时。

## 3. 当前工作区现状（与 AI 相关）
- AI 模块主链路（邀请码 -> 会话 -> 对话 -> 历史 -> 分享 -> Admin 配置）已打通。
- 仍存在大量与本次 AI 工作无关的工作区改动（用户历史改动 + 未跟踪文件），本次未回退。
- `tmp_ai_cookie.txt`、`tmp_chat_id.txt`、`tmp_share_url.txt` 为本地联调产物，建议后续清理。

## 4. 已完成验证
- 已验证 `/api/chat/session`：邀请码校验与会话建立正常。
- 已验证 `/api/chat`：`u0-pro` 可正常流式返回。
- 已验证 `/api/chat/conversations` 与 `/api/chat/history`：会话与消息可读写。
- 已验证 `/api/chat/share`：可生成并访问分享链接。
- 已验证页面流转：`/chat/preview` 输入邀请码后可直达 `/c/[chatId]`。

## 5. 仍需关注（非阻塞）
- 仓库中存在若干历史类型问题（非本次 AI 模块引入），全量 `tsc` 可能仍报错。
- 若后续做上线前收口，建议补齐最小自动化测试：
  - 邀请码校验成功/失败路径。
  - 新 `chatId` 首次访问路径。
  - 分享链接匿名访问路径。
  - 配额扣减与并发保护路径。

## 6. 关联提交（本轮 AI 主线）
- `9285c4a` refactor: move chat api routes into chat route group
- `5f69c9c` feat: add conversation routes and chat sharing links
- `f02e0ae` feat: wrap chat page with rsc and migrate to usechat
- `e503099` feat: map u0-pro to kimi via openai-compatible provider
- `561e5ed` feat: add admin ai page for invite code management
- `508f9c2` fix: reset-safe db config and stabilize ai chat admin flows
- `24ba17e` fix: allow new chat ids after invite and add preview invite entry
