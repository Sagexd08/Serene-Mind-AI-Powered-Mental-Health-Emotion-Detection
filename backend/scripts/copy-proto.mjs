import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");
const srcDir = path.join(projectRoot, "src", "proto");
const destDir = path.join(projectRoot, "dist", "proto");

fs.mkdirSync(destDir, { recursive: true });

const protoFiles = fs
  .readdirSync(srcDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && entry.name.endsWith(".proto"))
  .map((entry) => entry.name);

if (protoFiles.length === 0) {
  console.warn("No .proto files found to copy.");
  process.exit(0);
}

for (const file of protoFiles) {
  const source = path.join(srcDir, file);
  const target = path.join(destDir, file);
  fs.copyFileSync(source, target);
  console.log(`Copied ${file} -> dist/proto`);
}
