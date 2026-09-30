import { createPrismaClient } from "../src/index.js";

const prisma = createPrismaClient();

const districts = [
  {
    name: "Riverside Unified",
    usState: "CA",
    schools: [
      {
        name: "Riverside Elementary",
        teachers: [
          ["Maria", "Lopez"],
          ["James", "Chen"],
        ],
        students: [
          ["Ava", "Nguyen", 2],
          ["Liam", "Patel", 3],
          ["Sofia", "Garcia", 0],
        ],
      },
      {
        name: "Riverside High",
        teachers: [
          ["Robert", "King"],
          ["Aisha", "Rahman"],
        ],
        students: [
          ["Noah", "Kim", 10],
          ["Emma", "Johnson", 11],
          ["Mateo", "Rossi", 12],
        ],
      },
    ],
  },
  {
    name: "Lakeview School District",
    usState: "MN",
    schools: [
      {
        name: "Lakeview Middle",
        teachers: [["Grace", "Olson"]],
        students: [
          ["Oliver", "Anderson", 6],
          ["Isabella", "Berg", 7],
          ["Ethan", "Larson", 8],
        ],
      },
    ],
  },
  {
    name: "Hill Country ISD",
    usState: "TX",
    schools: [
      {
        name: "Bluebonnet Elementary",
        teachers: [["Carlos", "Mendoza"]],
        students: [["Mia", "Williams", 4]],
      },
      {
        name: "Pecan Valley High",
        teachers: [["Hannah", "Brooks"]],
        students: [["Lucas", "Martinez", 9]],
      },
    ],
  },
] as const;

function emailFor(given: string, family: string, school: string) {
  const domain = school.toLowerCase().replace(/[^a-z]+/g, "") + ".example.edu";
  return `${given}.${family}@${domain}`.toLowerCase();
}

async function main() {
  const existing = await prisma.district.count();
  if (existing > 0) {
    console.log(`Seed skipped: database already has ${existing} district(s).`);
    return;
  }

  for (const d of districts) {
    await prisma.district.create({
      data: {
        name: d.name,
        usState: d.usState,
        schools: {
          create: d.schools.map((s) => ({
            name: s.name,
            teachers: {
              create: s.teachers.map(([givenName, familyName]) => ({
                givenName,
                familyName,
                emailAddress: emailFor(givenName, familyName, s.name),
              })),
            },
            students: {
              create: s.students.map(([givenName, familyName, grade]) => ({
                givenName,
                familyName,
                grade,
              })),
            },
          })),
        },
      },
    });
  }
  console.log(`Seeded ${districts.length} districts.`);
}

try {
  await main();
} finally {
  await prisma.$disconnect();
}
