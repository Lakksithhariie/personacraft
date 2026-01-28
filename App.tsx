import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import TextArea from './components/TextArea';
import SelectionGrid from './components/SelectionGrid';
import OutputSection from './components/OutputSection';
import ShortcutsModal from './components/ShortcutsModal';
import ControlsPanel from './components/ControlsPanel';
import { WRITING_MODES, MODELS, MAX_CHARS } from './constants';
import { RephraseResponse, RewriteSettings } from './types';
import { rephraseText } from './services/groqService';

const DEFAULT_SETTINGS: RewriteSettings = {
  tense: 'as_is',
  pov: 'as_is',
  length: 'same',
  vividness: 'balanced',
  transitions: 'light',
  includeSummary: false,
};

const App: React.FC = () => {
  // State
  const [inputText, setInputText] = useState('');
  const [pinnedTerms, setPinnedTerms] = useState<string[]>([]);

  // Writing mode (replaces voices/personas)
  const [selectedModeId, setSelectedModeId] = useState<string>(
    WRITING_MODES[0]?.id || 'exec_storyteller'
  );

  const [selectedModelId, setSelectedModelId] = useState<string>(MODELS[0].id);
  const [variationCount, setVariationCount] = useState<number>(1);

  // NEW: sidekick controls state
  const [settings, setSettings] = useState<RewriteSettings>(DEFAULT_SETTINGS);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<RephraseResponse | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Trust panel state
  const [lastSubmittedText, setLastSubmittedText] = useState<string>('');
  const [compareIndex, setCompareIndex] = useState<number>(0);

  // Derived
  const selectedMode = WRITING_MODES.find(m => m.id === selectedModeId) || WRITING_MODES[0];
  const selectedModel = MODELS.find(m => m.id === selectedModelId)!;

  const outputRef = useRef<HTMLDivElement>(null);

  // Actions
  const handleRephrase = useCallback(async () => {
    if (!inputText.trim()) {
      setError('please enter some text to rephrase.');
      return;
    }

    if (!selectedMode) {
      setError('please select a writing mode.');
      return;
    }

    if (inputText.length > MAX_CHARS) {
      setError(`text exceeds character limit of ${MAX_CHARS}.`);
      return;
    }

    setLastSubmittedText(inputText);
    setCompareIndex(0);

    setIsLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await rephraseText(
        inputText,
        selectedMode,
        selectedModel,
        variationCount,
        pinnedTerms,
        settings
      );

      setResponse(res);

      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'failed to rephrase text.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, pinnedTerms, selectedMode, selectedModel, variationCount, settings]);

  const handleClear = useCallback(() => {
    setInputText('');
    setPinnedTerms([]);
    setResponse(null);
    setError(null);
    setLastSubmittedText('');
    setCompareIndex(0);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const handleModeSelect = (id: string) => {
    setSelectedModeId(id);
    setError(null);
  };

  const handleCopyResult = useCallback(
    async (text?: string) => {
      const textToCopy = text || response?.results[0];
      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
      }
    },
    [response]
  );

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
      } else if (
        e.key === '?' &&
        (e.target as HTMLElement).tagName !== 'TEXTAREA' &&
        (e.target as HTMLElement).tagName !== 'INPUT'
      ) {
        e.preventDefault();
        setShowShortcuts(true);
      } else if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRephrase, handleCopyResult, handleClear]);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modKey = isMac ? '⌘' : 'ctrl';

  return (
    <div className="min-h-screen flex flex-col font-sans pattern-bg">
      <Header onOpenShortcuts={() => setShowShortcuts(true)} />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-12 flex flex-col gap-12">
        {/* Hero */}
        <section className="text-center space-y-4">
          <h2 className="text-4xl sm:text-5xl font-bold text-brand-900 leading-tight lowercase">
            turn ideas into credible writing you can’t ignore
          </h2>
          <p className="text-brand-600 max-w-xl mx-auto font-medium lowercase">
            executive-level clarity, measured emotion, clean grammar.
            pick a writing mode, set a few constraints, and ship.
          </p>
        </section>

        {/* Input */}
        <TextArea
          value={inputText}
          onChange={setInputText}
          onClear={handleClear}
          disabled={isLoading}
          pinnedTerms={pinnedTerms}
          onPinnedTermsChange={setPinnedTerms}
        />

        {/* NEW: Sidekick Controls */}
        <ControlsPanel
          value={settings}
          onChange={setSettings}
          disabled={isLoading}
        />

        {/* Output */}
        <div ref={outputRef}>
          <OutputSection
            response={response}
            isLoading={isLoading}
            label={selectedMode?.name || ''}
            onRegenerate={handleRephrase}
            onCopy={handleCopyResult}
          />
        </div>

        {/* Trust Panel: Before vs After */}
        {!isLoading && response && (
          <section className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div className="flex flex-col">
                <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">
                  before vs after
                </h2>
                <p className="text-xs text-brand-500 lowercase">
                  compare your original text with the rewritten version
                </p>
              </div>

              {response.results.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-brand-500 lowercase">variation</span>
                  <select
                    value={Math.min(compareIndex, response.results.length - 1)}
                    onChange={(e) => setCompareIndex(Number(e.target.value))}
                    className="border-2 border-brand-200 bg-white/60 px-2 py-1 text-xs font-semibold text-brand-800 lowercase"
                  >
                    {response.results.map((_, i) => (
                      <option key={i} value={i}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* BEFORE */}
              <div className="p-5 bg-white/60 border-2 border-brand-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    before
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const t = lastSubmittedText || inputText;
                      if (t.trim()) await navigator.clipboard.writeText(t);
                    }}
                    className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
                  >
                    [copy]
                  </button>
                </div>

                <div className="text-brand-900 whitespace-pre-wrap leading-relaxed">
                  {(lastSubmittedText || inputText).trim()}
                </div>
              </div>

              {/* AFTER */}
              <div className="p-5 bg-brand-100 border-2 border-brand-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-bold text-brand-700 uppercase tracking-wider">
                    after
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyResult(
                        response.results[Math.min(compareIndex, response.results.length - 1)]
                      )
                    }
                    className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
                  >
                    [copy]
                  </button>
                </div>

                <div className="text-brand-900 whitespace-pre-wrap leading-relaxed">
                  {response.results[Math.min(compareIndex, response.results.length - 1)]}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Writing Mode Picker */}
        <SelectionGrid
          title="choose a writing mode"
          subtitle="credible by default. pick the vibe you want."
          items={WRITING_MODES}
          selectedId={selectedModeId}
          onSelect={handleModeSelect}
          renderItem={(mode, isSelected) => (
            <button
              type="button"
              className={`w-full group p-4 border-2 transition-all flex flex-col items-center gap-2 text-center
              ${isSelected
                ? 'bg-brand-200 border-brand-500 ring-2 ring-brand-500 ring-offset-2'
                : 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300'
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-xs font-semibold lowercase ${isSelected ? 'text-brand-900' : 'text-brand-700'}`}>
                  {mode.name}
                </span>
                <span className="text-[10px] text-brand-500 leading-tight lowercase hidden sm:block">
                  {mode.description}
                </span>
              </div>
            </button>
          )}
        />

        {/* Model Selector */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">
              select model
            </h2>
            <p className="text-xs text-brand-500 lowercase">
              choose the ai model for generation
            </p>
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
                type="button"
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

        {/* Variations */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col">
            <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">
              output variations
            </h2>
            <p className="text-xs text-brand-500 lowercase">
              how many different versions do you want?
            </p>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => setVariationCount(num)}
                className={`w-12 h-12 border-2 transition-all flex items-center justify-center font-bold
                  ${variationCount === num
                    ? 'bg-brand-200 border-brand-500 ring-2 ring-brand-500 ring-offset-2 text-brand-900'
                    : 'bg-brand-50 border-brand-200 hover:bg-brand-100 hover:border-brand-300 text-brand-700'
                  }`}
                type="button"
              >
                {num}
              </button>
            ))}
          </div>
        </section>

        {/* Primary Action */}
        <div className="flex flex-col gap-4 sticky bottom-8 z-30">
          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-4 text-red-800 text-sm font-semibold flex items-center gap-3 lowercase">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500 shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={handleRephrase}
            disabled={isLoading || !inputText.trim() || !selectedMode}
            className={`w-full h-16 bg-brand-500 text-white font-bold text-lg lowercase tracking-widest flex items-center justify-center gap-3 transition-all
              ${isLoading ? 'bg-brand-700 cursor-not-allowed' : 'hover:bg-brand-600 active:bg-brand-700'}
              disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed`}
            type="button"
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
        type="button"
      >
        ?
      </button>
    </div>
  );
};

export default App;