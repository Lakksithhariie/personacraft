// App.tsx - Clean SaaS UI Revamp

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy,
  Trash2,
  Settings2,
  FileText,
  Zap,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  Check,
  Keyboard,
  Github,
  Sun,
  Moon,
  ArrowRight,
  Layers,
  Wand2,
  RotateCcw,
} from 'lucide-react';

import { WRITING_MODES, MODELS, DEFAULT_CONTROLS, MAX_CHARS } from './constants';
import { RephraseResponse, WritingMode, SidekickControls } from './types';
import { rephraseText } from './services/geminiService';
import ShortcutsModal from './components/ShortcutsModal';

// ============================================
// HOOKS
// ============================================
function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark(!isDark) };
}

// ============================================
// COMPONENTS
// ============================================
function Confetti({ count = 50 }: { count?: number }) {
  const colors = ['#00674F', '#73E6CB', '#3EBB9E', '#009975', '#59d8ba'];
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: `${Math.random() * 0.5}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
    } as React.CSSProperties,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map((p) => (
        <div key={p.id} className="confetti" style={p.style} />
      ))}
    </div>
  );
}

function TypewriterText({ text, speed = 10 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('');
  const [complete, setComplete] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setComplete(false);
    idx.current = 0;

    const timer = setInterval(() => {
      if (idx.current < text.length) {
        setDisplayed(text.slice(0, idx.current + 1));
        idx.current++;
      } else {
        clearInterval(timer);
        setComplete(true);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <span>
      {displayed}
      {!complete && <span className="typewriter-cursor" />}
    </span>
  );
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-dark-500 border border-slate-200 dark:border-white/10 rounded-xl shadow-medium">
        <div className="w-5 h-5 rounded-full bg-brand-500/10 dark:bg-mint-500/10 flex items-center justify-center">
          <Check size={12} className="text-brand-500 dark:text-mint-500" />
        </div>
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{message}</span>
      </div>
    </div>
  );
}

function ModeSelector({ value, onChange }: { value: WritingMode; onChange: (m: WritingMode) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = WRITING_MODES.find((m) => m.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-300 dark:hover:border-white/20 transition-all text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {selected?.label}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {selected?.description}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-dark-500 border border-slate-200 dark:border-white/10 rounded-xl shadow-medium overflow-hidden animate-slide-down">
          <div className="max-h-72 overflow-y-auto p-2">
            {WRITING_MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  onChange(mode.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                  value === mode.id
                    ? 'bg-brand-50 dark:bg-mint-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      value === mode.id
                        ? 'text-brand-600 dark:text-mint-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {mode.label}
                  </span>
                  {value === mode.id && (
                    <Check size={14} className="text-brand-500 dark:text-mint-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelSelector({ value, onChange }: { value: string; onChange: (m: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = MODELS.find((m) => m.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-300 dark:hover:border-white/20 transition-all text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-slate-900 dark:text-white truncate">
            {selected?.label}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {selected?.contextWindow}
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white dark:bg-dark-500 border border-slate-200 dark:border-white/10 rounded-xl shadow-medium overflow-hidden animate-slide-down">
          <div className="max-h-72 overflow-y-auto p-2">
            {MODELS.map((model) => (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onChange(model.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2.5 rounded-lg text-left transition-all ${
                  value === model.id
                    ? 'bg-brand-50 dark:bg-mint-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-sm font-medium ${
                      value === model.id
                        ? 'text-brand-600 dark:text-mint-400'
                        : 'text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {model.label}
                  </span>
                  {value === model.id && (
                    <Check size={14} className="text-brand-500 dark:text-mint-400" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{model.strengths}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ControlPill({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: any) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-lg">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all ${
              value === opt
                ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {opt.replace(/_/g, ' ')}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const { isDark, toggle: toggleTheme } = useTheme();

  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<WritingMode>('eloquent');
  const [model, setModel] = useState(MODELS[0].id);
  const [variationCount, setVariationCount] = useState(1);
  const [controls, setControls] = useState<SidekickControls>(DEFAULT_CONTROLS);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RephraseResponse | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [showControls, setShowControls] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [firstSuccess, setFirstSuccess] = useState(true);
  const [typewriter, setTypewriter] = useState(false);

  const notify = useCallback((msg: string) => setToast(msg), []);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      notify('Copied to clipboard');
    },
    [notify]
  );

  const clear = useCallback(() => {
    setInputText('');
    setResult(null);
    setError(null);
    setControls(DEFAULT_CONTROLS);
    setTypewriter(false);
    notify('Workspace cleared');
  }, [notify]);

  const copyPrimary = useCallback(() => {
    if (result?.variations[selectedIdx]) copy(result.variations[selectedIdx]);
  }, [copy, result, selectedIdx]);

  const transform = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to transform.');
      return;
    }
    if (inputText.length > MAX_CHARS) {
      setError(`Text exceeds ${MAX_CHARS} characters.`);
      return;
    }
    setLoading(true);
    setError(null);
    setTypewriter(false);

    try {
      const res = await rephraseText({
        text: inputText,
        mode,
        model,
        variationCount,
        controls,
      });
      setResult(res);
      setSelectedIdx(0);
      setTypewriter(true);

      if (firstSuccess) {
        setShowConfetti(true);
        setFirstSuccess(false);
        setTimeout(() => setShowConfetti(false), 3500);
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  }, [inputText, mode, model, variationCount, controls, firstSuccess]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        transform();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        clear();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyPrimary();
      }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey && !isTyping) {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [transform, clear, copyPrimary]);

  useEffect(() => {
    if (result) setTypewriter(true);
  }, [selectedIdx]);

  const charPct = Math.min((inputText.length / MAX_CHARS) * 100, 100);
  const overLimit = inputText.length > MAX_CHARS;
  const currentMode = WRITING_MODES.find((m) => m.id === mode);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-500 transition-colors">
      {showConfetti && <Confetti />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-dark-500/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-teal-500 flex items-center justify-center shadow-glow">
                <Wand2 size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white">
                Personacraft
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="btn-ghost p-2.5 rounded-xl"
                title="Toggle theme"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                onClick={() => setShortcutsOpen(true)}
                className="btn-ghost p-2.5 rounded-xl"
                title="Shortcuts"
              >
                <Keyboard size={18} />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost p-2.5 rounded-xl"
              >
                <Github size={18} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Input */}
          <div className="space-y-4">
            {/* Input Card */}
            <div className="card p-0 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-brand-500 dark:text-mint-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Input
                  </span>
                </div>
                <span className={`text-xs font-medium ${overLimit ? 'text-red-500' : 'text-slate-400'}`}>
                  {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>

              {/* Progress */}
              <div className="h-0.5 bg-slate-100 dark:bg-white/5">
                <div
                  className={`h-full transition-all ${
                    overLimit
                      ? 'bg-red-500'
                      : 'bg-gradient-to-r from-brand-500 to-teal-500'
                  }`}
                  style={{ width: `${charPct}%` }}
                />
              </div>

              {/* Textarea */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full h-64 p-4 bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none resize-none text-[15px] leading-relaxed"
              />

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-500/10 border-t border-red-100 dark:border-red-500/20 flex items-center gap-2">
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}
            </div>

            {/* Mode & Model */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Writing Mode
                </label>
                <ModeSelector value={mode} onChange={setMode} />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  AI Model
                </label>
                <ModelSelector value={model} onChange={setModel} />
              </div>
            </div>

            {/* Advanced Controls Toggle */}
            <button
              onClick={() => setShowControls(!showControls)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-300 dark:hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-2">
                <Settings2 size={14} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Advanced Controls
                </span>
              </div>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${showControls ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Advanced Controls Panel */}
            {showControls && (
              <div className="card p-4 space-y-4 animate-slide-down">
                <div className="grid grid-cols-3 gap-3">
                  <ControlPill
                    label="Tense"
                    value={controls.tense}
                    onChange={(v) => setControls({ ...controls, tense: v })}
                    options={['as_is', 'present', 'past']}
                  />
                  <ControlPill
                    label="POV"
                    value={controls.pov}
                    onChange={(v) => setControls({ ...controls, pov: v })}
                    options={['as_is', 'first', 'third']}
                  />
                  <ControlPill
                    label="Length"
                    value={controls.length}
                    onChange={(v) => setControls({ ...controls, length: v })}
                    options={['shorter', 'same', 'longer']}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <ControlPill
                    label="Transitions"
                    value={controls.transitions}
                    onChange={(v) => setControls({ ...controls, transitions: v })}
                    options={['off', 'light', 'strong']}
                  />
                  <ControlPill
                    label="Vividness"
                    value={controls.vividness}
                    onChange={(v) => setControls({ ...controls, vividness: v })}
                    options={['low', 'balanced', 'high']}
                  />
                </div>

                {/* Variations */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Variations
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 5].map((v) => (
                      <button
                        key={v}
                        onClick={() => setVariationCount(v)}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                          variationCount === v
                            ? 'bg-brand-500 dark:bg-mint-500 text-white dark:text-dark-500'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                        }`}
                      >
                        {v}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary Toggle */}
                <label className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Zap size={14} className={controls.includeSummary ? 'text-brand-500 dark:text-mint-400' : 'text-slate-400'} />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      Include Summary
                    </span>
                  </div>
                  <div
                    className={`toggle-track w-10 h-6 rounded-full relative ${
                      controls.includeSummary ? 'active' : ''
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${
                        controls.includeSummary ? 'left-5' : 'left-1'
                      }`}
                    />
                  </div>
                  <input
                    type="checkbox"
                    checked={controls.includeSummary}
                    onChange={(e) => setControls({ ...controls, includeSummary: e.target.checked })}
                    className="sr-only"
                  />
                </label>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button onClick={clear} className="btn-secondary flex-1 py-3 rounded-xl text-sm font-medium">
                <Trash2 size={16} className="inline mr-2" />
                Clear
              </button>
              <button
                onClick={transform}
                disabled={loading || !inputText.trim()}
                className="btn-primary flex-[2] py-3 rounded-xl text-sm"
              >
                {loading ? (
                  <RotateCcw size={16} className="inline mr-2 animate-spin" />
                ) : (
                  <Sparkles size={16} className="inline mr-2" />
                )}
                {result ? 'Regenerate' : 'Transform'}
                {!loading && <ArrowRight size={16} className="inline ml-2" />}
              </button>
            </div>
          </div>

          {/* Right: Output */}
          <div className="space-y-4">
            {/* Empty State */}
            {!result && !loading && (
              <div className="card p-12 flex flex-col items-center justify-center min-h-[500px] border-2 border-dashed">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-100 to-teal-100 dark:from-brand-500/20 dark:to-teal-500/20 flex items-center justify-center mb-4">
                  <Sparkles size={28} className="text-brand-500 dark:text-mint-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  Ready to transform
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-xs">
                  Paste your text and click <span className="font-semibold text-brand-500 dark:text-mint-400">Transform</span> to see the magic.
                </p>
                <div className="flex items-center gap-6 mt-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Layers size={12} />
                    <span>8 modes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={12} />
                    <span>6 models</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Copy size={12} />
                    <span>5 variations</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="card p-12 flex flex-col items-center justify-center min-h-[500px]">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-white/10" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-brand-500 dark:border-t-mint-400 animate-spin" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-1">
                  Transforming...
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Using <span className="font-medium text-brand-500 dark:text-mint-400">{currentMode?.label}</span>
                </p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-4 animate-fade-in">
                {/* Variation Tabs */}
                {result.variations.length > 1 && (
                  <div className="flex gap-2">
                    {result.variations.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIdx(idx)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                          selectedIdx === idx
                            ? 'bg-brand-500 dark:bg-mint-500 text-white dark:text-dark-500'
                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300'
                        }`}
                      >
                        Variation {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Result Card */}
                <div className="card overflow-hidden border-brand-200 dark:border-mint-500/20">
                  <div className="flex items-center justify-between px-4 py-3 bg-brand-50 dark:bg-mint-500/10 border-b border-brand-100 dark:border-mint-500/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500 dark:bg-mint-400 animate-pulse-soft" />
                      <span className="text-xs font-semibold text-brand-700 dark:text-mint-300 uppercase tracking-wider">
                        {currentMode?.label}
                      </span>
                    </div>
                    <button
                      onClick={copyPrimary}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-brand-600 dark:text-mint-400 hover:bg-brand-100 dark:hover:bg-mint-500/20 rounded-lg transition-colors"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                  <div className="p-5 text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 min-h-[200px] whitespace-pre-wrap">
                    {typewriter ? (
                      <TypewriterText text={result.variations[selectedIdx]} />
                    ) : (
                      result.variations[selectedIdx]
                    )}
                  </div>
                  <div className="px-4 py-3 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 flex items-center gap-4 text-xs text-slate-500">
                    <span>
                      {result.variations[selectedIdx].split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span>•</span>
                    <span>{result.originalWordCount} original</span>
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="card p-4 border-l-4 border-l-brand-500 dark:border-l-mint-400">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-brand-500 dark:text-mint-400" />
                        <span className="text-xs font-semibold text-brand-600 dark:text-mint-400 uppercase tracking-wider">
                          Summary
                        </span>
                      </div>
                      <button
                        onClick={() => copy(result.summary!)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 italic">
                      "{result.summary}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <Sparkles size={12} className="text-brand-500 dark:text-mint-400" />
                Powered by Groq
              </span>
              <span>•</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="hover:text-slate-700 dark:hover:text-white transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-slate-700 dark:hover:text-white transition-colors">
                Privacy
              </a>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span>Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}