import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { verifyToken } from '../netlify/functions/verifyToken';
import crypto from 'crypto';

describe('verifyToken', () => {
  const appSecret = 'test-secret';
  
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1000000000000));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function generateValidToken(secret: string, offsetMs: number = 60000) {
    const expiry = Date.now() + offsetMs;
    const data = expiry.toString();
    const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
    return `${data}.${signature}`;
  }

  it('passes a valid token', () => {
    const token = generateValidToken(appSecret);
    const result = verifyToken(token, appSecret);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects an expired token', () => {
    const token = generateValidToken(appSecret, -1000); // 1 second in the past
    const result = verifyToken(token, appSecret);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Unauthorized: Token expired");
  });

  it('rejects a tampered signature', () => {
    const token = generateValidToken(appSecret);
    const [expiry, signature] = token.split('.');
    const tamperedToken = `${expiry}.bad${signature}`;
    
    const result = verifyToken(tamperedToken, appSecret);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Unauthorized: Invalid signature");
  });

  it('rejects a malformed token missing the dot separator', () => {
    const token = "justsomerandomstring";
    const result = verifyToken(token, appSecret);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Unauthorized: Invalid token format");
  });

  it('rejects a null or empty token', () => {
    expect(verifyToken(null, appSecret).valid).toBe(false);
    expect(verifyToken("", appSecret).valid).toBe(false);
  });
});
