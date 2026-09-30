import {
  idParamSchema,
  personFilterSchema,
  studentInputSchema,
  type StudentDetail,
  type StudentInput,
} from "@edu/common";
import { Router } from "express";
import { prisma } from "../db.js";
import { notFound } from "../errors.js";
import { assertSchoolExists, personOrder, schoolWithDistrict } from "./shared.js";

async function validate(body: unknown): Promise<StudentInput> {
  const data = studentInputSchema.parse(body);
  await assertSchoolExists(data.schoolId);
  return data;
}

export const studentsRouter = Router();

studentsRouter.get("/", async (req, res) => {
  const { schoolId } = personFilterSchema.parse(req.query);
  const students: StudentDetail[] = await prisma.student.findMany({
    where: { schoolId },
    orderBy: personOrder,
    include: schoolWithDistrict,
  });
  res.json(students);
});

studentsRouter.get("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const student: StudentDetail | null = await prisma.student.findUnique({
    where: { id },
    include: schoolWithDistrict,
  });
  if (!student) throw notFound("Student");
  res.json(student);
});

studentsRouter.post("/", async (req, res) => {
  const data = await validate(req.body);
  const student: StudentDetail = await prisma.student.create({ data, include: schoolWithDistrict });
  res.status(201).json(student);
});

studentsRouter.put("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await validate(req.body);
  const student: StudentDetail = await prisma.student.update({
    where: { id },
    data,
    include: schoolWithDistrict,
  });
  res.json(student);
});

studentsRouter.delete("/:id", async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await prisma.student.delete({ where: { id } });
  res.status(204).end();
});
