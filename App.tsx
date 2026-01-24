import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import TextArea from './components/TextArea';
import SelectionGrid from './components/SelectionGrid';
import OutputSection from './components/OutputSection';
import ShortcutsModal from './components/ShortcutsModal';
import { TONES, PERSONAS, MODELS, MAX_CHARS } from './constants';
import { Tone, Persona, RephraseResponse, Model } from './types';
import { rephraseText } from './services/groqService';

const App: React.FC = () => {
  // State
  const [inputText, setInputText] = useState('');
  const [selectedToneId, setSelectedToneId] = useState<string | null>(null);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState<string>(MODELS[0].id);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<RephraseResponse | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Derived state
  const selectedTone = TONES.find(t => t.id === selectedToneId);
  const selectedPersona = PERSONAS.find(p => p.id === selectedPersonaId);
  const selectedModel = MODELS.find(m => m.id === selectedModelId)!;
  const activeSelection = selectedTone || selectedPersona;
  const isPersona = !!selectedPersona;

  const outputRef = useRef<HTMLDivElement>(null);

  // Handlers
  const handleRephrase = useCallback(async () => {
    if (!inputText.trim()) {
      setError('please enter some text to rephrase.');
      return;
    }
    if (!activeSelection) {
      setError('please select a tone or a persona.');
      return;
    }
    if (inputText.length > MAX_CHARS) {
      setError(`text exceeds character limit of ${MAX_CHARS}.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await rephraseText(inputText, activeSelection, isPersona, selectedModel);
      setResponse(res);
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'failed to rephrase text.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, activeSelection, isPersona, selectedModel]);

  const handleClear = () => {
    setInputText('');
    setResponse(null);
    setError(null);
  };

  const handleToneSelect = (id: string) => {
    setSelectedToneId(id === selectedToneId ? null : id);
    setSelectedPersonaId(null);
    setError(null);
  };

  const handlePersonaSelect = (id: string) => {
    setSelectedPersonaId(id === selectedPersonaId ? null : id);
    setSelectedToneId(null);
    setError(null);
  };

  const handleCopyResult = async () => {
    if (response?.result) {
      await navigator.clipboard.writeText(response.result);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'Enter') {
        e.preventDefault();
        handleRephrase();
      } else if (isMod && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleCopyResult();
      } else if (isMod && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleClear();
      } else if (e.key === '?' && (e.target as HTMLElement).tagName !== 'TEXTAREA' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRephrase, response]);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'ctrl';

  return (
    <div className="min-h-screen flex flex-col font-sans pattern-bg">
      <Header onOpenShortcuts={() => setShowShortcuts(true)} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-brand-900 leading-tight lowercase">
            rephrase anything <br className="hidden sm:block" /> in any voice
          </h2>
          <p className="text-brand-600 max-w-xl mx-auto font-medium lowercase">
            fix grammar, change tone, or channel famous personas — instantly.
            ai-powered writing that sounds like a native speaker wrote it.
          </p>
        </section>

        {/* 1. Input Area */}
        <TextArea
          value={inputText}
          onChange={setInputText}
          onClear={handleClear}
          disabled={isLoading}
        />

        {/* 2. Output Section */}
        <div ref={outputRef}>
          <OutputSection
            response={response}
            isLoading={isLoading}
            label={activeSelection?.name || ''}
            onRegenerate={handleRephrase}
          />
        </div>

        {/* 3. Tone Grid */}
        <SelectionGrid
          title="choose a tone"
          subtitle="how should your message sound?"
          items={TONES}
          selectedId={selectedToneId}
          onSelect={handleToneSelect}
          renderItem={(tone, isSelected) => (
            <button
              className={`w-full group p-4 border-2 transition-all flex flex-col items-center gap-2 text-center
              ${isSelected
                  ? 'bg-brand-200 border-brand-500 ring-2 ring-brand-500 ring-offset-2'
                  : 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300'
                }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-semibold lowercase ${isSelected ? 'text-brand-900' : 'text-brand-700'}`}>
                  {tone.name}
                </span>
                <span className="text-[10px] text-brand-500 leading-tight lowercase hidden sm:block">
                  {tone.description}
                </span>
              </div>
            </button>
          )}
        />

        {/* 4. Persona Grid */}
        <SelectionGrid
          title="impersonate a character"
          subtitle="who should deliver the message?"
          items={PERSONAS}
          selectedId={selectedPersonaId}
          onSelect={handlePersonaSelect}
          renderItem={(persona, isSelected) => (
            <button
              className={`w-full group p-4 border-2 transition-all flex flex-col items-center gap-2 text-center
              ${isSelected
                  ? 'bg-brand-200 border-brand-500 ring-2 ring-brand-500 ring-offset-2'
                  : 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300'
                }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-semibold lowercase ${isSelected ? 'text-brand-900' : 'text-brand-700'}`}>
                  {persona.name}
                </span>
                <span className="text-[10px] text-brand-500 leading-tight italic lowercase hidden sm:block">
                  "{persona.catchphrase}"
                </span>
              </div>
            </button>
          )}
        />

        {/* 5. Model Selector */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">select model</h2>
            <p className="text-xs text-brand-500 lowercase">choose the ai model for generation</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModelId(model.id)}
                className={`w-full group p-3 border-2 transition-all flex flex-col items-center gap-1 text-center
                  ${selectedModelId === model.id
                    ? 'bg-brand-200 border-brand-500 ring-2 ring-brand-500 ring-offset-2'
                    : 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300'
                  }`}
              >
                <span className={`text-xs font-semibold lowercase ${selectedModelId === model.id ? 'text-brand-900' : 'text-brand-700'}`}>
                  {model.name}
                </span>
                <span className="text-[10px] text-brand-500 leading-tight lowercase hidden sm:block">
                  {model.description}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* 6. Primary Action Button */}
        <div className="flex flex-col gap-4 sticky bottom-8 z-30">
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-4 text-red-800 text-sm font-semibold flex items-center gap-3 lowercase">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={handleRephrase}
            disabled={isLoading || !inputText.trim() || !activeSelection}
            className={`w-full h-16 bg-brand-500 text-white font-bold text-lg lowercase tracking-widest flex items-center justify-center gap-3 transition-all
              ${isLoading ? 'bg-brand-700 cursor-not-allowed' : 'hover:bg-brand-600 active:bg-brand-700'}
              disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>rephrasing...</span>
              </>
            ) : (
              <>
                <span>rephrase text</span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-brand-600 text-[10px] font-mono border border-brand-400 lowercase">
                  {modKey}+enter
                </kbd>
              </>
            )}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-4 py-8 border-t-2 border-brand-200 mt-12 text-center">
        <p className="text-xs font-semibold text-brand-400 lowercase tracking-widest">
          personacraft © 2026 — powered by groq
        </p>
      </footer>

      {/* Shortcuts Modal */}
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />

      {/* Floating Shortcut Button for Mobile */}
      <button
        onClick={() => setShowShortcuts(true)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-white border-2 border-brand-900 flex items-center justify-center text-brand-900 sm:hidden z-40 shadow-none hover:bg-brand-100 transition-colors"
        aria-label="shortcuts"
      >
        ?
      </button>
    </div>
  );
};

export default App;
