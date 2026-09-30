import { formatGrade, fullName, GRADES, sortableName, studentInputSchema } from "@edu/common";
import { Link, useNavigate, useSearchParams } from "react-router";
import { schools, students } from "../api/resources.js";
import { EntityForm } from "../components/EntityForm.js";
import { DeleteButton, EmptyRow, PageHeader, useIdParam } from "../components/Page.js";
import { QueryView } from "../components/Status.js";
import { SchoolLinks, schoolOptions } from "./shared.js";

export function StudentsPage() {
  const query = students.useList();
  return (
    <>
      <PageHeader
        title="Students"
        actions={
          <Link to="/students/new" className="button primary">
            New student
          </Link>
        }
      />
      <QueryView query={query}>
        {(rows) => (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Grade</th>
                <th>School</th>
                <th>District</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <EmptyRow colSpan={4}>No students yet.</EmptyRow>}
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/students/${s.id}`}>{sortableName(s)}</Link>
                  </td>
                  <td>{formatGrade(s.grade)}</td>
                  <td>
                    <Link to={`/schools/${s.school.id}`}>{s.school.name}</Link>
                  </td>
                  <td>
                    <Link to={`/districts/${s.school.district.id}`}>{s.school.district.name}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </QueryView>
    </>
  );
}

export function StudentPage() {
  const id = useIdParam()!;
  const query = students.useDetail(id);
  const remove = students.useRemove();
  return (
    <QueryView query={query}>
      {(student) => (
        <>
          <PageHeader
            crumbs={[
              { label: "Students", to: "/students" },
              { label: student.school.name, to: `/schools/${student.school.id}` },
            ]}
            title={fullName(student)}
            subtitle={`Student #${student.id}`}
            actions={
              <>
                <Link to={`/students/${id}/edit`} className="button">
                  Edit
                </Link>
                <DeleteButton id={id} label={fullName(student)} mutation={remove} redirectTo="/students" />
              </>
            }
          />
          <dl className="card details">
            <dt>Given name</dt>
            <dd>{student.givenName}</dd>
            <dt>Family name</dt>
            <dd>{student.familyName}</dd>
            <dt>Grade</dt>
            <dd>{formatGrade(student.grade)}</dd>
            <SchoolLinks school={student.school} />
          </dl>
        </>
      )}
    </QueryView>
  );
}

export function StudentFormPage() {
  const id = useIdParam();
  const [searchParams] = useSearchParams();
  const existing = students.useDetail(id);
  const schoolList = schools.useList();
  const save = students.useSave();
  const navigate = useNavigate();

  if (id !== undefined && !existing.data) return <QueryView query={existing}>{() => null}</QueryView>;
  if (!schoolList.data) return <QueryView query={schoolList}>{() => null}</QueryView>;
  const student = existing.data;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Students", to: "/students" }]}
        title={student ? `Edit ${fullName(student)}` : "New student"}
      />
      <EntityForm
        schema={studentInputSchema}
        initialValues={{
          givenName: student?.givenName ?? "",
          familyName: student?.familyName ?? "",
          grade: String(student?.grade ?? ""),
          schoolId: String(student?.schoolId ?? searchParams.get("schoolId") ?? ""),
        }}
        fields={[
          { name: "givenName", label: "Given name" },
          { name: "familyName", label: "Family name" },
          {
            name: "grade",
            label: "Grade",
            type: "select",
            options: GRADES.map((g) => ({ value: g, label: formatGrade(g) })),
          },
          { name: "schoolId", label: "School", type: "select", options: schoolOptions(schoolList.data) },
        ]}
        submitLabel={student ? "Save changes" : "Create student"}
        cancelTo={student ? `/students/${student.id}` : "/students"}
        onSubmit={async (input) => {
          const saved = await save.mutateAsync({ id, input });
          navigate(`/students/${saved.id}`);
        }}
      />
    </>
  );
}
