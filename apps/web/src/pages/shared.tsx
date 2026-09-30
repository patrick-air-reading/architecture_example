import { usStateName, type SchoolListItem, type SchoolWithDistrict } from "@edu/common";
import { Link } from "react-router";

export function schoolOptions(schools: SchoolListItem[]) {
  return schools.map((s) => ({ value: s.id, label: `${s.name} — ${s.district.name}` }));
}

/** School + district rows for a person's details list. */
export function SchoolLinks({ school }: { school: SchoolWithDistrict }) {
  return (
    <>
      <dt>School</dt>
      <dd>
        <Link to={`/schools/${school.id}`}>{school.name}</Link>
      </dd>
      <dt>District</dt>
      <dd>
        <Link to={`/districts/${school.district.id}`}>{school.district.name}</Link>{" "}
        <span className="muted">({usStateName(school.district.usState)})</span>
      </dd>
    </>
  );
}
