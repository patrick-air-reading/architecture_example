import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/Layout.js";
import { NotFound } from "./components/Status.js";
import { DistrictFormPage, DistrictPage, DistrictsPage } from "./pages/districts.js";
import { SchoolFormPage, SchoolPage, SchoolsPage } from "./pages/schools.js";
import { StudentFormPage, StudentPage, StudentsPage } from "./pages/students.js";
import { TeacherFormPage, TeacherPage, TeachersPage } from "./pages/teachers.js";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/districts" replace /> },
      { path: "districts", element: <DistrictsPage /> },
      { path: "districts/new", element: <DistrictFormPage /> },
      { path: "districts/:id", element: <DistrictPage /> },
      { path: "districts/:id/edit", element: <DistrictFormPage /> },
      { path: "schools", element: <SchoolsPage /> },
      { path: "schools/new", element: <SchoolFormPage /> },
      { path: "schools/:id", element: <SchoolPage /> },
      { path: "schools/:id/edit", element: <SchoolFormPage /> },
      { path: "students", element: <StudentsPage /> },
      { path: "students/new", element: <StudentFormPage /> },
      { path: "students/:id", element: <StudentPage /> },
      { path: "students/:id/edit", element: <StudentFormPage /> },
      { path: "teachers", element: <TeachersPage /> },
      { path: "teachers/new", element: <TeacherFormPage /> },
      { path: "teachers/:id", element: <TeacherPage /> },
      { path: "teachers/:id/edit", element: <TeacherFormPage /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
