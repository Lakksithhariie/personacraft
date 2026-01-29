// types.ts

export type WritingMode =
  | 'exec_storyteller'
  | 'founder_creator'
  | 'investigative_clarity';

export type Tense = 'as_is' | 'present' | 'past';
export type POV = 'as_is' | 'first' | 'third';
export type Length = 'shorter' | 'same' | 'longer';
export type Transitions = 'off' | 'light' | 'strong';
export type Vividness = 'low' | 'balanced' | 'high';

export interface SidekickControls {
  tense: Tense;
  pov: POV;
  length: Length;
  transitions: Transitions;
  vividness: Vividness;
  includeSummary: boolean;
}

export interface RephraseRequest {
  text: string;
  mode: WritingMode;
  model: string;
  variationCount: number;
  // ❌ pinnedTerms: string[]; — REMOVED
  controls: SidekickControls;
}

export interface RephraseResponse {
  variations: string[];
  summary?: string;
  warnings?: string[];  // Keep this (optional), won't cause issues
  model: string;
  variationCount: number;
  originalWordCount: number;
}