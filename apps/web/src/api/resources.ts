import type {
  DistrictDetail,
  DistrictInput,
  DistrictListItem,
  SchoolDetail,
  SchoolInput,
  SchoolListItem,
  StudentDetail,
  StudentInput,
  TeacherDetail,
  TeacherInput,
} from "@edu/common";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "./client.js";

type Filter = Record<string, number | undefined>;

function toQueryString(filter?: Filter) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filter ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/** Typed React Query hooks for one REST collection under /api/<path>. */
function createResource<TListItem, TDetail, TInput>(path: string) {
  return {
    useList(filter?: Filter) {
      return useQuery({
        queryKey: [path, "list", filter ?? {}],
        queryFn: () => api.get<TListItem[]>(`/${path}${toQueryString(filter)}`),
      });
    },

    useDetail(id: number | undefined) {
      return useQuery({
        queryKey: [path, "detail", id],
        queryFn: () => api.get<TDetail>(`/${path}/${id}`),
        enabled: id !== undefined,
      });
    },

    useSave() {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: ({ id, input }: { id?: number; input: TInput }) =>
          id === undefined
            ? api.post<{ id: number }>(`/${path}`, input)
            : api.put<{ id: number }>(`/${path}/${id}`, input),
        // Entities are interrelated (counts, nested lists), so refresh everything.
        onSuccess: () => queryClient.invalidateQueries(),
      });
    },

    useRemove() {
      const queryClient = useQueryClient();
      return useMutation({
        mutationFn: (id: number) => api.delete(`/${path}/${id}`),
        onSuccess: () => queryClient.invalidateQueries(),
      });
    },
  };
}

export const districts = createResource<DistrictListItem, DistrictDetail, DistrictInput>("districts");
export const schools = createResource<SchoolListItem, SchoolDetail, SchoolInput>("schools");
export const students = createResource<StudentDetail, StudentDetail, StudentInput>("students");
export const teachers = createResource<TeacherDetail, TeacherDetail, TeacherInput>("teachers");
