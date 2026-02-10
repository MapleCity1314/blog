import fs from "node:fs";
import path from "node:path";
import { ABOUT_DATA } from "@/lib/data/about-data";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "@/lib/db/schema";
import { about, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";

function loadEnvFile(filename: string) {
  const filePath = path.resolve(process.cwd(), filename);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, "utf-8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const [key, ...rest] = trimmed.split("=");
    if (!key) {
      continue;
    }
    const value = rest.join("=");
    if (!(key in process.env)) {
      process.env[key] = value.replace(/^\"|\"$/g, "");
    }
  }
}

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  const client = postgres(url, { max: 1, connect_timeout: 10 });
  const db = drizzle(client, { schema });
  return { db, client };
}

async function seedAdminUser(db: ReturnType<typeof createDb>["db"]) {
  const username = "presto";
  const password = "presto13140627";

  await db.delete(users).where(eq(users.username, "admin"));

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(users)
      .set({
        displayName: "Presto",
        passwordHash: hashPassword(password),
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing[0].id));
    return;
  }

  await db.insert(users).values({
    username,
    displayName: "Presto",
    passwordHash: hashPassword(password),
  });
}

async function seedAbout(db: ReturnType<typeof createDb>["db"]) {
  const existing = await db
    .select({ id: about.id })
    .from(about)
    .limit(1);

  if (existing.length === 0) {
    await db.insert(about).values({
      profile: ABOUT_DATA.profile,
      heroIntro: ABOUT_DATA.heroIntro,
      heroMeta: ABOUT_DATA.heroMeta,
      partner: ABOUT_DATA.partner,
      skills: ABOUT_DATA.skills,
      experiences: ABOUT_DATA.experiences,
      blog: ABOUT_DATA.blog,
    });
    return;
  }

  await db
    .update(about)
    .set({
      profile: ABOUT_DATA.profile,
      heroIntro: ABOUT_DATA.heroIntro,
      heroMeta: ABOUT_DATA.heroMeta,
      partner: ABOUT_DATA.partner,
      skills: ABOUT_DATA.skills,
      experiences: ABOUT_DATA.experiences,
      blog: ABOUT_DATA.blog,
      updatedAt: new Date(),
    })
    .where(eq(about.id, existing[0].id));
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");

  const { db, client } = createDb();
  await seedAdminUser(db);
  await seedAbout(db);
  await client.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
