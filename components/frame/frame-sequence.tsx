import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import FrameSequencePlayer, {
  type FrameSequenceBorderStyle,
  type FrameSequenceConfig,
} from "./frame-sequence-player";

const FRAMES_DIR = path.join(process.cwd(), "public", "frames");

type FrameSequenceProps = {
  config?: FrameSequenceConfig;
  borderStyle?: FrameSequenceBorderStyle;
};

async function loadFrames() {
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

  return frames;
}

export default async function FrameSequence({
  config,
  borderStyle,
}: FrameSequenceProps) {
  const frames = await loadFrames();

  return (
    <FrameSequencePlayer
      frames={frames}
      config={config}
      borderStyle={borderStyle}
    />
  );
}
