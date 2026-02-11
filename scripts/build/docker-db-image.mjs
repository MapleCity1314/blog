import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "output");
const dockerDir = path.join(outputDir, "docker");
const dockerfile = path.join(root, "scripts", "docker", "Dockerfile.postgres");

const args = process.argv.slice(2);
const tagIndex = args.indexOf("--tag");
const imageTag =
  tagIndex !== -1 && args[tagIndex + 1] ? args[tagIndex + 1] : "blog-db:local";

if (!fs.existsSync(dockerfile)) {
  console.error("Missing scripts/docker/Dockerfile.postgres.");
  process.exit(1);
}

fs.mkdirSync(dockerDir, { recursive: true });

execSync(`docker build -f "${dockerfile}" -t "${imageTag}" "${root}"`, {
  stdio: "inherit",
});

const safeName = imageTag.replace(/[^a-zA-Z0-9_.-]/g, "_");
const outputTar = path.join(dockerDir, `${safeName}.tar`);

execSync(`docker save "${imageTag}" -o "${outputTar}"`, { stdio: "inherit" });

console.log(`Database Docker image saved to ${outputTar}`);
