import { execSync } from "node:child_process";

// FROZEN global setup (Fix 1), SD-B2. Builds the dedicated test database with
// the ordinary scenario before the server starts. Never targets practice.db.
// Imports only Node builtins (Playwright 1.61 + Node 24 loader note).
export default async function globalSetup() {
  const env = { ...process.env, DATABASE_URL: "file:./test.db" };
  console.log("→ [frozen global-setup] Building test.db with scenario 'ordinary'…");
  execSync("npx tsx prisma/seed.ts --scenario=ordinary", { stdio: "inherit", env });
}
