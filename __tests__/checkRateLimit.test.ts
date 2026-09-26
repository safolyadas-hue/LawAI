import { describe, it, expect } from 'vitest';
import { checkRateLimit } from '../netlify/functions/checkRateLimit';

describe('checkRateLimit', () => {
  it('returns true when under the limit', () => {
    expect(checkRateLimit(10)).toBe(true);
  });

  it('returns false when exactly at the limit', () => {
    expect(checkRateLimit(25)).toBe(false);
  });

  it('returns true when one below the limit', () => {
    expect(checkRateLimit(24)).toBe(true);
  });
});
