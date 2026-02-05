// App.tsx — Fixed layout: config inside columns, no overlap

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Copy,
  Trash2,
  Settings2,
  FileText,
  Zap,
  AlertCircle,
  Check,
  ChevronDown,
  Sparkles,
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
// CONFETTI
// ============================================
function Confetti({ count = 50 }: { count?: number }) {
  const colors = ['#FF8243', '#FFC0CB', '#FCE883', '#069494'];
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      animationDelay: `${Math.random() * 0.5}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      transform: `rotate(${Math.random() * 360}deg)`,
      width: `${6 + Math.random() * 6}px`,
      height: `${6 + Math.random() * 6}px`,
      borderRadius: Math.random() > 0.5 ? '50%' : '2px',
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

// ============================================
// TYPEWRITER
// ============================================
function TypewriterText({ text, speed = 8 }: { text: string; speed?: number }) {
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
// SKELETON
// ============================================
function SkeletonLoader() {
  return (
    <div className="space-y-3 animate-fade-in">
      {[100, 92, 100, 75, 88, 100, 60].map((w, i) => (
        <div
          key={i}
          className="h-4 skeleton-line"
          style={{ width: `${w}%`, animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
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
    <div className="fixed bottom-5 right-5 z-50 animate-slide-up">
      <div className="flex items-center gap-2.5 px-4 py-2.5 bg-background border border-border rounded-lg">
        <Check size={14} className="text-teal-500" />
        <span className="text-sm text-foreground">{message}</span>
      </div>
    </div>
  );
}

// ============================================
// SELECT DROPDOWN — FIXED: opens inside its
// own stacking context, never overlaps siblings
// ============================================
function SelectDropdown({
  value,
  onChange,
  options,
  renderOption,
  renderValue,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; [k: string]: any }[];
  renderOption: (opt: any, isSelected: boolean) => React.ReactNode;
  renderValue: (opt: any) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 h-9 px-3 bg-background border border-border rounded-md text-sm text-foreground hover:bg-accent/50 transition-colors text-left"
      >
        <span className="truncate text-[13px]">
          {selected ? renderValue(selected) : 'Select...'}
        </span>
        <ChevronDown
          size={14}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-md overflow-hidden animate-scale-in origin-top z-[100]">
          <div className="max-h-[280px] overflow-y-auto p-1">
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  onChange(opt.id);
                  setOpen(false);
                }}
                className={`w-full px-2.5 py-2 rounded text-left transition-colors ${
                  value === opt.id
                    ? 'bg-accent text-accent-foreground'
                    : 'text-foreground hover:bg-accent/50'
                }`}
              >
                {renderOption(opt, value === opt.id)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================
// SEGMENTED CONTROL
// ============================================
function SegmentedControl({
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
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="inline-flex items-center h-8 p-0.5 bg-muted rounded-md w-full">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex-1 h-full px-2 rounded text-xs font-medium transition-colors ${
              value === opt
                ? 'bg-background text-foreground border border-border'
                : 'text-muted-foreground hover:text-foreground'
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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const isTyping =
        t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' ||
        t.tagName === 'SELECT' ||
        t.isContentEditable;

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {showConfetti && <Confetti />}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
                <Wand2 size={16} className="text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight">Personacraft</span>
            </div>
            <div className="flex items-center gap-0.5">
              <button
                onClick={toggleTheme}
                className="btn-ghost h-8 w-8 rounded-md inline-flex items-center justify-center"
              >
                {isDark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                onClick={() => setShortcutsOpen(true)}
                className="btn-ghost h-8 w-8 rounded-md hidden sm:inline-flex items-center justify-center"
              >
                <Keyboard size={15} />
              </button>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost h-8 w-8 rounded-md inline-flex items-center justify-center"
              >
                <Github size={15} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 max-w-screen-xl mx-auto px-6 py-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 items-start">
          {/* ════════════════════════════════════════
              LEFT COLUMN — ALL CONTROLS + INPUT
             ════════════════════════════════════════ */}
          <div className="space-y-4">
            {/* Row 1: Mode + Model selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Writing Mode</label>
                <SelectDropdown
                  value={mode}
                  onChange={(v) => setMode(v as WritingMode)}
                  options={WRITING_MODES}
                  renderValue={(opt) => opt.label}
                  renderOption={(opt, sel) => (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`text-[13px] font-medium truncate ${sel ? 'text-brand-500' : ''}`}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{opt.description}</div>
                      </div>
                      {sel && <Check size={14} className="text-brand-500 shrink-0" />}
                    </div>
                  )}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">AI Model</label>
                <SelectDropdown
                  value={model}
                  onChange={setModel}
                  options={MODELS}
                  renderValue={(opt) => opt.label}
                  renderOption={(opt, sel) => (
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className={`text-[13px] font-medium truncate ${sel ? 'text-teal-500' : ''}`}>
                          {opt.label}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">{opt.strengths}</div>
                      </div>
                      {sel && <Check size={14} className="text-teal-500 shrink-0" />}
                    </div>
                  )}
                />
              </div>
            </div>

            {/* Row 2: Variations + Advanced toggle */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Variations</label>
                <div className="inline-flex items-center h-9 p-0.5 bg-muted rounded-md w-full">
                  {[1, 2, 3, 5].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVariationCount(v)}
                      className={`flex-1 h-full rounded text-sm font-medium transition-colors ${
                        variationCount === v
                          ? 'bg-brand-500 text-white'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setShowControls(!showControls)}
                className="h-9 px-3 inline-flex items-center gap-1.5 border border-border rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors shrink-0"
              >
                <Settings2 size={14} />
                Advanced
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${showControls ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Advanced Controls */}
            {showControls && (
              <div className="p-3 border border-border rounded-lg bg-muted/30 animate-slide-down space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <SegmentedControl
                    label="Tense"
                    value={controls.tense}
                    onChange={(v) => setControls({ ...controls, tense: v })}
                    options={['as_is', 'present', 'past']}
                  />
                  <SegmentedControl
                    label="POV"
                    value={controls.pov}
                    onChange={(v) => setControls({ ...controls, pov: v })}
                    options={['as_is', 'first', 'third']}
                  />
                  <SegmentedControl
                    label="Length"
                    value={controls.length}
                    onChange={(v) => setControls({ ...controls, length: v })}
                    options={['shorter', 'same', 'longer']}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SegmentedControl
                    label="Transitions"
                    value={controls.transitions}
                    onChange={(v) => setControls({ ...controls, transitions: v })}
                    options={['off', 'light', 'strong']}
                  />
                  <SegmentedControl
                    label="Vividness"
                    value={controls.vividness}
                    onChange={(v) => setControls({ ...controls, vividness: v })}
                    options={['low', 'balanced', 'high']}
                  />
                </div>
                <div className="pt-2 border-t border-border">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-sm text-foreground">Include summary</span>
                    <div
                      className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                        controls.includeSummary ? 'bg-brand-500' : 'bg-muted-foreground/20'
                      }`}
                      onClick={() =>
                        setControls({ ...controls, includeSummary: !controls.includeSummary })
                      }
                    >
                      <div
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
                          controls.includeSummary ? 'left-[18px]' : 'left-0.5'
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Textarea */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-border">
                <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <FileText size={12} />
                  Input
                </div>
                <span
                  className={`text-xs tabular-nums ${
                    overLimit ? 'text-red-500 font-medium' : 'text-muted-foreground'
                  }`}
                >
                  {inputText.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>
              </div>

              {/* Thin progress */}
              <div className="h-px bg-border relative">
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                    overLimit ? 'bg-red-500' : 'bg-brand-500'
                  }`}
                  style={{ width: `${charPct}%`, height: '2px', top: '-0.5px' }}
                />
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your text here..."
                className="w-full min-h-[240px] p-3 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed"
              />

              {error && (
                <div className="px-3 py-2 border-t border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 flex items-center gap-2 animate-slide-up">
                  <AlertCircle size={13} className="text-red-500 shrink-0" />
                  <span className="text-xs text-red-600 dark:text-red-400">{error}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={clear}
                className="h-9 px-4 inline-flex items-center gap-1.5 border border-border rounded-md text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
              >
                <Trash2 size={14} />
                Clear
              </button>
              <button
                onClick={transform}
                disabled={loading || !inputText.trim()}
                className="flex-1 h-9 px-4 inline-flex items-center justify-center gap-1.5 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-[13px] font-medium rounded-md transition-colors"
              >
                {loading ? (
                  <RotateCcw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {result ? 'Regenerate' : 'Transform'}
                {!loading && <ArrowRight size={14} />}
              </button>
            </div>
          </div>

          {/* ════════════════════════════════════════
              RIGHT COLUMN — OUTPUT ONLY
             ════════════════════════════════════════ */}
          <div className="lg:sticky lg:top-[72px]">
            {/* Empty state */}
            {!result && !loading && (
              <div className="border border-dashed border-border rounded-lg flex flex-col items-center justify-center min-h-[460px] p-8">
                <div className="w-11 h-11 rounded-lg bg-muted flex items-center justify-center mb-3">
                  <Sparkles size={20} className="text-brand-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-1">Ready to transform</h3>
                <p className="text-xs text-muted-foreground text-center max-w-[220px] leading-relaxed">
                  Paste your text and click{' '}
                  <span className="text-brand-500 font-medium">Transform</span> to see the magic.
                </p>

                <div className="flex items-center gap-4 mt-6 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers size={11} className="text-brand-500" /> 8 modes
                  </span>
                  <span className="flex items-center gap-1">
                    <Zap size={11} className="text-teal-500" /> 6 models
                  </span>
                  <span className="flex items-center gap-1">
                    <Copy size={11} className="text-pink-400" /> 5 variations
                  </span>
                </div>

                <div className="mt-5 flex items-center gap-1.5 text-[11px] text-muted-foreground/50">
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">
                    ⌘
                  </kbd>
                  <span>+</span>
                  <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono border border-border">
                    Enter
                  </kbd>
                  <span className="ml-1">to transform</span>
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="border border-border rounded-lg overflow-hidden min-h-[460px]">
                <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
                  <div className="relative w-3.5 h-3.5">
                    <div className="absolute inset-0 rounded-full border-2 border-muted" />
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-brand-500 animate-spin" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">
                    Transforming with <span className="text-brand-500">{currentMode?.label}</span>...
                  </span>
                </div>
                <div className="p-4">
                  <SkeletonLoader />
                </div>
              </div>
            )}

            {/* Result */}
            {result && !loading && (
              <div className="space-y-3 animate-fade-in">
                {/* Variation tabs */}
                {result.variations.length > 1 && (
                  <div className="inline-flex items-center h-8 p-0.5 bg-muted rounded-md">
                    {result.variations.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedIdx(idx)}
                        className={`h-full px-3 rounded text-xs font-medium transition-colors ${
                          selectedIdx === idx
                            ? 'bg-background text-foreground border border-border'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        V{idx + 1}
                      </button>
                    ))}
                  </div>
                )}

                {/* Result card */}
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-accent/30">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse-soft" />
                      <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                        {currentMode?.label}
                      </span>
                    </div>
                    <button
                      onClick={copyPrimary}
                      className="h-7 px-2 inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-accent rounded transition-colors"
                    >
                      <Copy size={12} />
                      Copy
                    </button>
                  </div>
                  <div className="p-4 text-sm leading-[1.8] text-foreground min-h-[200px] whitespace-pre-wrap">
                    {typewriter ? (
                      <TypewriterText text={result.variations[selectedIdx]} />
                    ) : (
                      result.variations[selectedIdx]
                    )}
                  </div>
                  <div className="px-3 py-2 border-t border-border flex items-center gap-3 text-xs text-muted-foreground tabular-nums">
                    <span>
                      {result.variations[selectedIdx].split(/\s+/).filter(Boolean).length} words
                    </span>
                    <span className="text-border">•</span>
                    <span>{result.originalWordCount} original</span>
                  </div>
                </div>

                {/* Summary */}
                {result.summary && (
                  <div className="border border-border border-l-2 border-l-teal-500 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Zap size={12} className="text-teal-500" />
                        <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                          Summary
                        </span>
                      </div>
                      <button
                        onClick={() => copy(result.summary!)}
                        className="h-6 w-6 inline-flex items-center justify-center text-muted-foreground hover:text-foreground rounded transition-colors"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">
                      "{result.summary}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-border mt-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sparkles size={11} className="text-brand-500" />
              <span>Powered by Groq</span>
              <span className="text-border">•</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <a href="#" className="hover:text-foreground transition-colors">
                Docs
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
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