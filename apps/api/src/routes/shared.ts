import { prisma } from "../db.js";
import { HttpError } from "../errors.js";

export const schoolWithDistrict = { school: { include: { district: true } } } as const;

export const personOrder: ({ familyName: "asc" } | { givenName: "asc" })[] = [
  { familyName: "asc" },
  { givenName: "asc" },
];

export async function assertSchoolExists(schoolId: number) {
  const exists = await prisma.school.count({ where: { id: schoolId } });
  if (!exists) throw new HttpError(400, `School ${schoolId} does not exist`);
}
