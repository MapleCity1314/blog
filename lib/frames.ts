import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const FRAMES_DIR = path.join(process.cwd(), "public", "frames");

async function getFrameFiles() {
  const entries = await readdir(FRAMES_DIR);
  return entries
    .filter((entry) => entry.endsWith(".txt"))
    .sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

export async function getFrames() {
  const files = await getFrameFiles();

  return Promise.all(
    files.map(async (file) => {
      const raw = await readFile(path.join(FRAMES_DIR, file), "utf8");
      return raw.replace(/\r\n/g, "\n").replace(/[^\x00-\x7F]/g, ".");
    })
  );
}

export async function getFirstFrame() {
  const files = await getFrameFiles();
  const first = files[0];
  if (!first) {
    return null;
  }
  const raw = await readFile(path.join(FRAMES_DIR, first), "utf8");
  return raw.replace(/\r\n/g, "\n").replace(/[^\x00-\x7F]/g, ".");
}
