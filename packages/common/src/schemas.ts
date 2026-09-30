import { z } from "zod";
import { MAX_GRADE, MIN_GRADE } from "./format.js";
import { US_STATE_CODES } from "./us-states.js";

const name = z.string().trim().min(1, "Required").max(200);

// Accepts numbers or numeric strings (form values, query params). Blank strings must
// fail as "Required" rather than coercing to 0, which would be a valid grade.
const blankToUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;
const integer = () => z.coerce.number({ error: "Required" }).int();
const id = z.preprocess(blankToUndefined, integer().positive());
const grade = z.preprocess(blankToUndefined, integer().min(MIN_GRADE).max(MAX_GRADE));

export const idParamSchema = z.object({ id });

export const districtInputSchema = z.object({
  name,
  usState: z.enum(US_STATE_CODES, { error: "Select a US state" }),
});

export const schoolInputSchema = z.object({
  name,
  districtId: id,
});

export const studentInputSchema = z.object({
  givenName: name,
  familyName: name,
  grade,
  schoolId: id,
});

export const teacherInputSchema = z.object({
  givenName: name,
  familyName: name,
  emailAddress: z.email().trim().toLowerCase(),
  schoolId: id,
});

export const schoolFilterSchema = z.object({ districtId: id.optional() });
export const personFilterSchema = z.object({ schoolId: id.optional() });

export type DistrictInput = z.infer<typeof districtInputSchema>;
export type SchoolInput = z.infer<typeof schoolInputSchema>;
export type StudentInput = z.infer<typeof studentInputSchema>;
export type TeacherInput = z.infer<typeof teacherInputSchema>;
