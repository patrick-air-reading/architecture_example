/** Grades are stored as integers: 0 = Kindergarten, 1–12 = grade number. */
export const MIN_GRADE = 0;
export const MAX_GRADE = 12;

export const GRADES: readonly number[] = Array.from(
  { length: MAX_GRADE - MIN_GRADE + 1 },
  (_, i) => MIN_GRADE + i,
);

export function formatGrade(grade: number): string {
  if (grade === 0) return "Kindergarten";
  const suffix =
    grade % 100 >= 11 && grade % 100 <= 13
      ? "th"
      : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[grade % 10] ?? "th";
  return `${grade}${suffix} grade`;
}

export function fullName(person: { givenName: string; familyName: string }): string {
  return `${person.givenName} ${person.familyName}`.trim();
}

/** "Family, Given" — handy for sorted lists. */
export function sortableName(person: { givenName: string; familyName: string }): string {
  return `${person.familyName}, ${person.givenName}`;
}
