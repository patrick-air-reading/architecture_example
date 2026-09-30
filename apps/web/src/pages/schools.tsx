import { formatGrade, schoolInputSchema, sortableName, usStateName } from "@edu/common";
import { Link, useNavigate, useSearchParams } from "react-router";
import { districts, schools } from "../api/resources.js";
import { EntityForm } from "../components/EntityForm.js";
import { DeleteButton, EmptyRow, PageHeader, Section, useIdParam } from "../components/Page.js";
import { QueryView } from "../components/Status.js";

export function SchoolsPage() {
  const query = schools.useList();
  return (
    <>
      <PageHeader
        title="Schools"
        actions={
          <Link to="/schools/new" className="button primary">
            New school
          </Link>
        }
      />
      <QueryView query={query}>
        {(rows) => (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>District</th>
                <th className="num">Students</th>
                <th className="num">Teachers</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <EmptyRow colSpan={4}>No schools yet.</EmptyRow>}
              {rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/schools/${s.id}`}>{s.name}</Link>
                  </td>
                  <td>
                    <Link to={`/districts/${s.district.id}`}>{s.district.name}</Link>
                  </td>
                  <td className="num">{s.studentCount}</td>
                  <td className="num">{s.teacherCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </QueryView>
    </>
  );
}

export function SchoolPage() {
  const id = useIdParam()!;
  const query = schools.useDetail(id);
  const remove = schools.useRemove();
  return (
    <QueryView query={query}>
      {(school) => (
        <>
          <PageHeader
            crumbs={[
              { label: "Districts", to: "/districts" },
              { label: school.district.name, to: `/districts/${school.district.id}` },
            ]}
            title={school.name}
            subtitle={`${school.district.name} · ${usStateName(school.district.usState)}`}
            actions={
              <>
                <Link to={`/schools/${id}/edit`} className="button">
                  Edit
                </Link>
                <DeleteButton id={id} label={school.name} mutation={remove} redirectTo="/schools" />
              </>
            }
          />
          <div className="two-col">
            <Section
              title={`Students (${school.students.length})`}
              actions={
                <Link to={`/students/new?schoolId=${id}`} className="button small">
                  Add student
                </Link>
              }
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {school.students.length === 0 && <EmptyRow colSpan={2}>No students yet.</EmptyRow>}
                  {school.students.map((s) => (
                    <tr key={s.id}>
                      <td>
                        <Link to={`/students/${s.id}`}>{sortableName(s)}</Link>
                      </td>
                      <td>{formatGrade(s.grade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
            <Section
              title={`Teachers (${school.teachers.length})`}
              actions={
                <Link to={`/teachers/new?schoolId=${id}`} className="button small">
                  Add teacher
                </Link>
              }
            >
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {school.teachers.length === 0 && <EmptyRow colSpan={2}>No teachers yet.</EmptyRow>}
                  {school.teachers.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Link to={`/teachers/${t.id}`}>{sortableName(t)}</Link>
                      </td>
                      <td className="truncate">{t.emailAddress}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          </div>
        </>
      )}
    </QueryView>
  );
}

export function SchoolFormPage() {
  const id = useIdParam();
  const [searchParams] = useSearchParams();
  const existing = schools.useDetail(id);
  const districtOptions = districts.useList();
  const save = schools.useSave();
  const navigate = useNavigate();

  if (id !== undefined && !existing.data) return <QueryView query={existing}>{() => null}</QueryView>;
  if (!districtOptions.data) return <QueryView query={districtOptions}>{() => null}</QueryView>;
  const school = existing.data;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Schools", to: "/schools" }]}
        title={school ? `Edit ${school.name}` : "New school"}
      />
      <EntityForm
        schema={schoolInputSchema}
        initialValues={{
          name: school?.name ?? "",
          districtId: String(school?.districtId ?? searchParams.get("districtId") ?? ""),
        }}
        fields={[
          { name: "name", label: "Name" },
          {
            name: "districtId",
            label: "District",
            type: "select",
            options: districtOptions.data.map((d) => ({ value: d.id, label: `${d.name} (${d.usState})` })),
          },
        ]}
        submitLabel={school ? "Save changes" : "Create school"}
        cancelTo={school ? `/schools/${school.id}` : "/schools"}
        onSubmit={async (input) => {
          const saved = await save.mutateAsync({ id, input });
          navigate(`/schools/${saved.id}`);
        }}
      />
    </>
  );
}
