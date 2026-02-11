import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const serverPath = path.join(root, "output", "standalone", "server.js");

if (!fs.existsSync(serverPath)) {
  console.error("Missing output/standalone/server.js. Run build:standalone first.");
  process.exit(1);
}

const child = spawn(process.execPath, [serverPath], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV ?? "production",
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
