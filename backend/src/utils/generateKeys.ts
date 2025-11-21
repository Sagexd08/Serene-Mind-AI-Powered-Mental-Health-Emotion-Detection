import { existsSync, mkdirSync, writeFileSync } from "fs";
import { generateKeyPairSync } from "crypto";
import path from "path";
import { fileURLToPath } from "url";

export function generateKeys() {
  // Recreate __dirname in ESM
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  const keysDir = path.join(__dirname, "../keys");
  const privateKeyPath = path.join(keysDir, "private.key");
  const publicKeyPath = path.join(keysDir, "public.key");

  if (!existsSync(keysDir)) mkdirSync(keysDir);

  if (existsSync(privateKeyPath) && existsSync(publicKeyPath)) {
    console.log("Keys already exist. Skipping generation.");
    return;
  }

  const { publicKey, privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });

  writeFileSync(privateKeyPath, privateKey);
  writeFileSync(publicKeyPath, publicKey);

  console.log("RSA key pair generated successfully.");
}
