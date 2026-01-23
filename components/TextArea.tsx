import React from 'react';
import { MAX_CHARS } from '../constants';

interface TextAreaProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const TextArea: React.FC<TextAreaProps> = ({ value, onChange, onClear, placeholder, disabled }) => {
  const percentage = (value.length / MAX_CHARS) * 100;
  const isWarning = value.length > MAX_CHARS * 0.8;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-end">
        <label className="text-sm font-semibold text-brand-900 lowercase tracking-wider">your text</label>
        <button
          onClick={onClear}
          className="text-xs font-semibold text-brand-500 hover:text-brand-700 lowercase tracking-tight"
          disabled={disabled}
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
          className={`w-full h-48 p-4 bg-white border-2 border-brand-200 focus:border-brand-500 focus:outline-none resize-none transition-colors text-brand-800 font-medium ${disabled ? 'opacity-50' : ''}`}
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
    </div>
  );
};

export default TextArea;
