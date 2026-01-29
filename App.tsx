// App.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy,
  Trash2,
  Settings2,
  FileText,
  ShieldCheck,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Layout,
  Sparkles,
  Check,
  Keyboard,
  Github,
  PartyPopper,
  Sun,
  Moon,
} from 'lucide-react';

import { WRITING_MODES, MODELS, DEFAULT_CONTROLS, MAX_CHARS } from './constants';
import { RephraseResponse, WritingMode, SidekickControls } from './types';
import { rephraseText } from './services/geminiService';
import ShortcutsModal from './components/ShortcutsModal';

// ============================================
// THEME HOOK
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
// CONFETTI
// ============================================
function Confetti({ count = 50 }: { count?: number }) {
  const colors = ['#d5ff00', '#027e6f', '#1b0d6f', '#4dcabd', '#c4eb00'];
  
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
      {pieces.map((p) => <div key={p.id} className="confetti" style={p.style} />)}
    </div>
  );
}

// ============================================
// TYPEWRITER
// ============================================
function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
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

// ============================================
// TOAST
// ============================================
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="card flex items-center gap-2 px-4 py-3">
        <Check size={16} className="text-teal-500" />
        <span className="text-sm font-medium">{message}</span>
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
  const [mode, setMode] = useState<WritingMode>('exec_storyteller');
  const [model, setModel] = useState(MODELS[0].id);
  const [variationCount, setVariationCount] = useState(1);
  const [controls, setControls] = useState<SidekickControls>(DEFAULT_CONTROLS);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RephraseResponse | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const [showControls, setShowControls] = useState(true);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);
  const [firstSuccess, setFirstSuccess] = useState(true);
  const [typewriter, setTypewriter] = useState(false);

  const notify = useCallback((msg: string) => setToast(msg), []);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    notify('Copied to clipboard!');
  }, [notify]);

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
      const res = await rephraseText({ text: inputText, mode, model, variationCount, controls });
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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); transform(); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'x') { e.preventDefault(); clear(); }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') { e.preventDefault(); copyPrimary(); }
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) { e.preventDefault(); setShortcutsOpen(true); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [transform, clear, copyPrimary]);

  useEffect(() => { if (result) setTypewriter(true); }, [selectedIdx]);

  const charPct = Math.min((inputText.length / MAX_CHARS) * 100, 100);
  const overLimit = inputText.length > MAX_CHARS;

  return (
    <div className="min-h-screen bg-white dark:bg-navy-800 transition-colors duration-300">
      {showConfetti && <Confetti />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white dark:bg-navy-800 border-b border-navy-200 dark:border-navy-700 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-lime-400 flex items-center justify-center">
                <Sparkles size={20} className="text-navy-800" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-navy-800 dark:text-white">Personacraft</h1>
                <p className="text-[10px] text-navy-500 dark:text-navy-400 -mt-0.5">AI Writing Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={toggleTheme} className="p-2.5 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-xl transition-colors" title="Toggle theme">
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => setShortcutsOpen(true)} className="p-2.5 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-xl transition-colors" title="Shortcuts">
                <Keyboard size={18} />
              </button>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-2.5 text-navy-600 dark:text-navy-300 hover:bg-navy-100 dark:hover:bg-navy-700 rounded-xl transition-colors">
                <Github size={18} />
              </a>
              <div className="w-px h-6 bg-navy-200 dark:bg-navy-600 mx-2" />
              <button onClick={clear} className="btn-secondary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium">
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear</span>
              </button>
              <button onClick={transform} disabled={loading || !inputText.trim()} className="btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm">
                {loading ? <div className="w-4 h-4 border-2 border-navy-800/30 border-t-navy-800 rounded-full animate-spin" /> : <Sparkles size={16} />}
                <span className="font-semibold">{result ? 'Regenerate' : 'Transform'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* LEFT */}
          <div className="lg:col-span-5 space-y-5">

            {/* INPUT */}
            <section className="card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-navy-200 dark:border-navy-600 bg-navy-50 dark:bg-navy-700/50">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-teal-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-600 dark:text-navy-300">Input Text</span>
                </div>
                <span className={`text-xs font-medium ${overLimit ? 'text-red-500' : 'text-navy-500 dark:text-navy-400'}`}>
                  {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>
              <div className="h-1 bg-navy-100 dark:bg-navy-700">
                <div className={`h-full transition-all duration-300 ${overLimit ? 'bg-red-500' : 'bg-teal-500'}`} style={{ width: `${charPct}%` }} />
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your rough draft here..."
                className="input-field w-full h-72 p-4 resize-none text-base leading-relaxed border-none rounded-none"
              />
              {error && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 flex items-start gap-2">
                  <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}
            </section>

            {/* CONTROLS */}
            <section className="card overflow-hidden">
              <button onClick={() => setShowControls(!showControls)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-navy-50 dark:hover:bg-navy-700/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Settings2 size={14} className="text-teal-500" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-navy-600 dark:text-navy-300">Sidekick Controls</span>
                </div>
                <ChevronDown size={16} className={`text-navy-500 transition-transform duration-300 ${showControls ? 'rotate-180' : ''}`} />
              </button>

              <div className={`overflow-hidden transition-all duration-300 ${showControls ? 'max-h-[600px]' : 'max-h-0'}`}>
                <div className="p-4 pt-0 space-y-4 border-t border-navy-200 dark:border-navy-600">

                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-navy-500 dark:text-navy-400 tracking-wider">Writing Mode</label>
                      <select value={mode} onChange={(e) => setMode(e.target.value as WritingMode)} className="input-field w-full rounded-lg px-3 py-2.5 text-sm cursor-pointer">
                        {WRITING_MODES.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-navy-500 dark:text-navy-400 tracking-wider">Model</label>
                      <select value={model} onChange={(e) => setModel(e.target.value)} className="input-field w-full rounded-lg px-3 py-2.5 text-sm cursor-pointer">
                        {MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Select label="Tense" value={controls.tense} onChange={(v) => setControls({ ...controls, tense: v })} options={['as_is', 'present', 'past']} />
                    <Select label="POV" value={controls.pov} onChange={(v) => setControls({ ...controls, pov: v })} options={['as_is', 'first', 'third']} />
                    <Select label="Length" value={controls.length} onChange={(v) => setControls({ ...controls, length: v })} options={['shorter', 'same', 'longer']} />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Select label="Transitions" value={controls.transitions} onChange={(v) => setControls({ ...controls, transitions: v })} options={['off', 'light', 'strong']} />
                    <Select label="Vividness" value={controls.vividness} onChange={(v) => setControls({ ...controls, vividness: v })} options={['low', 'balanced', 'high']} />
                  </div>

                  {/* Variations */}
                  <div className="flex items-center justify-between p-3 bg-navy-50 dark:bg-navy-700/50 rounded-lg border border-navy-200 dark:border-navy-600">
                    <div className="flex items-center gap-2">
                      <Layout size={14} className="text-teal-500" />
                      <div>
                        <p className="text-xs font-semibold text-navy-800 dark:text-navy-100">Variations</p>
                        <p className="text-[10px] text-navy-500 dark:text-navy-400">Options to generate</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 5].map((v) => (
                        <button key={v} onClick={() => setVariationCount(v)} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${variationCount === v ? 'bg-lime-400 text-navy-800' : 'bg-white dark:bg-navy-600 border border-navy-200 dark:border-navy-500 text-navy-600 dark:text-navy-300 hover:border-teal-500'}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Toggle */}
                  <label className="flex items-center justify-between p-3 bg-navy-50 dark:bg-navy-700/50 rounded-lg border border-navy-200 dark:border-navy-600 cursor-pointer hover:border-teal-500 transition-colors">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className={controls.includeSummary ? 'text-teal-500' : 'text-navy-400'} />
                      <div>
                        <p className="text-xs font-semibold text-navy-800 dark:text-navy-100">Include Summary</p>
                        <p className="text-[10px] text-navy-500 dark:text-navy-400">Generate a brief summary</p>
                      </div>
                    </div>
                    <div className={`toggle-track w-11 h-6 rounded-full relative ${controls.includeSummary ? 'active' : ''}`}>
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${controls.includeSummary ? 'left-6' : 'left-1'}`} />
                    </div>
                    <input type="checkbox" checked={controls.includeSummary} onChange={(e) => setControls({ ...controls, includeSummary: e.target.checked })} className="sr-only" />
                  </label>
                </div>
              </div>
            </section>

            {/* Keyboard Hint */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-navy-500 dark:text-navy-400">
              <span>Press</span>
              <kbd className="px-2 py-1 bg-navy-100 dark:bg-navy-700 border border-navy-200 dark:border-navy-600 rounded-lg text-navy-600 dark:text-navy-300 font-mono text-[10px]">⌘</kbd>
              <span>+</span>
              <kbd className="px-2 py-1 bg-navy-100 dark:bg-navy-700 border border-navy-200 dark:border-navy-600 rounded-lg text-navy-600 dark:text-navy-300 font-mono text-[10px]">Enter</kbd>
              <span>to transform</span>
            </div>
          </div>

          {/* RIGHT */}
          <div className="lg:col-span-7 space-y-5">

            {/* Empty */}
            {!result && !loading && (
              <div className="card p-12 flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-navy-300 dark:border-navy-600">
                <div className="w-20 h-20 rounded-2xl bg-lime-400/20 dark:bg-lime-400/10 flex items-center justify-center mb-5">
                  <Sparkles size={36} className="text-lime-500" />
                </div>
                <h3 className="font-display text-xl font-bold text-navy-800 dark:text-white mb-2">Ready to Transform</h3>
                <p className="text-sm text-navy-500 dark:text-navy-400 text-center max-w-sm mb-6">
                  Paste your text on the left and click <span className="font-semibold text-lime-500">Transform</span> to see the magic.
                </p>
                <div className="flex items-center gap-6 text-xs text-navy-400">
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-500" /><span>3 writing modes</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-indigo-500" /><span>6 AI models</span></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-lime-400" /><span>Up to 5 variations</span></div>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="card p-12 flex flex-col items-center justify-center min-h-[400px]">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full border-4 border-navy-200 dark:border-navy-600" />
                  <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-teal-500 animate-spin" />
                  <div className="absolute inset-3 w-14 h-14 rounded-full bg-navy-100 dark:bg-navy-700 flex items-center justify-center">
                    <Sparkles size={24} className="text-teal-500 animate-pulse-soft" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-navy-800 dark:text-white mb-1">Transforming your text...</h3>
                <p className="text-sm text-navy-500 dark:text-navy-400">This usually takes a few seconds</p>
              </div>
            )}

            {/* Results */}
            {result && !loading && (
              <div className="space-y-5 animate-fade-in">

                {showConfetti && (
                  <div className="card-accent p-4 flex items-center gap-3 bg-teal-50 dark:bg-teal-900/20">
                    <PartyPopper size={24} className="text-teal-500" />
                    <div>
                      <p className="font-bold text-navy-800 dark:text-white">Amazing! Your first transformation! 🎉</p>
                      <p className="text-sm text-navy-600 dark:text-navy-300">Your text has been beautifully rewritten.</p>
                    </div>
                  </div>
                )}

                {result.variations.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {result.variations.map((_, idx) => (
                      <button key={idx} onClick={() => setSelectedIdx(idx)} className={`shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${selectedIdx === idx ? 'bg-lime-400 text-navy-800' : 'bg-navy-100 dark:bg-navy-700 text-navy-600 dark:text-navy-300 hover:bg-navy-200 dark:hover:bg-navy-600'}`}>
                        Variation {idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                <section className="card-accent overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-900/20">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-soft" />
                      <span className="text-xs font-bold text-navy-600 dark:text-navy-300 uppercase tracking-wider">
                        {WRITING_MODES.find(m => m.id === mode)?.label}
                      </span>
                    </div>
                    <button onClick={copyPrimary} className="btn-secondary flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium">
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                  <div className="p-6 text-base leading-relaxed text-navy-800 dark:text-navy-100 min-h-[200px] whitespace-pre-wrap">
                    {typewriter ? <TypewriterText text={result.variations[selectedIdx]} /> : result.variations[selectedIdx]}
                  </div>
                  <div className="px-4 py-3 bg-navy-50 dark:bg-navy-700/50 border-t border-navy-200 dark:border-navy-600 flex flex-wrap items-center gap-4 text-[10px] text-navy-500 dark:text-navy-400">
                    <span><span className="uppercase tracking-wider font-medium">Model:</span> <span className="text-navy-700 dark:text-navy-200">{MODELS.find(m => m.id === result.model)?.label}</span></span>
                    <span><span className="uppercase tracking-wider font-medium">Words:</span> <span className="text-navy-700 dark:text-navy-200">{result.variations[selectedIdx].split(/\s+/).filter(Boolean).length}</span> → {result.originalWordCount} original</span>
                  </div>
                </section>

                {result.summary && (
                  <section className="card p-5 border-l-4 border-l-indigo-500">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Zap size={14} className="text-indigo-500" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Executive Summary</h4>
                      </div>
                      <button onClick={() => copy(result.summary!)} className="p-1.5 hover:bg-navy-100 dark:hover:bg-navy-700 text-navy-500 rounded-lg transition-colors">
                        <Copy size={12} />
                      </button>
                    </div>
                    <p className="text-sm text-navy-600 dark:text-navy-300 italic leading-relaxed">"{result.summary}"</p>
                  </section>
                )}

                <section className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-navy-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-navy-500 dark:text-navy-400">Compare Changes</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="card p-4">
                      <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block mb-2">Original</span>
                      <p className="text-xs text-navy-500 dark:text-navy-400 leading-relaxed max-h-32 overflow-y-auto">{inputText}</p>
                    </div>
                    <div className="card p-4 bg-lime-50 dark:bg-lime-900/10 border-lime-300 dark:border-lime-800">
                      <span className="text-[10px] font-bold text-lime-600 dark:text-lime-400 uppercase tracking-wider block mb-2">Transformed</span>
                      <p className="text-xs text-navy-700 dark:text-navy-200 leading-relaxed max-h-32 overflow-y-auto">{result.variations[selectedIdx]}</p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-navy-200 dark:border-navy-700 mt-16 bg-navy-50 dark:bg-navy-900/50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-500 dark:text-navy-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-lime-500" /><span className="font-medium">Powered by Groq</span></span>
              <span className="w-1 h-1 rounded-full bg-navy-300 dark:bg-navy-600" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-navy-800 dark:hover:text-white transition-colors">Documentation</a>
              <a href="#" className="hover:text-navy-800 dark:hover:text-white transition-colors">Privacy</a>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-teal-500" /><span>All systems operational</span></div>
            </div>
          </div>
        </div>
      </footer>

      <ShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

// ============================================
// SELECT HELPER
// ============================================
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: any) => void; options: string[] }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-bold uppercase text-navy-500 dark:text-navy-400 tracking-wider">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field w-full rounded-lg px-2 py-2 text-[11px] font-medium cursor-pointer">
        {options.map((o) => <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>)}
      </select>
    </div>
  );
}