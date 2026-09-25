import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error("Server configuration error: API key is missing");
    }

    const body = await request.json();

    // Defensively grab the text no matter what the frontend named the key
    const userText = body.query || body.text || body.input || body.message || Object.values(body)[0];

    if (!userText) {
      throw new Error(`Frontend sent an empty or unrecognized payload: ${JSON.stringify(body)}`);
    }

    const systemPrompt = "You are an expert legal assistant. Translate the following complex legal text into simple, 8th-grade level plain English. Explicitly highlight any hidden risks or liabilities for the user. Use H3 (###) for titles, horizontal rules (***) for main breaks, and clear bullet points for risk lists.";

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          parts: [{ text: String(userText) }]
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
      // Throwing the exact API error so it reaches the frontend network tab
      throw new Error(`Gemini API Error: ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("No text generated from Gemini API");
    }

    return NextResponse.json({
      simplified_text: generatedText
    });

  } catch (error: any) {
    console.error("Analysis Error:", error);
    // Returning the actual error message to the browser for debugging
    return NextResponse.json(
      { error: error.message || "Failed to process the request" },
      { status: 500 }
    );
  }
}