import { describe, it, expect, vi, beforeEach } from 'vitest';
import analyzeHandler from '../netlify/functions/analyze';
import crypto from 'crypto';

// Mock getStore from @netlify/blobs
vi.mock('@netlify/blobs', () => {
  return {
    getStore: () => ({
      get: vi.fn().mockResolvedValue("0"),
      set: vi.fn().mockResolvedValue(true),
    }),
  };
});

describe('analyze function', () => {
  const appSecret = 'test-secret';
  
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    process.env.APP_SECRET = appSecret;
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
    vi.setSystemTime(new Date(1000000000000));
  });

  function generateValidToken(secret: string) {
    const expiry = Date.now() + 60000;
    const data = expiry.toString();
    const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
    return `${data}.${signature}`;
  }

  it('returns 401 if missing token', async () => {
    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: {},
      body: JSON.stringify({ query: 'hello' }),
    });

    const res = await analyzeHandler(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data.error).toBe('Unauthorized: Missing token');
  });

  it('returns 400 if body exceeds 25,000 characters', async () => {
    const token = generateValidToken(appSecret);
    const hugeText = 'a'.repeat(25001);
    
    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: {
        'x-app-token': token,
      },
      body: JSON.stringify({ query: hugeText }),
    });

    const res = await analyzeHandler(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain('exceeds the 25,000 character limit');
  });

  it('returns simplified_text on success with valid token', async () => {
    const token = generateValidToken(appSecret);
    
    // Mock the global fetch for Gemini API
    const mockFetch = vi.mocked(global.fetch).mockResolvedValue(
      new Response(JSON.stringify({
        candidates: [
          {
            content: {
              parts: [{ text: 'mocked simplified text' }]
            }
          }
        ]
      }), { status: 200 })
    );

    const req = new Request('http://localhost/', {
      method: 'POST',
      headers: {
        'x-app-token': token,
      },
      body: JSON.stringify({ query: 'hello there' }),
    });

    const res = await analyzeHandler(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.simplified_text).toBe('mocked simplified text');
    
    // Verify fetch was called with correct key
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('key=test-api-key'),
      expect.any(Object)
    );
  });
});
