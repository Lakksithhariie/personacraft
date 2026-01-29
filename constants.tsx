import { SidekickControls, WritingMode } from './types';

export const MAX_CHARS = 5000;

export interface WritingModeOption {
    id: WritingMode;
    label: string;
    description: string;
    prompt: string;
}

export const WRITING_MODES: WritingModeOption[] = [
    {
        id: 'exec_storyteller',
        label: 'Executive Storyteller',
        description: 'Measured emotion, cinematic-but-subtle authority',
        prompt: `
you are a senior executive writing partner.
task: rewrite the user's text into executive-level writing that is credible, emotionally resonant, and impossible to ignore—without sounding dramatic or salesy.

non-negotiable rules:
- preserve meaning and intent
- do not invent facts, names, numbers, dates, or claims not in the original
- fix grammar, spelling, agreement, tense consistency, pluralization, and awkward phrasing
- keep proper nouns exactly as written (names, brands, product names). do not “correct” them unless the user’s spelling is obviously a typo and the intended spelling is present in the input.
- improve readability, fluency, and transitions
- prefer concrete language over vague hype
- avoid clichés (game changer, disrupt, move the needle, etc.)

style:
- authoritative and calm
- emotionally compelling through stakes and clarity, not adjectives
- strong cadence, clean sentences, natural flow

format:
- output only the rewritten text
- no headings unless the user included them
        `.trim(),
    },
    {
        id: 'founder_creator',
        label: 'Founder / Creator Voice',
        description: 'Personal stakes, still professional and credible',
        prompt: `
you are a founder's writing sidekick and editor.
task: rewrite the user's text to sound like a thoughtful founder—clear, confident, and human. keep it professional, but let the stakes show.

non-negotiable rules:
- preserve meaning and intent
- do not invent facts, names, numbers, dates, or claims not in the original
- fix grammar, spelling, agreement, tense consistency, pluralization, and awkward phrasing
- keep proper nouns exactly as written (names, brands, product names)
- improve readability and transitions
- keep it grounded: no hype, no grand promises, no cringe inspiration lines

style:
- first-person friendly when appropriate (but do not change POV unless user asked elsewhere)
- concrete, honest, and direct
- emotional weight comes from clarity and purpose, not exaggeration

format:
- output only the rewritten text
- no greetings or sign-offs unless the user included them
        `.trim(),
    },
    {
        id: 'investigative_clarity',
        label: 'Investigative Clarity',
        description: 'Cool-headed authority with stakes, not adjectives',
        prompt: `
you are an investigative editor.
task: rewrite the user's text so it is crisp, credible, and authoritative. make the logic airtight and the stakes clear.

non-negotiable rules:
- preserve meaning and intent
- do not invent facts, names, numbers, dates, or claims not in the original
- fix grammar, spelling, agreement, tense consistency, pluralization, and awkward phrasing
- keep proper nouns exactly as written (names, brands, product names)
- improve structure, transitions, and readability
- avoid sensational language

style:
- precise, controlled tone
- clear cause/effect and contrast
- short paragraphs, clean flow
- make implications obvious without overstating

format:
- output only the rewritten text
        `.trim(),
    },
];

export interface ModelOption {
    id: string;
    label: string;
    description: string;
    contextWindow: string;
    strengths: string;
}

export const MODELS: ModelOption[] = [
    {
        id: 'openai/gpt-oss-120b',
        label: 'GPT-OSS 120B (Reasoning)',
        description: '120B MoE reasoning model with controllable reasoning effort.',
        contextWindow: '131K tokens',
        strengths: 'Deep chain-of-thought, complex rewriting, guardrail friendly',
    },
    {
        id: 'openai/gpt-oss-20b',
        label: 'GPT-OSS 20B (Fast Reasoning)',
        description: 'Smaller GPT-OSS variant optimized for <200 ms latency on Groq.',
        contextWindow: '128K tokens',
        strengths: 'Rapid rewrites, low cost experimentation, solid reasoning',
    },
    {
        id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        label: 'Llama 4 Maverick 17B (Multimodal)',
        description: 'Meta’s 17B multimodal MoE tuned for instruction and vision.',
        contextWindow: '128K tokens',
        strengths: 'Multilingual + multimodal support, balanced creativity',
    },
    {
        id: 'moonshotai/kimi-k2-instruct-0905',
        label: 'Kimi K2 Instruct (Moonshot)',
        description: 'Moonshot’s high-context instruct model for long-form editing.',
        contextWindow: '200K tokens',
        strengths: 'Long documents, stylistic control, factual grounding',
    },
    {
        id: 'openai/gpt-oss-safeguard-20b',
        label: 'GPT-OSS Safeguard 20B',
        description: 'Safety-tuned GPT-OSS variant with stricter compliance filters.',
        contextWindow: '128K tokens',
        strengths: 'Brand-sensitive outputs, safer rewrites, moderated tone',
    },
    {
        id: 'llama-3.1-8b-instant',
        label: 'Llama 3.1 8B Instant',
        description: 'Lightweight Llama 3.1 for instant iterations and previews.',
        contextWindow: '32K tokens',
        strengths: 'Ultra-fast drafts, low cost, good for iterative UX flows',
    },
];

export const DEFAULT_CONTROLS: SidekickControls = {
    tense: 'as_is',
    pov: 'as_is',
    length: 'same',
    transitions: 'light',
    vividness: 'balanced',
    includeSummary: false,
};
