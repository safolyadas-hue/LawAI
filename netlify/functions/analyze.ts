import crypto from "crypto";
import { getStore } from "@netlify/blobs";
import { verifyToken } from "./verifyToken";
import { checkRateLimit } from "./checkRateLimit";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const appSecret = process.env.APP_SECRET;

  if (!apiKey || !appSecret) {
    console.error("Missing configuration: GEMINI_API_KEY or APP_SECRET");
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }

  // 1. Anti-replay Token verification
  const token = req.headers.get("x-app-token");
  const verification = verifyToken(token, appSecret);
  if (!verification.valid) {
    return Response.json({ error: verification.error }, { status: 401 });
  }

  // 2. Rate Limiting per IP
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

  try {
    const body: { query: string } = await req.json();
    const userText = body.query;

    if (!userText) {
      return Response.json({ error: "Bad Request" }, { status: 400 });
    }

    const textString = String(userText);
    if (textString.length > 25000) {
      return Response.json({ error: "Bad Request: Text exceeds the 25,000 character limit." }, { status: 400 });
    }

    const systemPrompt = "You are an expert legal assistant. Translate the following complex legal text into simple, 8th-grade level plain English. Explicitly highlight any hidden risks or liabilities for the user. Use H3 (###) for titles, horizontal rules (***) for main breaks, and clear bullet points for risk lists.";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          parts: [{ text: textString }]
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API Error: ${errorText}`);
      return Response.json({ error: "Internal Server Error" }, { status: 502 });
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      console.error("No text generated from Gemini API");
      return Response.json({ error: "Internal Server Error" }, { status: 500 });
    }

    return Response.json({
      simplified_text: generatedText
    });
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return Response.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
