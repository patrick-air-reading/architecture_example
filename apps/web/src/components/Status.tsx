import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { ApiRequestError } from "../api/client.js";

export function Loading() {
  return <p className="muted">Loading…</p>;
}

export function ErrorMessage({ error }: { error: unknown }) {
  if (error instanceof ApiRequestError && error.status === 404) return <NotFound />;
  const message = error instanceof Error ? error.message : "Something went wrong";
  return (
    <p className="alert" role="alert">
      {message}
    </p>
  );
}

export function NotFound() {
  return (
    <div className="empty-state">
      <h1>Not found</h1>
      <p>
        That page doesn't exist. <Link to="/districts">Back to districts</Link>
      </p>
    </div>
  );
}

/** Renders loading / error states for a query, then the children with its data. */
export function QueryView<T>({
  query,
  children,
}: {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
}) {
  if (query.isPending) return <Loading />;
  if (query.isError) return <ErrorMessage error={query.error} />;
  return <>{children(query.data)}</>;
}
