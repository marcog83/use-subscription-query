import { fakeSSE } from "./fake-sse";
import { useQueryStream } from "./use-query-stream/use-query-stream";

type GridStreamProps = {
  queryKey: string;
  enabled?: boolean;
};

export const GridStream = ({ queryKey, enabled = true }: GridStreamProps) => {
  const { data, isLoading, isError, error, isComplete } = useQueryStream({
    queryKey: ["grid-stream", queryKey],
    queryFn: fakeSSE,
    // enable the query. If disabled, the query will not start
    // what if it is disabled after it has started?
    enabled,
    // select is invoked after the queryFn has been called
    // and cache has been updated, so data is not transformed
    select: (data) =>
      data.map(({ timestamp: id, message: label }) => ({
        id,
        label,
      })),
  });

  if (isError) {
    return "Error";
  }

  return (
    <div style={{ height: "100vh", overflow: "auto" }}>
      {isComplete && <span style={{ fontSize: 52 }}>👌</span>}
      <pre>
        {JSON.stringify(
          { length: data?.length ?? 0, isLoading, queryKey, data },
          null,
          2
        )}
      </pre>
    </div>
  );
};
