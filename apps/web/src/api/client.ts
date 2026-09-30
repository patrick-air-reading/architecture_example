import type { ApiError } from "@edu/common";

export class ApiRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly details?: ApiError["details"],
  ) {
    super(message);
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const err = (data ?? {}) as Partial<ApiError>;
    throw new ApiRequestError(res.status, err.error ?? res.statusText, err.details);
  }
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>("GET", path),
  post: <T>(path: string, body: unknown) => request<T>("POST", path, body),
  put: <T>(path: string, body: unknown) => request<T>("PUT", path, body),
  delete: (path: string) => request<void>("DELETE", path),
};
