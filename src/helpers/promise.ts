class TooManyAttempts extends Error {
  cause: any;
  tolerable: any;
  requestId: any;
  associatedEvent: any;
  parentError: any;

  constructor({
    event,
    numTries,
    parentError,
  }: {
    event?: string;
    numTries: number;
    parentError?: Error | null;
  }) {
    super(
      `retryPromise tried to resolve ${numTries} times. Too many attempts :(`,
    );
    this.name = 'TooManyAttempts';
    this.cause = event || 'cause unknown';
    this.parentError = parentError;
  }
}

class TimeoutError extends Error {
  cause: any;
  tolerable: any;
  requestId: any;
  associatedEvent: any;
  parentError: any;

  constructor({
    event,
    parentError,
    deadlineMs,
  }: {
    event?: string;
    parentError?: Error | null;
    deadlineMs?: number;
  }) {
    super(
      `Failed to fulfill promise for ${event} event after ${deadlineMs} ms`,
    );
    this.name = 'TimeoutError';
    this.cause = event || 'cause unknown';
    this.parentError = parentError;
  }
}

const delay = (BASE_DELAY = 500, retries: number) =>
  new Promise(resolve => setTimeout(resolve, BASE_DELAY * retries));

/**
 * retryPromise attempts to try promise up to `MAX_NUM_TRIES` times
 * on each attempt, it introduces a greater delay between attempts (backoff) and increases the deadline (to give the promise a bit more time)
 *
 * note: I think this function is an anti-pattern for promises (as it takes an async function as a parameter), so improvements and alternative solutions are welcome.
 * - Danilo
 *
 * @param asyncFunc %
 * @param tries
 * @returns
 */
export const retryPromise = async <T>(
  asyncFunc: (deadlineMs: number) => Promise<T>,
  settings = {
    BASE_DEADLINE_MS: 5000,
    MAX_NUM_TRIES: 3,
    BASE_DELAY: 500,
  },
  event = 'unknown event, see parent error',
  tries = 1,
  err = null,
): Promise<T | undefined> => {
  if (tries > settings.MAX_NUM_TRIES) {
    throw new TooManyAttempts({ parentError: err, numTries: tries - 1, event });
  }
  // increase initial deadline with a small extension
  try {
    const res = await asyncFunc(settings.BASE_DEADLINE_MS + tries * 200);
    return res;
  } catch (error) {
    await delay(settings.BASE_DELAY, tries);
    try {
      const result = await retryPromise(
        asyncFunc,
        settings,
        event,
        tries + 1,
        error as any,
      );
      return result;
    } catch (retryErr) {
      throw retryErr;
    }
  }
};

/**
 * throws error and short circuits if `promise` doesn't resolve before `deadlineMs` milliseconds have elapsed
 *
 * @param deadlineMs the deadline/timeout in milliseconds
 * @param promise the promise that we're attempting to resolve
 * @param event the name of the event associated with the promise
 * @returns
 */
export const promiseTimeout = async <T>(
  deadlineMs: number,
  promise: Promise<T>,
  event: string,
): Promise<T> => {
  let timeoutHandle: number | NodeJS.Timeout;
  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(
        new TimeoutError({
          deadlineMs,
          event,
        }),
      );
    }, deadlineMs);
  });

  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeoutPromise]).then((result: T | any) => {
    clearTimeout(timeoutHandle as any);
    return result;
  });
};

// Returns the first promise that successfully resolves
export const promiseFirstResolved = async <T>(promises: Promise<T>[]) => {
  let numRejected = 0;
  return new Promise<T>((resolve, reject) =>
    promises.forEach(promise =>
      promise.then(resolve).catch(() => {
        // eslint-disable-next-line no-plusplus
        if (++numRejected === promises.length) reject();
      }),
    ),
  );
};
