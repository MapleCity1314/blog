"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import path from "node:path";
import { promises as fs } from "node:fs";
import { db } from "@/lib/db";
import { about as aboutTable } from "@/lib/db/schema";
import type { AboutData } from "@/lib/data/about-types";
import { buildAdminToastUrl } from "@/lib/admin/toast";

const HISTORY_PATH = path.join(process.cwd(), "content", "about-history.json");

async function appendAboutHistory(snapshot: AboutData) {
  const entry = {
    at: new Date().toISOString(),
    data: snapshot,
  };

  try {
    await fs.mkdir(path.join(process.cwd(), "content"), { recursive: true });
    let history: Array<typeof entry> = [];
    try {
      const raw = await fs.readFile(HISTORY_PATH, "utf8");
      history = JSON.parse(raw) as Array<typeof entry>;
    } catch {
      history = [];
    }
    history.unshift(entry);
    history = history.slice(0, 20);
    await fs.writeFile(HISTORY_PATH, JSON.stringify(history, null, 2), "utf8");
  } catch {
    // Best-effort history; ignore failures to avoid blocking updates.
  }
}

export async function updateAboutRaw(formData: FormData) {
  const redirectTo = String(formData.get("redirect_to") ?? "").trim() || "/admin/settings";
  const raw = String(formData.get("about_json") ?? "").trim();
  if (!raw) {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Save failed",
        description: "About payload is empty.",
      })
    );
  }

  let parsed: AboutData;
  try {
    parsed = JSON.parse(raw) as AboutData;
  } catch {
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "error",
        message: "Save failed",
        description: "Invalid JSON payload for About.",
      })
    );
  }

  const existing = await db
    .select({ id: aboutTable.id })
    .from(aboutTable)
    .limit(1);

  if (existing.length === 0) {
    await db.insert(aboutTable).values({
      profile: parsed.profile,
      heroIntro: parsed.heroIntro,
      heroMeta: parsed.heroMeta,
      partner: parsed.partner,
      skills: parsed.skills,
      experiences: parsed.experiences,
      blog: parsed.blog,
    });
    revalidatePath("/about");
    revalidatePath("/admin/settings");
    redirect(
      buildAdminToastUrl({
        path: redirectTo,
        type: "success",
        message: "About data saved",
      })
    );
  }

  const current = await db
    .select({
      profile: aboutTable.profile,
      heroIntro: aboutTable.heroIntro,
      heroMeta: aboutTable.heroMeta,
      partner: aboutTable.partner,
      skills: aboutTable.skills,
      experiences: aboutTable.experiences,
      blog: aboutTable.blog,
    })
    .from(aboutTable)
    .where(eq(aboutTable.id, existing[0].id))
    .limit(1);

  if (current[0]) {
    await appendAboutHistory(current[0] as AboutData);
  }

  await db
    .update(aboutTable)
    .set({
      profile: parsed.profile,
      heroIntro: parsed.heroIntro,
      heroMeta: parsed.heroMeta,
      partner: parsed.partner,
      skills: parsed.skills,
      experiences: parsed.experiences,
      blog: parsed.blog,
      updatedAt: new Date(),
    })
    .where(eq(aboutTable.id, existing[0].id));

  revalidatePath("/about");
  revalidatePath("/admin/settings");
  redirect(
    buildAdminToastUrl({
      path: redirectTo,
      type: "success",
      message: "About data saved",
    })
  );
}
