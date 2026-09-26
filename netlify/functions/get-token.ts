import crypto from "crypto";
import { getStore } from "@netlify/blobs";
import { checkRateLimit } from "./checkRateLimit";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const contentLength = parseInt(req.headers.get("content-length") || "0", 10);
  if (contentLength > 30000) {
    return Response.json({ error: "Payload Too Large" }, { status: 413 });
  }

  // Rate Limiting per IP
  const ip = req.headers.get("x-nf-client-connection-ip") || "unknown-ip";
  const currentHour = new Date().toISOString().slice(0, 13);
  const blobKey = `ratelimit_${ip}_${currentHour}`;

  try {
    const rateLimits = getStore("rate-limits");
    const currentCountBlob = await rateLimits.get(blobKey);
    const currentCountStr = currentCountBlob ? Buffer.from(currentCountBlob as ArrayBuffer).toString('utf-8') : "";
    let currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    
    if (!checkRateLimit(currentCount)) {
      return Response.json({ error: "Too Many Requests: Rate limit exceeded. Try again next hour." }, { status: 429 });
    }

    currentCount += 1;
    await rateLimits.set(blobKey, currentCount.toString());
  } catch (err) {
    console.error("Blob Storage Error:", err);
  }

  const appSecret = process.env.APP_SECRET;
  if (!appSecret) {
    console.error("Missing APP_SECRET");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }

  const expiry = Date.now() + 60000; // 60 seconds
  const data = expiry.toString();
  const signature = crypto.createHmac("sha256", appSecret).update(data).digest("hex");
  const token = `${data}.${signature}`;

  return Response.json({ token });
};
