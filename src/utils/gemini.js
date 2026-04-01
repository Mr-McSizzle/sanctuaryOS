// Shared Gemini API utility — uses fetch directly to avoid SDK version issues
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const MODEL = "gemini-2.0-flash";
const BASE_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}`;

/**
 * Send a text prompt to Gemini and get a text response.
 * @param {string} prompt - The user/system prompt
 * @param {string} [systemInstruction] - Optional system instruction for role-playing
 * @returns {Promise<string>} The model's text response
 */
export async function askGemini(prompt, systemInstruction) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
    },
  };

  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const res = await fetch(`${BASE_URL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

/**
 * Send an image (base64) + text prompt to Gemini Vision.
 * @param {string} prompt
 * @param {string} base64Image - JPEG base64 string (no data: prefix)
 * @returns {Promise<string>}
 */
export async function askGeminiVision(prompt, base64Image) {
  const body = {
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/jpeg", data: base64Image } }
      ]
    }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 256,
    },
  };

  const res = await fetch(`${BASE_URL}:generateContent?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini Vision error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
}

export { API_KEY, MODEL };
