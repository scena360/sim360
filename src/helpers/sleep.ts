/**
 * await the returned promise to sleep for `durationMs` milliseconds
 *
 * @param durationMs {Number}
 * @returns
 */
export const sleep = (durationMs: number): Promise<void> => {
  return new Promise(res => {
    setTimeout(() => {
      res();
    }, durationMs);
  });
};
