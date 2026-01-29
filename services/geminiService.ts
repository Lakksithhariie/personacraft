// services/geminiService.ts

import { RephraseRequest, RephraseResponse } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_REASONING_MODELS = new Set([
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'openai/gpt-oss-safeguard-20b',
]);

const DEFAULT_TEMPERATURE = 0.65;
const DEFAULT_MAX_COMPLETION_TOKENS = 1200;

// Get API key from environment
const apiKey =
  (typeof window !== 'undefined'
    ? import.meta.env?.VITE_GROQ_API_KEY
    : process.env.GROQ_API_KEY) || '';

if (!apiKey) {
  console.warn(
    'GROQ API key is missing. Set VITE_GROQ_API_KEY (client) or GROQ_API_KEY (server).'
  );
}

// ❌ REMOVED: escapeRegex()
// ❌ REMOVED: protectPinnedTerms()
// ❌ REMOVED: restorePinnedTerms()

/**
 * Builds the system prompt for the AI model
 */
function buildSystemPrompt(request: RephraseRequest): string {
  const { mode, variationCount, controls } = request;

  const tenseInstruction =
    controls.tense === 'as_is'
      ? 'Preserve the original tense.'
      : `Convert everything to ${controls.tense} tense.`;

  const povInstruction =
    controls.pov === 'as_is'
      ? 'Keep the original point of view.'
      : `Rewrite in ${controls.pov} person.`;

  const lengthInstruction =
    controls.length === 'same'
      ? 'Stay roughly the same length.'
      : `Make it ${controls.length}.`;

  const transitionInstruction =
    controls.transitions === 'off'
      ? 'Do not add new transitions.'
      : `Use ${controls.transitions} connective transitions.`;

  return `
You are Personacraft, a world-class professional editor.

Rewrite the user's text in the "${mode}" writing mode while respecting these constraints:

- Variations: Provide exactly ${variationCount} distinct variations.
- Tense: ${tenseInstruction}
- POV: ${povInstruction}
- Length: ${lengthInstruction}
- Transitions: ${transitionInstruction}
- Vividness: ${controls.vividness} sensory/descriptive detail.

Output ONLY valid JSON with this structure:
{
  "variations": ["variation1", "variation2", ...],
  "summary": "brief summary" or null
}

${controls.includeSummary ? 'Include a summary.' : 'Set summary to null.'}
Do not include any text outside the JSON object.
`.trim();
}

/**
 * Builds the messages array for the API request
 */
function buildMessages(
  request: RephraseRequest,
  text: string
): Array<{ role: string; content: string }> {
  return [
    {
      role: 'system',
      content: buildSystemPrompt(request),
    },
    {
      role: 'user',
      content: `Rephrase the following text:

TEXT:
${text}`,
    },
  ];
}

/**
 * Checks if a model requires reasoning parameters
 */
function needsReasoning(model: string): boolean {
  return GROQ_REASONING_MODELS.has(model);
}

/**
 * Extracts JSON from the API response, handling markdown code blocks
 */
function extractJsonPayload(
  rawContent: string | null
): { variations?: string[]; summary?: string | null } {
  if (!rawContent) return {};

  const trimmed = rawContent.trim();

  // Try direct JSON parse first
  try {
    return JSON.parse(trimmed);
  } catch {
    // Try extracting from markdown code block
    const fenceMatch = trimmed.match(/````(?:json)?\s*([\s\S]*?)````/i);
    if (fenceMatch?.[1]) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch {
        // Fall through
      }
    }

    // Try finding JSON object in the text
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        // Fall through
      }
    }

    return {};
  }
}

/**
 * Main function to rephrase text using Groq API
 */
export async function rephraseText(
  request: RephraseRequest
): Promise<RephraseResponse> {
  if (!apiKey) {
    throw new Error(
      'Missing Groq API key. Please configure VITE_GROQ_API_KEY in your .env file.'
    );
  }

  const { text, model, variationCount, controls } = request;
  // ❌ REMOVED: pinnedTerms from destructuring
  // ❌ REMOVED: protectPinnedTerms() call
  
  const originalWordCount = text.split(/\s+/).filter(Boolean).length;

  // Build request body
  const body: Record<string, unknown> = {
    model,
    messages: buildMessages(request, text), // Now uses raw text directly
    temperature: DEFAULT_TEMPERATURE,
    max_completion_tokens: DEFAULT_MAX_COMPLETION_TOKENS,
    top_p: 0.9,
    stream: false,
  };

  // Add reasoning parameters for supported models
  if (needsReasoning(model)) {
    body.reasoning_effort = 'medium';
    body.include_reasoning = false;
  }

  // Make API request
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  // Handle errors
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API Error:', errorText);
    throw new Error(`Groq request failed (${response.status}): ${errorText}`);
  }

  // Parse response
  const completion = await response.json();
  const messageContent = completion?.choices?.[0]?.message?.content ?? null;
  const payload = extractJsonPayload(messageContent);

  // ❌ REMOVED: restorePinnedTerms() calls
  // ❌ REMOVED: warnings generation logic

  const variations = payload.variations || [];

  // Validate we got variations
  if (!variations.length) {
    console.error('Raw API response:', messageContent);
    throw new Error('Groq response did not include any variations.');
  }

  return {
    variations: variations.slice(0, variationCount),
    summary: controls.includeSummary ? (payload.summary ?? undefined) : undefined,
    warnings: undefined, // Always undefined now
    model,
    variationCount: variations.length,
    originalWordCount,
  };
}