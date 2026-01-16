import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const FRAMES_DIR = path.join(process.cwd(), "public", "frames");

export async function GET() {
  try {
    const entries = await readdir(FRAMES_DIR);
    const files = entries
      .filter((entry) => entry.endsWith(".txt"))
      .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));

    const frames = await Promise.all(
      files.map(async (file) => {
        const raw = await readFile(path.join(FRAMES_DIR, file), "utf8");
        return raw
          .replace(/\r\n/g, "\n")
          .replace(/[^\x00-\x7F]/g, ".");
      })
    );

    return NextResponse.json({ frames });
  } catch (error) {
    console.error("Error loading frames:", error);
    return NextResponse.json(
      { error: "Failed to load frames" },
      { status: 500 }
    );
  }
}
