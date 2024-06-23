/* eslint-disable no-underscore-dangle */
/* eslint-disable max-len */

"use client";

import * as React from "react";

import {
  notifyManager,
  useQueryClient,
  useIsRestoring,
} from "@tanstack/react-query";
import type {
  QueryClient,
  QueryObserverResult,
  UseBaseQueryOptions,
} from "@tanstack/react-query";

export function useBaseQuery(
  options: UseBaseQueryOptions,
  Observer,
  queryClient?: QueryClient
): QueryObserverResult {
  const client = useQueryClient(queryClient);
  const isRestoring = useIsRestoring();
  // const errorResetBoundary = useQueryErrorResetBoundary();
  const defaultedOptions = client.defaultQueryOptions(options);

  // Make sure results are optimistically set in fetching state before subscribing or updating options
  defaultedOptions._optimisticResults = isRestoring
    ? "isRestoring"
    : "optimistic";

  // ensureStaleTime(defaultedOptions);
  //  ensurePreventErrorBoundaryRetry(defaultedOptions, errorResetBoundary);

  // useClearResetErrorBoundary(errorResetBoundary);

  const [observer] = React.useState(
    () => new Observer(client, defaultedOptions)
  );

  const result = observer.getOptimisticResult(defaultedOptions);

  React.useSyncExternalStore(
    React.useCallback(
      (onStoreChange) => {
        const unsubscribe = isRestoring
          ? () => undefined
          : observer.subscribe(notifyManager.batchCalls(onStoreChange));

        // Update result to make sure we did not miss any query updates
        // between creating the observer and subscribing to it.
        observer.updateResult();

        return unsubscribe;
      },
      [observer, isRestoring]
    ),
    () => observer.getCurrentResult(),
    () => observer.getCurrentResult()
  );

  React.useEffect(() => {
    // Do not notify on updates because of changes in the options because
    // these changes should already be reflected in the optimistic result.
    observer.setOptions(defaultedOptions, { listeners: false });
  }, [defaultedOptions, observer]);

  // Handle suspense

  // Handle error boundary

  // Handle result property usage tracking
  return result;
}
