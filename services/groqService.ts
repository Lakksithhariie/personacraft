import { Tone, Persona, RephraseResponse, Model } from "../types";

export const rephraseText = async (
  text: string,
  selection: Tone | Persona,
  isPersona: boolean,
  model: Model
): Promise<RephraseResponse> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure GROQ_API_KEY is configured.");
  }

  const systemPrompt = selection.prompt;
  const userPrompt = `Please rephrase the following text according to your persona/tone instructions. Do not add any introductory text or quotes around the result. Output only the rephrased content.

Text to rephrase: "${text}"`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model.id,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: isPersona ? 0.8 : 0.4,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please wait a moment and try again.");
      }
      throw new Error(error?.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    const cleanedResult = result.trim().replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1');

    return {
      result: cleanedResult,
      meta: {
        model: model.name,
        wordCount: cleanedResult.split(/\s+/).filter(Boolean).length,
        originalWordCount: text.split(/\s+/).filter(Boolean).length,
      },
    };
  } catch (error: any) {
    console.error("Groq API Error:", error);
    throw new Error(error?.message || "An unexpected error occurred while rephrasing.");
  }
};
