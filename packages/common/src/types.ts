/**
 * API response shapes shared by the server and the web client.
 * Kept independent of Prisma so the frontend never depends on the DB package.
 */

export interface District {
  id: number;
  name: string;
  usState: string;
}

export interface School {
  id: number;
  name: string;
  districtId: number;
}

export interface Student {
  id: number;
  givenName: string;
  familyName: string;
  grade: number;
  schoolId: number;
}

export interface Teacher {
  id: number;
  givenName: string;
  familyName: string;
  emailAddress: string;
  schoolId: number;
}

export interface DistrictListItem extends District {
  schoolCount: number;
}

export interface SchoolListItem extends School {
  district: District;
  studentCount: number;
  teacherCount: number;
}

export interface DistrictDetail extends District {
  schools: SchoolListItem[];
}

export interface SchoolDetail extends School {
  district: District;
  students: Student[];
  teachers: Teacher[];
}

export interface SchoolWithDistrict extends School {
  district: District;
}

export interface StudentDetail extends Student {
  school: SchoolWithDistrict;
}

export interface TeacherDetail extends Teacher {
  school: SchoolWithDistrict;
}

export interface ApiError {
  error: string;
  details?: Record<string, string[] | undefined>;
}
