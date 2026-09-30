import { createApp } from "./app.js";
import { prisma } from "./db.js";
import { env } from "./env.js";

const server = createApp().listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));
