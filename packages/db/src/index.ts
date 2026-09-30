import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.js";

export { Prisma, PrismaClient } from "./generated/prisma/client.js";
export type { District, School, Student, Teacher } from "./generated/prisma/client.js";

export function createPrismaClient(connectionString = process.env.DATABASE_URL): PrismaClient {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  // Prisma 7 talks to Postgres through a driver adapter (node-postgres here).
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Prisma error codes the API maps to HTTP responses. */
export const PrismaErrorCode = {
  UniqueConstraint: "P2002",
  ForeignKeyConstraint: "P2003",
  RecordNotFound: "P2025",
} as const;
