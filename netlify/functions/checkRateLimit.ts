export function checkRateLimit(currentCount: number): boolean {
  return currentCount < 25;
}
