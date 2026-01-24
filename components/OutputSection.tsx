import React, { useState } from 'react';
import { RephraseResponse } from '../types';

interface OutputSectionProps {
  response: RephraseResponse | null;
  label: string;
  onRegenerate: () => void;
  onCopy: (text?: string) => void;
  isLoading: boolean;
}

const OutputSection: React.FC<OutputSectionProps> = ({ response, label, onRegenerate, onCopy, isLoading }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!response && !isLoading) return null;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-brand-900 lowercase tracking-wider">rephrased result</h2>
          <p className="text-xs text-brand-500 italic lowercase">voice. {label}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            disabled={isLoading}
            className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
          >
            [regenerate]
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6 bg-brand-100 border-2 border-brand-200 relative min-h-[120px] flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <span className="text-xs font-bold text-brand-500 lowercase tracking-widest">processing...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {response?.results.map((result, index) => (
            <div key={index} className="p-6 bg-brand-100 border-2 border-brand-200 relative">
              {response.results.length > 1 && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-brand-200 text-brand-700 text-[10px] font-bold uppercase tracking-wider">
                  variation {index + 1}
                </div>
              )}
              <div className="text-brand-900 whitespace-pre-wrap leading-relaxed mt-4">
                {result}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleCopy(result, index)}
                  className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
                >
                  [{copiedIndex === index ? 'copied!' : 'copy'}]
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && response && (
        <div className="flex justify-between text-[10px] text-brand-400 font-mono lowercase tracking-widest">
          <span>model. {response.meta.model}</span>
          <span>variations. {response.meta.variationCount} | original words. {response.meta.originalWordCount}</span>
        </div>
      )}
    </section>
  );
};

export default OutputSection;
