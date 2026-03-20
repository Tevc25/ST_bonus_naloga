import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, "..");
const sourceScriptPath = path.join(
  projectRoot,
  "node_modules",
  "webgazer",
  "dist",
  "webgazer.js"
);
const targetDir = path.join(projectRoot, "public", "vendor");
const targetScriptPath = path.join(targetDir, "webgazer.js");
const sourceMediapipeDir = path.join(
  projectRoot,
  "node_modules",
  "webgazer",
  "dist",
  "mediapipe"
);
const targetMediapipeDir = path.join(projectRoot, "public", "mediapipe");

if (!fs.existsSync(sourceScriptPath)) {
  console.error("[copy-webgazer] Source file not found:", sourceScriptPath);
  process.exit(1);
}

if (!fs.existsSync(sourceMediapipeDir)) {
  console.error(
    "[copy-webgazer] Mediapipe directory not found:",
    sourceMediapipeDir
  );
  process.exit(1);
}

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(sourceScriptPath, targetScriptPath);
fs.cpSync(sourceMediapipeDir, targetMediapipeDir, { recursive: true });

console.log("[copy-webgazer] Copied", sourceScriptPath, "->", targetScriptPath);
console.log(
  "[copy-webgazer] Copied",
  sourceMediapipeDir,
  "->",
  targetMediapipeDir
);
