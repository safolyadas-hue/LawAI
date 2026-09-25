export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Server configuration error: API key is missing" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const userText = body.query || body.text || body.input || body.message || Object.values(body)[0];

    if (!userText) {
      return Response.json({ error: `Frontend sent an empty or unrecognized payload` }, { status: 400 });
    }

    const textString = String(userText);
    if (textString.length > 25000) {
      return Response.json({ error: "Text exceeds the 25,000 character limit." }, { status: 400 });
    }

    const systemPrompt = "You are an expert legal assistant. Translate the following complex legal text into simple, 8th-grade level plain English. Explicitly highlight any hidden risks or liabilities for the user.";

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
      return Response.json({ error: `Gemini API Error: ${errorText}` }, { status: 502 });
    }

    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return Response.json({ error: "No text generated from Gemini API" }, { status: 500 });
    }

    return Response.json({
      simplified_text: generatedText
    });
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return Response.json(
      { error: error.message || "Failed to process the request" },
      { status: 500 }
    );
  }
};
