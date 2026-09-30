import cors from "cors";
import express from "express";
import { prisma } from "./db.js";
import { errorHandler, unknownRoute } from "./errors.js";
import { districtsRouter } from "./routes/districts.js";
import { schoolsRouter } from "./routes/schools.js";
import { studentsRouter } from "./routes/students.js";
import { teachersRouter } from "./routes/teachers.js";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", async (_req, res) => {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  });

  app.use("/api/districts", districtsRouter);
  app.use("/api/schools", schoolsRouter);
  app.use("/api/students", studentsRouter);
  app.use("/api/teachers", teachersRouter);

  app.use(unknownRoute);
  app.use(errorHandler);
  return app;
}
