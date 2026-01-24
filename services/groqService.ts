import { Tone, Persona, RephraseResponse, Model } from "../types";

export const rephraseText = async (
  text: string,
  selection: Tone | Persona,
  isPersona: boolean,
  model: Model
): Promise<RephraseResponse> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("api key is missing. please ensure GROQ_API_KEY is configured.");
  }

  const systemPrompt = selection.prompt;

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
          { role: "user", content: text }
        ],
        temperature: isPersona ? 0.7 : 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 429) {
        throw new Error("rate limit exceeded. please wait a moment and try again.");
      }
      throw new Error(error?.error?.message || `api error: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    // Clean up any quotes, asterisks, or markdown the model might add
    const cleanedResult = result
      .trim()
      .replace(/^["']|["']$/g, '')
      .replace(/^\*\*|\*\*$/g, '')
      .replace(/^#+\s*/gm, '')
      .replace(/\*\*/g, '');

    return {
      result: cleanedResult,
      meta: {
        model: model.name,
        wordCount: cleanedResult.split(/\s+/).filter(Boolean).length,
        originalWordCount: text.split(/\s+/).filter(Boolean).length,
      },
    };
  } catch (error: any) {
    console.error("groq api error:", error);
    throw new Error(error?.message || "an unexpected error occurred while rephrasing.");
  }
};