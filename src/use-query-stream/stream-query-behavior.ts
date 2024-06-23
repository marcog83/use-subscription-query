import { Query } from "@tanstack/react-query";
import { ensureQueryFn } from "./utils";

export function streamQueryBehavior(client) {
  return {
    onFetch: (context, query: Query) => {
      let cancelled = false;

      const addSignalProperty = (object: unknown) => {
        Object.defineProperty(object, "signal", {
          enumerable: true,
          get: () => {
            if (context.signal.aborted) {
              cancelled = true;
            } else {
              // how can i remove this listener?
              // can it, really, cause memory leak?
              context.signal.addEventListener("abort", () => {
                cancelled = true;
              });
            }

            return context.signal;
          },
        });
      };
      const fetchFn = async () => {
        const queryFn = ensureQueryFn(context.options, context.fetchOptions);

        const fetchPage = () => {
          if (cancelled) {
            return Promise.reject();
          }
          const { promise, resolve, reject } = Promise.withResolvers();

          const params = {
            next: (newData) => {
              query.setData(newData);
              query.setState({
                ...query.state,
                isComplete: false,
              });
              const cache = client.getQueryCache();

              // Notify cache callback
              cache.config.onSuccess?.(data, query);
              cache.config.onSettled?.(data, query.state.error, query);
            },
            error: (error) => {
              reject(error);
            },
            complete: () => {
              query.setState({
                ...query.state,
                isComplete: !cancelled,
              });
              resolve(query.state.data);
            },
          };

          addSignalProperty(params);
          queryFn(params);

          return promise;
        };

        return fetchPage();
      };

      context.fetchFn = fetchFn;
    },
  };
}
