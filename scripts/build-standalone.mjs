import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "output", "standalone");
const standaloneDir = path.join(root, ".next", "standalone");
const nextStaticDir = path.join(root, ".next", "static");
const publicDir = path.join(root, "public");

const envExampleCandidates = [
  path.join(root, ".env.example"),
  path.join(root, "env.example"),
];

function copyDir(source, destination) {
  if (!fs.existsSync(source)) {
    return false;
  }

  fs.cpSync(source, destination, { recursive: true });
  return true;
}

fs.rmSync(outputDir, { recursive: true, force: true });
fs.mkdirSync(outputDir, { recursive: true });

execSync("bun run build", { stdio: "inherit" });

if (!fs.existsSync(standaloneDir)) {
  console.error("Missing .next/standalone. Ensure next.config.ts output is set to 'standalone'.");
  process.exit(1);
}

fs.cpSync(standaloneDir, outputDir, { recursive: true });

if (!copyDir(nextStaticDir, path.join(outputDir, ".next", "static"))) {
  console.warn("Skipping .next/static copy because it was not found.");
}

if (!copyDir(publicDir, path.join(outputDir, "public"))) {
  console.warn("Skipping public copy because it was not found.");
}

const envExample = envExampleCandidates.find((candidate) =>
  fs.existsSync(candidate)
);

if (envExample) {
  fs.copyFileSync(envExample, path.join(outputDir, path.basename(envExample)));
} else {
  console.warn("No env example file found to copy.");
}

console.log("Standalone output ready at output/standalone.");
