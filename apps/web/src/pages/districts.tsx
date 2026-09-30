import { districtInputSchema, US_STATES, usStateName } from "@edu/common";
import { Link, useNavigate } from "react-router";
import { districts } from "../api/resources.js";
import { EntityForm } from "../components/EntityForm.js";
import { DeleteButton, EmptyRow, PageHeader, Section, useIdParam } from "../components/Page.js";
import { QueryView } from "../components/Status.js";

export function DistrictsPage() {
  const query = districts.useList();
  return (
    <>
      <PageHeader
        title="Districts"
        actions={
          <Link to="/districts/new" className="button primary">
            New district
          </Link>
        }
      />
      <QueryView query={query}>
        {(rows) => (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>State</th>
                <th className="num">Schools</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && <EmptyRow colSpan={3}>No districts yet.</EmptyRow>}
              {rows.map((d) => (
                <tr key={d.id}>
                  <td>
                    <Link to={`/districts/${d.id}`}>{d.name}</Link>
                  </td>
                  <td>{usStateName(d.usState)}</td>
                  <td className="num">{d.schoolCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </QueryView>
    </>
  );
}

export function DistrictPage() {
  const id = useIdParam()!;
  const query = districts.useDetail(id);
  const remove = districts.useRemove();
  return (
    <QueryView query={query}>
      {(district) => (
        <>
          <PageHeader
            crumbs={[{ label: "Districts", to: "/districts" }]}
            title={district.name}
            subtitle={`${usStateName(district.usState)} · District #${district.id}`}
            actions={
              <>
                <Link to={`/districts/${id}/edit`} className="button">
                  Edit
                </Link>
                <DeleteButton id={id} label={district.name} mutation={remove} redirectTo="/districts" />
              </>
            }
          />
          <Section
            title={`Schools (${district.schools.length})`}
            actions={
              <Link to={`/schools/new?districtId=${id}`} className="button small">
                Add school
              </Link>
            }
          >
            <table className="table">
              <thead>
                <tr>
                  <th>School</th>
                  <th className="num">Students</th>
                  <th className="num">Teachers</th>
                </tr>
              </thead>
              <tbody>
                {district.schools.length === 0 && (
                  <EmptyRow colSpan={3}>No schools in this district yet.</EmptyRow>
                )}
                {district.schools.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <Link to={`/schools/${s.id}`}>{s.name}</Link>
                    </td>
                    <td className="num">{s.studentCount}</td>
                    <td className="num">{s.teacherCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        </>
      )}
    </QueryView>
  );
}

export function DistrictFormPage() {
  const id = useIdParam();
  const existing = districts.useDetail(id);
  const save = districts.useSave();
  const navigate = useNavigate();

  if (id !== undefined && !existing.data) return <QueryView query={existing}>{() => null}</QueryView>;
  const district = existing.data;

  return (
    <>
      <PageHeader
        crumbs={[{ label: "Districts", to: "/districts" }]}
        title={district ? `Edit ${district.name}` : "New district"}
      />
      <EntityForm
        schema={districtInputSchema}
        initialValues={{ name: district?.name ?? "", usState: district?.usState ?? "" }}
        fields={[
          { name: "name", label: "Name" },
          {
            name: "usState",
            label: "State",
            type: "select",
            options: US_STATES.map((s) => ({ value: s.code, label: s.name })),
          },
        ]}
        submitLabel={district ? "Save changes" : "Create district"}
        cancelTo={district ? `/districts/${district.id}` : "/districts"}
        onSubmit={async (input) => {
          const saved = await save.mutateAsync({ id, input });
          navigate(`/districts/${saved.id}`);
        }}
      />
    </>
  );
}
