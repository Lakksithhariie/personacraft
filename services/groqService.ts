import { Voice, Persona, RephraseResponse, Model } from "../types";

export const rephraseText = async (
  text: string,
  selection: Voice | Persona,
  isPersona: boolean,
  model: Model,
  variationCount: number = 1
): Promise<RephraseResponse> => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("api key is missing. please ensure GROQ_API_KEY is configured.");
  }

  const systemPrompt = selection.prompt;
  
  const userPrompt = variationCount > 1 
    ? `provide exactly ${variationCount} different variations of the rephrased text. separate each variation with "---" on its own line. each variation should be distinct but follow the same voice and rules.\n\ntext to rephrase:\n${text}`
    : text;

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
        temperature: isPersona ? 0.7 : 0.4,
        max_tokens: variationCount * 500,
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

    // Clean and split variations
    const cleanResult = (text: string): string => {
      return text
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/^\*\*|\*\*$/g, '')
        .replace(/^#+\s*/gm, '')
        .replace(/\*\*/g, '')
        .replace(/—/g, ' ')
        .replace(/–/g, ' ')
        .replace(/:/g, ',')
        .replace(/;/g, '.')
        .trim();
    };

    let results: string[];
    
    if (variationCount > 1) {
      results = result
        .split('---')
        .map((v: string) => cleanResult(v))
        .filter((v: string) => v.length > 0)
        .slice(0, variationCount);
      
      // If splitting didn't work well, just return the whole thing as one
      if (results.length === 0) {
        results = [cleanResult(result)];
      }
    } else {
      results = [cleanResult(result)];
    }

    return {
      results,
      meta: {
        model: model.name,
        variationCount: results.length,
        originalWordCount: text.split(/\s+/).filter(Boolean).length,
      },
    };
  } catch (error: any) {
    console.error("groq api error:", error);
    throw new Error(error?.message || "an unexpected error occurred while rephrasing.");
  }
};
