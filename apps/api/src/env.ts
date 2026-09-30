import path from "node:path";
import { config } from "dotenv";

// Locally, load the repo-root .env. In Docker the variables are set on the container
// and the file doesn't exist, which dotenv tolerates (and it never overrides real env vars).
config({ path: path.resolve(import.meta.dirname, "../../../.env"), quiet: true });

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
};
