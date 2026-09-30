import {
  districtInputSchema,
  idParamSchema,
  type District,
  type DistrictDetail,
  type DistrictListItem,
} from "@edu/common";
import { Router } from "express";
import { prisma } from "../db.js";
import { HttpError, notFound } from "../errors.js";
import { toSchoolListItem, schoolListInclude } from "./schools.js";

export const districtsRouter = Router();

districtsRouter.get("/", async (_req, res) => {
  const districts = await prisma.district.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { schools: true } } },
  });
  res.json(
    districts.map(({ _count, ...d }): DistrictListItem => ({ ...d, schoolCount: _count.schools })),
  );
});

districtsRouter.get("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const district = await prisma.district.findUnique({
    where: { id },
    include: { schools: { orderBy: { name: "asc" }, include: schoolListInclude } },
  });
  if (!district) throw notFound("District");

  const { schools, ...rest } = district;
  res.json({ ...rest, schools: schools.map(toSchoolListItem) } satisfies DistrictDetail);
});

districtsRouter.post("/", async (req, res) => {
  const data = districtInputSchema.parse(req.body);
  const district: District = await prisma.district.create({ data });
  res.status(201).json(district);
});

districtsRouter.put("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = districtInputSchema.parse(req.body);
  const district: District = await prisma.district.update({ where: { id }, data });
  res.json(district);
});

districtsRouter.delete("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const schoolCount = await prisma.school.count({ where: { districtId: id } });
  if (schoolCount > 0) {
    throw new HttpError(
      409,
      `Cannot delete a district that still has ${schoolCount} school(s). Delete or move them first.`,
    );
  }
  await prisma.district.delete({ where: { id } });
  res.status(204).end();
});
