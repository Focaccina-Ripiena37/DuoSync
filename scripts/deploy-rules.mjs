// Injects the two partner emails from .env.local into firestore.rules,
// deploys the rules, then restores the placeholder version in the repo.
// Real addresses never end up in the working tree or in git history.
//
// Usage: npm run deploy:rules
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rulesPath = resolve(root, "firestore.rules");
const PLACEHOLDERS = ["user1@example.com", "user2@example.com"];

function readEnv() {
  const env = {};
  const file = resolve(root, ".env.local");
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trimStart().startsWith("#")) env[m[1]] = m[2].trim();
  }
  return env;
}

const emails = [readEnv().DUOSYNC_EMAIL_1, readEnv().DUOSYNC_EMAIL_2];
if (emails.some((e) => !e)) {
  console.error(
    "Mancano DUOSYNC_EMAIL_1 / DUOSYNC_EMAIL_2 in .env.local (vedi .env.local.example)."
  );
  process.exit(1);
}

const template = readFileSync(rulesPath, "utf8");

try {
  const injected = template
    .replaceAll(PLACEHOLDERS[0], emails[0])
    .replaceAll(PLACEHOLDERS[1], emails[1]);
  writeFileSync(rulesPath, injected);
  console.log("firestore.rules aggiornato con le email reali (solo locale)");

  const result = spawnSync("firebase deploy --only firestore", {
    stdio: "inherit",
    cwd: root,
    shell: true,
  });
  if (result.error) {
    console.error(`Errore nell'avvio di firebase: ${result.error.message}`);
    process.exitCode = 1;
  } else {
    process.exitCode = result.status ?? 1;
  }
} finally {
  writeFileSync(rulesPath, template);
  console.log("firestore.rules ripristinato ai placeholder (niente email nel repo)");
}