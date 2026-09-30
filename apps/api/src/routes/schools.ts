import {
  idParamSchema,
  schoolFilterSchema,
  schoolInputSchema,
  type SchoolDetail,
  type SchoolInput,
  type SchoolListItem,
  type SchoolWithDistrict,
} from "@edu/common";
import type { Prisma } from "@edu/db";
import { Router } from "express";
import { prisma } from "../db.js";
import { HttpError, notFound } from "../errors.js";
import { personOrder } from "./shared.js";

export const schoolListInclude = {
  district: true,
  _count: { select: { students: true, teachers: true } },
} satisfies Prisma.SchoolInclude;

type SchoolWithCounts = Prisma.SchoolGetPayload<{ include: typeof schoolListInclude }>;

export function toSchoolListItem({ _count, ...school }: SchoolWithCounts): SchoolListItem {
  return { ...school, studentCount: _count.students, teacherCount: _count.teachers };
}

async function assertDistrictExists(districtId: number) {
  const exists = await prisma.district.count({ where: { id: districtId } });
  if (!exists) throw new HttpError(400, `District ${districtId} does not exist`);
}

async function validate(body: unknown): Promise<SchoolInput> {
  const data = schoolInputSchema.parse(body);
  await assertDistrictExists(data.districtId);
  return data;
}

export const schoolsRouter = Router();

schoolsRouter.get("/", async (req, res) => {
  const { districtId } = schoolFilterSchema.parse(req.query);
  const schools = await prisma.school.findMany({
    where: { districtId },
    orderBy: { name: "asc" },
    include: schoolListInclude,
  });
  res.json(schools.map(toSchoolListItem));
});

schoolsRouter.get("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      district: true,
      students: { orderBy: personOrder },
      teachers: { orderBy: personOrder },
    },
  });
  if (!school) throw notFound("School");
  res.json(school satisfies SchoolDetail);
});

schoolsRouter.post("/", async (req, res) => {
  const data = await validate(req.body);
  const school: SchoolWithDistrict = await prisma.school.create({ data, include: { district: true } });
  res.status(201).json(school);
});

schoolsRouter.put("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await validate(req.body);
  const school: SchoolWithDistrict = await prisma.school.update({
    where: { id },
    data,
    include: { district: true },
  });
  res.json(school);
});

schoolsRouter.delete("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const [students, teachers] = await Promise.all([
    prisma.student.count({ where: { schoolId: id } }),
    prisma.teacher.count({ where: { schoolId: id } }),
  ]);
  if (students + teachers > 0) {
    throw new HttpError(
      409,
      `Cannot delete a school that still has ${students} student(s) and ${teachers} teacher(s). Remove or move them first.`,
    );
  }
  await prisma.school.delete({ where: { id } });
  res.status(204).end();
});
