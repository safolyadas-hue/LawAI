/**
 * Evaluates whether a given request count exceeds the predefined rate limit threshold.
 * Kept as a pure function to allow for robust unit testing in isolation from the
 * actual database/blob storage logic.
 *
 * @param currentCount - The number of requests already made by this IP in the current window.
 * @returns True if the request is allowed (under threshold), false otherwise.
 */
export function checkRateLimit(currentCount: number): boolean {
  return currentCount < 25;
}
