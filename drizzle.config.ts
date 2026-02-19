import type { Config } from "drizzle-kit";
import fs from "node:fs";
import path from "node:path";

function readDatabaseUrlFromEnvFiles() {
  const candidates = [".env.local", ".env"];

  for (const fileName of candidates) {
    const fullPath = path.join(process.cwd(), fileName);
    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const raw = fs.readFileSync(fullPath, "utf8");
    const lines = raw.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }
      const index = trimmed.indexOf("=");
      if (index < 0) {
        continue;
      }
      const key = trimmed.slice(0, index).trim();
      const value = trimmed.slice(index + 1).trim();
      if (key === "DATABASE_URL" && value) {
        return value;
      }
    }
  }

  return undefined;
}

const databaseUrl = process.env.DATABASE_URL ?? readDatabaseUrlFromEnvFiles();

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is missing. Set it in environment, .env.local, or .env before running drizzle."
  );
}

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
} satisfies Config;
