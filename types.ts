export interface Voice {
  id: string;
  name: string;
  description: string;
  prompt: string;
}

export interface Persona {
  id: string;
  name: string;
  catchphrase: string;
  prompt: string;
}

export interface Model {
  id: string;
  name: string;
  description: string;
}

export interface RephraseResponse {
  results: string[];
  meta: {
    model: string;
    variationCount: number;
    originalWordCount: number;
  };
}