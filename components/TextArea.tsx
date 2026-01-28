import React, { useMemo, useState } from 'react';
import { MAX_CHARS } from '../constants';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;

  // NEW: pin names/phrases you don't want the model to change
  pinnedTerms: string[];
  onPinnedTermsChange: (terms: string[]) => void;
}

function normalizeTerm(t: string) {
  return t.trim().replace(/\s+/g, ' ');
}

function uniqTerms(terms: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of terms.map(normalizeTerm)) {
    const key = t.toLowerCase();
    if (!t) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
}

// Simple heuristic extraction: quoted phrases + acronyms + capitalized sequences
function extractTermsFromText(input: string): string[] {
  const terms: string[] = [];

  for (const m of input.matchAll(/"([^"]+)"/g)) terms.push(m[1]);
  for (const m of input.matchAll(/'([^']+)'/g)) terms.push(m[1]);
  for (const m of input.matchAll(/\b[A-Z]{2,}\b/g)) terms.push(m[0]);
  for (const m of input.matchAll(/\b(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,4})\b/g)) {
    terms.push(m[0]);
  }

  return uniqTerms(terms).slice(0, 20);
}

const TextArea: React.FC<TextAreaProps> = ({
  value,
  onChange,
  onClear,
  placeholder,
  disabled,
  pinnedTerms,
  onPinnedTermsChange,
}) => {
  const percentage = (value.length / MAX_CHARS) * 100;
  const isWarning = value.length > MAX_CHARS * 0.8;

  const [termInput, setTermInput] = useState('');

  const canAdd = useMemo(() => {
    return normalizeTerm(termInput).length > 0 && !disabled;
  }, [termInput, disabled]);

  const addTerm = () => {
    const t = normalizeTerm(termInput);
    if (!t) return;
    onPinnedTermsChange(uniqTerms([...pinnedTerms, t]));
    setTermInput('');
  };

  const removeTerm = (t: string) => {
    const key = t.toLowerCase();
    onPinnedTermsChange(pinnedTerms.filter(x => x.toLowerCase() !== key));
  };

  const handleExtract = () => {
    const extracted = extractTermsFromText(value);
    if (extracted.length === 0) return;
    onPinnedTermsChange(uniqTerms([...pinnedTerms, ...extracted]));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-brand-900 lowercase tracking-wider">
          your text
        </label>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
          disabled={disabled}
          type="button"
        >
          [clear]
        </button>
      </div>

      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "type or paste your text here..."}
          disabled={disabled}
          className={`w-full h-48 p-4 bg-white border-2 border-brand-200 focus:border-brand-500 focus:outline-none resize-none transition-colors text-brand-800 font-medium ${
            disabled ? 'opacity-50' : ''
          }`}
        />

        <div className="absolute bottom-4 right-4 flex flex-col items-end gap-1 pointer-events-none">
          <div className="flex items-baseline gap-1 bg-white/80 px-2 py-1 border border-brand-100">
            <span className={`text-xs font-mono font-bold ${isWarning ? 'text-brand-500' : 'text-brand-400'}`}>
              {value.length.toLocaleString()}
            </span>
            <span className="text-[10px] text-brand-200">/</span>
            <span className="text-[10px] text-brand-200 font-mono">{MAX_CHARS.toLocaleString()}</span>
          </div>
          <div className="w-24 h-1 bg-brand-50 border border-brand-200 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${isWarning ? 'bg-brand-500' : 'bg-brand-300'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* NEW: pinned terms */}
      <section className="flex flex-col gap-2">
        <div className="flex items-end justify-between gap-3">
          <div className="flex flex-col">
            <h3 className="text-xs font-semibold text-brand-900 lowercase tracking-wider">
              pinned terms
            </h3>
            <p className="text-[11px] text-brand-500 lowercase">
              names and phrases that must not change
            </p>
          </div>

          <button
            type="button"
            onClick={handleExtract}
            disabled={disabled || value.trim().length === 0}
            className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight disabled:opacity-50 disabled:cursor-not-allowed"
            title="extract likely names/phrases from your text"
          >
            [extract]
          </button>
        </div>

        {pinnedTerms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pinnedTerms.map((t) => (
              <span
                key={t.toLowerCase()}
                className="inline-flex items-center gap-2 px-2 py-1 bg-white/70 border-2 border-brand-200 text-brand-800 text-xs font-semibold"
              >
                <span className="lowercase">{t}</span>
                <button
                  type="button"
                  onClick={() => removeTerm(t)}
                  disabled={disabled}
                  className="text-brand-500 hover:text-brand-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`remove pinned term ${t}`}
                  title="remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={termInput}
            onChange={(e) => setTermInput(e.target.value)}
            disabled={disabled}
            placeholder='add a name or phrase, e.g. "Acme Corp"'
            className="w-full px-3 py-2 bg-white border-2 border-brand-200 focus:border-brand-500 focus:outline-none text-brand-800 font-medium"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTerm();
              }
            }}
          />
          <button
            type="button"
            onClick={addTerm}
            disabled={!canAdd}
            className="h-10 px-4 bg-brand-500 text-white font-bold lowercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            add
          </button>
        </div>
      </section>
    </div>
  );
};

export default TextArea;
