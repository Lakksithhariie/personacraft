import { Tone, Persona, Model } from './types';

export const TONES: Tone[] = [
  {
    id: 'eli5',
    name: "explain like i'm 5",
    description: 'simple, childlike explanation',
    prompt: 'rewrite this text for a 5-year-old child. use very simple words and short sentences. explain it like a friendly teacher talking to a kindergartner.'
  },
  {
    id: 'casual',
    name: 'casual',
    description: 'relaxed, everyday language',
    prompt: 'rewrite this text in a casual tone. use everyday language and slang, like you are texting a friend. keep it relaxed and friendly.'
  },
  {
    id: 'teen',
    name: 'high schooler',
    description: 'teen-friendly, relatable',
    prompt: 'rewrite this text like a high school student. use modern slang and sound casual. make it sound authentic to how teenagers talk.'
  },
  {
    id: 'pm',
    name: 'product manager',
    description: 'simple, plain language',
    prompt: 'rewrite this text as a product manager who uses simple, plain english. avoid all corporate jargon and buzzwords. explain it so clearly that anyone on the street can understand it immediately. keep it practical and direct.'
  },
  {
    id: 'analyst',
    name: 'data analyst',
    description: 'precise, metrics-driven',
    prompt: 'rewrite this text as a data analyst. be precise and focus on facts and numbers. use terms like "data," "trends," and "analysis." keep it logical and objective.'
  },
  {
    id: 'dev',
    name: 'software dev',
    description: 'technical, logical',
    prompt: 'rewrite this text as a software developer. use technical logic and terms related to coding and systems. be solution-oriented and clear.'
  },
  {
    id: 'exec',
    name: 'executive',
    description: 'corporate, authoritative',
    prompt: 'rewrite this text as a corporate executive. be authoritative and professional. use formal language focused on business goals and leadership.'
  },
  {
    id: 'sales',
    name: 'sales & marketing',
    description: 'persuasive, engaging',
    prompt: 'rewrite this text like a salesperson. be persuasive and enthusiastic. highlight the benefits and make the reader want to take action.'
  },
  {
    id: 'professor',
    name: 'professor',
    description: 'academic, scholarly',
    prompt: 'rewrite this text like a professor. use formal, scholarly language. explain the concept with authority and educational structure.'
  },
  {
    id: 'writer',
    name: 'creative writer',
    description: 'artistic, expressive',
    prompt: 'rewrite this text like a creative writer. use descriptive language, metaphors, and vivid imagery. make it sound artistic and engaging.'
  }
];

export const PERSONAS: Persona[] = [
  {
    id: 'trump',
    name: 'donald trump',
    catchphrase: 'tremendous, believe me',
    prompt: 'rewrite this text exactly as donald trump would say it. use simple words, repetition, and superlatives like "huge," "tremendous," and "the best." mention "many people are saying" and "believe me."'
  },
  {
    id: 'musk',
    name: 'elon musk',
    catchphrase: 'first principles thinking',
    prompt: 'rewrite this text exactly as elon musk would say it. focus on first principles, physics, and the future. use casual tech language, humor, and references to mars or ai.'
  },
  {
    id: 'scott',
    name: 'michael scott',
    catchphrase: "that's what she said",
    prompt: 'rewrite this text exactly as michael scott from the office would say it. use awkward humor, try to be cool, and make unnecessary jokes. include "that\'s what she said" if possible.'
  },
  {
    id: 'bing',
    name: 'chandler bing',
    catchphrase: 'could this be more sarcastic?',
    prompt: 'rewrite this text exactly as chandler bing from friends would say it. use heavy sarcasm, self-deprecating jokes, and rhetorical questions like "could this be any more...?"'
  },
  {
    id: 'mosby',
    name: 'ted mosby',
    catchphrase: 'romantic architect vibes',
    prompt: 'rewrite this text exactly as ted mosby from how i met your mother would say it. be sentimental, romantic, and overly detailed. talk about destiny and architecture.'
  }
];

export const MODELS: Model[] = [
  {
    id: 'openai/gpt-oss-120b',
    name: 'gpt-oss 120b',
    description: 'most capable',
  },
  {
    id: 'openai/gpt-oss-20b',
    name: 'gpt-oss 20b',
    description: 'fast & efficient',
  },
  {
    id: 'meta-llama/llama-4-maverick-17b-128e-instruct',
    name: 'llama 4 maverick',
    description: "meta's latest",
  },
  {
    id: 'qwen/qwen3-32b',
    name: 'qwen3 32b',
    description: 'balanced',
  },
  {
    id: 'moonshotai/kimi-k2-instruct-0905',
    name: 'kimi k2',
    description: 'moonshot ai',
  },
];

export const MAX_CHARS = 2000;