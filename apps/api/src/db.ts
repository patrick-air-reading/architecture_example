import { createPrismaClient } from "@edu/db";
import { env } from "./env.js";

export const prisma = createPrismaClient(env.databaseUrl);
