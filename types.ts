// types.ts

export type WritingMode =
  | 'eloquent'
  | 'planiloquent'
  | 'breviloquent'
  | 'dulciloquent'
  | 'doctiloquent'
  | 'suaviloquent'
  | 'grandiloquent'
  | 'melliloquent';

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
  controls: SidekickControls;
}

export interface RephraseResponse {
  variations: string[];
  summary?: string;
  warnings?: string[];
  model: string;
  variationCount: number;
  originalWordCount: number;
}