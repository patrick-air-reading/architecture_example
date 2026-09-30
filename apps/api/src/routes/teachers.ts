import {
  idParamSchema,
  personFilterSchema,
  teacherInputSchema,
  type TeacherDetail,
  type TeacherInput,
} from "@edu/common";
import { Router } from "express";
import { prisma } from "../db.js";
import { notFound } from "../errors.js";
import { assertSchoolExists, personOrder, schoolWithDistrict } from "./shared.js";

async function validate(body: unknown): Promise<TeacherInput> {
  const data = teacherInputSchema.parse(body);
  await assertSchoolExists(data.schoolId);
  return data;
}

export const teachersRouter = Router();

teachersRouter.get("/", async (req, res) => {
  const { schoolId } = personFilterSchema.parse(req.query);
  const teachers: TeacherDetail[] = await prisma.teacher.findMany({
    where: { schoolId },
    orderBy: personOrder,
    include: schoolWithDistrict,
  });
  res.json(teachers);
});

teachersRouter.get("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const teacher: TeacherDetail | null = await prisma.teacher.findUnique({
    where: { id },
    include: schoolWithDistrict,
  });
  if (!teacher) throw notFound("Teacher");
  res.json(teacher);
});

teachersRouter.post("/", async (req, res) => {
  const data = await validate(req.body);
  const teacher: TeacherDetail = await prisma.teacher.create({ data, include: schoolWithDistrict });
  res.status(201).json(teacher);
});

teachersRouter.put("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await validate(req.body);
  const teacher: TeacherDetail = await prisma.teacher.update({
    where: { id },
    data,
    include: schoolWithDistrict,
  });
  res.json(teacher);
});

teachersRouter.delete("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.teacher.delete({ where: { id } });
  res.status(204).end();
});
