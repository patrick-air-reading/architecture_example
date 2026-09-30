import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma 7 no longer loads .env automatically. Locally we read the repo-root
// .env; in Docker, DATABASE_URL comes from the container environment instead.
config({ path: path.resolve(import.meta.dirname, "../../.env"), quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Not using env() here so `prisma generate` works without a database (e.g. Docker builds).
    url: process.env.DATABASE_URL ?? "",
  },
});
