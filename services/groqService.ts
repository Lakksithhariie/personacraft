import { WritingMode, RephraseResponse, Model, RewriteSettings } from "../types";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

const GROQ_CHAT_COMPLETIONS_URL = "/api/groq/chat";

function normalizeTerm(t: string) {
  return t.trim().replace(/\s+/g, " ");
}

function uniqTerms(terms: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of terms) {
    const t = normalizeTerm(raw);
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function stripCodeFences(s: string): string {
  const trimmed = s.trim();
  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```[a-zA-Z]*\s*/i, "").replace(/```$/, "").trim();
  }
  return trimmed;
}

function tryParseJsonStringArray(raw: string): string[] | null {
  const text = stripCodeFences(raw);

  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) return parsed;
  } catch {
    // continue
  }

  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start >= 0 && end > start) {
    const slice = text.slice(start, end + 1);
    try {
      const parsed = JSON.parse(slice);
      if (Array.isArray(parsed) && parsed.every((x) => typeof x === "string")) return parsed;
    } catch {
      // ignore
    }
  }

  return null;
}

function tryParseJsonString(raw: string): string | null {
  const text = stripCodeFences(raw);

  try {
    const parsed = JSON.parse(text);
    if (typeof parsed === "string") return parsed;
  } catch {
    // continue
  }

  const m = text.match(/"([^"]+)"/);
  if (m?.[1]) return m[1];

  return null;
}

function cleanResult(s: string): string {
  return s
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\*\*/g, "")
    .replace(/^#+\s*/gm, "")
    .replace(/[—–]/g, "-")
    .trim();
}

/**
 * Placeholder enforcement for pinned terms.
 */
function applyPinnedPlaceholders(input: string, pinnedTerms: string[]) {
  const terms = uniqTerms(pinnedTerms).sort((a, b) => b.length - a.length);

  const placeholderToTerm = new Map<string, string>();
  let text = input;

  let usedCount = 0;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (!term) continue;

    const re = new RegExp(escapeRegex(term), "g");
    if (!re.test(text)) continue;

    const placeholder = `[[PIN_${usedCount + 1}]]`;
    usedCount += 1;

    placeholderToTerm.set(placeholder, term);
    text = text.replace(re, placeholder);
  }

  return { text, placeholderToTerm };
}

function restorePinnedPlaceholders(output: string, placeholderToTerm: Map<string, string>) {
  let text = output;
  for (const [placeholder, term] of placeholderToTerm.entries()) {
    text = text.split(placeholder).join(term);
  }
  return text;
}

async function callGroqChatCompletion(
  modelId: string,
  messages: ChatMessage[],
  temperature: number,
  max_tokens: number
): Promise<string> {
  const response = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({} as any));
    if (response.status === 429) {
      throw new Error("rate limit exceeded. please wait a moment and try again.");
    }
    throw new Error(error?.error?.message || `api error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function settingsToInstruction(settings?: RewriteSettings): string {
  if (!settings) return "";

  const lines: string[] = [];

  if (settings.tense !== "as_is") lines.push(`- tense: rewrite in ${settings.tense} tense`);
  if (settings.pov !== "as_is") lines.push(`- point of view: rewrite in ${settings.pov} person`);

  if (settings.length === "shorter") lines.push(`- length: noticeably shorter while preserving meaning`);
  if (settings.length === "same") lines.push(`- length: roughly the same length as the input`);
  if (settings.length === "longer") lines.push(`- length: slightly longer (add clarity, not new facts)`);

  if (settings.transitions === "off") lines.push(`- transitions: keep transitions minimal`);
  if (settings.transitions === "light") lines.push(`- transitions: light smoothing for flow`);
  if (settings.transitions === "strong") lines.push(`- transitions: stronger transitions and signposting (without fluff)`);

  if (settings.vividness === "low") lines.push(`- vividness: keep language plain and direct; avoid imagery`);
  if (settings.vividness === "balanced") lines.push(`- vividness: balanced; add specificity only when supported by input`);
  if (settings.vividness === "high") lines.push(`- vividness: increase sensory specificity and concreteness WITHOUT adding facts`);

  if (lines.length === 0) return "";
  return `\nadditional rewrite settings:\n${lines.join("\n")}\n`;
}

async function generateSummary(
  model: Model,
  pinnedPlaceholders: string[],
  textToSummarize: string
): Promise<string> {
  const systemPrompt = `
you are a concise executive summarizer.

rules:
- 1–2 sentences max
- do not add new facts
- do not use bullets, headings, or labels like "summary:"
- preserve any pinned placeholders exactly if they appear (example: [[PIN_1]])
- output ONLY the summary text (no extra commentary)
  `.trim();

  const userPrompt = `
pinned placeholders (must remain unchanged if used):
${pinnedPlaceholders.map((p) => `- ${p}`).join("\n") || "(none)"}

text to summarize:
${textToSummarize}
  `.trim();

  const raw = await callGroqChatCompletion(
    model.id,
    [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    0.2,
    220
  );

  const parsed = tryParseJsonString(raw);
  return cleanResult(parsed ?? raw);
}

export const rephraseText = async (
  text: string,
  mode: WritingMode,
  model: Model,
  variationCount: number = 1,
  pinnedTerms: string[] = [],
  settings?: RewriteSettings
): Promise<RephraseResponse> => {
  const warnings: string[] = [];
  const normalizedPinned = uniqTerms(pinnedTerms);

  const { text: placeholderText, placeholderToTerm } = applyPinnedPlaceholders(text, normalizedPinned);
  const pinnedPlaceholders = Array.from(placeholderToTerm.keys());

  const placeholderLine =
    pinnedPlaceholders.length > 0
      ? `pinned placeholders (MUST remain exactly unchanged): ${pinnedPlaceholders
          .map((p) => `"${p}"`)
          .join(", ")}`
      : "";

  const extraSettings = settingsToInstruction(settings);
  const systemPrompt = mode.prompt;

  const userPrompt = `
return a valid JSON array of exactly ${Math.max(1, variationCount)} strings.
do not include any extra text outside the JSON.

global constraints:
- preserve meaning and intent
- do not add new facts
- fix spelling and grammar
- improve readability, fluency, and transitions
${placeholderLine ? `- ${placeholderLine}` : ""}

${extraSettings}

text:
${placeholderText}
  `.trim();

  try {
    const raw = await callGroqChatCompletion(
      model.id,
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      0.4,
      Math.max(700, variationCount * 800)
    );

    let results = tryParseJsonStringArray(raw);

    if (!results) {
      if (variationCount > 1) {
        const split = raw
          .split("---")
          .map((v) => cleanResult(v))
          .filter((v) => v.length > 0)
          .slice(0, variationCount);

        results = split.length > 0 ? split : [cleanResult(raw)];
      } else {
        results = [cleanResult(raw)];
      }
    }

    results = results.map(cleanResult).slice(0, variationCount);

    if (results.length > 0) {
      const proofreadSystem = `
you are a meticulous professional copy editor.

fix grammar, spelling, agreement (subject-verb), pluralization, tense consistency, punctuation, and awkward phrasing.
tighten wording where it improves clarity.
do not add new facts. do not change meaning.

CRITICAL:
- do not change or remove any pinned placeholders (example: [[PIN_1]]).
- return a valid JSON array of strings only (no extra text).
      `.trim();

      const proofreadUser = `
pinned placeholders (must remain exactly unchanged):
${pinnedPlaceholders.map((p) => `- ${p}`).join("\n") || "(none)"}

input JSON array:
${JSON.stringify(results)}
      `.trim();

      const proofreadRaw = await callGroqChatCompletion(
        model.id,
        [
          { role: "system", content: proofreadSystem },
          { role: "user", content: proofreadUser },
        ],
        0.2,
        Math.max(700, variationCount * 800)
      );

      const proofreadResults = tryParseJsonStringArray(proofreadRaw);
      if (proofreadResults && proofreadResults.length > 0) {
        results = proofreadResults.map(cleanResult).slice(0, variationCount);
      }
    }

    results = results.map((r) => restorePinnedPlaceholders(r, placeholderToTerm));

    if (normalizedPinned.length > 0) {
      const pinnedThatWereInInput = normalizedPinned.filter((t) => text.includes(t));
      const missing = pinnedThatWereInInput.filter((t) =>
        results.some((r) => !r.includes(t))
      );

      if (missing.length > 0) {
        warnings.push(`Pinned term(s) missing from output: ${missing.join(", ")}`);
      }
    }

    let summary: string | undefined = undefined;
    if (settings?.includeSummary) {
      const summaryRaw = await generateSummary(model, pinnedPlaceholders, results[0] || "");
      summary = restorePinnedPlaceholders(summaryRaw, placeholderToTerm);
    }

    return {
      results,
      model: model.name,
      variationCount: results.length,
      originalWordCount: text.split(/\s+/).filter(Boolean).length,
      summary,
      warnings: warnings.length ? warnings : undefined,
    };
  } catch (error: any) {
    console.error("groq api error:", error);
    throw new Error(
      error?.message || "an unexpected error occurred while rephrasing."
    );
  }
};