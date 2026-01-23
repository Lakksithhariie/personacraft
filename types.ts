export interface Tone {
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
  result: string;
  meta: {
    model: string;
    wordCount: number;
    originalWordCount: number;
  };
}
