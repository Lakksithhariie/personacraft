// types.ts

/**
 * Core selection types
 * Keep these small and stable because multiple UI components depend on them.
 */

export type Model = {
  id: string;
  name: string;
  description: string;
};

/**
 * New primary concept (replaces persona + voice in the product).
 * This is what the app should use going forward.
 */
export type WritingMode = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

/**
 * Legacy compatibility types.
 * Kept so older imports don’t break while we finish cleanup later.
 */
export type Voice = {
  id: string;
  name: string;
  description: string;
  prompt: string;
};

export type Persona = {
  id: string;
  name: string;
  catchphrase?: string;
  prompt: string;
};

/**
 * Sidekick controls
 */
export type RewriteSettings = {
  tense: 'as_is' | 'present' | 'past';
  pov: 'as_is' | 'first' | 'third';
  length: 'shorter' | 'same' | 'longer';
  transitions: 'off' | 'light' | 'strong';
  vividness: 'low' | 'balanced' | 'high';
  includeSummary: boolean;
};

/**
 * Service response payload (what UI renders)
 */
export type RephraseResponse = {
  results: string[];
  model: string;
  variationCount: number;
  originalWordCount: number;

  // v1 additions
  summary?: string;
  warnings?: string[];
};
