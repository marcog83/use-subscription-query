/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-use-before-define */
import {
  Query,
  QueryClient,
  QueryObserver,
  QueryObserverOptions,
} from "@tanstack/react-query";

import { resolveStaleTime } from "./utils";
import { streamQueryBehavior } from "./stream-query-behavior";

function noop(): undefined {
  return undefined;
}

function isStale(query, options): boolean {
  return (
    options.enabled !== false &&
    query.isStaleByTime(resolveStaleTime(options.staleTime, query))
  );
}

function shouldLoadOnMount(query, options): boolean {
  return (
    options.enabled !== false &&
    query.state.data === undefined &&
    !(query.state.status === "error" && options.retryOnMount === false)
  );
}

function shouldFetchOnMount(query, options): boolean {
  return (
    shouldLoadOnMount(query, options) ||
    (query.state.data !== undefined &&
      shouldFetchOn(query, options, options.refetchOnMount))
  );
}

function shouldFetchOn(
  query,
  options,
  field: (typeof options)["refetchOnMount"] &
    (typeof options)["refetchOnWindowFocus"] &
    (typeof options)["refetchOnReconnect"]
) {
  if (options.enabled !== false) {
    const value = typeof field === "function" ? field(query) : field;

    return value === "always" || (value !== false && isStale(query, options));
  }

  return false;
}

export class StreamQueryObserver extends QueryObserver {
  _client: QueryClient;

  constructor(client: QueryClient, options: QueryObserverOptions) {
    const _options = {
      ...options,
      behavior: streamQueryBehavior(client),
    };

    super(client, _options);
    this._client = client;
  }

  setOptions(options, notifyOptions?): void {
    super.setOptions(
      {
        ...options,
        // try to re-use the existing behavior.
        // maybe i miss the reason why infiniteQuery always redefine the behavior.
        behavior: this.options.behavior ?? streamQueryBehavior(this._client),
      },
      notifyOptions
    );
  }

  getOptimisticResult(options) {
    // try to re-use the existing behavior.
    // maybe i miss the reason why infiniteQuery always redefine the behavior.
    options.behavior =
      this.options.behavior ?? streamQueryBehavior(this._client);

    return super.getOptimisticResult(options);
  }

  _executeFetch(fetchOptions?): Promise {
    // Make sure we reference the latest query as the current one might have been removed
    // i don't know how to use this from here. :(
    // this.#updateQuery();
    const currentQuery = this.getCurrentQuery();

    let promise = currentQuery.fetch(this.options, fetchOptions);

    if (!fetchOptions?.throwOnError) {
      promise = promise.catch(noop);
    }

    return promise;
  }

  protected onSubscribe(): void {
    if (this.listeners.size === 1) {
      const currentQuery = this.getCurrentQuery();

      currentQuery.addObserver(this);

      if (shouldFetchOnMount(currentQuery, this.options)) {
        this._executeFetch();
      } else {
        this.updateResult();
      }
    }
  }

  protected createResult(query: Query, options) {
    // remove refetch from the result.
    // not sure if it will be used.
    const { refetch, ...result } = super.createResult(query, options);
    const { state } = query;

    return {
      ...result,
      isComplete: !!state.isComplete,
    };
  }
}
