import type { UseMutationResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router";

export interface Crumb {
  label: string;
  to: string;
}

export function PageHeader({
  title,
  subtitle,
  crumbs,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <div className="page-header">
      {crumbs && crumbs.length > 0 && (
        <nav className="crumbs" aria-label="Breadcrumb">
          {crumbs.map((c) => (
            <span key={c.to}>
              <Link to={c.to}>{c.label}</Link>
              <span aria-hidden="true"> / </span>
            </span>
          ))}
        </nav>
      )}
      <div className="page-header-row">
        <div>
          <h1>{title}</h1>
          {subtitle && <p className="muted">{subtitle}</p>}
        </div>
        {actions && <div className="actions">{actions}</div>}
      </div>
    </div>
  );
}

export function Section({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="section">
      <div className="section-header">
        <h2>{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="muted empty-cell">
        {children}
      </td>
    </tr>
  );
}

/** Numeric `:id` route param, or undefined on "new" routes. */
export function useIdParam(): number | undefined {
  const { id } = useParams();
  return id === undefined ? undefined : Number(id);
}

export function DeleteButton({
  id,
  label,
  mutation,
  redirectTo,
}: {
  id: number;
  label: string;
  mutation: UseMutationResult<void, Error, number>;
  redirectTo: string;
}) {
  const navigate = useNavigate();
  const onClick = () => {
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    mutation.mutate(id, { onSuccess: () => navigate(redirectTo) });
  };
  return (
    <>
      <button type="button" className="button danger" onClick={onClick} disabled={mutation.isPending}>
        {mutation.isPending ? "Deleting…" : "Delete"}
      </button>
      {mutation.isError && (
        <p className="alert inline" role="alert">
          {mutation.error.message}
        </p>
      )}
    </>
  );
}
