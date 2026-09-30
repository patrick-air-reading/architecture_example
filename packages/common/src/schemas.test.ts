import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatGrade } from "./format.js";
import { districtInputSchema, personFilterSchema, studentInputSchema, teacherInputSchema } from "./schemas.js";

describe("studentInputSchema", () => {
  const valid = { givenName: " Ava ", familyName: "Nguyen", grade: "0", schoolId: "3" };

  it("coerces form strings and trims names", () => {
    assert.deepEqual(studentInputSchema.parse(valid), {
      givenName: "Ava",
      familyName: "Nguyen",
      grade: 0,
      schoolId: 3,
    });
  });

  it("treats a blank grade as missing, not Kindergarten", () => {
    const result = studentInputSchema.safeParse({ ...valid, grade: "" });
    assert.equal(result.success, false);
  });

  it("rejects out-of-range grades and blank school ids", () => {
    assert.equal(studentInputSchema.safeParse({ ...valid, grade: 13 }).success, false);
    assert.equal(studentInputSchema.safeParse({ ...valid, schoolId: "" }).success, false);
  });
});

describe("other schemas", () => {
  it("only accepts US state codes", () => {
    assert.equal(districtInputSchema.safeParse({ name: "X", usState: "CA" }).success, true);
    assert.equal(districtInputSchema.safeParse({ name: "X", usState: "ZZ" }).success, false);
  });

  it("normalizes teacher emails", () => {
    const parsed = teacherInputSchema.parse({
      givenName: "A",
      familyName: "B",
      emailAddress: "A.B@Example.EDU",
      schoolId: 1,
    });
    assert.equal(parsed.emailAddress, "a.b@example.edu");
  });

  it("allows omitting optional filters", () => {
    assert.deepEqual(personFilterSchema.parse({}), {});
    assert.deepEqual(personFilterSchema.parse({ schoolId: "2" }), { schoolId: 2 });
  });
});

describe("formatGrade", () => {
  it("formats grades", () => {
    assert.equal(formatGrade(0), "Kindergarten");
    assert.equal(formatGrade(1), "1st grade");
    assert.equal(formatGrade(3), "3rd grade");
    assert.equal(formatGrade(11), "11th grade");
    assert.equal(formatGrade(12), "12th grade");
  });
});
