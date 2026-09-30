import type { ApiError } from "@edu/common";
import { Prisma, PrismaErrorCode } from "@edu/db";
import type { ErrorRequestHandler, RequestHandler } from "express";
import { z } from "zod";

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, `${what} not found`);

export const unknownRoute: RequestHandler = (_req, res) => {
  res.status(404).json({ error: "Route not found" } satisfies ApiError);
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message } satisfies ApiError);
    return;
  }

  if (err instanceof z.ZodError) {
    res.status(400).json({
      error: "Validation failed",
      details: z.flattenError(err).fieldErrors as ApiError["details"],
    } satisfies ApiError);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case PrismaErrorCode.RecordNotFound:
        res.status(404).json({ error: "Record not found" } satisfies ApiError);
        return;
      case PrismaErrorCode.UniqueConstraint:
        res.status(409).json({ error: "A record with that value already exists" } satisfies ApiError);
        return;
      case PrismaErrorCode.ForeignKeyConstraint:
        res.status(409).json({
          error: "This record is referenced by (or references) another record that prevents the change",
        } satisfies ApiError);
        return;
    }
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" } satisfies ApiError);
};
