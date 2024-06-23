import { interval, take, fromEvent, takeUntil, map, scan } from "rxjs";

export const fakeSSE = ({ next, error, complete, signal }) => {
  const source = interval(500);
  const signalAborted = fromEvent(signal, "abort");
  const result = source.pipe(
    take(20),
    map((number) => ({
      message: `This is a mock event ${number}`,
      timestamp: Date.now(),
    })),
    scan((acc, curr) => [...acc, curr], []),
    takeUntil(signalAborted)
  );

  result.subscribe({
    next,
    error,
    complete,
  });
};
