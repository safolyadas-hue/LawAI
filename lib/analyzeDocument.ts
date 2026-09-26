export async function analyzeDocument(query: string, documentText?: string): Promise<string> {
  const tokenRes = await fetch("/.netlify/functions/get-token", { method: "POST" });
  if (!tokenRes.ok) {
    throw new Error("Failed to authenticate request");
  }
  
  const { token } = await tokenRes.json();

  const bodyData: { query: string; documentText?: string } = { query };
  if (documentText !== undefined) {
    bodyData.documentText = documentText;
  }

  const res = await fetch("/.netlify/functions/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-app-token": token,
    },
    body: JSON.stringify(bodyData),
  });

  if (!res.ok) {
    throw new Error("Failed to analyze");
  }

  const data = await res.json();
  if (!data.simplified_text) {
    throw new Error("No simplified text returned from server");
  }
  
  return data.simplified_text;
}
