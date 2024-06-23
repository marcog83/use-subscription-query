import { QueryClient, UseQueryOptions } from "@tanstack/react-query";
import { useBaseQuery } from "./use-base-query";
import { StreamQueryObserver } from "./stream-query-observer";

export function useQueryStream(
  options: UseQueryOptions,
  queryClient?: QueryClient
) {
  return useBaseQuery(options, StreamQueryObserver, queryClient);
}
