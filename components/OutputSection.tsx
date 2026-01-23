import React, { useState } from 'react';
import { RephraseResponse } from '../types';

interface OutputSectionProps {
  response: RephraseResponse | null;
  label: string;
  onRegenerate: () => void;
  isLoading: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({ response, label, onRegenerate, isLoading }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!response?.result) return;
    await navigator.clipboard.writeText(response.result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!response && !isLoading) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">rephrased result</h2>
          <p className="text-xs text-brand-500 italic lowercase">tone: {label}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
          >
            [regenerate]
          </button>
          <button
            onClick={handleCopy}
            className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
          >
            [{copied ? 'copied!' : 'copy'}]
          </button>
        </div>
      </div>

      <div className={`p-6 bg-brand-100 border-2 border-brand-200 relative min-h-[120px] transition-all ${isLoading ? 'opacity-60' : ''}`}>
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
            <span className="text-xs font-bold text-brand-500 lowercase tracking-widest">processing...</span>
          </div>
        ) : (
          <div className="text-brand-900 whitespace-pre-wrap leading-relaxed">
            {response?.result}
          </div>
        )}
      </div>

      {!isLoading && response && (
        <div className="flex justify-between text-[10px] text-brand-400 font-mono lowercase tracking-widest">
          <span>model: {response.meta.model}</span>
          <span>words: {response.meta.wordCount} (was {response.meta.originalWordCount})</span>
        </div>
      )}
    </section>
  );
};

export default OutputSection;
