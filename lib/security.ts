import "server-only";

import { promises as fs } from "node:fs";
import path from "node:path";

type RateLimitRecord = {
  key: string;
  timestamp: number;
};

type RateLimitStore = {
  records: RateLimitRecord[];
};

const RATE_LIMIT_FILE = path.join(process.cwd(), "content", "rate-limit.json");

async function ensureContentDir() {
  await fs.mkdir(path.join(process.cwd(), "content"), { recursive: true });
}

async function readRateLimitStore(): Promise<RateLimitStore> {
  try {
    const raw = await fs.readFile(RATE_LIMIT_FILE, "utf8");
    return JSON.parse(raw) as RateLimitStore;
  } catch {
    return { records: [] };
  }
}

async function writeRateLimitStore(store: RateLimitStore) {
  await ensureContentDir();
  await fs.writeFile(RATE_LIMIT_FILE, JSON.stringify(store, null, 2));
}

/**
 * 简单文件级限流：
 * - key: 可以是 IP + 路径 等组合
 * - limit: 时间窗口内允许的最大请求次数
 * - windowMs: 时间窗口（毫秒）
 *
 * 返回 true 表示允许，false 表示达到上限。
 */
export async function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const cutoff = now - windowMs;

  const store = await readRateLimitStore();
  const recentRecords = store.records.filter((record) => record.timestamp >= cutoff);

  const hits = recentRecords.filter((record) => record.key === key).length;
  if (hits >= limit) {
    // 只在内存中统计到达上限，不再写入新记录
    // 顺便清理过期记录
    if (recentRecords.length !== store.records.length) {
      store.records = recentRecords;
      await writeRateLimitStore(store);
    }
    return false;
  }

  recentRecords.push({ key, timestamp: now });
  store.records = recentRecords;
  await writeRateLimitStore(store);
  return true;
}

/**
 * 获取站点的安全 base URL：
 * - 优先使用 PUBLIC_SITE_URL / NEXT_PUBLIC_SITE_URL
 * - 回退到 http://localhost:3000 方便本地开发
 */
export function getSiteBaseUrl() {
  const envUrl =
    process.env.PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  try {
    const url = new URL(envUrl);
    // 只允许 http/https
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("Unsupported protocol");
    }
    return url.origin;
  } catch {
    // 万一配置错误，保证本地开发还能工作
    return "http://localhost:3000";
  }
}

