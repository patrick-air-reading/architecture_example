import { fullName, sortableName, teacherInputSchema } from "@edu/common";
import { Link, useNavigate, useSearchParams } from "react-router";
import { schools, teachers } from "../api/resources.js";
import { EntityForm } from "../components/EntityForm.js";
import { DeleteButton, EmptyRow, PageHeader, useIdParam } from "../components/Page.js";
import { QueryView } from "../components/Status.js";
import { SchoolLinks, schoolOptions } from "./shared.js";

export function TeachersPage() {
  const query = teachers.useList();
  return (
    <>
      <PageHeader
        title="Teachers"
        actions={
          <Link to="/teachers/new" className="button primary">
            New teacher
          </Link>
        }
      />
      <QueryView query={query}>
        {(rows) => (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>School</th>
                <th>District</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <EmptyRow colSpan={4}>No teachers yet.</EmptyRow>}
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/teachers/${t.id}`}>{sortableName(t)}</Link>
                  </td>
                  <td className="truncate">{t.emailAddress}</td>
                  <td>
                    <Link to={`/schools/${t.school.id}`}>{t.school.name}</Link>
                  </td>
                  <td>
                    <Link to={`/districts/${t.school.district.id}`}>{t.school.district.name}</Link>
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

export function TeacherPage() {
  const id = useIdParam()!;
  const query = teachers.useDetail(id);
  const remove = teachers.useRemove();
  return (
    <QueryView query={query}>
      {(teacher) => (
        <>
          <PageHeader
            crumbs={[
              { label: "Teachers", to: "/teachers" },
              { label: teacher.school.name, to: `/schools/${teacher.school.id}` },
            ]}
            title={fullName(teacher)}
            subtitle={`Teacher #${teacher.id}`}
            actions={
              <>
                <Link to={`/teachers/${id}/edit`} className="button">
                  Edit
                </Link>
                <DeleteButton id={id} label={fullName(teacher)} mutation={remove} redirectTo="/teachers" />
              </>
            }
          />
          <dl className="card details">
            <dt>Given name</dt>
            <dd>{teacher.givenName}</dd>
            <dt>Family name</dt>
            <dd>{teacher.familyName}</dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${teacher.emailAddress}`}>{teacher.emailAddress}</a>
            </dd>
            <SchoolLinks school={teacher.school} />
          </dl>
        </>
      )}
    </QueryView>
  );
}

export function TeacherFormPage() {
  const id = useIdParam();
  const [searchParams] = useSearchParams();
  const existing = teachers.useDetail(id);
  const schoolList = schools.useList();
  const save = teachers.useSave();
  const navigate = useNavigate();

  if (id !== undefined && !existing.data) return <QueryView query={existing}>{() => null}</QueryView>;
  if (!schoolList.data) return <QueryView query={schoolList}>{() => null}</QueryView>;
  const teacher = existing.data;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Teachers", to: "/teachers" }]}
        title={teacher ? `Edit ${fullName(teacher)}` : "New teacher"}
      />
      <EntityForm
        schema={teacherInputSchema}
        initialValues={{
          givenName: teacher?.givenName ?? "",
          familyName: teacher?.familyName ?? "",
          emailAddress: teacher?.emailAddress ?? "",
          schoolId: String(teacher?.schoolId ?? searchParams.get("schoolId") ?? ""),
        }}
        fields={[
          { name: "givenName", label: "Given name" },
          { name: "familyName", label: "Family name" },
          { name: "emailAddress", label: "Email address", type: "email", placeholder: "name@school.edu" },
          { name: "schoolId", label: "School", type: "select", options: schoolOptions(schoolList.data) },
        ]}
        submitLabel={teacher ? "Save changes" : "Create teacher"}
        cancelTo={teacher ? `/teachers/${teacher.id}` : "/teachers"}
        onSubmit={async (input) => {
          const saved = await save.mutateAsync({ id, input });
          navigate(`/teachers/${saved.id}`);
        }}
      />
    </>
  );
}
